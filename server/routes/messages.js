module.exports = (app, db, authenticateToken) => {
  // 创建消息表
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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

  // 获取与特定用户的聊天记录
  app.get('/api/messages/:userId', authenticateToken, (req, res) => {
    const currentUserId = req.user.userId;
    const otherUserId = req.params.userId;
    
    // 首先获取聊天伙伴的信息
    db.get('SELECT id, email FROM users WHERE id = ?', [otherUserId], (err, partnerInfo) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      // 获取消息记录
      const query = `
        SELECT 
          m.id, m.content, m.created_at, m.sender_id,
          CASE WHEN m.sender_id = ? THEN 'user' ELSE 'other' END as sender
        FROM messages m
        WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
        ORDER BY m.created_at ASC
      `;
      
      db.all(query, [currentUserId, currentUserId, otherUserId, otherUserId, currentUserId], (err, messages) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        // 格式化消息
        const formattedMessages = messages.map(msg => ({
          id: msg.id.toString(),
          sender: msg.sender,
          senderId: msg.sender_id.toString(), // 添加发送者ID
          content: msg.content,
          createdAt: msg.created_at, // 添加原始时间戳
          timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        }));
        
        // 标记消息为已读
        db.run(
          'UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE',
          [otherUserId, currentUserId],
          (err) => {
            if (err) {
              console.error('Error marking messages as read:', err.message);
            }
          }
        );
        
        // 返回消息和聊天伙伴信息
        const partnerName = partnerInfo ? partnerInfo.email.split('@')[0] : '未知用户';
        res.json({
          messages: formattedMessages,
          partnerName: partnerName,
          partnerAvatar: '/images/lon.jpg',
          partnerId: otherUserId
        });
      });
    });
  });

  // 发送消息
  app.post('/api/messages', authenticateToken, (req, res) => {
    const { receiverId, content } = req.body;
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
        'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
        [senderId, receiverId, content],
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
              
              res.status(201).json({
                id: message.id.toString(),
                sender: 'user',
                senderId: message.sender_id.toString(),
                content: message.content,
                createdAt: message.created_at, // 添加原始时间戳
                timestamp: new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
              });
            }
          );
        }
      );
    });
  });
};