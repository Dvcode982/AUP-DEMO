// 失物招领类型迁移脚本
const sqlite3 = require('sqlite3').verbose();

// 连接到失物招领数据库
const dbPath = './lost_found_database.sqlite';
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the Lost and Found SQLite database.');
});

async function migrateLostFoundTypes() {
  console.log('开始迁移失物招领类型数据...');
  
  try {
    // 1. 确保 item_type 字段存在
    await new Promise((resolve, reject) => {
      db.run(`ALTER TABLE lost_and_found ADD COLUMN item_type TEXT DEFAULT 'lost'`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          reject(err);
        } else {
          console.log('✓ item_type 字段已添加或已存在');
          resolve();
        }
      });
    });

    // 2. 更新所有现有记录的 item_type
    await new Promise((resolve, reject) => {
      db.run(`UPDATE lost_and_found SET item_type = 'lost' WHERE item_type IS NULL OR item_type = ''`, function(err) {
        if (err) {
          reject(err);
        } else {
          console.log(`✓ 已更新 ${this.changes} 条记录的类型为 'lost'`);
          resolve();
        }
      });
    });

    // 3. 检查数据统计
    const stats = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          item_type,
          COUNT(*) as count 
        FROM lost_and_found 
        GROUP BY item_type
      `, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    console.log('\n📊 当前数据统计:');
    stats.forEach(stat => {
      const typeName = stat.item_type === 'lost' ? '失物' : stat.item_type === 'found' ? '招领' : stat.item_type;
      console.log(`   ${typeName}: ${stat.count} 条`);
    });

    console.log('\n✅ 失物招领类型迁移完成！');
    
  } catch (error) {
    console.error('❌ 迁移失败:', error);
    throw error;
  } finally {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  migrateLostFoundTypes().catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

module.exports = { migrateLostFoundTypes }; 