const sqlite3 = require('sqlite3').verbose();

// 创建失物招领数据库连接
const dbLostFound = new sqlite3.Database('./lost_found_database.sqlite', (err) => {
  if (err) {
    console.error('Error opening lost and found database', err.message);
  } else {
    console.log('Connected to the Lost and Found SQLite database.');
    
    // 创建用户表 (与主数据库共享相同结构)
    dbLostFound.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // 创建失物招领表
    dbLostFound.run(`CREATE TABLE IF NOT EXISTS lost_and_found (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      is_returned BOOLEAN DEFAULT FALSE,
      returned_time DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users (id)
    )`);
    
    // 创建失物招领评论表
    dbLostFound.run(`CREATE TABLE IF NOT EXISTS lost_found_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      author_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES lost_and_found (id),
      FOREIGN KEY (author_id) REFERENCES users (id)
    )`);
  }
});

module.exports = dbLostFound;