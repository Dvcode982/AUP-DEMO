'use client'
import Sidebar from './components/Sidebar'
import Post from './components/Post'
import SearchBar from './components/SearchBar'
import FloatingActionButton from './components/FloatingActionButton'
import { useState, useEffect } from 'react'
import ChatWindow from './components/messages/ChatWindow'
import { postsAPI } from '@/lib/api'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedChat] = useState<string | null>('2')
  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const data = await postsAPI.getPosts()
        // 为每个帖子添加头像和postType
        const postsWithAvatars = data.map(post => ({
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

    fetchData()
  }, [])

  return (
    <div className="flex h-screen bg-gradient-to-br ">
      <Sidebar />

      <main className="flex-1 pt-4 pb-4 pl-4 overflow-hidden flex ">
        {/* 左侧：帖子列表，占据 50% */}
        <div className="w-2/3 flex flex-col mr-4">
          <SearchBar />

          <div className="flex flex-col space-y-4 mt-6 overflow-y-auto opacity-90" style={{ maxHeight: 'calc(100vh - 140px)' }}>
            {loading ? (
              <div className="text-center py-10">加载中...</div>
            ) : posts.length > 0 ? (
              posts.map(post => (
                <Post key={post.id} {...post} />
              ))
            ) : (
              <div className="text-center py-10">暂无论坛帖子</div>
            )}
          </div>
        </div>

        {/* 右侧：聊天窗口，占据 50% */}
        <div className="w-full flex flex-col">
          {selectedChat ? (
            <ChatWindow chatId={selectedChat} />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              选择一个聊天或开始新的对话
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
