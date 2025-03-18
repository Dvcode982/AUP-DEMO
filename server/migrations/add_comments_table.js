// 添加评论表的迁移脚本
module.exports = (db) => {
  return new Promise((resolve, reject) => {
    // 创建评论表
    db.run(`CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      author_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts (id),
      FOREIGN KEY (author_id) REFERENCES users (id)
    )`, (err) => {
      if (err) {
        console.error('Error creating comments table:', err.message);
        reject(err);
      } else {
        console.log('Comments table created successfully');
        resolve();
      }
    });
  });
};