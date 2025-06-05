module.exports = (app, db, authenticateToken) => {
  // 修改消息表，添加 type 字段
  db.run(`ALTER TABLE messages ADD COLUMN type TEXT DEFAULT 'text'`, (err) => {
    console.log('Added type column to messages table');
  });

  // 创建消息表
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    type TEXT DEFAULT 'text',
    FOREIGN KEY (sender_id) REFERENCES users (id),
    FOREIGN KEY (receiver_id) REFERENCES users (id)
  )`, (err) => {
    if (err) {
      console.error('Error creating messages table:', err.message);
    } else {
      console.log('Messages table initialized successfully');
    }
  });

  // 获取当前用户的所有对话列表
  app.get('/api/messages/conversations', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    
    // 查询与当前用户相关的所有对话
    const query = `
      SELECT 
        u.id, u.email,
        m.content as last_message,
        m.created_at as last_message_time,
        m.is_read,
        CASE WHEN m.sender_id = ? THEN 'sent' ELSE 'received' END as direction
      FROM (
        SELECT 
          CASE 
            WHEN sender_id = ? THEN receiver_id 
            ELSE sender_id 
          END as other_user_id,
          MAX(id) as max_message_id
        FROM messages
        WHERE sender_id = ? OR receiver_id = ?
        GROUP BY other_user_id
      ) as latest
      JOIN messages m ON m.id = latest.max_message_id
      JOIN users u ON u.id = latest.other_user_id
      ORDER BY m.created_at DESC
    `;
    
    db.all(query, [userId, userId, userId, userId], (err, conversations) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      
      // 格式化返回数据
      const formattedConversations = conversations.map(conv => ({
        id: conv.id,
        user: {
          name: conv.email.split('@')[0], // 简单处理，使用邮箱前缀作为名称
          avatar: '/placeholder.svg?height=32&width=32', // 默认头像
          email: conv.email // 添加完整邮箱
        },
        lastMessage: conv.last_message,
        timestamp: new Date(conv.last_message_time).toLocaleString(),
        unread: !conv.is_read && conv.direction === 'received'
      }));
      
      res.json(formattedConversations);
    });
  });

  // 修改获取与特定用户的聊天记录
  app.get('/api/messages/:userId', authenticateToken, (req, res) => {
    const currentUserId = req.user.userId;
    const otherUserId = req.params.userId;
    
    console.log('Fetching messages between users:', { currentUserId, otherUserId });

    // 修复查询语句，添加缺失的字段
    const query = `
      SELECT 
        m.id, m.content, m.type, m.created_at, m.sender_id,
        CASE WHEN m.sender_id = ? THEN 'user' ELSE 'other' END as sender
      FROM messages m
      WHERE (m.sender_id = ? AND m.receiver_id = ?) 
         OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC
    `;
    
    db.all(query, [currentUserId, currentUserId, otherUserId, otherUserId, currentUserId], (err, messages) => {
      if (err) {
        console.error('Error fetching messages:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      const formattedMessages = messages.map(msg => {
        const messageDate = new Date(msg.created_at);
        return {
          id: msg.id.toString(),
          sender: msg.sender,
          senderId: msg.sender_id.toString(),
          content: msg.content,
          type: msg.type || 'text',
          created_at: msg.created_at,
          timestamp: messageDate.getTime(), // Unix时间戳
          formattedTime: messageDate.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }),
          formattedDate: messageDate.toLocaleDateString('zh-CN'),
          relativeTime: getRelativeTime(messageDate)
        };
      });

      // 获取聊天伙伴信息
      db.get('SELECT id, email FROM users WHERE id = ?', [otherUserId], (err, partnerInfo) => {
        if (err) {
          console.error('Error fetching partner info:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        const partnerName = partnerInfo ? partnerInfo.email.split('@')[0] : '未知用户';
        
        res.json({
          messages: formattedMessages,
          partnerName,
          partnerAvatar: '/images/lon.jpg',
          partnerId: otherUserId
        });
      });
    });
  });

  // 发送消息
  app.post('/api/messages', authenticateToken, (req, res) => {
    const { receiverId, content, type = 'text' } = req.body;
    const senderId = req.user.userId;
    
    if (!receiverId || !content) {
      return res.status(400).json({ error: 'Receiver ID and content are required' });
    }
    
    // 获取当前精确时间戳
    const now = new Date();
    const timestamp = now.toISOString();
    
    // 检查接收者是否存在
    db.get('SELECT id FROM users WHERE id = ?', [receiverId], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!user) {
        return res.status(404).json({ error: 'Receiver not found' });
      }
      
      // 插入新消息，使用精确时间戳
      db.run(
        'INSERT INTO messages (sender_id, receiver_id, content, type, created_at) VALUES (?, ?, ?, ?, ?)',
        [senderId, receiverId, content, type, timestamp],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to send message' });
          }
          
          // 返回新消息
          db.get(
            'SELECT id, content, created_at, sender_id, type FROM messages WHERE id = ?',
            [this.lastID],
            (err, message) => {
              if (err) {
                return res.status(500).json({ error: 'Failed to retrieve sent message' });
              }
              
              const messageDate = new Date(message.created_at);
              res.status(201).json({
                id: message.id.toString(),
                sender: 'user',
                senderId: message.sender_id.toString(),
                content: message.content,
                type: message.type,
                created_at: message.created_at,
                timestamp: messageDate.getTime(), // 添加Unix时间戳
                formattedTime: messageDate.toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }),
                formattedDate: messageDate.toLocaleDateString('zh-CN'),
                relativeTime: getRelativeTime(messageDate)
              });
            }
          );
        }
      );
    });
  });

  // 修改图片上传接口
  app.post('/api/messages/:receiverId/image', authenticateToken, async (req, res) => {
    const senderId = req.user.userId;
    const receiverId = req.params.receiverId;
    const imageUrl = req.body.imageUrl;

    console.log('Received image upload request');

    if (!imageUrl) {
      console.error('No image data provided');
      return res.status(400).json({ error: 'No image data provided' });
    }

    try {
      console.log('Saving image message to database...');
      db.run(
        'INSERT INTO messages (sender_id, receiver_id, content, type) VALUES (?, ?, ?, ?)',
        [senderId, receiverId, imageUrl, 'image'],
        function(err) {
          if (err) {
            console.error('Failed to save image message:', err);
            return res.status(500).json({ error: 'Failed to save image message' });
          }

          const msgId = this.lastID;
          console.log('Image message saved, id:', msgId);

          // 获取保存的消息
          db.get(
            'SELECT * FROM messages WHERE id = ?',
            [msgId],
            (err, message) => {
              if (err) {
                console.error('Failed to retrieve saved message:', err);
                return res.status(500).json({ error: 'Failed to retrieve message' });
              }

              res.status(201).json({
                id: message.id.toString(),
                sender: 'user',
                senderId: message.sender_id.toString(),
                content: imageUrl,
                type: 'image',
                createdAt: message.created_at,
                timestamp: new Date(message.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })
              });
            }
          );
        }
      );
    } catch (error) {
      console.error('Failed to process image upload:', error);
      res.status(500).json({ error: 'Failed to process image upload' });
    }
  });

  // 标记消息为已读
  app.post('/api/messages/:messageId/read', authenticateToken, (req, res) => {
    const messageId = req.params.messageId;
    const userId = req.user.userId;
    
    // 只能标记发给自己的消息为已读
    db.run(
      'UPDATE messages SET is_read = 1 WHERE id = ? AND receiver_id = ?',
      [messageId, userId],
      function(err) {
        if (err) {
          console.error('Error marking message as read:', err);
          return res.status(500).json({ error: 'Failed to mark message as read' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Message not found or not yours' });
        }
        
        res.json({ success: true, messageId });
      }
    );
  });

  // 批量标记对话为已读
  app.post('/api/messages/conversations/:userId/read', authenticateToken, (req, res) => {
    const otherUserId = req.params.userId;
    const currentUserId = req.user.userId;
    
    // 标记来自特定用户的所有未读消息为已读
    db.run(
      'UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0',
      [otherUserId, currentUserId],
      function(err) {
        if (err) {
          console.error('Error marking conversation as read:', err);
          return res.status(500).json({ error: 'Failed to mark conversation as read' });
        }
        
        res.json({ success: true, markedCount: this.changes });
      }
    );
  });

  // 获取消息统计信息
  app.get('/api/messages/stats', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const { timeRange = 'week' } = req.query;
    
    // 计算时间范围
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    // 并行执行多个统计查询
    const queries = [
      // 发送的消息数量
      new Promise((resolve, reject) => {
        db.get(
          `SELECT COUNT(*) as count FROM messages 
           WHERE sender_id = ? AND created_at >= ?`,
          [userId, startDate.toISOString()],
          (err, result) => err ? reject(err) : resolve(result.count)
        );
      }),
      
      // 接收的消息数量
      new Promise((resolve, reject) => {
        db.get(
          `SELECT COUNT(*) as count FROM messages 
           WHERE receiver_id = ? AND created_at >= ?`,
          [userId, startDate.toISOString()],
          (err, result) => err ? reject(err) : resolve(result.count)
        );
      }),
      
      // 未读消息数量
      new Promise((resolve, reject) => {
        db.get(
          `SELECT COUNT(*) as count FROM messages 
           WHERE receiver_id = ? AND is_read = 0`,
          [userId],
          (err, result) => err ? reject(err) : resolve(result.count)
        );
      }),
      
      // 活跃对话数量
      new Promise((resolve, reject) => {
        db.get(
          `SELECT COUNT(DISTINCT CASE 
             WHEN sender_id = ? THEN receiver_id 
             ELSE sender_id 
           END) as count FROM messages 
           WHERE (sender_id = ? OR receiver_id = ?) AND created_at >= ?`,
          [userId, userId, userId, startDate.toISOString()],
          (err, result) => err ? reject(err) : resolve(result.count)
        );
      }),
      
      // 每日消息活动 (最近7天)
      new Promise((resolve, reject) => {
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        db.all(
          `SELECT 
             DATE(created_at) as date,
             COUNT(*) as count,
             SUM(CASE WHEN sender_id = ? THEN 1 ELSE 0 END) as sent,
             SUM(CASE WHEN receiver_id = ? THEN 1 ELSE 0 END) as received
           FROM messages 
           WHERE (sender_id = ? OR receiver_id = ?) AND created_at >= ?
           GROUP BY DATE(created_at)
           ORDER BY date`,
          [userId, userId, userId, userId, last7Days.toISOString()],
          (err, results) => err ? reject(err) : resolve(results)
        );
      }),
      
      // 消息类型统计
      new Promise((resolve, reject) => {
        db.all(
          `SELECT 
             type,
             COUNT(*) as count
           FROM messages 
           WHERE (sender_id = ? OR receiver_id = ?) AND created_at >= ?
           GROUP BY type`,
          [userId, userId, startDate.toISOString()],
          (err, results) => err ? reject(err) : resolve(results)
        );
      })
    ];
    
    Promise.all(queries)
      .then(([sentCount, receivedCount, unreadCount, activeChats, dailyActivity, messageTypes]) => {
        res.json({
          timeRange,
          startDate: startDate.toISOString(),
          endDate: now.toISOString(),
          summary: {
            sent: sentCount,
            received: receivedCount,
            unread: unreadCount,
            activeChats: activeChats,
            total: sentCount + receivedCount
          },
          dailyActivity,
          messageTypes: messageTypes.reduce((acc, curr) => {
            acc[curr.type] = curr.count;
            return acc;
          }, {}),
          trends: {
            averagePerDay: Math.round((sentCount + receivedCount) / 7 * 10) / 10,
            mostActiveDay: dailyActivity.length > 0 
              ? dailyActivity.reduce((max, day) => day.count > max.count ? day : max).date
              : null
          }
        });
      })
      .catch(err => {
        console.error('Error fetching message stats:', err);
        res.status(500).json({ error: 'Failed to fetch message statistics' });
      });
  });

  // 获取消息时间线
  app.get('/api/messages/timeline/:userId', authenticateToken, (req, res) => {
    const currentUserId = req.user.userId;
    const otherUserId = req.params.userId;
    const { limit = 50, offset = 0 } = req.query;
    
    // 获取消息时间线，包含详细时间信息
    const query = `
      SELECT 
        m.id, m.content, m.type, m.created_at, m.sender_id,
        CASE WHEN m.sender_id = ? THEN 'user' ELSE 'other' END as sender,
        DATE(m.created_at) as message_date,
        TIME(m.created_at) as message_time
      FROM messages m
      WHERE (m.sender_id = ? AND m.receiver_id = ?) 
         OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    db.all(query, [currentUserId, currentUserId, otherUserId, otherUserId, currentUserId, limit, offset], (err, messages) => {
      if (err) {
        console.error('Error fetching message timeline:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      // 按日期分组消息
      const groupedMessages = messages.reduce((acc, msg) => {
        const date = msg.message_date;
        if (!acc[date]) {
          acc[date] = [];
        }
        
        const messageDate = new Date(msg.created_at);
        acc[date].push({
          id: msg.id.toString(),
          sender: msg.sender,
          senderId: msg.sender_id.toString(),
          content: msg.content,
          type: msg.type || 'text',
          created_at: msg.created_at,
          timestamp: messageDate.getTime(),
          formattedTime: messageDate.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }),
          relativeTime: getRelativeTime(messageDate)
        });
        
        return acc;
      }, {});

      res.json({
        timeline: groupedMessages,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: messages.length === parseInt(limit)
        }
      });
    });
  });

  // 相对时间计算函数
  function getRelativeTime(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return '刚刚';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}分钟前`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}小时前`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  }
};