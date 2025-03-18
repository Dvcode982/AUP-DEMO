module.exports = (app, db, authenticateToken) => {
  // 获取帖子列表
  app.get('/api/posts', async (req, res) => {
    const query = `
      SELECT 
        p.id,
        u.email as author,
        p.content,
        p.image,
        p.created_at as time,
        p.category,
        p.privacy,
        p.location
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.privacy = 'public'
      ORDER BY p.created_at DESC
    `;

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
        p.location
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
};