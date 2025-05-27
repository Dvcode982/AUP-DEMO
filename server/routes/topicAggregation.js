module.exports = (app, db, authenticateToken) => {
  // 获取用户的主题推荐
  app.get('/api/topic-recommendations', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    
    try {
      // 获取用户最近的互动记录
      const recentInteractions = await new Promise((resolve, reject) => {
        db.all(
          `SELECT topic, tag, action_type, COUNT(*) as count
           FROM user_interactions
           WHERE user_id = ? AND created_at > datetime('now', '-30 days')
           GROUP BY topic, tag, action_type
           ORDER BY count DESC
           LIMIT 50`,
          [userId],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });
      
      // 计算主题和标签的权重分数
      const topicScores = {};
      const tagScores = {};
      
      recentInteractions.forEach(interaction => {
        const weight = getActionWeight(interaction.action_type);
        
        if (interaction.topic) {
          topicScores[interaction.topic] = (topicScores[interaction.topic] || 0) + interaction.count * weight;
        }
        
        if (interaction.tag) {
          tagScores[interaction.tag] = (tagScores[interaction.tag] || 0) + interaction.count * weight;
        }
      });
      
      // 获取相关主题的热门标签
      const topTopics = Object.entries(topicScores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([topic]) => topic);
      
      const recommendations = await Promise.all(
        topTopics.map(async (topic) => {
          const relatedTags = await getTopicRelatedTags(db, topic, userId);
          return {
            topic,
            score: topicScores[topic],
            relatedTags: relatedTags.slice(0, 10)
          };
        })
      );
      
      res.json({
        recommendations,
        topTags: Object.entries(tagScores)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 20)
          .map(([tag, score]) => ({ tag, score }))
      });
      
    } catch (error) {
      console.error('Error getting topic recommendations:', error);
      res.status(500).json({ error: 'Failed to get recommendations' });
    }
  });
  
  // 获取智能聚合的帖子
  app.get('/api/aggregated-posts', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { limit = 20, offset = 0 } = req.query;
    
    try {
      // 获取用户感兴趣的主题和标签
      const userInterests = await getUserInterests(db, userId);
      
      // 构建查询条件
      let query = `
        SELECT DISTINCT
          p.id,
          u.email as author,
          p.content,
          p.image,
          p.created_at as time,
          p.category,
          p.privacy,
          p.location,
          (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes,
          (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments,
          (SELECT COUNT(*) FROM shares WHERE post_id = p.id) as shares,
          CASE 
            WHEN p.category IN (${userInterests.topics.map(() => '?').join(',')}) THEN 2
            WHEN EXISTS (
              SELECT 1 FROM post_tags pt 
              WHERE pt.post_id = p.id 
              AND pt.tag IN (${userInterests.tags.map(() => '?').join(',')})
            ) THEN 1
            ELSE 0
          END as relevance_score
        FROM posts p
        JOIN users u ON p.author_id = u.id
        WHERE p.privacy = 'public'
        ORDER BY relevance_score DESC, p.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      const params = [...userInterests.topics, ...userInterests.tags, limit, offset];
      
      db.all(query, params, async (err, posts) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        // 获取每个帖子的标签
        const postsWithTags = await Promise.all(
          posts.map(post => 
            new Promise((resolve, reject) => {
              db.all('SELECT tag FROM post_tags WHERE post_id = ?', [post.id], (err, tags) => {
                if (err) reject(err);
                post.tags = tags.map(t => t.tag);
                resolve(post);
              });
            })
          )
        );
        
        res.json(postsWithTags);
      });
      
    } catch (error) {
      console.error('Error getting aggregated posts:', error);
      res.status(500).json({ error: 'Failed to get aggregated posts' });
    }
  });
  
  // 获取主题下的热门标签
  app.get('/api/topics/:topic/popular-tags', async (req, res) => {
    const { topic } = req.params;
    const { limit = 10 } = req.query;
    
    const query = `
      SELECT pt.tag, COUNT(DISTINCT pt.post_id) as post_count
      FROM post_tags pt
      JOIN posts p ON pt.post_id = p.id
      WHERE p.category = ?
      GROUP BY pt.tag
      ORDER BY post_count DESC
      LIMIT ?
    `;
    
    db.all(query, [topic, limit], (err, tags) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(tags);
    });
  });
  
  // 记录用户行为
  app.post('/api/track-interaction', authenticateToken, async (req, res) => {
    const { postId, topic, tag, actionType } = req.body;
    const userId = req.user.userId;
    
    if (!actionType) {
      return res.status(400).json({ error: 'Action type is required' });
    }
    
    db.run(
      `INSERT INTO user_interactions (user_id, post_id, topic, tag, action_type)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, postId, topic, tag, actionType],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to track interaction' });
        }
        res.json({ message: 'Interaction tracked successfully' });
      }
    );
  });
};

// 辅助函数：获取行为权重
function getActionWeight(actionType) {
  const weights = {
    'view': 1,
    'like': 3,
    'comment': 5,
    'share': 4,
    'create': 10
  };
  return weights[actionType] || 1;
}

// 辅助函数：获取主题相关的标签
async function getTopicRelatedTags(db, topic, userId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT pt.tag, COUNT(*) as count
      FROM post_tags pt
      JOIN posts p ON pt.post_id = p.id
      LEFT JOIN user_interactions ui ON ui.post_id = p.id AND ui.user_id = ?
      WHERE p.category = ?
      GROUP BY pt.tag
      ORDER BY 
        CASE WHEN ui.user_id IS NOT NULL THEN 1 ELSE 0 END DESC,
        count DESC
      LIMIT 15
    `;
    
    db.all(query, [userId, topic], (err, tags) => {
      if (err) reject(err);
      else resolve(tags);
    });
  });
}

// 辅助函数：获取用户兴趣
async function getUserInterests(db, userId) {
  return new Promise((resolve, reject) => {
    // 获取用户最感兴趣的主题
    const topicsQuery = `
      SELECT topic, COUNT(*) as count
      FROM user_interactions
      WHERE user_id = ? AND topic IS NOT NULL
      GROUP BY topic
      ORDER BY count DESC
      LIMIT 5
    `;
    
    // 获取用户最感兴趣的标签
    const tagsQuery = `
      SELECT tag, COUNT(*) as count
      FROM user_interactions
      WHERE user_id = ? AND tag IS NOT NULL
      GROUP BY tag
      ORDER BY count DESC
      LIMIT 10
    `;
    
    db.all(topicsQuery, [userId], (err, topics) => {
      if (err) return reject(err);
      
      db.all(tagsQuery, [userId], (err, tags) => {
        if (err) return reject(err);
        
        resolve({
          topics: topics.map(t => t.topic),
          tags: tags.map(t => t.tag)
        });
      });
    });
  });
} 