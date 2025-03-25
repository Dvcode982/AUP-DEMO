module.exports = (app, db, authenticateToken) => {
  // 获取失物招领的评论列表
  app.get('/api/lost-and-found/:itemId/comments', async (req, res) => {
    const { itemId } = req.params;

    const query = `
      SELECT 
        c.id,
        u.email as author,
        c.content,
        c.created_at as time
      FROM lost_found_comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.item_id = ?
      ORDER BY c.created_at ASC
    `;

    db.all(query, [itemId], (err, comments) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(comments);
    });
  });

  // 添加评论
  app.post('/api/lost-and-found/:itemId/comments', authenticateToken, async (req, res) => {
    const { itemId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    try {
      // 检查失物招领是否存在
      db.get('SELECT id FROM lost_and_found WHERE id = ?', [itemId], (err, item) => {
        if (err) {
          console.error('Database error when checking item:', err.message);
          return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        if (!item) {
          return res.status(404).json({ error: 'Lost and found item not found' });
        }

        // 添加评论到失物招领评论表
        db.run(
          `INSERT INTO lost_found_comments (item_id, author_id, content)
           VALUES (?, ?, ?)`,
          [itemId, req.user.userId, content],
          function(err) {
            if (err) {
              console.error('Database error when adding comment:', err.message);
              return res.status(500).json({ error: 'Failed to add comment: ' + err.message });
            }

            res.status(201).json({
              id: this.lastID,
              message: 'Comment added successfully'
            });
          }
        );
      });
    } catch (error) {
      console.error('Unexpected error in comment API:', error);
      res.status(500).json({ error: 'Server error: ' + error.message });
    }
  });
};