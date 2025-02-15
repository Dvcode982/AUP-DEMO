module.exports = (app, db, authenticateToken) => {
  // 发送规划请求
  app.post('/api/ai-planner', authenticateToken, async (req, res) => {
    const { message, date } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    try {
      // 这里应该调用实际的 AI 服务
      // 目前使用模拟响应
      const aiResponse = {
        response: '感谢您的提问！这是一个示例回复。',
        suggestions: [
          {
            time: '09:00',
            activity: '晨跑'
          },
          {
            time: '10:00',
            activity: '学习'
          },
          {
            time: '12:00',
            activity: '午餐'
          }
        ]
      };

      // 保存对话记录
      db.run(
        'INSERT INTO ai_plans (user_id, message, response, plan_date) VALUES (?, ?, ?, ?)',
        [req.user.userId, message, JSON.stringify(aiResponse), date],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to save plan' });
          }

          res.json({
            id: this.lastID,
            ...aiResponse
          });
        }
      );
    } catch (error) {
      res.status(500).json({ error: 'AI service error' });
    }
  });

  // 获取历史规划记录
  app.get('/api/ai-planner/history', authenticateToken, async (req, res) => {
    db.all(
      'SELECT * FROM ai_plans WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.userId],
      (err, plans) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        const formattedPlans = plans.map(plan => ({
          ...plan,
          response: JSON.parse(plan.response)
        }));

        res.json(formattedPlans);
      }
    );
  });
}; 