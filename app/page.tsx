'use client'
import Sidebar from './components/Sidebar'
import Post from './components/Post'
import SearchBar from './components/SearchBar'
import FloatingActionButton from './components/FloatingActionButton'
import { useState, useEffect } from 'react'
import { postsAPI } from '@/lib/api'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  
  useEffect(() => {
    // 从URL获取搜索参数
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    
    fetchPosts(searchParam || '');
  }, [])
  
  // 搜索帖子
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    await fetchPosts(query);
  }
  
  // 获取帖子数据
  const fetchPosts = async (query: string) => {
    try {
      setLoading(true)
      const data = await postsAPI.getPosts(query)
      // 过滤掉失物招领的帖子，只保留论坛帖子
      const forumPosts = data.filter(post => !post.isLostAndFound)
      // 为每个帖子添加头像和postType
      const postsWithAvatars = forumPosts.map(post => ({
        ...post,
        avatar: '/placeholder.svg?height=40&width=40',
        postType: 'forum'
      }))
      setPosts(postsWithAvatars)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br">
      <Sidebar />

      <main className="flex-1 pt-4 pb-4 pl-4 pr-4 overflow-hidden">
        <div className="w-full flex flex-col">
          <SearchBar onSearch={handleSearch} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4 overflow-y-auto bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-50 rounded-lg p-4 " style={{ maxHeight: 'calc(100vh - 140px)' }}>
            {loading ? (
              <div className="col-span-4 text-center py-10">加载中...</div>
            ) : posts.length > 0 ? (
              posts.map(post => (
                <Post key={post.id} {...post} />
              ))
            ) : (
              <div className="col-span-4 text-center py-10">暂无论坛帖子</div>
            )}
          </div>
        </div>
        
        <FloatingActionButton />
      </main>
    </div>
  )
}
