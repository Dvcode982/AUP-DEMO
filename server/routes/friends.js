module.exports = function(app, db, authenticateToken) {
  // 搜索用户（不包括自己和已经是好友的）
  app.get('/api/friends/search', authenticateToken, (req, res) => {
    const { query } = req.query;
    const userId = req.user.userId;
    
    if (!query || query.trim().length === 0) {
      return res.json({ users: [] });
    }
    
    const searchPattern = `%${query}%`;
    
    // 搜索用户，排除自己和已经是好友的
    const sql = `
      SELECT 
        u.id,
        u.email,
        up.username,
        up.avatar,
        up.department,
        up.grade,
        up.bio,
        CASE 
          WHEN f.id IS NOT NULL THEN 'friend'
          WHEN fr_sent.id IS NOT NULL THEN 'pending_sent'
          WHEN fr_received.id IS NOT NULL THEN 'pending_received'
          ELSE 'none'
        END as friendship_status
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN friends f ON 
        (f.user_id = ? AND f.friend_id = u.id AND f.status = 'accepted') OR 
        (f.friend_id = ? AND f.user_id = u.id AND f.status = 'accepted')
      LEFT JOIN friends fr_sent ON 
        fr_sent.user_id = ? AND fr_sent.friend_id = u.id AND fr_sent.status = 'pending'
      LEFT JOIN friends fr_received ON 
        fr_received.friend_id = ? AND fr_received.user_id = u.id AND fr_received.status = 'pending'
      WHERE 
        u.id != ? AND 
        (u.email LIKE ? OR up.username LIKE ? OR up.department LIKE ?)
      ORDER BY up.username ASC
      LIMIT 20
    `;
    
    db.all(sql, [userId, userId, userId, userId, userId, searchPattern, searchPattern, searchPattern], (err, users) => {
      if (err) {
        console.error('Search users error:', err);
        return res.status(500).json({ error: '搜索用户失败' });
      }
      res.json({ users });
    });
  });

  // 获取好友列表
  app.get('/api/friends/list', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    
    const sql = `
      SELECT 
        u.id,
        u.email,
        up.username,
        up.avatar,
        up.department,
        up.grade,
        up.bio,
        f.created_at as friendship_date
      FROM friends f
      JOIN users u ON 
        CASE 
          WHEN f.user_id = ? THEN f.friend_id = u.id
          ELSE f.user_id = u.id
        END
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE 
        (f.user_id = ? OR f.friend_id = ?) AND 
        f.status = 'accepted'
      ORDER BY up.username ASC
    `;
    
    db.all(sql, [userId, userId, userId], (err, friends) => {
      if (err) {
        console.error('Get friends error:', err);
        return res.status(500).json({ error: '获取好友列表失败' });
      }
      res.json({ friends });
    });
  });

  // 获取好友请求
  app.get('/api/friends/requests', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    
    // 获取收到的好友请求
    const receivedSql = `
      SELECT 
        f.id as request_id,
        u.id,
        u.email,
        up.username,
        up.avatar,
        up.department,
        up.grade,
        up.bio,
        f.created_at as request_date
      FROM friends f
      JOIN users u ON f.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE f.friend_id = ? AND f.status = 'pending'
      ORDER BY f.created_at DESC
    `;
    
    // 获取发送的好友请求
    const sentSql = `
      SELECT 
        f.id as request_id,
        u.id,
        u.email,
        up.username,
        up.avatar,
        up.department,
        up.grade,
        up.bio,
        f.created_at as request_date
      FROM friends f
      JOIN users u ON f.friend_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE f.user_id = ? AND f.status = 'pending'
      ORDER BY f.created_at DESC
    `;
    
    db.all(receivedSql, [userId], (err1, received) => {
      if (err1) {
        console.error('Get received requests error:', err1);
        return res.status(500).json({ error: '获取好友请求失败' });
      }
      
      db.all(sentSql, [userId], (err2, sent) => {
        if (err2) {
          console.error('Get sent requests error:', err2);
          return res.status(500).json({ error: '获取好友请求失败' });
        }
        
        res.json({ received, sent });
      });
    });
  });

  // 发送好友请求
  app.post('/api/friends/request', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const { friendId } = req.body;
    
    if (!friendId) {
      return res.status(400).json({ error: '请提供好友ID' });
    }
    
    // 检查是否已经是好友或有待处理的请求
    const checkSql = `
      SELECT * FROM friends 
      WHERE 
        (user_id = ? AND friend_id = ?) OR 
        (user_id = ? AND friend_id = ?)
    `;
    
    db.get(checkSql, [userId, friendId, friendId, userId], (err, existing) => {
      if (err) {
        console.error('Check existing friend error:', err);
        return res.status(500).json({ error: '发送好友请求失败' });
      }
      
      if (existing) {
        return res.status(400).json({ error: '已经发送过好友请求或已经是好友' });
      }
      
      // 创建好友请求
      const insertSql = `
        INSERT INTO friends (user_id, friend_id, status)
        VALUES (?, ?, 'pending')
      `;
      
      db.run(insertSql, [userId, friendId], function(err) {
        if (err) {
          console.error('Send friend request error:', err);
          return res.status(500).json({ error: '发送好友请求失败' });
        }
        
        res.json({ 
          success: true, 
          message: '好友请求已发送',
          requestId: this.lastID
        });
      });
    });
  });

  // 接受好友请求
  app.post('/api/friends/accept/:requestId', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const { requestId } = req.params;
    
    // 验证请求是否发送给当前用户
    const checkSql = `
      SELECT * FROM friends 
      WHERE id = ? AND friend_id = ? AND status = 'pending'
    `;
    
    db.get(checkSql, [requestId, userId], (err, request) => {
      if (err) {
        console.error('Check friend request error:', err);
        return res.status(500).json({ error: '接受好友请求失败' });
      }
      
      if (!request) {
        return res.status(404).json({ error: '好友请求不存在' });
      }
      
      // 更新状态为已接受
      const updateSql = `
        UPDATE friends 
        SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(updateSql, [requestId], (err) => {
        if (err) {
          console.error('Accept friend request error:', err);
          return res.status(500).json({ error: '接受好友请求失败' });
        }
        
        res.json({ success: true, message: '已接受好友请求' });
      });
    });
  });

  // 拒绝好友请求
  app.post('/api/friends/reject/:requestId', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const { requestId } = req.params;
    
    // 验证请求是否发送给当前用户
    const checkSql = `
      SELECT * FROM friends 
      WHERE id = ? AND friend_id = ? AND status = 'pending'
    `;
    
    db.get(checkSql, [requestId, userId], (err, request) => {
      if (err) {
        console.error('Check friend request error:', err);
        return res.status(500).json({ error: '拒绝好友请求失败' });
      }
      
      if (!request) {
        return res.status(404).json({ error: '好友请求不存在' });
      }
      
      // 删除请求
      db.run(`DELETE FROM friends WHERE id = ?`, [requestId], (err) => {
        if (err) {
          console.error('Reject friend request error:', err);
          return res.status(500).json({ error: '拒绝好友请求失败' });
        }
        
        res.json({ success: true, message: '已拒绝好友请求' });
      });
    });
  });

  // 取消好友请求
  app.delete('/api/friends/request/:requestId', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const { requestId } = req.params;
    
    // 验证请求是否由当前用户发送
    const checkSql = `
      SELECT * FROM friends 
      WHERE id = ? AND user_id = ? AND status = 'pending'
    `;
    
    db.get(checkSql, [requestId, userId], (err, request) => {
      if (err) {
        console.error('Check friend request error:', err);
        return res.status(500).json({ error: '取消好友请求失败' });
      }
      
      if (!request) {
        return res.status(404).json({ error: '好友请求不存在' });
      }
      
      // 删除请求
      db.run(`DELETE FROM friends WHERE id = ?`, [requestId], (err) => {
        if (err) {
          console.error('Cancel friend request error:', err);
          return res.status(500).json({ error: '取消好友请求失败' });
        }
        
        res.json({ success: true, message: '已取消好友请求' });
      });
    });
  });

  // 删除好友
  app.delete('/api/friends/:friendId', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const { friendId } = req.params;
    
    // 删除好友关系
    const deleteSql = `
      DELETE FROM friends 
      WHERE 
        ((user_id = ? AND friend_id = ?) OR 
        (user_id = ? AND friend_id = ?)) AND 
        status = 'accepted'
    `;
    
    db.run(deleteSql, [userId, friendId, friendId, userId], function(err) {
      if (err) {
        console.error('Delete friend error:', err);
        return res.status(500).json({ error: '删除好友失败' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: '好友关系不存在' });
      }
      
      res.json({ success: true, message: '已删除好友' });
    });
  });

  // 获取推荐好友（支持分页）
  app.get('/api/friends/recommendations', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 10;
    
    // 获取所有非好友用户，按推荐权重排序
    const sql = `
      WITH user_tags AS (
        -- 获取用户常用的标签（从他们发布的帖子中提取）
        SELECT 
          p.author_id as user_id,
          pt.tag,
          COUNT(*) as tag_count
        FROM posts p
        JOIN post_tags pt ON p.id = pt.post_id
        GROUP BY p.author_id, pt.tag
      ),
      mutual_friends AS (
        -- 获取好友的好友（潜在的推荐对象）
        SELECT DISTINCT
          CASE 
            WHEN f2.user_id = f1.friend_id THEN f2.friend_id
            ELSE f2.user_id
          END as recommended_user_id,
          COUNT(DISTINCT f1.user_id) as mutual_count
        FROM friends f1
        JOIN friends f2 ON 
          (f1.friend_id = f2.user_id OR f1.friend_id = f2.friend_id) AND
          f2.status = 'accepted'
        WHERE 
          (f1.user_id = ? OR f1.friend_id = ?) AND 
          f1.status = 'accepted' AND
          f2.user_id != ? AND f2.friend_id != ?
        GROUP BY recommended_user_id
      ),
      user_tag_matches AS (
        -- 计算标签匹配度
        SELECT 
          ut2.user_id,
          COUNT(DISTINCT ut2.tag) as matching_tags
        FROM user_tags ut1
        JOIN user_tags ut2 ON ut1.tag = ut2.tag
        WHERE ut1.user_id = ? AND ut2.user_id != ?
        GROUP BY ut2.user_id
      )
      SELECT DISTINCT
        u.id,
        u.email,
        up.username,
        up.avatar,
        up.department,
        up.grade,
        up.bio,
        COALESCE(mf.mutual_count, 0) as mutual_friends_count,
        GROUP_CONCAT(DISTINCT ut.tag) as user_tags,
        CASE 
          WHEN up.department = (SELECT department FROM user_profiles WHERE user_id = ?) THEN 1
          ELSE 0
        END as same_department,
        COALESCE(utm.matching_tags, 0) as matching_tags_count,
        -- 计算推荐分数
        (
          COALESCE(mf.mutual_count, 0) * 10 + 
          CASE WHEN up.department = (SELECT department FROM user_profiles WHERE user_id = ?) THEN 5 ELSE 0 END +
          COALESCE(utm.matching_tags, 0) * 2
        ) as recommendation_score
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN mutual_friends mf ON u.id = mf.recommended_user_id
      LEFT JOIN user_tags ut ON u.id = ut.user_id
      LEFT JOIN user_tag_matches utm ON u.id = utm.user_id
      LEFT JOIN friends f ON 
        (f.user_id = ? AND f.friend_id = u.id) OR 
        (f.friend_id = ? AND f.user_id = u.id)
      WHERE 
        u.id != ? AND 
        f.id IS NULL
      GROUP BY u.id
      ORDER BY 
        recommendation_score DESC,
        u.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    // 获取总数
    const countSql = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      LEFT JOIN friends f ON 
        (f.user_id = ? AND f.friend_id = u.id) OR 
        (f.friend_id = ? AND f.user_id = u.id)
      WHERE 
        u.id != ? AND 
        f.id IS NULL
    `;
    
    db.get(countSql, [userId, userId, userId], (err, countResult) => {
      if (err) {
        console.error('Get count error:', err);
        return res.status(500).json({ error: '获取用户总数失败' });
      }
      
      db.all(sql, [
        userId, userId, userId, userId, // for mutual friends
        userId, userId, // for tag matches
        userId, // for same department check
        userId, // for recommendation score
        userId, userId, // for existing friends check
        userId, // for user != self
        limit, offset // pagination
      ], (err, recommendations) => {
        if (err) {
          console.error('Get recommendations error:', err);
          return res.status(500).json({ error: '获取推荐好友失败' });
        }
        
        // 处理标签字符串
        recommendations = recommendations.map(user => ({
          ...user,
          tags: user.user_tags ? user.user_tags.split(',').slice(0, 5) : [] // 限制显示5个标签
        }));
        
        res.json({ 
          recommendations,
          total: countResult.total,
          hasMore: offset + limit < countResult.total
        });
      });
    });
  });
}; 