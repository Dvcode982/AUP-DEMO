'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Post from '../components/Post'
import SearchBar from '../components/SearchBar'
import FloatingActionButton from '../components/FloatingActionButton'
import { lostAndFoundAPI } from '@/lib/api'

export default function LostAndFound() {
  const [lostAndFoundPosts, setLostAndFoundPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

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
      // 为每个帖子添加头像和postType
      const postsWithAvatars = data.map(post => ({
        ...post,
        avatar: '/placeholder.svg?height=40&width=40',
        postType: 'lostAndFound'
      }))
      setLostAndFoundPosts(postsWithAvatars)
    } catch (error) {
      console.error('Error fetching lost and found items:', error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="flex h-screen ">
      <Sidebar />
      <main className="flex-1 p-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <SearchBar onSearch={handleSearch} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4 overflow-y-auto " style={{maxHeight: 'calc(100vh - 140px)'}}>
            {loading ? (
              <div className="col-span-4 text-center py-10">加载中...</div>
            ) : lostAndFoundPosts.length > 0 ? (
              lostAndFoundPosts.map(post => (
                <Post key={post.id} {...post} />
              ))
            ) : (
              <div className="col-span-4 text-center py-10">暂无失物招领信息</div>
            )}
          </div>
          <FloatingActionButton />
        </div>
      </main>
    </div>
  )
}

