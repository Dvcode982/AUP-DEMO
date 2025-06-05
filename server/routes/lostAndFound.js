module.exports = (app, db, authenticateToken) => {
  // 为lost_and_found表添加item_type字段
  db.run(`ALTER TABLE lost_and_found ADD COLUMN item_type TEXT DEFAULT 'lost'`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding item_type column:', err.message);
    } else {
      console.log('Added item_type column to lost_and_found table');
    }
  });

  // 获取失物招领列表
  app.get('/api/lost-and-found', async (req, res) => {
    const { search, type } = req.query;
    
    let query = `
      SELECT 
        l.id,
        u.email as author,
        l.content,
        l.item_type as itemType,
        l.is_returned as isReturned,
        l.returned_time as returnedTime,
        l.created_at as time
      FROM lost_and_found l
      JOIN users u ON l.author_id = u.id
    `;
    
    const conditions = [];
    const params = [];
    
    // 搜索条件
    if (search) {
      conditions.push('l.content LIKE ?');
      params.push(`%${search}%`);
    }
    
    // 类型过滤
    if (type && (type === 'lost' || type === 'found')) {
      conditions.push('l.item_type = ?');
      params.push(type);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ` ORDER BY l.created_at DESC`;

    db.all(query, params, (err, items) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // 根据类型为每个项目添加正确的标签
      const itemsWithTags = items.map(item => {
        const itemType = item.itemType || 'lost'; // 默认为失物
        return {
          ...item,
          itemType,
          tags: [itemType === 'lost' ? '失物' : '招领'],
          isLostAndFound: true
        };
      });

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
        l.item_type as itemType,
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

      // 根据类型添加正确的标签
      const itemType = item.itemType || 'lost';
      item.itemType = itemType;
      item.tags = [itemType === 'lost' ? '失物' : '招领'];
      item.isLostAndFound = true;
      
      res.json(item);
    });
  });

  // 创建失物招领帖子
  app.post('/api/lost-and-found', authenticateToken, async (req, res) => {
    const { content, itemType = 'lost', itemName, category, location, contactInfo, reward } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // 验证itemType
    if (!['lost', 'found'].includes(itemType)) {
      return res.status(400).json({ error: 'Invalid item type. Must be "lost" or "found"' });
    }

    // 构建完整的内容描述
    let fullContent = content;
    if (itemName) {
      fullContent = `物品名称：${itemName}\n${content}`;
    }
    if (location) {
      const locationLabel = itemType === 'lost' ? '丢失地点' : '拾获地点';
      fullContent += `\n${locationLabel}：${location}`;
    }
    if (contactInfo) {
      fullContent += `\n联系方式：${contactInfo}`;
    }
    if (reward && itemType === 'lost') {
      fullContent += `\n酬谢：${reward}`;
    }

    db.run(
      'INSERT INTO lost_and_found (author_id, content, item_type) VALUES (?, ?, ?)',
      [req.user.userId, fullContent, itemType],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create lost and found post' });
        }

        res.status(201).json({
          id: this.lastID,
          itemType,
          message: `${itemType === 'lost' ? '失物' : '招领'}信息发布成功`
        });
      }
    );
  });

  // 获取失物招领统计信息
  app.get('/api/lost-and-found/stats', async (req, res) => {
    console.log('Lost and Found stats API called');
    try {
      // 并行查询各种统计信息
      const queries = [
        // 总数
        new Promise((resolve) => {
          console.log('Querying total count...');
          db.get('SELECT COUNT(*) as count FROM lost_and_found', (err, result) => {
            if (err) {
              console.error('Error getting total count:', err);
              resolve(0);
            } else {
              console.log('Total count result:', result);
              resolve(result?.count || 0);
            }
          });
        }),
        
        // 失物数量
        new Promise((resolve) => {
          console.log('Querying lost count...');
          db.get('SELECT COUNT(*) as count FROM lost_and_found WHERE item_type = "lost"', (err, result) => {
            if (err) {
              console.error('Error getting lost count:', err);
              resolve(0);
            } else {
              console.log('Lost count result:', result);
              resolve(result?.count || 0);
            }
          });
        }),
        
        // 招领数量
        new Promise((resolve) => {
          console.log('Querying found count...');
          db.get('SELECT COUNT(*) as count FROM lost_and_found WHERE item_type = "found"', (err, result) => {
            if (err) {
              console.error('Error getting found count:', err);
              resolve(0);
            } else {
              console.log('Found count result:', result);
              resolve(result?.count || 0);
            }
          });
        }),
        
        // 已解决数量
        new Promise((resolve) => {
          console.log('Querying resolved count...');
          db.get('SELECT COUNT(*) as count FROM lost_and_found WHERE is_returned = 1', (err, result) => {
            if (err) {
              console.error('Error getting resolved count:', err);
              resolve(0);
            } else {
              console.log('Resolved count result:', result);
              resolve(result?.count || 0);
            }
          });
        }),
        
        // 未解决数量
        new Promise((resolve) => {
          console.log('Querying unresolved count...');
          db.get('SELECT COUNT(*) as count FROM lost_and_found WHERE is_returned = 0', (err, result) => {
            if (err) {
              console.error('Error getting unresolved count:', err);
              resolve(0);
            } else {
              console.log('Unresolved count result:', result);
              resolve(result?.count || 0);
            }
          });
        })
      ];

      console.log('Executing all queries...');
      const [total, lost, found, resolved, unresolved] = await Promise.all(queries);

      const statsResult = {
        total: total || 0,
        lost: lost || 0,
        found: found || 0,
        resolved: resolved || 0,
        unresolved: unresolved || 0
      };

      console.log('Stats result:', statsResult);
      res.json(statsResult);
    } catch (error) {
      console.error('Error fetching lost and found stats:', error);
      // 返回默认值而不是错误
      res.json({
        total: 0,
        lost: 0,
        found: 0,
        resolved: 0,
        unresolved: 0
      });
    }
  });
};