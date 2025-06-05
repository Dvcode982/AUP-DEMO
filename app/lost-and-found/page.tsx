'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import LostFoundCard from '../components/LostFoundCard'
import SearchBar from '../components/SearchBar'
import FloatingActionButton from '../components/FloatingActionButton'
import { lostAndFoundAPI } from '@/lib/api'
import { Filter, Grid3X3, List, Calendar, MapPin, Tag, Package } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'

interface FilterState {
  itemType: 'all' | 'lost' | 'found'
  status: 'all' | 'active' | 'resolved'
  timeRange: 'all' | 'today' | 'week' | 'month'
  category: string
  location?: 'all' | 'nearby' | string
}

interface LostFoundPost {
  id: number
  author: string
  avatar: string
  content: string
  itemName: string
  category?: string
  location?: string
  contactInfo?: string
  reward?: string
  image?: string
  images?: string[]
  time: string
  tags: string[]
  isReturned: boolean
  returnedTime?: string
  itemType?: 'lost' | 'found'
  comments?: number
  shares?: number
  views: number
  likes: number
  postType?: string
}

export default function LostAndFound() {
  const { t } = useTranslation()
  const [lostAndFoundPosts, setLostAndFoundPosts] = useState<LostFoundPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    itemType: 'all',
    status: 'all',
    timeRange: 'all',
    category: 'all',
    location: 'all'
  })
  const [stats, setStats] = useState({
    total: 0,
    lost: 0,
    found: 0,
    resolved: 0,
    unresolved: 0
  })

  const categories = [
    { value: 'all', label: t('lostFound.categories.all') || '全部分类', icon: Package },
    { value: 'electronics', label: t('lostFound.categories.electronics'), icon: Package },
    { value: 'documents', label: t('lostFound.categories.documents'), icon: Package },
    { value: 'keys', label: t('lostFound.categories.keys'), icon: Package },
    { value: 'clothing', label: t('lostFound.categories.clothing'), icon: Package },
    { value: 'books', label: t('lostFound.categories.books'), icon: Package },
    { value: 'sports', label: t('lostFound.categories.sports'), icon: Package },
    { value: 'bags', label: t('lostFound.categories.bags'), icon: Package },
    { value: 'jewelry', label: t('lostFound.categories.jewelry'), icon: Package },
    { value: 'others', label: t('lostFound.categories.others'), icon: Package }
  ]

  useEffect(() => {
    // 从URL获取搜索参数
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    
    fetchItems(searchParam || '');
    fetchStats();
  }, [])
  
  // 获取统计信息
  const fetchStats = async () => {
    try {
      const statsData = await lostAndFoundAPI.getLostAndFoundStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }
  
  // 搜索失物招领
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    await fetchItems(query);
  }
  
  // 获取失物招领数据
  const fetchItems = async (query: string, typeFilter?: string) => {
    try {
      setLoading(true)
      
      // 确保类型安全
      let type: 'lost' | 'found' | undefined;
      if (typeFilter === 'lost' || typeFilter === 'found') {
        type = typeFilter;
      } else if (filters.itemType === 'lost' || filters.itemType === 'found') {
        type = filters.itemType;
      } else {
        type = undefined;
      }
      
      const data = await lostAndFoundAPI.getLostAndFoundItems(query, type)
      // 为每个帖子添加头像和postType，并确保itemType正确传递
      const postsWithAvatars = data.map((post: any) => ({
        ...post,
        avatar: post.avatar || '/placeholder.svg?height=40&width=40',
        postType: 'lostAndFound',
        // 确保itemType正确设置
        itemType: post.itemType || 'lost',
        // 确保所有必要字段都存在
        itemName: post.itemName || post.title,
        content: post.content || post.description,
        comments: post.comments || 0,
        shares: post.shares || 0,
        views: post.views || 0,
        likes: post.likes || 0
      }))
      setLostAndFoundPosts(postsWithAvatars)
    } catch (error) {
      console.error('Error fetching lost and found items:', error)
    } finally {
      setLoading(false)
    }
  }

  // 处理筛选器变化
  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    
    // 如果是类型筛选，重新获取数据
    if (filterType === 'itemType') {
      fetchItems(searchQuery, value !== 'all' ? value : undefined);
    }
  }

  // 应用筛选器
  const applyFilters = (filteredPosts: LostFoundPost[]) => {
    return filteredPosts.filter((post: LostFoundPost) => {
      // 物品类型筛选
      if (filters.itemType !== 'all' && post.itemType !== filters.itemType) {
        return false
      }
      
      // 状态筛选
      if (filters.status === 'active' && post.isReturned) {
        return false
      }
      if (filters.status === 'resolved' && !post.isReturned) {
        return false
      }
      
      // 时间筛选
      if (filters.timeRange !== 'all') {
        const postDate = new Date(post.time);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - postDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch (filters.timeRange) {
          case 'today':
            if (diffDays > 1) return false;
            break;
          case 'week':
            if (diffDays > 7) return false;
            break;
          case 'month':
            if (diffDays > 30) return false;
            break;
        }
      }
      
      // 地点筛选 - 附近地点的逻辑
      if (filters.location === 'nearby') {
        // 这里可以根据实际需求添加地理位置筛选逻辑
        // 目前简单匹配包含"附近"、"校内"、"宿舍"、"图书馆"等关键词的位置
        const nearbyKeywords = ['附近', '校内', '宿舍', '图书馆', '食堂', '教学楼', '实验楼', '体育馆'];
        if (post.location && !nearbyKeywords.some(keyword => post.location!.includes(keyword))) {
          return false;
        }
      }
      
      // 分类筛选
      if (filters.category !== 'all' && post.category !== filters.category) {
        return false
      }
      
      return true;
    });
  }

  const filteredPosts = applyFilters(lostAndFoundPosts);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 pt-4 pb-4 pl-4 pr-4 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* 搜索栏 */}
          <SearchBar 
            onSearch={handleSearch} 
            placeholder={t('searchLostFound')} 
            resultCount={filteredPosts.length}
            filters={filters}
            onFilterChange={setFilters}
          />

          {/* 主内容区 */}
          <div className="flex-1 min-h-0 bg-white/40 dark:bg-gray-800/40 rounded-lg p-4 mt-4">
            {/* 标题和统计 */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {t('lostFoundNav')}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {t('lostFound.description') || '帮助你找回失物，助人为乐'}
                </p>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs">{t('lostFound.stats.total') || '总计'}</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-red-500">{stats.lost}</div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs">{t('lostFound.stats.lost') || '寻物'}</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-500">{stats.found}</div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs">{t('lostFound.stats.found') || '招领'}</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-500">{stats.resolved}</div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs">{t('lostFound.stats.resolved') || '已解决'}</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-500">{stats.unresolved}</div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs">未解决</div>
                </div>
              </div>
            </div>

            {/* 筛选和视图控制 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                {/* 筛选按钮 */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all duration-200 text-sm ${
                    showFilters 
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                      : 'bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                  }`}
                >
                  <Filter size={16} />
                  <span>{t('filter')}</span>
                </button>
              </div>

              {/* 视图切换 */}
              <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                  title={t('lostFound.gridView') || '网格视图'}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  title={t('lostFound.listView') || '列表视图'}
                >
                  <List size={16} />
                </button>
              </div>
            </div>

            {/* 高级筛选面板 */}
            {showFilters && (
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-4 space-y-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* 状态筛选 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('lostFound.status') || '状态'}
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300/50 dark:border-gray-600/50 rounded-lg bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100"
                    >
                      <option value="all">{t('lostFound.allStatus') || '全部状态'}</option>
                      <option value="active">{t('lostFound.activeStatus') || '进行中'}</option>
                      <option value="resolved">{t('lostFound.resolvedStatus') || '已解决'}</option>
                    </select>
                  </div>
<<<<<<< HEAD
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">{stats.lost}</div>
                    <div className="text-gray-500 dark:text-gray-400">失物</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{stats.found}</div>
                    <div className="text-gray-500 dark:text-gray-400">招领</div>
=======

                  {/* 时间筛选 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('lostFound.timeRange') || '时间范围'}
                    </label>
                    <select
                      value={filters.timeRange}
                      onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300/50 dark:border-gray-600/50 rounded-lg bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100"
                    >
                      <option value="all">{t('lostFound.allTime') || '全部时间'}</option>
                      <option value="today">{t('lostFound.today') || '今天'}</option>
                      <option value="week">{t('lostFound.thisWeek') || '近一周'}</option>
                      <option value="month">{t('lostFound.thisMonth') || '近一月'}</option>
                    </select>
                  </div>

                  {/* 地点筛选 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      地点范围
                    </label>
                    <select
                      value={filters.location || 'all'}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300/50 dark:border-gray-600/50 rounded-lg bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100"
                    >
                      <option value="all">全部地点</option>
                      <option value="nearby">附近地点</option>
                    </select>
>>>>>>> 803e0c25696cfdebff4345d0de587bf1f5b817ed
                  </div>

                  {/* 分类筛选 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('lostFound.category')}
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300/50 dark:border-gray-600/50 rounded-lg bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

<<<<<<< HEAD
              {/* 搜索栏 */}
              <SearchBar onSearch={handleSearch} placeholder={t('searchLostFound')} resultCount={filteredPosts.length} />

              {/* 筛选和视图控制 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* 筛选按钮 */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                      showFilters 
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Filter size={18} />
                    <span>{t('filter')}</span>
                  </button>

                  {/* 快速筛选标签 */}
                  <div className="flex items-center space-x-2">
                    {[
                      { key: 'all', label: t('lostFound.filterAll') || '全部' },
                      { key: 'lost', label: '失物' },
                      { key: 'found', label: '招领' }
                    ].map((type) => (
                      <button
                        key={type.key}
                        onClick={() => handleFilterChange('itemType', type.key as any)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                          filters.itemType === type.key
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
=======
            {/* 内容区域 */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{t('loading')}</p>
>>>>>>> 803e0c25696cfdebff4345d0de587bf1f5b817ed
                  </div>
                </div>
              ) : filteredPosts.length > 0 ? (
                <div className={
                  viewMode === 'grid' 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
                    : "space-y-4"
                }>
                  {filteredPosts.map(post => (
                    <LostFoundCard 
                      key={post.id} 
                      {...post}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
<<<<<<< HEAD
              </div>

              {/* 高级筛选面板 */}
              {showFilters && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 状态筛选 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('lostFound.status') || '状态'}
                      </label>
                      <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="all">{t('lostFound.allStatus') || '全部状态'}</option>
                        <option value="active">{t('lostFound.activeStatus') || '进行中'}</option>
                        <option value="resolved">{t('lostFound.resolvedStatus') || '已解决'}</option>
                      </select>
                    </div>

                    {/* 时间筛选 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('lostFound.timeRange') || '时间范围'}
                      </label>
                      <select
                        value={filters.timeRange}
                        onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="all">{t('lostFound.allTime') || '全部时间'}</option>
                        <option value="today">{t('lostFound.today') || '今天'}</option>
                        <option value="week">{t('lostFound.thisWeek') || '近一周'}</option>
                        <option value="month">{t('lostFound.thisMonth') || '近一月'}</option>
                      </select>
                    </div>

                    {/* 分类筛选 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('lostFound.category')}
                      </label>
                      <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
=======
              ) : (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 bg-white/60 dark:bg-gray-700/60 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-10 h-10 text-gray-400 dark:text-gray-500" />
>>>>>>> 803e0c25696cfdebff4345d0de587bf1f5b817ed
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {searchQuery ? t('lostFound.noSearchResults') || '没有找到匹配的结果' : t('lostFound.noItems') || '暂无失物招领信息'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                      {searchQuery 
                        ? t('lostFound.tryOtherKeywords') || '试试其他关键词' 
                        : t('lostFound.noItemsDesc') || '还没有人发布失物招领信息'
                      }
                    </p>
                    <button
                      onClick={() => window.location.href = '/create-lost-found'}
                      className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      {t('lostFound.publishPost')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <FloatingActionButton />
      </main>
    </div>
  )
}

