module.exports = (app, db, authenticateToken) => {
  // 获取失物招领列表
  app.get('/api/lost-and-found', async (req, res) => {
    const query = `
      SELECT 
        l.id,
        u.email as author,
        l.content,
        l.is_returned as isReturned,
        l.returned_time as returnedTime,
        l.created_at as time
      FROM lost_and_found l
      JOIN users u ON l.author_id = u.id
      ORDER BY l.created_at DESC
    `;

    db.all(query, [], (err, items) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // 为每个项目添加固定标签
      const itemsWithTags = items.map(item => ({
        ...item,
        tags: ['失物招领'],
        isLostAndFound: true
      }));

      res.json(itemsWithTags);
    });
  });

  // 标记物品已找到/已归还
  app.put('/api/lost-and-found/:id/return', authenticateToken, async (req, res) => {
    const { id } = req.params;

    // 检查物品是否存在并属于当前用户
    db.get(
      'SELECT * FROM lost_and_found WHERE id = ? AND author_id = ?',
      [id, req.user.userId],
      (err, item) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        if (!item) {
          return res.status(404).json({ error: 'Item not found or unauthorized' });
        }

        const returnedTime = new Date().toISOString();

        // 更新物品状态
        db.run(
          'UPDATE lost_and_found SET is_returned = TRUE, returned_time = ? WHERE id = ?',
          [returnedTime, id],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to update item status' });
            }

            res.json({
              message: 'Item marked as returned',
              returnedTime
            });
          }
        );
      }
    );
  });

  // 获取单个失物招领详情
  app.get('/api/lost-and-found/:id', async (req, res) => {
    const { id } = req.params;

    const query = `
      SELECT 
        l.id,
        u.email as author,
        l.content,
        l.is_returned as isReturned,
        l.returned_time as returnedTime,
        l.created_at as time
      FROM lost_and_found l
      JOIN users u ON l.author_id = u.id
      WHERE l.id = ?
    `;

    db.get(query, [id], (err, item) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      // 添加固定标签
      item.tags = ['失物招领'];
      item.isLostAndFound = true;
      
      res.json(item);
    });
  });

  // 创建失物招领帖子
  app.post('/api/lost-and-found', authenticateToken, async (req, res) => {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    db.run(
      'INSERT INTO lost_and_found (author_id, content) VALUES (?, ?)',
      [req.user.userId, content],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create lost and found post' });
        }

        res.status(201).json({
          id: this.lastID,
          message: 'Lost and found post created successfully'
        });
      }
    );
  });
};