'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, UserPlus } from 'lucide-react'
import { useTheme } from 'next-themes'
import { messagesAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import UserSearchModal from './UserSearchModal'

interface Message {
  id: string
  user: {
    name: string
    avatar: string
    email?: string // 添加email字段
  }
  lastMessage: string
  timestamp: string
  unread: boolean
}

interface MessageListProps {
  onSelectChat: (chatId: string) => void
}

export default function MessageList({ onSelectChat }: MessageListProps) {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const [messages, setMessages] = useState<Message[]>([])
  const [searchTerm, setSearchTerm] = useState('')  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isUserSearchOpen, setIsUserSearchOpen] = useState(false)

  // 添加mounted状态管理
  useEffect(() => {
    setMounted(true)
  }, [])

  // 获取对话列表
  useEffect(() => {
    async function fetchConversations() {
      try {
        setLoading(true)
        const data = await messagesAPI.getConversations()
        setMessages(data)
      } catch (err: any) {
        console.error('获取对话列表失败:', err)
        // 检查是否是认证错误
        if (err.message && err.message.includes('Authentication token required')) {
          setError('请先登录后再访问消息功能')
        } else {
          setError('无法加载对话列表')
        }
        toast.error('获取对话列表失败')
      } finally {
        setLoading(false)
      }
    }

    if (mounted) {
      fetchConversations()
    }
  }, [mounted])

  // 计算主题相关的样式
  const bgColor = mounted && theme === 'dark' ? 'bg-gray-800' : 'bg-white'
  const hoverBgColor = mounted && theme === 'dark' ? 'hover:bg-indigo-700' : 'hover:bg-indigo-300'

  const filteredMessages = messages.filter(message =>
    (message.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (message.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (message.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  )

  // 处理用户选择
  const handleUserSelect = async (userId: string) => {
    try {
      // 先尝试发送一条初始消息来创建对话
      await messagesAPI.sendMessage(userId, '你好，很高兴认识你！');
      // 然后跳转到新创建的对话
      onSelectChat(userId);
      toast.success('成功创建新对话');
    } catch (err) {
      console.error('创建对话失败:', err);
      toast.error('创建对话失败，请稍后再试');
    }
  }

  // 防止水合不匹配
  if (!mounted) {
    return null // 或者返回一个加载占位符
  }
  

  return (
    <div className={`${bgColor} rounded-lg overflow-hidden h-full border border-gray-200 dark:border-gray-700 bg-opacity-70`}>
      <div className="p-4">
        <div className="flex items-center space-x-2">
          <div className="relative opacity-80 flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 " />
            <Input
              type="text"
              placeholder="搜索消息或用户..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 bg-blue-200/80 dark:bg-gray-900 border-0 text-black dark:text-gray-200 placeholder-gray-500 focus:ring-0"
            />
          </div>
          <Button 
            variant="outline"
            size="icon"
            onClick={() => setIsUserSearchOpen(true)}
            className="bg-blue-200/80 dark:bg-gray-900 border-0 hover:bg-blue-300 dark:hover:bg-gray-800"
            title="搜索用户"
          >
            <UserPlus className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          </Button>
        </div>
      </div>
      
      {/* 用户搜索模态框 */}
      <UserSearchModal 
        isOpen={isUserSearchOpen} 
        onClose={() => setIsUserSearchOpen(false)} 
        onSelectUser={handleUserSelect} 
      />
      <div className="overflow-y-auto" style={{ height: 'calc(100vh - 240px)' }}>
        {filteredMessages.map((message) => (
            <div
            key={message.id}
            className={`flex items-center p-4 cursor-pointer ${hoverBgColor} ${message.unread ? (theme === 'dark' ? 'bg-indigo-700/60' : 'bg-indigo-200/90') : ''}`}
            onClick={() => onSelectChat(message.id)}
            >
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={message.user?.avatar || '/images/lon.jpg'} alt={message.user?.name || '未知用户'} />
              <AvatarFallback>{message.user?.name?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
              {message.user?.name || '未知用户'}
              </span>
              <span className="text-xs text-gray-500 flex-shrink-0">{message.timestamp || ''}</span>
              </div>
              {message.user?.email && (
                <div className="text-xs text-gray-500 mb-1 truncate">
                  {message.user.email}
                </div>
              )}
              <p className={`text-sm truncate ${
              message.unread ? 'text-indigo-700 dark:text-indigo-300' : 'text-indigo-600 dark:text-indigo-400'
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

 