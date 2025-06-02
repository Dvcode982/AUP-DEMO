module.exports = function(db) {
  return new Promise((resolve, reject) => {
    db.run(`CREATE TABLE IF NOT EXISTS friends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      friend_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (friend_id) REFERENCES users (id),
      UNIQUE(user_id, friend_id)
    )`, (err) => {
      if (err) {
        console.error('Error creating friends table:', err.message);
        return reject(err);
      }
      
      // 创建索引以优化查询
      db.run(`CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id)`, (err) => {
        if (err) {
          console.error('Error creating friends user_id index:', err.message);
          return reject(err);
        }
        
        db.run(`CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id)`, (err) => {
          if (err) {
            console.error('Error creating friends friend_id index:', err.message);
            return reject(err);
          }
          
          db.run(`CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status)`, (err) => {
            if (err) {
              console.error('Error creating friends status index:', err.message);
              return reject(err);
            }
            
            console.log('Friends table and indexes created successfully');
            resolve();
          });
        });
      });
    });
  });
}; 