const crypto = require('crypto');

module.exports = function setupGithubRoutes(app, pool) {
  const db = {
    query: (sql, params) => pool.query(sql, params)
  };

  const responseError = (res, statusCode, message, error) => {
    console.error(`Error: ${message}`, error?.message || error);
    return res.status(statusCode).json({ error: message, details: error?.message || error });
  };

  // Helper to extract Task Key (e.g., WR-114, IT-203) from strings
  const extractTaskKeys = (text) => {
    if (!text) return [];
    // Matches patterns like ABC-123 or ABC-1234
    const regex = /([A-Z]+-\d+)/g;
    const matches = text.match(regex);
    // Return unique matches
    return matches ? [...new Set(matches)] : [];
  };

  // GET attached GitHub metadata for a task key
  app.get('/api/tasks/:taskKey/github', async (req, res) => {
    try {
      const { taskKey } = req.params;

      const [commits] = await db.query(
        'SELECT * FROM github_commits WHERE task_key = ? ORDER BY created_at DESC',
        [taskKey]
      );

      const [prs] = await db.query(
        'SELECT * FROM github_prs WHERE task_key = ? ORDER BY created_at DESC',
        [taskKey]
      );

      res.json({ commits, prs });
    } catch (error) {
      responseError(res, 500, 'Failed to fetch github data for task', error);
    }
  });

  // Webhook listener for GitHub events
  app.post('/api/github/webhook', async (req, res) => {
    // Note: To secure this properly in production, verify the X-Hub-Signature-256 header using a secret.
    const event = req.headers['x-github-event'];
    const payload = req.body;

    if (!event) {
      return res.status(400).json({ error: 'No GitHub event header found' });
    }

    console.log(`[GitHub Webhook] Received event: ${event}`);

    try {
      if (event === 'push') {
        const commits = payload.commits || [];
        for (const commit of commits) {
          const message = commit.message;
          const taskKeys = extractTaskKeys(message);
          
          for (const key of taskKeys) {
            // Save commit linked to the task_key
            try {
              await db.query(`
                INSERT IGNORE INTO github_commits (task_key, commit_hash, message, author, url)
                VALUES (?, ?, ?, ?, ?)
              `, [
                key, 
                commit.id, 
                message, 
                commit.author?.name || commit.author?.username,
                commit.url
              ]);
              console.log(`Linked commit ${commit.id.substring(0,7)} to task ${key}`);
            } catch (err) {
              console.error('Error inserting commit:', err);
            }
          }
        }
      } else if (event === 'pull_request') {
        const action = payload.action;
        const pr = payload.pull_request;
        const title = pr.title;
        const body = pr.body || '';
        
        // Search for task keys in PR title and PR body
        const taskKeys = extractTaskKeys(`${title} ${body}`);

        for (const key of taskKeys) {
          try {
            await db.query(`
              INSERT INTO github_prs (task_key, pr_number, title, state, url)
              VALUES (?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE state = ?, title = ?
            `, [
              key, 
              pr.number, 
              title, 
              pr.state, // 'open' or 'closed'
              pr.html_url,
              pr.state,
              title
            ]);
            console.log(`Linked PR #${pr.number} to task ${key} with state ${pr.state}`);
          } catch (err) {
            console.error('Error inserting PR:', err);
          }
        }
      }

      res.status(200).json({ message: 'Webhook processed successfully' });
    } catch (error) {
      responseError(res, 500, 'Error processing webhook', error);
    }
  });
};
