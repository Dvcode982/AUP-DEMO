'use client'

import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import MessageList from '../components/messages/MessageList'
import ChatWindow from '../components/messages/ChatWindow'

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState<string | null>('2')

  return (
    <div className="flex h-screen bg-gray-900 text-foreground">
      <Sidebar />
      <main className="flex-1 p-4 overflow-hidden flex gap-4">
        <div className="w-80">
          <MessageList onSelectChat={setSelectedChat} />
        </div>
        <div className="flex-1">
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