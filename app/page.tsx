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
    <div className="flex h-screen bg-gradient-to-br">
      <Sidebar />

      <main className="flex-1 pt-4 pb-4 pl-4 pr-4 overflow-hidden">
        <div className="w-full flex flex-col h-full">
          <SearchBar onSearch={handleSearch} />
          
          <div className="flex gap-4 mt-4 h-full overflow-hidden">
            {/* 左侧主内容区 */}
            <div className="flex-1 flex flex-col">
              {/* 视图切换按钮 */}
              {isAuthenticated && (
                <div className="mb-4 flex gap-2">
                  <button
                    onClick={() => setViewMode('all')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      viewMode === 'all'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                    全部帖子
                  </button>
                  <button
                    onClick={() => setViewMode('aggregated')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      viewMode === 'aggregated'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    为您推荐
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-50 rounded-lg p-4 flex-1">
                {loading ? (
                  <div className="col-span-full text-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-500 dark:text-gray-400">加载中...</p>
                  </div>
                ) : posts.length > 0 ? (
                  posts.map(post => (
                    <Post key={post.id} {...post} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400">
                      {viewMode === 'aggregated' ? '暂无推荐内容，多浏览一些帖子吧！' : '暂无论坛帖子'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 右侧推荐区 */}
            <div className="w-80 hidden lg:block">
              <TopicRecommendations />
            </div>
          </div>
        </div>
        
        <FloatingActionButton />
      </main>
    </div>
  )
}
