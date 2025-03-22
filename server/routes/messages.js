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
        // 使用消息原始时间，而不是当前时间
        return {
          id: msg.id.toString(),
          sender: msg.sender,
          senderId: msg.sender_id.toString(),
          content: msg.content,
          type: msg.type || 'text',
          created_at: messageDate.toISOString(),
          timestamp: messageDate.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          })
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
    
    // 检查接收者是否存在
    db.get('SELECT id FROM users WHERE id = ?', [receiverId], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!user) {
        return res.status(404).json({ error: 'Receiver not found' });
      }
      
      // 插入新消息
      db.run(
        'INSERT INTO messages (sender_id, receiver_id, content, type, created_at) VALUES (?, ?, ?, ?, datetime("now", "localtime"))',
        [senderId, receiverId, content, type],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to send message' });
          }
          
          // 返回新消息
          db.get(
            'SELECT id, content, created_at, sender_id FROM messages WHERE id = ?',
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
                type: type,
                created_at: messageDate.toISOString(),
                timestamp: messageDate.toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })
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
};