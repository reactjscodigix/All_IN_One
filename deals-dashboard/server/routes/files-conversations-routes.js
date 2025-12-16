module.exports = function setupFilesConversationsRoutes(app, pool) {

  async function getConnection() {
    return pool.getConnection();
  }

  const responseError = (res, statusCode, message, error) => {
    console.error(`Error: ${message}`, error?.message || error);
    return res.status(statusCode).json({ error: message, details: error?.message || error });
  };

  app.get('/api/files', async (req, res) => {
    let connection;
    try {
      const { userId, skip = 0, limit = 50 } = req.query;
      connection = await getConnection();

      let query = 'SELECT f.* FROM files f WHERE 1=1';
      const params = [];

      if (userId) {
        query += ' AND f.user_id = ?';
        params.push(userId);
      }

      query += ' ORDER BY f.created_at DESC LIMIT ?, ?';
      params.push(parseInt(skip), parseInt(limit));

      const [files] = await connection.query(query, params);
      res.json(files);
    } catch (error) {
      responseError(res, 500, 'Failed to fetch files', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.post('/api/files', async (req, res) => {
    let connection;
    try {
      const { userId, name, fileType, sizeBytes, mimeType, storageType, folderId } = req.body;

      if (!userId || !name) {
        return res.status(400).json({ error: 'User ID and file name required' });
      }

      connection = await getConnection();
      const [result] = await connection.query(`
        INSERT INTO files (user_id, folder_id, name, file_type, size_bytes, mime_type, storage_type)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [userId, folderId || null, name, fileType || null, sizeBytes || 0, mimeType || null, storageType || 'Internal']);

      const [file] = await connection.query('SELECT * FROM files WHERE id = ?', [result.insertId]);
      res.status(201).json(file[0]);
    } catch (error) {
      responseError(res, 500, 'Failed to create file record', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.put('/api/files/:fileId/favorite', async (req, res) => {
    let connection;
    try {
      const { fileId } = req.params;
      const { isFavorite } = req.body;

      connection = await getConnection();
      await connection.query('UPDATE files SET is_favorite = ? WHERE id = ?', [isFavorite, fileId]);

      const [file] = await connection.query('SELECT * FROM files WHERE id = ?', [fileId]);
      res.json(file[0]);
    } catch (error) {
      responseError(res, 500, 'Failed to update file favorite', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.delete('/api/files/:fileId', async (req, res) => {
    let connection;
    try {
      const { fileId } = req.params;
      connection = await getConnection();

      await connection.query('DELETE FROM files WHERE id = ?', [fileId]);
      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      responseError(res, 500, 'Failed to delete file', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/folders', async (req, res) => {
    let connection;
    try {
      const { userId, skip = 0, limit = 50 } = req.query;
      connection = await getConnection();

      let query = 'SELECT f.* FROM file_folders f WHERE 1=1';
      const params = [];

      if (userId) {
        query += ' AND f.user_id = ?';
        params.push(userId);
      }

      query += ' ORDER BY f.created_at DESC LIMIT ?, ?';
      params.push(parseInt(skip), parseInt(limit));

      const [folders] = await connection.query(query, params);
      res.json(folders);
    } catch (error) {
      responseError(res, 500, 'Failed to fetch folders', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.post('/api/folders', async (req, res) => {
    let connection;
    try {
      const { userId, name, parentId, storageType } = req.body;

      if (!userId || !name) {
        return res.status(400).json({ error: 'User ID and folder name required' });
      }

      connection = await getConnection();
      const [result] = await connection.query(`
        INSERT INTO file_folders (user_id, name, parent_id, storage_type)
        VALUES (?, ?, ?, ?)
      `, [userId, name, parentId || null, storageType || 'Internal']);

      const [folder] = await connection.query('SELECT * FROM file_folders WHERE id = ?', [result.insertId]);
      res.status(201).json(folder[0]);
    } catch (error) {
      responseError(res, 500, 'Failed to create folder', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.delete('/api/folders/:folderId', async (req, res) => {
    let connection;
    try {
      const { folderId } = req.params;
      connection = await getConnection();

      await connection.query('DELETE FROM file_folders WHERE id = ?', [folderId]);
      res.json({ message: 'Folder deleted successfully' });
    } catch (error) {
      responseError(res, 500, 'Failed to delete folder', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/files/storage-stats', async (req, res) => {
    let connection;
    try {
      const { userId } = req.query;
      connection = await getConnection();

      let query = `
        SELECT 
          storage_type,
          COUNT(*) as file_count,
          SUM(size_bytes) as total_size
        FROM files
        WHERE 1=1
      `;
      const params = [];

      if (userId) {
        query += ' AND user_id = ?';
        params.push(userId);
      }

      query += ' GROUP BY storage_type ORDER BY storage_type';

      const [stats] = await connection.query(query, params);
      res.json(stats);
    } catch (error) {
      responseError(res, 500, 'Failed to fetch storage stats', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/conversations/:userId', async (req, res) => {
    let connection;
    try {
      const { userId } = req.params;
      connection = await getConnection();

      const [conversations] = await connection.query(`
        SELECT 
          c.id,
          c.participant1_id,
          c.participant2_id,
          c.last_message_text,
          c.last_message_timestamp,
          c.created_at,
          c.updated_at,
          CASE 
            WHEN c.participant1_id = ? THEN u2.id
            ELSE u1.id
          END as other_user_id,
          CASE 
            WHEN c.participant1_id = ? THEN CONCAT(u2.first_name, ' ', u2.last_name)
            ELSE CONCAT(u1.first_name, ' ', u1.last_name)
          END as name,
          CASE 
            WHEN c.participant1_id = ? THEN u2.avatar
            ELSE u1.avatar
          END as avatar,
          CASE 
            WHEN c.participant1_id = ? THEN u2.status
            ELSE u1.status
          END as status,
          c.last_message_text as lastMessage,
          DATE_FORMAT(c.last_message_timestamp, '%M %d, %Y %H:%i') as timestamp
        FROM conversations c
        LEFT JOIN users u1 ON c.participant1_id = u1.id
        LEFT JOIN users u2 ON c.participant2_id = u2.id
        WHERE c.participant1_id = ? OR c.participant2_id = ?
        ORDER BY c.updated_at DESC
      `, [userId, userId, userId, userId, userId, userId]);

      res.json(conversations);
    } catch (error) {
      responseError(res, 500, 'Failed to fetch conversations', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.post('/api/messages', async (req, res) => {
    let connection;
    try {
      const { sender_id, receiver_id, message_text } = req.body;

      if (!sender_id || !receiver_id || !message_text) {
        return res.status(400).json({ error: 'Sender ID, receiver ID, and message text required' });
      }

      connection = await getConnection();

      // Verify both users exist before creating message
      const [senderCheck] = await connection.query('SELECT id FROM users WHERE id = ?', [sender_id]);
      const [receiverCheck] = await connection.query('SELECT id FROM users WHERE id = ?', [receiver_id]);

      if (senderCheck.length === 0) {
        connection.release();
        return res.status(404).json({ error: `Sender with ID ${sender_id} not found` });
      }

      if (receiverCheck.length === 0) {
        connection.release();
        return res.status(404).json({ error: `Receiver with ID ${receiver_id} not found` });
      }

      const [result] = await connection.query(`
        INSERT INTO messages (sender_id, receiver_id, message_text)
        VALUES (?, ?, ?)
      `, [sender_id, receiver_id, message_text]);

      const [message] = await connection.query('SELECT * FROM messages WHERE id = ?', [result.insertId]);
      res.status(201).json(message[0]);
    } catch (error) {
      responseError(res, 500, 'Failed to send message', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/messages/:userId', async (req, res) => {
    let connection;
    try {
      const { userId } = req.params;
      const { conversationWith } = req.query;

      connection = await getConnection();

      let query = `
        SELECT 
          m.*,
          CASE 
            WHEN m.sender_id = ? THEN 'user'
            ELSE 'other'
          END as sender,
          CASE 
            WHEN m.sender_id = ? THEN m.message_text
            ELSE m.message_text
          END as text,
          DATE_FORMAT(m.created_at, '%h:%i %p') as timestamp
        FROM messages m
        WHERE (m.sender_id = ? OR m.receiver_id = ?)
      `;
      const params = [userId, userId, userId, userId];

      if (conversationWith) {
        query += ' AND (m.sender_id = ? OR m.receiver_id = ?)';
        params.push(conversationWith, conversationWith);
      }

      query += ' ORDER BY m.created_at ASC';

      const [messages] = await connection.query(query, params);
      res.json(messages);
    } catch (error) {
      responseError(res, 500, 'Failed to fetch messages', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/available-users/:userId', async (req, res) => {
    let connection;
    try {
      const { userId } = req.params;
      const { search } = req.query;

      connection = await getConnection();

      let query = 'SELECT id, first_name, last_name, email, avatar, status FROM users WHERE id != ?';
      const params = [userId];

      if (search) {
        query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      query += ' ORDER BY first_name ASC LIMIT 20';

      const [users] = await connection.query(query, params);

      const formattedUsers = users.map(u => ({
        id: u.id,
        name: `${u.first_name} ${u.last_name}`,
        email: u.email,
        avatar: u.avatar,
        status: u.status || 'Active'
      }));

      res.json(formattedUsers);
    } catch (error) {
      responseError(res, 500, 'Failed to fetch available users', error);
    } finally {
      if (connection) connection.release();
    }
  });

};
