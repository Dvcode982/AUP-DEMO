// 失物招领数据迁移脚本
const db = require('../db'); // 主数据库
const dbLostFound = require('../db_lost_found'); // 失物招领数据库

/**
 * 迁移失物招领数据到独立数据库
 */
async function migrateLostAndFoundData() {
  console.log('开始迁移失物招领数据...');
  
  try {
    // 1. 迁移用户数据
    await migrateUsers();
    
    // 2. 迁移失物招领帖子
    await migrateLostAndFoundItems();
    
    // 3. 迁移失物招领评论
    await migrateLostAndFoundComments();
    
    console.log('失物招领数据迁移完成！');
  } catch (error) {
    console.error('迁移失败:', error);
    throw error;
  }
}

/**
 * 迁移用户数据
 */
async function migrateUsers() {
  return new Promise((resolve, reject) => {
    // 获取所有用户
    db.all('SELECT * FROM users', [], (err, users) => {
      if (err) {
        console.error('获取用户数据失败:', err);
        return reject(err);
      }
      
      if (users.length === 0) {
        console.log('没有用户数据需要迁移');
        return resolve();
      }
      
      console.log(`开始迁移 ${users.length} 个用户...`);
      
      // 为每个用户创建一个插入Promise
      const insertPromises = users.map(user => {
        return new Promise((resolveInsert, rejectInsert) => {
          // 检查用户是否已存在
          dbLostFound.get('SELECT id FROM users WHERE id = ?', [user.id], (checkErr, existingUser) => {
            if (checkErr) {
              return rejectInsert(checkErr);
            }
            
            if (existingUser) {
              console.log(`用户ID ${user.id} 已存在，跳过`);
              return resolveInsert();
            }
            
            // 插入用户
            dbLostFound.run(
              'INSERT INTO users (id, email, password, created_at) VALUES (?, ?, ?, ?)',
              [user.id, user.email, user.password, user.created_at],
              function(insertErr) {
                if (insertErr) {
                  console.error(`插入用户 ${user.id} 失败:`, insertErr);
                  return rejectInsert(insertErr);
                }
                console.log(`用户 ${user.id} 迁移成功`);
                resolveInsert();
              }
            );
          });
        });
      });
      
      // 等待所有插入完成
      Promise.all(insertPromises)
        .then(() => {
          console.log('所有用户迁移完成');
          resolve();
        })
        .catch(error => {
          console.error('用户迁移过程中出错:', error);
          reject(error);
        });
    });
  });
}

/**
 * 迁移失物招领帖子
 */
async function migrateLostAndFoundItems() {
  return new Promise((resolve, reject) => {
    // 获取所有失物招领帖子
    db.all('SELECT * FROM lost_and_found', [], (err, items) => {
      if (err) {
        console.error('获取失物招领数据失败:', err);
        return reject(err);
      }
      
      if (items.length === 0) {
        console.log('没有失物招领数据需要迁移');
        return resolve();
      }
      
      console.log(`开始迁移 ${items.length} 个失物招领帖子...`);
      
      // 为每个帖子创建一个插入Promise
      const insertPromises = items.map(item => {
        return new Promise((resolveInsert, rejectInsert) => {
          // 检查帖子是否已存在
          dbLostFound.get('SELECT id FROM lost_and_found WHERE id = ?', [item.id], (checkErr, existingItem) => {
            if (checkErr) {
              return rejectInsert(checkErr);
            }
            
            if (existingItem) {
              console.log(`失物招领ID ${item.id} 已存在，跳过`);
              return resolveInsert();
            }
            
            // 插入失物招领帖子
            dbLostFound.run(
              'INSERT INTO lost_and_found (id, author_id, content, is_returned, returned_time, created_at) VALUES (?, ?, ?, ?, ?, ?)',
              [item.id, item.author_id, item.content, item.is_returned, item.returned_time, item.created_at],
              function(insertErr) {
                if (insertErr) {
                  console.error(`插入失物招领 ${item.id} 失败:`, insertErr);
                  return rejectInsert(insertErr);
                }
                console.log(`失物招领 ${item.id} 迁移成功`);
                resolveInsert();
              }
            );
          });
        });
      });
      
      // 等待所有插入完成
      Promise.all(insertPromises)
        .then(() => {
          console.log('所有失物招领帖子迁移完成');
          resolve();
        })
        .catch(error => {
          console.error('失物招领帖子迁移过程中出错:', error);
          reject(error);
        });
    });
  });
}

/**
 * 迁移失物招领评论
 */
async function migrateLostAndFoundComments() {
  return new Promise((resolve, reject) => {
    // 获取所有失物招领评论
    db.all("SELECT * FROM comments WHERE post_type = 'lost_and_found'", [], (err, comments) => {
      if (err) {
        console.error('获取失物招领评论数据失败:', err);
        return reject(err);
      }
      
      if (comments.length === 0) {
        console.log('没有失物招领评论数据需要迁移');
        return resolve();
      }
      
      console.log(`开始迁移 ${comments.length} 条失物招领评论...`);
      
      // 为每条评论创建一个插入Promise
      const insertPromises = comments.map(comment => {
        return new Promise((resolveInsert, rejectInsert) => {
          // 插入失物招领评论（已存在的评论自动跳过）
          dbLostFound.run(
            'INSERT OR IGNORE INTO lost_found_comments (id, item_id, author_id, content, created_at) VALUES (?, ?, ?, ?, ?)',
            [comment.id, comment.post_id, comment.author_id, comment.content, comment.created_at],
            function(insertErr) {
              if (insertErr) {
                console.error(`插入失物招领评论 ${comment.id} 失败:`, insertErr);
                return rejectInsert(insertErr);
              }
              console.log(`失物招领评论 ${comment.id} 迁移成功`);
              resolveInsert();
            }
          );
        });
      });
      
      // 等待所有插入完成
      Promise.all(insertPromises)
        .then(() => {
          console.log('所有失物招领评论迁移完成');
          resolve();
        })
        .catch(error => {
          console.error('失物招领评论迁移过程中出错:', error);
          reject(error);
        });
    });
  });
}

// 导出迁移函数
module.exports = migrateLostAndFoundData;