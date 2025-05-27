'use client'
import Sidebar from './components/Sidebar'
import Post from './components/Post'
import SearchBar from './components/SearchBar'
import FloatingActionButton from './components/FloatingActionButton'
import TopicRecommendations from './components/TopicRecommendations'
import { useState, useEffect } from 'react'
import { postsAPI, topicAggregationAPI } from '@/lib/api'
import { useAuth } from './contexts/AuthContext'
import { Sparkles, Grid3X3 } from 'lucide-react'

export default function Home() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'all' | 'aggregated'>('all')
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    fetchPosts()
  }, [viewMode, isAuthenticated])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      let data
      
      if (viewMode === 'aggregated' && isAuthenticated) {
        // 获取智能聚合的帖子
        data = await topicAggregationAPI.getAggregatedPosts(50)
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
      const data = await postsAPI.getPosts(query)
      setPosts(data || [])
    } catch (error) {
      console.error('Error searching posts:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Sidebar />

      <main className="flex-1 p-2 sm:p-3 lg:p-4 overflow-hidden">
        <div className="w-full flex flex-col h-full">
          <SearchBar onSearch={handleSearch} />
          
          <div className="flex gap-3 mt-3 h-full overflow-hidden">
            {/* 左侧主内容区 */}
            <div className="flex-1 flex flex-col">
              {/* 视图切换按钮 - 更紧凑 */}
              {isAuthenticated && (
                <div className="mb-3 flex gap-2">
                  <button
                    onClick={() => setViewMode('all')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      viewMode === 'all'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                    全部帖子
                  </button>
                  <button
                    onClick={() => setViewMode('aggregated')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      viewMode === 'aggregated'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    为您推荐
                  </button>
                </div>
              )}

              {/* 帖子网格 - 使用更紧密的布局 */}
              <div className="overflow-y-auto bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-2 sm:p-3 flex-1">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">加载中...</p>
                    </div>
                  </div>
                ) : posts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3 auto-rows-max">
                    {posts.map(post => (
                      <Post key={post.id} {...post} />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {viewMode === 'aggregated' ? '暂无推荐内容，多浏览一些帖子吧！' : '暂无论坛帖子'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 右侧推荐区 - 更紧凑 */}
            <div className="w-72 hidden xl:block">
              <TopicRecommendations />
            </div>
          </div>
        </div>
        
        <FloatingActionButton />
      </main>
    </div>
  )
}
