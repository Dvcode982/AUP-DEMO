import type { NextApiRequest, NextApiResponse } from 'next'

let sessionHistory: { role: string, content: string }[] = []

// 提取搜索关键词
function extractSearchKeywords(question: string) {
  const searchPatterns = [
    // 活动相关
    { pattern: /羽毛球|乒乓球|篮球|足球|跑步|健身|约球|运动/, keywords: ['羽毛球', '篮球', '足球', '乒乓球', '跑步', '健身', '运动'] },
    // 失物招领
    { pattern: /失物|招领|丢|捡|遗失|拾到|钥匙|校园卡|钱包|手机/, keywords: ['失物', '招领', '钥匙', '校园卡', '钱包', '手机'] },
    // 学习相关
    { pattern: /课程|作业|考试|论文|学习|图书馆/, keywords: ['课程', '作业', '考试', '论文', '学习'] },
    // 生活相关
    { pattern: /吃饭|购物|电影|聚会|旅行|兼职|租房/, keywords: ['吃饭', '购物', '电影', '聚会', '兼职', '租房'] }
  ]

  for (const { pattern, keywords } of searchPatterns) {
    if (pattern.test(question)) {
      // 找到匹配的具体关键词
      const matchedKeywords = keywords.filter(keyword => question.includes(keyword))
      if (matchedKeywords.length > 0) {
        return matchedKeywords[0] // 返回第一个匹配的关键词
      }
      return keywords[0] // 如果没有具体匹配，返回第一个相关关键词
    }
  }

  return null
}

// 获取智能推荐统计信息
async function getRecommendationStats(keyword: string) {
  try {
    const params = new URLSearchParams()
    params.append('query', keyword)
    
    const response = await fetch(`http://localhost:3001/api/smart-recommendations?${params.toString()}`)
    if (!response.ok) {
      console.error('获取推荐统计失败:', response.status)
      return null
    }
    
    const data = await response.json()
    return {
      total: data.total || 0,
      displayed: data.posts?.length || 0,
      keyword: keyword
    }
  } catch (error) {
    console.error('获取推荐统计异常:', error)
    return null
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 设置响应头
  res.setHeader('Content-Type', 'application/json')
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { question, reset } = req.body
    
    if (reset) {
      sessionHistory = []
      return res.status(200).json({ message: '会话已重置' })
    }
    
    if (!question) {
      return res.status(400).json({ error: 'Missing question' })
    }

    console.log('收到问题:', question)
    sessionHistory.push({ role: 'user', content: question })

    // 检查是否是搜索相关问题，并提取关键词
    const searchKeyword = extractSearchKeywords(question)
    const isSearchRelated = searchKeyword !== null
    
    console.log('搜索关键词提取:', { isSearchRelated, searchKeyword })
    
    // 如果是搜索相关，获取统计信息
    let statsInfo = null
    if (isSearchRelated && searchKeyword) {
      statsInfo = await getRecommendationStats(searchKeyword)
      console.log('推荐统计信息:', statsInfo)
    }
    
    console.log('正在调用 DeepSeek API...')
    
    // 为AI添加系统提示
    const systemPrompt = {
      role: 'system',
      content: `你是爱邮坪校园社区的AI助手。请用亲切、简洁的语言回复用户。

重要原则：
1. 回复要简短（30字以内），亲切友好
2. 如果用户想找相关内容，告诉他们"我来帮你找找相关内容！"
3. 专注于问答和建议
4. 使用日常对话语气，像朋友一样交流

${statsInfo ? `当前搜索"${statsInfo.keyword}"找到了${statsInfo.total}个相关帖子。` : ''}`
    }
    
    const messages = [systemPrompt, ...sessionHistory]
    
    const apiRes = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer sk-608efd7fe0304c8e9c7a974f270f495e',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        max_tokens: 80,  // 更短的回复
        temperature: 0.7
      })
    })

    if (!apiRes.ok) {
      const errorData = await apiRes.json().catch(() => null)
      console.error('DeepSeek API 响应错误:', {
        status: apiRes.status,
        statusText: apiRes.statusText,
        error: errorData
      })
      throw new Error(`DeepSeek API 请求失败: ${apiRes.status} ${apiRes.statusText}`)
    }

    const data = await apiRes.json()
    console.log('DeepSeek API 响应:', data)

    if (!data.choices?.[0]?.message?.content) {
      console.error('DeepSeek API 返回数据格式异常:', data)
      throw new Error('DeepSeek API 返回数据格式异常')
    }

    let answer = data.choices[0].message.content
    sessionHistory.push({ role: 'assistant', content: answer })
    
    // 返回响应，包含搜索建议
    const response: any = { answer }
    
    if (isSearchRelated && searchKeyword) {
      response.searchSuggestion = {
        keyword: searchKeyword,
        action: 'smart_recommend',
        message: statsInfo 
          ? `我来帮你找找相关内容！发现了 ${statsInfo.total} 个"${searchKeyword}"相关帖子`
          : '我来帮你找找相关内容！',
        stats: statsInfo
      }
    }
    
    return res.status(200).json(response)
  } catch (error: any) {
    console.error('AI服务异常:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    })
    
    // 确保返回 JSON 格式的错误响应
    return res.status(500).json({ 
      error: 'AI服务异常', 
      detail: error.message || String(error),
      timestamp: new Date().toISOString()
    })
  }
} 