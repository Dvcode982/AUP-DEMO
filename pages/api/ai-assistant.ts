import type { NextApiRequest, NextApiResponse } from 'next'

let sessionHistory: { role: string, content: string }[] = []

// 结构化关键词分类
const keywordCategories: Array<{ name: string; keywords: string[]; weight: number }> = [
  {
    name: "items",
    keywords: [
      '校园卡', '钥匙', '钱包', '手机', '充电器', '耳机', '书包', '雨伞', '水杯',
      '笔记本', '眼镜', '手表', '身份证', '银行卡', '公交卡', 'u盘', '移动硬盘',
      '电脑', '平板', '相机', '项链', '戒指', '手镯', '耳环', '手链', '包',
      '背包', '双肩包', '单肩包', '化妆包', '文具', '笔', '书', '课本', '作业本',
      '保温杯', '饭盒', '餐具', '衣服', '外套', '帽子', '围巾', '手套', '鞋',
      '袜子', '裤子', 't恤', '毛衣', '运动鞋', '凉鞋', '拖鞋'
    ],
    weight: 1.5
  },
  {
    name: "locations",
    keywords: [
      '宿舍', '食堂', '图书馆', '教学楼', '操场', '实验室', '停车场', '校门',
      '咖啡厅', '便利店', '超市', '洗衣房', '浴室', '厕所', '楼梯', '电梯',
      '走廊', '教室', '办公室', '医务室', '体育馆', '游泳池', '网球场',
      '篮球场', '足球场', '跑道', '健身房', '自习室', '机房', '实训室'
    ],
    weight: 1.2
  },
  {
    name: "activities",
    keywords: ['羽毛球', '篮球', '足球', '乒乓球', '跑步', '健身', '学习', '约', '一起'],
    weight: 1.3
  },
  {
    name: "actions",
    keywords: ['丢', '找', '寻找', '捡到', '遗失'],
    weight: 1.0
  }
]

// 主题无效词（用于过滤）
const meaninglessWords = ['相关', '帖子', '内容', '信息', '资料', '东西', '事情', '问题']

// 1. 意图识别
function shouldTriggerSearch(question: string): boolean {
  const lowerQuestion = question.toLowerCase()
  if (/(没|无|不|未).*(丢|丢过|寻找|找|遗失)/.test(lowerQuestion)) return false
  const searchPatterns = [
    /哪里.*(找|看到|捡到)/,
    /(帮我|请).*找/,
    /(丢|遗失).*(东西|物品)/,
    /(捡到|拾到).*(东西|物品)/,
    /想找/,
    /相关.*帖子/,
    /有没有.*(关于|相关)/
  ]
  return searchPatterns.some(pattern => pattern.test(lowerQuestion))
}

// 2. 上下文感知关键词提取
function getContextAwareKeywords(question: string, sessionHistory: { role: string, content: string }[]): string | null {
  const lastTwoMessages = sessionHistory.slice(-2)
  const isLostContext = lastTwoMessages.some(msg =>
    msg.role === 'user' && /(丢|找|失物)/.test(msg.content.toLowerCase())
  )
  const continuationPattern = /(它|这个|那|那里|上面)/
  if (isLostContext && continuationPattern.test(question)) {
    const contextItems = keywordCategories.find(c => c.name === 'items')?.keywords.filter(item =>
      lastTwoMessages.some(msg => msg.content.includes(item))
    ) || []
    if (contextItems.length > 0) return contextItems[0]
  }
  return extractSearchKeywords(question)
}

// 3. 加权关键词提取
function findWeightedKeywords(question: string): string | null {
  const lowerQuestion = question.toLowerCase()
  let bestKeyword = ''
  let bestScore = 0
  keywordCategories.forEach(category => {
    category.keywords.forEach(keyword => {
      if (lowerQuestion.includes(keyword)) {
        const positionScore = 1 - (lowerQuestion.indexOf(keyword) / lowerQuestion.length)
        const score = category.weight * positionScore
        if (score > bestScore) {
          bestKeyword = keyword
          bestScore = score
        }
      }
    })
  })
  return bestKeyword || null
}

// 4. 正则与组合关键词提取
function extractSearchKeywords(question: string): string | null {
  const lowerQuestion = question.toLowerCase()
  const itemPattern = new RegExp(
    `(${keywordCategories.find(c => c.name === 'items')?.keywords.join('|')})[的]*(丢失|遗失|丢|寻找|找|捡到|拾到|落在)?`,
    'g'
  )
  const locationPattern = new RegExp(
    `(在|从|到)(${keywordCategories.find(c => c.name === 'locations')?.keywords.join('|')})`,
    'g'
  )
  const itemMatches = [...lowerQuestion.matchAll(itemPattern)]
  const locationMatches = [...lowerQuestion.matchAll(locationPattern)]
  let keywords = []
  if (itemMatches.length > 0) keywords.push(itemMatches[0][1])
  if (locationMatches.length > 0) keywords.push(locationMatches[0][2])
  if (keywords.length > 0) return keywords.join(' ')
  if (/(丢东西|丢物品|找东西|失物|招领)/.test(lowerQuestion)) return '失物招领'
  // 活动类关键词兜底
  const activity = keywordCategories.find(c => c.name === 'activities')?.keywords.find(act => lowerQuestion.includes(act))
  if (activity) return activity
  // 通用分词兜底
  const stopWords = ['的', '了', '在', '是', '我', '你', '他', '她', '它', '们', '这', '那', '一个', '有', '没', '吗', '呢', '啊', '吧']
  const searchIndicators = ['找', '搜', '查', '看', '有没有', '哪里', '怎么', '什么']
  const words = lowerQuestion.split(/[，。！？、,.!?\s]+/).filter(word =>
    word.length > 1 && !stopWords.includes(word) && !searchIndicators.includes(word) && !meaninglessWords.includes(word)
  )
  if (words.length > 0) return words[0]
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

    // 优化后的关键词提取流程
    let searchKeyword: string | null = null
    let isSearchRelated = false
    if (shouldTriggerSearch(question)) {
      searchKeyword = getContextAwareKeywords(question, sessionHistory)
      if (!searchKeyword) searchKeyword = findWeightedKeywords(question)
      isSearchRelated = !!searchKeyword
    }
    
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

特殊处理：
- 如果用户询问失物招领相关问题（如丢失物品、寻找失物、招领物品等），优先推荐使用失物招领页面的AI智能推荐功能
- 失物招领相关回复应该包含鼓励和帮助的语气，比如"别担心，我来帮你在失物招领里找找！"

${statsInfo ? `当前搜索"${statsInfo.keyword}"找到了${statsInfo.total}个相关内容。` : ''}`
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