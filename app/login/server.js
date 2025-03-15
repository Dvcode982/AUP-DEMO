const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
const port = 5000;

/*使用中间件
app.use(bodyParser.json());
app.use(cors());

// 初始化数据库
const db = new sqlite3.Database('./users.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )`);
  }
});

// 注册用户
app.post('/register', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const query = `INSERT INTO users (email, password) VALUES (?, ?)`;
  db.run(query, [email, password], function(err) {
    if (err) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
  });
});
*/
// 用户登录
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const query = `SELECT * FROM users WHERE email = ?`;
  db.get(query, [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    try {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // 生成JWT token
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.status(200).json({ 
        message: 'Login successful', 
        userId: user.id,
        token,
        email: user.email
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
