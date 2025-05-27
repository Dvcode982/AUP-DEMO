const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 连接到数据库
const db = new sqlite3.Database(path.join(__dirname, '../database.sqlite'), (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the SQLite database.');
});

// 主题和标签映射
const topicData = {
  '学术交流': {
    tags: ['计导坛', '数分坛', '英语坛', '线代坛', '网导坛', '信通坛', '心导坛', '数学坛', '物理坛'],
    contents: [
      '今天的高数课真的太难了，有人能解释一下泰勒级数吗？',
      '线性代数的特征值和特征向量，谁能给个通俗的解释？',
      '大物实验报告怎么写啊，求助！',
      '英语四级备考经验分享，词汇量提升技巧',
      '离散数学的图论部分，有什么好的学习资源推荐吗？',
      '概率论与数理统计，贝叶斯定理的应用',
      '数据结构期中考试复习重点整理',
      '算法设计与分析课程难度如何？',
      '计算机网络TCP/IP协议详解',
      '操作系统进程调度算法总结'
    ]
  },
  '资源分享': {
    tags: ['电子书籍', '视频资源', '学习资料', '考试题库', '课件分享', '软件工具'],
    contents: [
      '分享一份数据结构的完整笔记，需要的同学自取',
      '找到了一个很好的编程学习网站，推荐给大家',
      'Python从入门到精通PDF电子书分享',
      '历年期末考试真题汇总，包含答案解析',
      '推荐几个实用的学习APP，提高学习效率',
      'MATLAB软件安装包及教程分享',
      '英语听力练习资源整理，四六级必备',
      '计算机专业课程视频教程合集',
      '考研资料大礼包，包含各科复习资料',
      '实验报告模板分享，格式规范'
    ]
  },
  '竞赛交流': {
    tags: ['数学建模', '程序设计', '创新创业', '学科竞赛', '挑战杯'],
    contents: [
      'ACM程序设计竞赛组队，寻找队友',
      '数学建模国赛经验分享，如何高效分工',
      '蓝桥杯编程大赛备赛心得',
      '创新创业大赛项目征集队员',
      '电子设计竞赛，硬件高手在哪里',
      '互联网+创新创业大赛项目idea讨论',
      '挑战杯参赛经验，从选题到答辩',
      '算法竞赛刷题技巧分享',
      'CTF网络安全竞赛入门指南',
      '机器人竞赛准备中，寻找编程大佬'
    ]
  },
  '校园生活': {
    tags: ['美食推荐', '社团活动', '校园风景', '运动健身', '宿舍生活'],
    contents: [
      '食堂新开的麻辣烫真的绝了，推荐大家去试试',
      '篮球社招新啦，欢迎热爱篮球的同学加入',
      '今天的夕阳太美了，分享几张校园美照',
      '健身房有人一起吗？互相监督打卡',
      '宿舍装修小技巧，让你的小窝更温馨',
      '学校周边美食探店，这家烧烤太香了',
      '摄影社团外拍活动，本周末梅花山',
      '羽毛球馆约球，有一起的吗',
      '图书馆学习氛围真好，推荐几个安静的位置',
      '社团文化节精彩回顾，各社团都太棒了'
    ]
  },
  '技术交流': {
    tags: ['编程开发', '人工智能', '网络技术', '数据分析', '前端开发'],
    contents: [
      'React和Vue选哪个？前端框架对比分析',
      'Python爬虫实战，如何爬取动态网页数据',
      '机器学习入门，推荐几个优质教程',
      'Git使用技巧总结，版本控制必备',
      'Docker容器化部署，简化开发流程',
      '深度学习框架TensorFlow vs PyTorch',
      'RESTful API设计最佳实践',
      '数据库优化技巧，提升查询性能',
      'Linux服务器运维经验分享',
      '前端性能优化，让网页飞起来'
    ]
  },
  '表白墙': {
    tags: ['表白专区', '脱单攻略', '情感故事', '心动瞬间'],
    contents: [
      '表白图书馆常见的那个穿白衬衫的男生',
      '寻找今天下午在梧桐大道帮我捡书的女生',
      '致计科院的学姐，你的笑容真的很温暖',
      '有人认识经常在操场跑步的马尾女孩吗',
      '表白食堂二楼常坐窗边的男生',
      '想认识每天早上在湖边背书的女生',
      '致篮球场上穿23号球衣的男生',
      '寻找昨天在自习室借我充电器的女生',
      '表白每天骑小黄车的眼镜男孩',
      '想认识图书馆三楼常看哲学书的女生'
    ]
  },
  '就业兼职': {
    tags: ['实习信息', '校招信息', '求职经验', '兼职信息'],
    contents: [
      '腾讯暑期实习面经分享，一面二面问题汇总',
      '家教兼职信息，初中数学辅导',
      '阿里巴巴校招流程详解，准备攻略',
      '创业公司实习体验，成长很快',
      '简历制作技巧，HR最看重什么',
      '字节跳动面试经验，算法题很重要',
      '校内勤工助学岗位招聘',
      '互联网大厂实习转正经验',
      '求职季时间规划，不要错过黄金期',
      '面试着装和礼仪注意事项'
    ]
  },
  '校园杂谈': {
    tags: ['校园新闻', '活动通知', '闲聊灌水', '情感交流'],
    contents: [
      '学校要举办音乐节了，有人一起去吗',
      '期末考试周，大家都复习得怎么样了',
      '宿舍空调终于修好了，感动哭了',
      '今天的月亮好圆，适合许愿',
      '食堂阿姨手抖治好了，今天肉给得好多',
      '图书馆占座现象严重，大家怎么看',
      '快递站排队太长了，有什么好办法吗',
      '学校的猫咪又多了几只，太可爱了',
      '期待已久的校庆要来了，会有什么活动',
      '最近压力有点大，如何调节心态'
    ]
  }
};

