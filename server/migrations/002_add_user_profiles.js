module.exports = function(db) {
  return new Promise((resolve, reject) => {
    // 创建用户资料表
    db.run(`CREATE TABLE IF NOT EXISTS user_profiles (
      user_id INTEGER PRIMARY KEY,
      username TEXT,
      avatar TEXT,
      bio TEXT,
      department TEXT,
      grade TEXT,
      role TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`, (err) => {
      if (err) {
        console.error('Error creating user_profiles table:', err.message);
        return reject(err);
      }
      
      console.log('User profiles table created successfully');
      
      // 为现有用户创建默认资料
      db.run(`INSERT OR IGNORE INTO user_profiles (user_id) 
              SELECT id FROM users`, (err) => {
        if (err) {
          console.error('Error creating default profiles:', err.message);
          return reject(err);
        }
        
        console.log('Default profiles created for existing users');
        resolve();
      });
    });
  });
}; 