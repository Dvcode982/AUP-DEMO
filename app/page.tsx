'use client'
import Sidebar from './components/Sidebar'
import Post from './components/Post'
import SearchBar from './components/SearchBar'
import FloatingActionButton from './components/FloatingActionButton'
import TopicRecommendations from './components/TopicRecommendations'
import SmartRecommendations from './components/SmartRecommendations'
import { useState, useEffect } from 'react'
import { postsAPI, topicAggregationAPI } from '@/lib/api'
import { useAuth } from './contexts/AuthContext'
import { useTranslation } from './hooks/useTranslation'
import { Sparkles, Grid3X3 } from 'lucide-react'

export default function Home() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'all' | 'aggregated' | 'smart'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [aiTriggered, setAiTriggered] = useState(false)
  const [recommendationStats, setRecommendationStats] = useState<{total: number, displayed: number, query?: string} | null>(null)
  const { isAuthenticated } = useAuth()
  const { t } = useTranslation()

  useEffect(() => {
    fetchPosts()
  }, [viewMode, isAuthenticated])

  useEffect(() => {
    // 监听AI助手的智能推荐事件
    const handleAISmartRecommend = (event: any) => {
      const { keyword } = event.detail
      console.log('收到AI智能推荐请求:', keyword)
      
      // 设置AI触发状态
      setAiTriggered(true)
      
      // 切换到智能推荐模式
      setViewMode('smart')
      setSearchQuery(keyword)
      
      // 清除AI触发状态
      setTimeout(() => {
        setAiTriggered(false)
      }, 3000)
    }
    
    window.addEventListener('aiSmartRecommend', handleAISmartRecommend)
    
    return () => {
      window.removeEventListener('aiSmartRecommend', handleAISmartRecommend)
    }
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      let data
      
      if (viewMode === 'aggregated' && isAuthenticated) {
        // 获取智能聚合的帖子
        data = await topicAggregationAPI.getAggregatedPosts(50)
      } else if (viewMode === 'smart') {
        // 使用智能推荐（将在组件中处理）
        setLoading(false)
        return
      } else {
        // 获取所有帖子
        data = await postsAPI.getPosts()
      }
      
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    try {
      setLoading(true)
      setSearchQuery(query)
      
      if (query.trim()) {
        // 如果有搜索词，切换到智能推荐模式
        setViewMode('smart')
      } else {
        // 没有搜索词，显示所有帖子
        setViewMode('all')
        const data = await postsAPI.getPosts()
        setPosts(data || [])
      }
    } catch (error) {
      console.error('Error searching posts:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const renderContent = () => {
    if (viewMode === 'smart') {
      return (
        <SmartRecommendations
          query={searchQuery}
          maxItems={20}
          showHeader={false}
          className="h-full"
          onStatsUpdate={(stats) => setRecommendationStats(stats)}
        />
      )
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{t('loading')}</p>
          </div>
        </div>
      )
    }

    if (posts.length > 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3 auto-rows-max">
          {posts.map(post => (
            <Post key={post.id} {...post} />
          ))}
        </div>
      )
    }

    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {viewMode === 'aggregated' ? t('noRecommendedContent') : t('noPosts')}
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Sidebar />

      <main className="flex-1 p-2 sm:p-3 lg:p-4 overflow-hidden">
        <div className="w-full flex flex-col h-full">
          <SearchBar onSearch={handleSearch} placeholder={t('searchPlaceholder')} />
          
          <div className="flex gap-3 mt-3 h-full overflow-hidden">
            {/* 左侧主内容区 */}
            <div className="flex-1 flex flex-col">
              {/* 视图切换按钮 */}
              <div className="mb-3 flex gap-2">
                <button
                  onClick={() => {
                    setViewMode('all')
                    setSearchQuery('')
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'all'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                  {t('allPosts')}
                </button>
                
                {isAuthenticated && (
                  <button
                    onClick={() => setViewMode('aggregated')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      viewMode === 'aggregated'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    主题推荐
                  </button>
                )}
                
                <button
                  onClick={() => setViewMode('smart')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'smart'
                      ? aiTriggered
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg animate-pulse'
                        : 'bg-green-500 text-white shadow-md'
                      : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                  }`}
                >
                  <Sparkles className={`w-4 h-4 ${aiTriggered ? 'animate-spin' : ''}`} />
                  智能推荐
                  {aiTriggered && <span className="text-xs ml-1">🤖</span>}
                </button>
              </div>

              {/* 当前搜索提示 */}
              {viewMode === 'smart' && searchQuery && (
                <div className="mb-3 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      🎯 基于 "<span className="font-medium">{searchQuery}</span>" 的智能推荐
                    </p>
                    {recommendationStats && (
                      <div className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-800/30 px-2 py-1 rounded">
                        共找到 {recommendationStats.total} 个相关帖子
                        {recommendationStats.displayed < recommendationStats.total && 
                          ` (显示前 ${recommendationStats.displayed} 个)`
                        }
                      </div>
                    )}
                  </div>
                  {aiTriggered && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                      <span>🤖</span> AI助手自动为您推荐
                    </p>
                  )}
                </div>
              )}

              {/* 内容区域 */}
              <div className="overflow-y-auto bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-2 sm:p-3 flex-1">
                {renderContent()}
              </div>
            </div>

            {/* 右侧推荐区 */}
            <div className="w-72 hidden xl:block">
              <TopicRecommendations />
            </div>
          </div>
        </div>
        
        <FloatingActionButton label={t('createPost')} />
      </main>
    </div>
  )
}