// 生成随机日期（最近30天内）
function randomDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const hoursAgo = Math.floor(Math.random() * 24);
  const minutesAgo = Math.floor(Math.random() * 60);
  
  now.setDate(now.getDate() - daysAgo);
  now.setHours(now.getHours() - hoursAgo);
  now.setMinutes(now.getMinutes() - minutesAgo);
  
  return now.toISOString().replace('T', ' ').substring(0, 19);
}

// 生成随机图片（30%概率有图片）
function randomImage() {
  if (Math.random() > 0.3) return null;
  
  // 使用随机数生成不同的图片
  const randomId = Math.floor(Math.random() * 1000) + 1;
  const width = 400 + Math.floor(Math.random() * 200); // 400-600
  const height = 300 + Math.floor(Math.random() * 100); // 300-400
  
  return `https://picsum.photos/${width}/${height}?random=${randomId}`;
}

// 清理现有数据
async function cleanDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log('Cleaning existing data...');
      
      // 删除相关表的数据
      db.run('DELETE FROM post_tags', (err) => {
        if (err) console.error('Error deleting post_tags:', err);
      });
      
      db.run('DELETE FROM likes', (err) => {
        if (err) console.error('Error deleting likes:', err);
      });
      
      db.run('DELETE FROM shares', (err) => {
        if (err) console.error('Error deleting shares:', err);
      });
      
      db.run('DELETE FROM comments WHERE post_type = "post"', (err) => {
        if (err) console.error('Error deleting comments:', err);
      });
      
      db.run('DELETE FROM user_interactions', (err) => {
        if (err) console.error('Error deleting user_interactions:', err);
      });
      
      db.run('DELETE FROM posts', (err) => {
        if (err) {
          console.error('Error deleting posts:', err);
          reject(err);
        } else {
          console.log('Existing data cleaned successfully');
          resolve();
        }
      });
    });
  });
}

// 生成测试帖子
async function generateTestPosts() {
  console.log('Generating 100 test posts...');
  
  const topics = Object.keys(topicData);
  let postCount = 0;
  
  // 确保有一个测试用户
  await new Promise((resolve, reject) => {
    db.run(
      'INSERT OR IGNORE INTO users (id, email, password) VALUES (1, "test@example.com", "$2b$10$YourHashedPasswordHere")',
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
  
  for (let i = 0; i < 100; i++) {
    // 随机选择主题
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const topicInfo = topicData[topic];
    
    // 随机选择内容
    const content = topicInfo.contents[Math.floor(Math.random() * topicInfo.contents.length)];
    
    // 随机选择1-3个标签
    const numTags = Math.floor(Math.random() * 3) + 1;
    const selectedTags = [];
    const availableTags = [...topicInfo.tags];
    
    for (let j = 0; j < numTags && availableTags.length > 0; j++) {
      const tagIndex = Math.floor(Math.random() * availableTags.length);
      selectedTags.push(availableTags[tagIndex]);
      availableTags.splice(tagIndex, 1);
    }
    
    // 生成帖子
    const image = randomImage();
    const createdAt = randomDate();
    
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO posts (author_id, content, image, category, privacy, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [1, content, image, topic, 'public', createdAt],
        function(err) {
          if (err) {
            console.error('Error inserting post:', err);
            reject(err);
          } else {
            const postId = this.lastID;
            
            // 添加标签
            const tagPromises = selectedTags.map(tag => {
              return new Promise((resolveTag, rejectTag) => {
                db.run(
                  'INSERT INTO post_tags (post_id, tag) VALUES (?, ?)',
                  [postId, tag],
                  (err) => {
                    if (err) rejectTag(err);
                    else resolveTag();
                  }
                );
              });
            });
            
            Promise.all(tagPromises)
              .then(() => {
                postCount++;
                console.log(`Created post ${postCount}/100: ${topic} - ${content.substring(0, 30)}...`);
                resolve();
              })
              .catch(reject);
          }
        }
      );
    });
    
    // 随机添加一些点赞和分享（20%概率）
    if (Math.random() < 0.2) {
      const postId = postCount;
      await new Promise((resolve) => {
        db.run('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [postId, 1], () => resolve());
      });
    }
    
    if (Math.random() < 0.1) {
      const postId = postCount;
      await new Promise((resolve) => {
        db.run('INSERT INTO shares (post_id, user_id) VALUES (?, ?)', [postId, 1], () => resolve());
      });
    }
  }
  
  console.log('Test posts generation completed!');
}

// 主函数
async function main() {
  try {
    await cleanDatabase();
    await generateTestPosts();
    
    // 显示统计信息
    db.get('SELECT COUNT(*) as count FROM posts', (err, result) => {
      if (!err) {
        console.log(`\nTotal posts in database: ${result.count}`);
      }
    });
    
    db.get('SELECT COUNT(*) as count FROM post_tags', (err, result) => {
      if (!err) {
        console.log(`Total tags in database: ${result.count}`);
      }
      
      // 关闭数据库连接
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('\nDatabase connection closed.');
        }
      });
    });
    
  } catch (error) {
    console.error('Error:', error);
    db.close();
  }
}

// 运行脚本
main(); 