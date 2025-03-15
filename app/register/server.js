const express = require('express');

const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../../server/db');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// 注册用户
app.post('/register', async (req, res) => {
  const { email, password, confirmPassword } = req.body;

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
      const query = `INSERT INTO users (email, password) VALUES (?, ?)`;
      db.run(query, [email, hashedPassword], function(err) {
        if (err) {
          return res.status(400).json({ error: 'Failed to create user' });
        }
        res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
