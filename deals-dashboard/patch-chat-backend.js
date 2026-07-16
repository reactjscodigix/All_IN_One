const fs = require('fs');
const path = 'server/routes/files-conversations-routes.js';
let content = fs.readFileSync(path, 'utf8');

// Add POST /api/chat-groups/:groupId/members endpoint
const newEndpoint = `
  app.post('/api/chat-groups/:groupId/members', async (req, res) => {
    let connection;
    try {
      const { groupId } = req.params;
      const { members = [] } = req.body;
      
      if (!members || members.length === 0) {
        return res.status(400).json({ error: 'No members provided' });
      }

      connection = await getConnection();
      await connection.beginTransaction();

      // Get existing members to avoid duplicates
      const [existing] = await connection.query(
        'SELECT user_id FROM chat_group_members WHERE group_id = ?',
        [groupId]
      );
      const existingUserIds = existing.map(row => row.user_id.toString());

      let addedCount = 0;
      for (const userId of members) {
        if (!existingUserIds.includes(userId.toString())) {
          await connection.query(
            'INSERT INTO chat_group_members (group_id, user_id) VALUES (?, ?)',
            [groupId, userId]
          );
          addedCount++;
        }
      }

      await connection.commit();
      res.status(201).json({ message: \`Added \${addedCount} new members to group\` });
    } catch (error) {
      if (connection) await connection.rollback();
      responseError(res, 500, 'Failed to add group members', error);
    } finally {
      if (connection) connection.release();
    }
  });
`;

if (!content.includes('/api/chat-groups/:groupId/members') || !content.includes('app.post(\'/api/chat-groups/:groupId/members\'')) {
  // Insert it right after the GET /api/chat-groups/:groupId/members
  content = content.replace(
    /app\.get\('\/api\/chat-groups\/:groupId\/members', async \(req, res\) => \{[\s\S]*?finally \{\n\s*if \(connection\) connection\.release\(\);\n\s*\}\n\s*\}\);/g,
    match => `${match}\n${newEndpoint}`
  );
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully added POST /api/chat-groups/:groupId/members');
} else {
  console.log('Endpoint already exists');
}
