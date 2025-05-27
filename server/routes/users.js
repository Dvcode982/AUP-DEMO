module.exports = (app, db, authenticateToken) => {
  // 获取所有用户列表
  app.get('/api/users', authenticateToken, (req, res) => {
    db.all('SELECT id, email, created_at FROM users', (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(users);
    });
  });
  
  // 通过邮箱搜索用户
  app.get('/api/users/search', authenticateToken, (req, res) => {
    const email = req.query.email;
    
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }
    
    db.all("SELECT id, email, created_at FROM users WHERE email LIKE ?", [`%${email}%`], (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(users);
    });
  });

  // 获取单个用户信息
  app.get('/api/users/:id', authenticateToken, (req, res) => {
    const userId = req.params.id;
    db.get('SELECT id, email, created_at FROM users WHERE id = ?', [userId], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    });
  });

  // 获取当前用户完整资料（包含profile信息）
  app.get('/api/user/profile', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    
    const query = `
      SELECT 
        u.id, 
        u.email, 
        u.created_at,
        p.username,
        p.avatar,
        p.bio,
        p.department,
        p.grade,
        p.role,
        p.updated_at
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = ?
    `;
    
    db.get(query, [userId], (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    });
  });

  // 更新当前用户资料
  app.put('/api/user/profile', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const { username, bio, department, grade, role, avatar } = req.body;
    
    // 首先检查用户是否存在
    db.get('SELECT id, email FROM users WHERE id = ?', [userId], (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // 更新或插入用户资料
      const query = `
        INSERT INTO user_profiles (user_id, username, bio, department, grade, role, avatar, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(user_id) DO UPDATE SET
          username = excluded.username,
          bio = excluded.bio,
          department = excluded.department,
          grade = excluded.grade,
          role = excluded.role,
          avatar = excluded.avatar,
          updated_at = datetime('now')
      `;
      
      db.run(query, [userId, username, bio, department, grade, role, avatar], function(err) {
        if (err) {
          console.error('Error updating profile:', err);
          return res.status(500).json({ error: 'Failed to update profile' });
        }
        
        // 返回更新后的完整用户信息
        const selectQuery = `
          SELECT 
            u.id, 
            u.email, 
            u.created_at,
            p.username,
            p.avatar,
            p.bio,
            p.department,
            p.grade,
            p.role,
            p.updated_at
          FROM users u
          LEFT JOIN user_profiles p ON u.id = p.user_id
          WHERE u.id = ?
        `;
        
        db.get(selectQuery, [userId], (err, updatedUser) => {
          if (err) {
            console.error('Error fetching updated user:', err);
            return res.status(500).json({ error: 'Profile updated but failed to fetch updated data' });
          }
          res.json(updatedUser);
        });
      });
    });
  });
};