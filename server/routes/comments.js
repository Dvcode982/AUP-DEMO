module.exports = (app, db, authenticateToken) => {
  // 获取帖子的评论列表
  app.get('/api/posts/:postId/comments', async (req, res) => {
    const { postId } = req.params;

    const query = `
      SELECT 
        c.id,
        u.email as author,
        c.content,
        c.created_at as time
      FROM comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `;

    db.all(query, [postId], (err, comments) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(comments);
    });
  });

  // 添加评论
  app.post('/api/posts/:postId/comments', authenticateToken, async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // 检查帖子是否存在
    db.get('SELECT id FROM posts WHERE id = ?', [postId], (err, post) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // 添加评论
      db.run(
        `INSERT INTO comments (post_id, author_id, content)
         VALUES (?, ?, ?)`,
        [postId, req.user.userId, content],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to add comment' });
          }

          res.status(201).json({
            id: this.lastID,
            message: 'Comment added successfully'
          });
        }
      );
    });
  });
};