module.exports = (app, db, authenticateToken) => {
  // 获取帖子列表
  app.get('/api/posts', async (req, res) => {
    const { search, category, tag } = req.query;
    
    let query = `
      SELECT 
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
        (SELECT COUNT(*) FROM shares WHERE post_id = p.id) as shares
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.privacy = 'public'
    `;
    
    // 如果有搜索参数，添加搜索条件
    if (search) {
      query += ` AND (p.content LIKE '%${search}%' OR p.category LIKE '%${search}%' OR p.location LIKE '%${search}%')`;
    }
    
    // 如果有分类参数，添加分类筛选条件
    if (category) {
      query += ` AND p.category LIKE '%${category}%'`;
    }
    
    query += ` ORDER BY p.created_at DESC`;

    db.all(query, [], (err, posts) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // 获取每个帖子的标签
      const postsWithTags = posts.map(post => {
        return new Promise((resolve, reject) => {
          db.all('SELECT tag FROM post_tags WHERE post_id = ?', [post.id], (err, tags) => {
            if (err) reject(err);
            post.tags = tags.map(t => t.tag);
            resolve(post);
          });
        });
      });

      Promise.all(postsWithTags)
        .then(completePosts => {
          // 如果有标签参数，过滤包含该标签的帖子
          if (tag) {
            const tagFilter = tag.toLowerCase();
            completePosts = completePosts.filter(post => 
              post.tags.some(tag => tag.toLowerCase().includes(tagFilter))
            );
          }
          res.json(completePosts);
        })
        .catch(error => {
          res.status(500).json({ error: 'Error fetching post tags' });
        });
    });
  });

  // 获取单个帖子
  app.get('/api/posts/:id', async (req, res) => {
    const { id } = req.params;

    const query = `
      SELECT 
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
        (SELECT COUNT(*) FROM shares WHERE post_id = p.id) as shares
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.id = ? AND (p.privacy = 'public' OR p.author_id = ?)
    `;

    db.get(query, [id, req.user?.userId], (err, post) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // 获取帖子标签
      db.all('SELECT tag FROM post_tags WHERE post_id = ?', [id], (err, tags) => {
        if (err) {
          return res.status(500).json({ error: 'Error fetching post tags' });
        }
        post.tags = tags.map(t => t.tag);
        res.json(post);
      });
    });
  });

  // 创建帖子
  app.post('/api/posts', authenticateToken, async (req, res) => {
    const { content, media, tags, category, privacy, location } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // 从内容中提取标签（如果没有提供tags参数）
    let extractedTags = tags || [];
    if (!extractedTags.length) {
      const tagRegex = /#([\u4e00-\u9fa5a-zA-Z0-9_]+)/g;
      const matches = content.match(tagRegex);
      if (matches) {
        extractedTags = matches.map(tag => tag.substring(1));
      }
    }

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      db.run(
        `INSERT INTO posts (author_id, content, image, category, privacy, location)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [req.user.userId, content, media, category, privacy || 'public', location],
        function(err) {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Failed to create post' });
          }

          const postId = this.lastID;

          // 添加标签
          if (extractedTags.length > 0) {
            const tagValues = extractedTags.map(tag => `(${postId}, '${tag}')`).join(',');
            db.run(`INSERT INTO post_tags (post_id, tag) VALUES ${tagValues}`, [], (err) => {
              if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Failed to add tags' });
              }

              db.run('COMMIT');
              res.status(201).json({
                id: postId,
                message: 'Post created successfully'
              });
            });
          } else {
            db.run('COMMIT');
            res.status(201).json({
              id: postId,
              message: 'Post created successfully'
            });
          }
        }
      );
    });
  });

  // 点赞帖子
  app.post('/api/posts/:id/like', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    // 检查帖子是否存在
    db.get('SELECT id FROM posts WHERE id = ?', [id], (err, post) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // 检查用户是否已经点赞过该帖子
      db.get('SELECT id FROM likes WHERE post_id = ? AND user_id = ?', [id, userId], (err, like) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (like) {
          // 如果已经点赞过，则取消点赞
          db.run('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [id, userId], function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to unlike post' });
            }
            
            // 获取最新点赞数
            db.get('SELECT COUNT(*) as count FROM likes WHERE post_id = ?', [id], (err, result) => {
              if (err) {
                return res.status(500).json({ error: 'Failed to get like count' });
              }
              
              res.json({
                liked: false,
                likes: result.count,
                message: 'Post unliked successfully'
              });
            });
          });
        } else {
          // 如果没有点赞过，则添加点赞
          db.run('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [id, userId], function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to like post' });
            }
            
            // 获取最新点赞数
            db.get('SELECT COUNT(*) as count FROM likes WHERE post_id = ?', [id], (err, result) => {
              if (err) {
                return res.status(500).json({ error: 'Failed to get like count' });
              }
              
              res.json({
                liked: true,
                likes: result.count,
                message: 'Post liked successfully'
              });
            });
          });
        }
      });
    });
  });

  // 分享帖子
  app.post('/api/posts/:id/share', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    // 检查帖子是否存在
    db.get('SELECT id FROM posts WHERE id = ?', [id], (err, post) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // 添加分享记录
      db.run('INSERT INTO shares (post_id, user_id) VALUES (?, ?)', [id, userId], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to share post' });
        }
        
        // 获取最新分享数
        db.get('SELECT COUNT(*) as count FROM shares WHERE post_id = ?', [id], (err, result) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to get share count' });
          }
          
          res.json({
            shares: result.count,
            message: 'Post shared successfully'
          });
        });
      });
    });
  });

  // 检查用户是否点赞过帖子
  app.get('/api/posts/:id/liked', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    db.get('SELECT id FROM likes WHERE post_id = ? AND user_id = ?', [id, userId], (err, like) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({
        liked: !!like
      });
    });
  });
};