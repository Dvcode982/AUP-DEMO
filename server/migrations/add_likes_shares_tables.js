// 添加点赞和分享表的迁移脚本
module.exports = (db) => {
  return new Promise((resolve, reject) => {
    // 创建点赞表
    db.run(`CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts (id),
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE(post_id, user_id)
    )`, (err) => {
      if (err) {
        console.error('Error creating likes table:', err.message);
        reject(err);
        return;
      }
      
      console.log('Likes table created successfully');
      
      // 创建分享表
      db.run(`CREATE TABLE IF NOT EXISTS shares (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`, (err) => {
        if (err) {
          console.error('Error creating shares table:', err.message);
          reject(err);
          return;
        }
        
        console.log('Shares table created successfully');
        resolve();
      });
    });
  });
};