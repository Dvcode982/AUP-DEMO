'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import MessageList from '../components/messages/MessageList'
import ChatWindow from '../components/messages/ChatWindow'
import { useSearchParams } from 'next/navigation'
import ProtectedRoute from '../components/ProtectedRoute'

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // 从URL参数中获取聊天ID
    const chatId = searchParams.get('chat')
    if (chatId) {
      setSelectedChat(chatId)
    } else if (!selectedChat) {
      // 如果没有URL参数且没有选中的聊天，默认选择第一个
      setSelectedChat('2')
    }
  }, [searchParams, selectedChat])

  return (
    <ProtectedRoute>
      <div className="flex h-screen text-foreground">
        <Sidebar />
        <main className="flex-1 p-4 overflow-hidden flex gap-4">
          <div className="w-1/3 flex flex-col">
            <MessageList onSelectChat={setSelectedChat} />
          </div>
          <div className="flex-1">
            {selectedChat ? (
              <ChatWindow 
                chatId={selectedChat} 
                showUserInfo={true} 
                isComment={false}
                isDirectMessage={true} // 添加这个属性来标识是私聊
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                选择一个聊天或开始新的对话
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}