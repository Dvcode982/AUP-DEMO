'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import MessageList from '../components/messages/MessageList'
import ChatWindow from '../components/messages/ChatWindow'
import { useSearchParams } from 'next/navigation'
import ProtectedRoute from '../components/ProtectedRoute'
import { MessageSquare, Users, Star } from 'lucide-react'

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const searchParams = useSearchParams()
  
  useEffect(() => {
    setMounted(true)
    // 从URL参数中获取聊天ID
    const chatId = searchParams?.get('chat')
    if (chatId) {
      setSelectedChat(chatId)
    }
    // 移除硬编码的默认聊天ID，让用户手动选择
  }, [searchParams, selectedChat])

  if (!mounted) {
    return null
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* 聊天界面 */}
          <div className="flex-1 flex gap-1 p-4 overflow-hidden">
            {/* 消息列表 */}
            <div className="w-80 flex-shrink-0">
              <MessageList onSelectChat={setSelectedChat} />
            </div>
            
            {/* 聊天窗口 */}
            <div className="flex-1 min-w-0">
              {selectedChat ? (
                <ChatWindow chatId={selectedChat} />
              ) : (
                <div className="h-full flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      选择一个聊天
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      从左侧选择一个对话开始聊天，或搜索新用户开始对话
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}