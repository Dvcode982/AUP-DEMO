'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search, Plus } from 'lucide-react'
import { useTheme } from 'next-themes'

interface Message {
  id: string
  user: {
    name: string
    avatar: string
  }
  lastMessage: string
  timestamp: string
  unread: boolean
}

const mockMessages: Message[] = [
  {
    id: '1',
    user: { name: '艾米·科尔', avatar: '/placeholder.svg?height=32&width=32' },
    lastMessage: '这是我最喜欢的主题',
    timestamp: '3/1 早上',
    unread: true,
  },
  {
    id: '2',
    user: { name: '杰西卡·李', avatar: '/placeholder.svg?height=32&width=32' },
    lastMessage: '嗨，大卫，附上一些产品',
    timestamp: '下午 6:53',
    unread: false,
  },
  {
    id: '3',
    user: { name: '布鲁斯', avatar: '/placeholder.svg?height=32&width=32' },
    lastMessage: 'MAN',
    timestamp: '星期二 下午 9:30',
    unread: false,
  },
]

interface MessageListProps {
  onSelectChat: (chatId: string) => void
}

export default function MessageList({ onSelectChat }: MessageListProps) {
  const { theme } = useTheme()
  const bgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
  const hoverBgColor = theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-blue-100'
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredMessages = messages.filter(message =>
    message.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className={`${bgColor} rounded-lg overflow-hidden h-full border border-gray-200 dark:border-gray-600`}>
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            type="text"
            placeholder="请输入关键字..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 bg-blue-100 dark:bg-gray-900 border-0 text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:ring-0"
          />
        </div>
      </div>
      <div className="overflow-y-auto" style={{ height: 'calc(100vh - 240px)' }}>
        {filteredMessages.map((message) => (
          <div
            key={message.id}
            className={`flex items-center p-4 cursor-pointer ${hoverBgColor} ${
              message.unread ? bgColor : ''
            }`}
            onClick={() => onSelectChat(message.id)}
          >
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={message.user.avatar} alt={message.user.name} />
              <AvatarFallback>{message.user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                  {message.user.name}
                </span>
                <span className="text-xs text-gray-500 flex-shrink-0">{message.timestamp}</span>
              </div>
              <p className={`text-sm truncate ${
                message.unread ? 'text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'
              }`}>
                {message.lastMessage}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

