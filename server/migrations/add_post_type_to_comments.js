// 添加post_type字段到评论表的迁移脚本
module.exports = (db) => {
  return new Promise((resolve, reject) => {
    // 检查comments表是否存在post_type字段
    db.all("PRAGMA table_info(comments)", (err, rows) => {
      if (err) {
        console.error('Error checking comments table schema:', err.message);
        reject(err);
        return;
      }
      
      // 如果post_type字段不存在，添加它
      const hasPostTypeColumn = rows && rows.some(row => row.name === 'post_type');
      
      if (!hasPostTypeColumn) {
        db.run(`ALTER TABLE comments ADD COLUMN post_type TEXT DEFAULT 'post'`, (err) => {
          if (err) {
            console.error('Error adding post_type column to comments table:', err.message);
            reject(err);
          } else {
            console.log('post_type column added to comments table successfully');
            resolve();
          }
        });
      } else {
        console.log('post_type column already exists in comments table');
        resolve();
      }
    });
  });
};