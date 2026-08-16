// 失物招领类型迁移脚本
// 作为启动迁移运行：确保 lost_and_found 表存在 item_type 字段，并为旧数据设置默认类型。
// 该迁移是幂等的，可安全地反复执行。
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

module.exports = async function updateLostFoundTypes() {
  const dbPath = path.join(__dirname, '..', 'lost_found_database.sqlite');

  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening lost & found database:', err.message);
        return reject(err);
      }

      // 1. 确保 item_type 字段存在
      db.run(`ALTER TABLE lost_and_found ADD COLUMN item_type TEXT DEFAULT 'lost'`, (alterErr) => {
        if (alterErr && !alterErr.message.includes('duplicate column')) {
          console.error('Error adding item_type column:', alterErr.message);
          db.close();
          return reject(alterErr);
        }

        // 2. 更新所有现有记录的 item_type
        db.run(`UPDATE lost_and_found SET item_type = 'lost' WHERE item_type IS NULL OR item_type = ''`, function(updateErr) {
          if (updateErr) {
            console.error('Error updating item_type defaults:', updateErr.message);
            db.close();
            return reject(updateErr);
          }

          console.log(`Lost & found item_type migration completed (${this.changes} records defaulted)`);
          db.close();
          resolve();
        });
      });
    });
  });
};
