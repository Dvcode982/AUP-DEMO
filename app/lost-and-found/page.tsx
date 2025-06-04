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
    category: 'all'
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
  }, [])
  
  // 搜索失物招领
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    await fetchItems(query);
  }
  
  // 获取失物招领数据
  const fetchItems = async (query: string) => {
    try {
      setLoading(true)
      const data = await lostAndFoundAPI.getLostAndFoundItems(query)
      // 为每个帖子添加头像和postType，并确保itemType正确传递
      const postsWithAvatars = data.map((post: any) => ({
        ...post,
        avatar: post.avatar || '/placeholder.svg?height=40&width=40',
        postType: 'lostAndFound',
        // 确保itemType正确设置，如果没有则根据其他字段推断
        itemType: post.itemType || (post.type === 'lost' ? 'lost' : post.type === 'found' ? 'found' : 'lost'),
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
      
      // 时间筛选 (这里需要根据实际时间字段调整)
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
      
      return true;
    });
  }

  const filteredPosts = applyFilters(lostAndFoundPosts);
  const stats = {
    total: filteredPosts.length,
    lost: filteredPosts.filter(p => p.itemType === 'lost').length,
    found: filteredPosts.filter(p => p.itemType === 'found').length,
    resolved: filteredPosts.filter(p => p.isReturned).length,
    unresolved: filteredPosts.filter(p => !p.isReturned).length
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部横幅 */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col space-y-4">
              {/* 标题和统计 */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {t('lostFoundNav')}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t('lostFound.description') || '帮助你找回失物，助人为乐'}
                  </p>
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
                    <div className="text-gray-500 dark:text-gray-400">{t('lostFound.stats.total') || '总计'}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">{stats.lost}</div>
                    <div className="text-gray-500 dark:text-gray-400">{t('lostFound.stats.lost') || '寻物'}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{stats.found}</div>
                    <div className="text-gray-500 dark:text-gray-400">{t('lostFound.stats.found') || '招领'}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">{stats.resolved}</div>
                    <div className="text-gray-500 dark:text-gray-400">{t('lostFound.stats.resolved') || '已解决'}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">{stats.unresolved}</div>
                    <div className="text-gray-500 dark:text-gray-400">未解决</div>
                  </div>
                </div>
              </div>

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
                      { key: 'lost', label: t('lostFound.lostItem') },
                      { key: 'found', label: t('lostFound.foundItem') }
                    ].map((type) => (
                      <button
                        key={type.key}
                        onClick={() => setFilters(prev => ({ ...prev, itemType: type.key as any }))}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                          filters.itemType === type.key
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 视图切换 */}
                <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                    title={t('lostFound.gridView') || '网格视图'}
                  >
                    <Grid3X3 size={18} />
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
                    <List size={18} />
                  </button>
                </div>
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
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
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
                        onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value as any }))}
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
                        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">{t('loading')}</p>
                </div>
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {searchQuery ? t('lostFound.noSearchResults') || '没有找到匹配的结果' : t('lostFound.noItems') || '暂无失物招领信息'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
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

        <FloatingActionButton />
      </main>
    </div>
  )
}

