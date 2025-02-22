'use client'
import Sidebar from './components/Sidebar'
import Post from './components/Post'
import SearchBar from './components/SearchBar'
import FloatingActionButton from './components/FloatingActionButton'
import { useState } from 'react'
import ChatWindow from './components/messages/ChatWindow'

const posts = [
  {
    id: 1,
    author: '用户A',
    avatar: '/placeholder.svg?height=40&width=40',
    content: '今天天气真好！',
    time: '2023-07-01 10:00',
    tags: ['天气', '心情', '分享']
  },
  {
    id: 2,
    author: '用户B',
    avatar: '/placeholder.svg?height=40&width=40',
    content: '推荐一本好书《百年孤独》',
    time: '2023-07-01 11:30',
    tags: ['读书', '推荐', '文学']
  },
  {
    id: 3,
    author: '用户C',
    avatar: '/placeholder.svg?height=40&width=40',
    content: '分享一道美食：红烧肉',
    image: '/placeholder.svg?height=200&width=300',
    time: '2023-07-01 12:45',
    tags: ['美食', '烹饪', '分享']
  }
]

export default function Home() {
  const [selectedChat] = useState<string | null>('2')

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      {/* 左侧 Sidebar */}
      <Sidebar />

      {/* 主体内容：左右分栏 */}
      <main className="flex-1 p-4 overflow-hidden flex gap-4">
        {/* 左侧：帖子列表，占据 50% */}
        <div className="w-1/2 flex flex-col">
          <SearchBar />

          {/* 帖子内容区域，纵向排列 */}
          <div className="flex flex-col space-y-4 mt-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
            {posts.map(post => (
              <Post key={post.id} {...post} />
            ))}
          </div>
        </div>

        {/* 右侧：聊天窗口，占据 50% */}
        <div className="w-1/2 flex flex-col">
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
