module.exports = (app, db, bcrypt, jwt) => {
  // 用户注册
  app.post('/register', async (req, res) => {
    const { email, password, confirmPassword } = req.body;

    // 验证输入
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Email, password, and confirm password are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    try {
      // 检查邮箱是否已存在
      db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        if (row) {
          return res.status(400).json({ error: 'Email already exists' });
        }

        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);

        // 创建新用户
        db.run(
          'INSERT INTO users (email, password) VALUES (?, ?)',
          [email, hashedPassword],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to create user' });
            }
            res.status(201).json({
              message: 'User registered successfully',
              userId: this.lastID
            });
          }
        );
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  // 用户登录
  app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // 验证输入
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // 查找用户
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      try {
        // 验证密码
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        // 生成 JWT token
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        );

        res.status(200).json({
          message: 'Login successful',
          userId: user.id,
          token
        });
      } catch (error) {
        res.status(500).json({ error: 'Server error' });
      }
    });
  });
}; 