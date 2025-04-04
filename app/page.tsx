'use client'
import Sidebar from './components/Sidebar'
import Post from './components/Post'
import SearchBar from './components/SearchBar'
import FloatingActionButton from './components/FloatingActionButton'
import ChatWindow from './components/messages/ChatWindow'
import { useState, useEffect } from 'react'
import { postsAPI } from '@/lib/api'
import { X } from 'lucide-react'
import Image from 'next/image'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPost, setSelectedPost] = useState(null)
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    
    fetchPosts(searchParam || '');
  }, [])
  
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    await fetchPosts(query);
  }
  
  const fetchPosts = async (query: string) => {
    try {
      setLoading(true)
      const data = await postsAPI.getPosts(query)
      const forumPosts = data.filter(post => !post.isLostAndFound)
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

  const handlePostClick = (post) => {
    setSelectedPost(post)
  }

  const closePostDetail = () => {
    setSelectedPost(null)
  }

  return (
    <div className="flex h-screen bg-gradient-to-br">
      <Sidebar />

      <main className="flex-1 pt-4 pb-4 pl-4 pr-4 overflow-hidden flex">
        {/* 左侧区域 */}
        <div className={`flex flex-col transition-all duration-300 ${selectedPost ? 'w-1/2' : 'w-full'}`}>
          <SearchBar onSearch={handleSearch} />

          {selectedPost ? (
            // 显示选中的帖子详情
            <div className="mt-4 overflow-y-auto bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-50 rounded-lg p-4" 
                 style={{ maxHeight: 'calc(100vh - 140px)' }}>
              <button
                onClick={closePostDetail}
                className="mb-4 text-sm text-blue-500 hover:text-blue-600 flex items-center"
              >
                <X className="h-4 w-4 mr-1" />
                返回列表
              </button>
              <Post 
                {...selectedPost}
                isSelected={true}
              />
            </div>
          ) : (
            // 显示帖子列表
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4 overflow-y-auto bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-50 rounded-lg p-4" 
                 style={{ maxHeight: 'calc(100vh - 140px)' }}>
              {loading ? (
                <div className="col-span-4 text-center py-10">加载中...</div>
              ) : posts.length > 0 ? (
                posts.map(post => (
                  <Post 
                    key={post.id} 
                    {...post} 
                    onClick={() => handlePostClick(post)}
                  />
                ))
              ) : (
                <div className="col-span-4 text-center py-10">暂无论坛帖子</div>
              )}
            </div>
          )}
        </div>

        {/* 右侧区域 - 评论聊天窗口 */}
        {selectedPost && (
          <div className="w-1/2 pl-4">
            <ChatWindow 
              chatId={`post-${selectedPost.id}`} 
              title={`评论区 - ${selectedPost.title || selectedPost.content.substring(0, 20)}`}
              showUserInfo={false}
              isComment={true} // 添加这个属性
            />
          </div>
        )}

        <FloatingActionButton />
      </main>
    </div>
  )
}
