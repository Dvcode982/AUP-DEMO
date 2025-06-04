import type { NextApiRequest, NextApiResponse } from 'next'

// 智能关键词提取和分类
function extractKeywords(query: string) {
  const keywords = {
    // 失物招领相关
    lostAndFound: ['失物', '招领', '找', '寻', '丢', '捡', '遗失', '拾到', '归还'],
    // 物品类型
    items: ['校园卡', '钥匙', '钱包', '手机', '充电器', '耳机', '书包', '雨伞', '水杯', '笔记本', '眼镜', '手表'],
    // 地点相关
    locations: ['宿舍', '食堂', '图书馆', '教学楼', '操场', '实验室', '停车场', '校门', '咖啡厅'],
    // 活动相关
    activities: ['羽毛球', '篮球', '足球', '乒乓球', '跑步', '健身', '学习', '约', '一起'],
    // 学术相关
    academic: ['课程', '作业', '考试', '论文', '实验', '项目', '研究', '学习'],
    // 生活相关
    life: ['吃饭', '购物', '电影', '聚会', '旅行', '兼职', '租房']
  }
  
  const foundCategories: string[] = []
  const foundKeywords: string[] = []
  
  for (const [category, words] of Object.entries(keywords)) {
    const matchedWords = words.filter(word => query.includes(word))
    if (matchedWords.length > 0) {
      foundCategories.push(category)
      foundKeywords.push(...matchedWords)
    }
  }
  
  return { categories: foundCategories, keywords: foundKeywords }
}

// 获取智能推荐帖子
async function getSmartRecommendations(query?: string, userId?: string) {
  try {
    // 1. 获取所有帖子
    const res = await fetch('http://localhost:5000/api/posts')
    if (!res.ok) return { posts: [], total: 0, query: query || null }
    const allPosts = await res.json()
    
    if (!Array.isArray(allPosts)) return { posts: [], total: 0, query: query || null }
    
    // 2. 如果有查询，基于查询进行智能推荐
    if (query) {
      return getQueryBasedRecommendations(allPosts, query)
    }
    
    // 3. 否则返回热门推荐
    return getPopularRecommendations(allPosts)
  } catch (error) {
    console.error('获取推荐失败:', error)
    return { posts: [], total: 0, query: query || null }
  }
}

// 基于查询的智能推荐
function getQueryBasedRecommendations(posts: any[], query: string) {
  const { keywords } = extractKeywords(query)
  
  // 评分和排序
  const scoredPosts = posts.map(post => {
    let score = 0
    const content = (post.content || '').toLowerCase()
    const queryLower = query.toLowerCase()
    
    // 精确匹配权重最高
    if (content.includes(queryLower)) score += 10
    
    // 关键词匹配
    keywords.forEach(keyword => {
      if (content.includes(keyword.toLowerCase())) score += 3
    })
    
    // 新帖子权重更高
    const createdAt = new Date(post.created_at || post.time)
    const daysSinceCreated = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceCreated < 7) score += 2
    if (daysSinceCreated < 1) score += 3
    
    // 互动度权重
    const interactions = (post.likes || 0) + (post.comments || 0) + (post.shares || 0)
    score += Math.min(interactions * 0.5, 5) // 最多加5分
    
    return { ...post, relevanceScore: score }
  })
  
  const filteredPosts = scoredPosts.filter(post => post.relevanceScore > 0)
  const sortedPosts = filteredPosts.sort((a, b) => b.relevanceScore - a.relevanceScore)
  
  return {
    posts: sortedPosts.slice(0, 10),
    total: filteredPosts.length,
    query: query
  }
}

// 热门推荐
function getPopularRecommendations(posts: any[]) {
  const scoredPosts = posts
    .map(post => {
      let score = 0
      
      // 基于互动度评分
      const likes = post.likes || 0
      const comments = post.comments || 0
      const shares = post.shares || 0
      
      score += likes * 1 + comments * 2 + shares * 3
      
      // 时间衰减
      const createdAt = new Date(post.created_at || post.time)
      const daysSinceCreated = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      
      if (daysSinceCreated < 1) score *= 1.5
      else if (daysSinceCreated < 7) score *= 1.2
      else if (daysSinceCreated < 30) score *= 1.0
      else score *= 0.8
      
      return { ...post, popularityScore: score }
    })
    .sort((a, b) => b.popularityScore - a.popularityScore)
  
  return {
    posts: scoredPosts.slice(0, 10),
    total: posts.length,
    query: null
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { query, userId } = req.query
    
    console.log('获取智能推荐:', { query, userId })
    
    const result = await getSmartRecommendations(
      query as string, 
      userId as string
    )
    
    console.log(`返回${result.posts.length}个推荐帖子，总共${result.total}个相关帖子`)
    
    res.status(200).json(result)
  } catch (error: any) {
    console.error('智能推荐API错误:', error)
    res.status(500).json({ error: '获取推荐失败', detail: error.message })
  }
} 