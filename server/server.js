const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// 中间件
app.use(bodyParser.json({ limit: '50mb' }));  // 增加限制到 50MB
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));  // 同样增加 urlencoded 的限制
app.use(cors());

// 初始化数据库
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeTables()
      .then(() => runMigrations())
      .catch(err => console.error('Error during initialization:', err));
  }
});

// 运行迁移脚本
async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  try {
    // 检查migrations目录是否存在
    if (!fs.existsSync(migrationsDir)) {
      console.log('No migrations directory found');
      return;
    }
    
    // 读取所有迁移文件
    const files = fs.readdirSync(migrationsDir);
    
    // 按顺序执行每个迁移文件
    for (const file of files) {
      if (file.endsWith('.js')) {
        const migration = require(path.join(migrationsDir, file));
        console.log(`Running migration: ${file}`);
        await migration(db);
        console.log(`Migration completed: ${file}`);
      }
    }
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}

// 初始化数据库表
function initializeTables() {
  return new Promise((resolve, reject) => {
    // 用户表
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
        return reject(err);
      }
      
      // 帖子表
      db.run(`CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        author_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        category TEXT,
        privacy TEXT DEFAULT 'public',
        location TEXT,
        FOREIGN KEY (author_id) REFERENCES users (id)
      )`, (err) => {
        if (err) {
          console.error('Error creating posts table:', err.message);
          return reject(err);
        }
        
        // 帖子标签表
        db.run(`CREATE TABLE IF NOT EXISTS post_tags (
          post_id INTEGER NOT NULL,
          tag TEXT NOT NULL,
          FOREIGN KEY (post_id) REFERENCES posts (id)
        )`, (err) => {
          if (err) {
            console.error('Error creating post_tags table:', err.message);
            return reject(err);
          }
          
          // 失物招领表
          db.run(`CREATE TABLE IF NOT EXISTS lost_and_found (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            is_returned BOOLEAN DEFAULT FALSE,
            returned_time DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (author_id) REFERENCES users (id)
          )`, (err) => {
            if (err) {
              console.error('Error creating lost_and_found table:', err.message);
              return reject(err);
            }
            
            // 评论表
            db.run(`CREATE TABLE IF NOT EXISTS comments (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              post_id INTEGER NOT NULL,
              author_id INTEGER NOT NULL,
              content TEXT NOT NULL,
              post_type TEXT DEFAULT 'post',
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (post_id) REFERENCES posts (id),
              FOREIGN KEY (author_id) REFERENCES users (id)
            )`, (err) => {
              if (err) {
                console.error('Error creating comments table:', err.message);
                return reject(err);
              }
              
              console.log('All tables initialized successfully');
              resolve();
            });
          });
        });
      });
    });
  });
}

// JWT 中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    console.log('Token verified successfully for user:', decoded.userId);
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// 基础路由
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to AVP API' });
});

// 导入路由
require('./routes/auth')(app, db, bcrypt, jwt);
require('./routes/posts')(app, db, authenticateToken);
require('./routes/lostAndFound')(app, db, authenticateToken);
require('./routes/comments')(app, db, authenticateToken);
require('./routes/lostAndFoundComments')(app, db, authenticateToken);
require('./routes/users')(app, db, authenticateToken);
require('./routes/messages')(app, db, authenticateToken);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});