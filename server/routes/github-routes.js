const crypto = require('crypto');
const axios = require('axios');

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

  // Init table for repositories if it doesn't exist
  (async () => {
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS github_repositories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          full_name VARCHAR(500),
          description TEXT,
          project VARCHAR(255),
          language VARCHAR(100),
          language_color VARCHAR(50),
          is_private BOOLEAN DEFAULT FALSE,
          stars INT DEFAULT 0,
          forks INT DEFAULT 0,
          open_prs INT DEFAULT 0,
          last_commit_msg VARCHAR(500),
          last_commit_hash VARCHAR(100),
          last_update VARCHAR(100),
          created_on VARCHAR(100),
          active_branch VARCHAR(100) DEFAULT 'main',
          status ENUM('Active', 'Archived') DEFAULT 'Active',
          topics JSON,
          contributors JSON
        )
      `);
      
      // Try to add the contributors column if it doesn't exist (migration)
      try {
        await db.query('ALTER TABLE github_repositories ADD COLUMN contributors JSON');
      } catch (err) {
        // Column likely exists
      }
      
      // Seed data if empty
      const [rows] = await db.query('SELECT COUNT(*) as count FROM github_repositories');
      if (rows.count === 0) {
        const seedData = [
          ['hospital-erp-backend', 'codigix-infotech/hospital-erp-backend', 'Backend API for Hospital ERP system built with Node.js, Express and TypeScript.', 'Hospital ERP', 'TypeScript', '#3178C6', true, 18, 7, 3, 'Fix: Patient billing calculation', 'a1b2c3d', '2 hours ago', 'Mar 15, 2026', 'main', 'Active', JSON.stringify(['nodejs', 'express', 'typescript', 'api', 'hospital', 'erp']), JSON.stringify([{name: 'Rahul Patil', role: 'Lead Developer', commits: 124, color: 'bg-blue-100 text-blue-700'}])],
          ['hospital-erp-frontend', 'codigix-infotech/hospital-erp-frontend', 'Frontend application for Hospital ERP', 'Hospital ERP', 'React', '#61DAFB', true, 24, 9, 2, 'Feat: Add new dashboard widgets', 'd4e5f6g', '4 hours ago', 'Mar 10, 2026', 'main', 'Active', JSON.stringify(['react', 'dashboard', 'frontend']), JSON.stringify([{name: 'Sneha Joshi', role: 'Frontend Developer', commits: 89, color: 'bg-purple-100 text-purple-700'}])],
          ['crm-backend', 'codigix-infotech/crm-backend', 'CRM backend services and APIs', 'CRM System', 'Node.js', '#339933', true, 32, 11, 5, 'Refactor: User service', 'h7i8j9k', '6 hours ago', 'Feb 1, 2026', 'develop', 'Active', JSON.stringify(['crm', 'nodejs', 'api']), '[]'],
          ['crm-frontend', 'codigix-infotech/crm-frontend', 'CRM frontend application', 'CRM System', 'Vue', '#4FC08D', true, 16, 4, 1, 'Fix: Responsive issues', 'l1m2n3o', '1 day ago', 'Feb 5, 2026', 'main', 'Active', JSON.stringify(['vue', 'crm', 'frontend']), '[]'],
          ['mobile-app', 'codigix-infotech/mobile-app', 'React Native mobile application', 'Mobile App', 'React Native', '#61DAFB', true, 27, 8, 3, 'Feat: Push notifications', 'p4q5r6s', '1 day ago', 'Jan 20, 2026', 'feature/push', 'Active', JSON.stringify(['react-native', 'mobile', 'ios', 'android']), '[]'],
          ['website', 'codigix-infotech/website', 'Corporate website', 'Website', 'Next.js', '#000000', false, 42, 15, 2, 'Update: Contact form', 't7u8v9w', '2 days ago', 'Dec 10, 2025', 'main', 'Active', JSON.stringify(['nextjs', 'website', 'marketing']), '[]'],
          ['shared-components', 'codigix-infotech/shared-components', 'Reusable UI components', 'Shared Library', 'TypeScript', '#3178C6', false, 31, 6, 0, 'Chore: Update dependencies', 'x1y2z3a', '3 days ago', 'Nov 15, 2025', 'master', 'Active', JSON.stringify(['typescript', 'react', 'ui-library']), '[]'],
          ['devops-scripts', 'codigix-infotech/devops-scripts', 'Deployment and automation scripts', 'DevOps', 'Shell', '#89e051', true, 12, 3, 1, 'Add: Backup automation', 'b4c5d6e', '4 days ago', 'Oct 5, 2025', 'main', 'Active', JSON.stringify(['bash', 'devops', 'automation']), '[]']
        ];
        
        for (const data of seedData) {
          await db.query(`
            INSERT INTO github_repositories 
            (name, full_name, description, project, language, language_color, is_private, stars, forks, open_prs, last_commit_msg, last_commit_hash, last_update, created_on, active_branch, status, topics, contributors)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, data);
        }
      }
    } catch (err) {
      console.error('Failed to init github_repositories table:', err);
    }
  })();

  // GET repositories
  app.get('/api/github/repositories', async (req, res) => {
    try {
      const [repos] = await db.query('SELECT * FROM github_repositories ORDER BY stars DESC');
      res.json(repos);
    } catch (error) {
      responseError(res, 500, 'Failed to fetch repositories', error);
    }
  });

  // DELETE repository
  app.delete('/api/github/repositories/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.query('DELETE FROM github_repositories WHERE id = ?', [id]);
      res.json({ success: true, message: 'Repository deleted successfully' });
    } catch (error) {
      responseError(res, 500, 'Failed to delete repository', error);
    }
  });

  // POST sync
  app.post('/api/github/sync', async (req, res) => {
    try {
      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Randomly update a repository's last_update to simulate new commits
      await db.query('UPDATE github_repositories SET last_update = "Just now", open_prs = open_prs + 1 WHERE id = 1');
      res.json({ success: true, message: 'Sync complete' });
    } catch (error) {
      responseError(res, 500, 'Failed to sync repositories', error);
    }
  });

  // POST import
  app.post('/api/github/import', async (req, res) => {
    try {
      const { url, project, isPrivate, token } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: 'GitHub Clone URL is required' });
      }

      // Very simple parser for https://github.com/owner/repo.git
      const urlParts = url.split('/');
      const repoWithGit = urlParts[urlParts.length - 1];
      const owner = urlParts[urlParts.length - 2];
      const repoName = repoWithGit ? repoWithGit.replace('.git', '') : 'UnknownRepo';
      const fullName = `${owner}/${repoName}`;
      
      let realContributors = [];
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        // First try to fetch collaborators (requires auth usually)
        try {
          const collabRes = await axios.get(`https://api.github.com/repos/${owner}/${repoName}/collaborators`, {
            headers, timeout: 5000
          });
          const colors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700'];
          realContributors = collabRes.data.map((c, idx) => ({
            name: c.login,
            role: 'Collaborator',
            commits: c.contributions || 10, // Collaborators endpoint doesn't return contributions, so mock it
            color: colors[idx % colors.length]
          }));
        } catch (collabErr) {
          // Fallback to contributors if collaborators fails (e.g. no token)
          const ghRes = await axios.get(`https://api.github.com/repos/${owner}/${repoName}/contributors`, {
            headers, timeout: 5000
          });
          const colors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700'];
          realContributors = ghRes.data.map((c, idx) => ({
            name: c.login,
            role: 'Contributor',
            commits: c.contributions,
            color: colors[idx % colors.length]
          }));
        }
      } catch (err) {
        console.error('Failed to fetch real contributors from GitHub:', err.message);
      }
      
      const newRepo = [
        repoName,
        fullName,
        'Imported repository from ' + url,
        project || 'Unassigned',
        'Unknown', // Language
        '#6B7280', // Default color (gray)
        isPrivate || false,
        0, // stars
        0, // forks
        0, // open_prs
        'Initial import',
        '0000000',
        'Just now',
        new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        'main',
        'Active',
        JSON.stringify([]), // topics
        JSON.stringify(realContributors) // contributors
      ];

      await db.query(`
        INSERT INTO github_repositories 
        (name, full_name, description, project, language, language_color, is_private, stars, forks, open_prs, last_commit_msg, last_commit_hash, last_update, created_on, active_branch, status, topics, contributors)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, newRepo);

      res.json({ success: true, message: 'Repository imported successfully' });
    } catch (error) {
      responseError(res, 500, 'Failed to import repository', error);
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
