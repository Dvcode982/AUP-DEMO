import type { NextApiRequest, NextApiResponse } from 'next'

// 智能关键词提取和分类
function extractKeywords(query: string) {
  const keywords = {
    // 失物招领相关 - 扩展词汇
    lostAndFound: [
      '失物', '招领', '找', '寻', '丢', '捡', '遗失', '拾到', '归还', '丢失', '遗忘', 
      '不见了', '找不到', '掉了', '落在', '忘记', '寻找', '寻物', '失而复得', 
      '拾金不昧', '物归原主', '认领', '失主', '领取', '捡到'
    ],
    // 物品类型 - 大幅扩展
    items: [
      '校园卡', '钥匙', '钱包', '手机', '充电器', '耳机', '书包', '雨伞', '水杯', 
      '笔记本', '眼镜', '手表', '身份证', '银行卡', '公交卡', 'U盘', '移动硬盘',
      '电脑', '平板', '相机', '项链', '戒指', '手镯', '耳环', '手链', '包',
      '背包', '双肩包', '单肩包', '化妆包', '文具', '笔', '书', '课本', '作业本',
      '保温杯', '饭盒', '餐具', '衣服', '外套', '帽子', '围巾', '手套', '鞋',
      '袜子', '内衣', '裤子', 'T恤', '毛衣', '运动鞋', '凉鞋', '拖鞋'
    ],
    // 地点相关 - 扩展校园地点
    locations: [
      '宿舍', '食堂', '图书馆', '教学楼', '操场', '实验室', '停车场', '校门', 
      '咖啡厅', '便利店', '超市', '洗衣房', '浴室', '厕所', '楼梯', '电梯',
      '走廊', '教室', '办公室', '医务室', '体育馆', '游泳池', '网球场', 
      '篮球场', '足球场', '跑道', '健身房', '自习室', '机房', '实训室'
    ],
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
async function getSmartRecommendations(query?: string, userId?: string, type?: string) {
  try {
    let allData: any[] = [];
    if (type === 'lostAndFound') {
      // 只查失物招领
      const lostFoundRes = await fetch('http://localhost:5000/api/lost-and-found');
      const lostFoundItems = lostFoundRes.ok ? await lostFoundRes.json() : [];
      allData = Array.isArray(lostFoundItems) ? lostFoundItems : [];
    } else {
      // 默认聚合所有
      const [postsRes, lostFoundRes] = await Promise.all([
        fetch('http://localhost:5000/api/posts'),
        fetch('http://localhost:5000/api/lost-and-found')
      ]);
      const allPosts = postsRes.ok ? await postsRes.json() : [];
      const lostFoundItems = lostFoundRes.ok ? await lostFoundRes.json() : [];
      allData = [
        ...(Array.isArray(allPosts) ? allPosts : []),
        ...(Array.isArray(lostFoundItems) ? lostFoundItems : [])
      ];
    }
    if (allData.length === 0) {
      return { posts: [], total: 0, query: query || null }
    }
    if (query) {
      return getQueryBasedRecommendations(allData, query)
    }
    return getPopularRecommendations(allData)
  } catch (error) {
    console.error('获取推荐失败:', error)
    return { posts: [], total: 0, query: query || null }
  }
}

// 基于查询的智能推荐
function getQueryBasedRecommendations(posts: any[], query: string) {
  const { categories, keywords } = extractKeywords(query)
  const isLostFoundQuery = categories.includes('lostAndFound') || categories.includes('items')
  
  // 评分和排序
  const scoredPosts = posts.map(post => {
    let score = 0
    const content = (post.content || '').toLowerCase()
    const queryLower = query.toLowerCase()
    
    // 精确匹配权重最高
    if (content.includes(queryLower)) score += 10
    
    // 失物招领相关查询时，给失物招领帖子额外权重
    if (isLostFoundQuery && post.isLostAndFound) {
      score += 5
      // 如果是对应类型的失物招领，再加权重
      if ((post.itemType === 'lost' && (query.includes('丢') || query.includes('失') || query.includes('找'))) ||
          (post.itemType === 'found' && (query.includes('捡') || query.includes('拾') || query.includes('招领')))) {
        score += 3
      }
    }
    
    // 关键词匹配
    keywords.forEach(keyword => {
      if (content.includes(keyword.toLowerCase())) {
        score += 3
        // 如果是失物招领帖子且匹配到物品关键词，额外加权
        if (post.isLostAndFound && categories.includes('items')) {
          score += 2
        }
      }
    })
    
    // 新帖子权重更高
    const createdAt = new Date(post.created_at || post.time)
    const daysSinceCreated = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceCreated < 7) score += 2
    if (daysSinceCreated < 1) score += 3
    
    // 互动度权重
    const interactions = (post.likes || 0) + (post.comments || 0) + (post.shares || 0)
    score += Math.min(interactions * 0.5, 5) // 最多加5分
    
    // 失物招领的特殊互动权重 - 未解决的更紧急
    if (post.isLostAndFound && !post.isReturned) {
      score += 1 // 未解决的失物招领更紧急
    }
    
    return { ...post, relevanceScore: score }
  })
  
  const filteredPosts = scoredPosts.filter(post => post.relevanceScore > 0)
  const sortedPosts = filteredPosts.sort((a, b) => b.relevanceScore - a.relevanceScore)
  
  return {
    posts: sortedPosts.slice(0, 10),
    total: filteredPosts.length,
    query: query,
    // 添加推荐信息
    recommendationInfo: {
      isLostFoundRelated: isLostFoundQuery,
      matchedCategories: categories,
      matchedKeywords: keywords
    }
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
    const { query, userId, type } = req.query
    
    console.log('获取智能推荐:', { query, userId, type })
    
    const result = await getSmartRecommendations(
      query as string, 
      userId as string,
      type as string
    )
    
    console.log(`返回${result.posts.length}个推荐帖子，总共${result.total}个相关帖子`)
    
    res.status(200).json(result)
  } catch (error: any) {
    console.error('智能推荐API错误:', error)
    res.status(500).json({ error: '获取推荐失败', detail: error.message })
  }
} 