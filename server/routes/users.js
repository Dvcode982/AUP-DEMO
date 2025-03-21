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

  // 获取当前用户信息
  app.get('/api/user/profile', authenticateToken, (req, res) => {
    const userId = req.user.userId;
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
};