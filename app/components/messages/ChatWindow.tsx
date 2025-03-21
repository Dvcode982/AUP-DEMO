'use client'

import { useState, useRef, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Smile, ImageIcon, Mic, Send, FileText, Paperclip, Sticker } from 'lucide-react'
import EmojiPicker from '../create-post/EmojiPicker'
import { useTheme } from 'next-themes'
import { messagesAPI } from '@/lib/api'
import toast from 'react-hot-toast'


interface Message {
  id: string
  sender: 'user' | 'other'
  content: string
  timestamp: string
  isRead?: boolean
}

interface ChatWindowProps {
  chatId: string
}

// 初始状态为空数组，将通过API获取真实消息
const initialMessages: Message[] = []

export default function ChatWindow({ chatId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [chatPartner, setChatPartner] = useState({ name: '加载中...', avatar: '/images/lon.jpg' })

  // 获取聊天历史
  useEffect(() => {
    async function fetchMessages() {
      if (!chatId) return
      
      try {
        setLoading(true)
        const data = await messagesAPI.getMessages(chatId)
        
        // 格式化消息数据
        // 检查data是否为数组，如果是数组则直接使用，否则尝试访问data.messages
        const messagesData = Array.isArray(data) ? data : (data.messages || [])
        const formattedMessages = messagesData.map((msg: any) => ({
          id: msg.id,
          // 使用senderId字段判断消息发送者
          sender: msg.senderId === localStorage.getItem('userId') ? 'user' : 'other',
          content: msg.content,
          // 使用createdAt字段格式化时间
          timestamp: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }) : '未知时间',
          isRead: msg.isRead
        }))
        
        setMessages(formattedMessages)
        // 设置聊天伙伴信息
        if (data.partnerName) {
          setChatPartner({
            name: data.partnerName,
            avatar: data.partnerAvatar || '/images/lon.jpg'
          })
        }
      } catch (err) {
        console.error('获取聊天历史失败:', err)
        setError('无法加载聊天历史')
      } finally {
        setLoading(false)
        // 滚动到底部
        scrollToBottom()
      }
    }
    
    fetchMessages()
  }, [chatId])
  
  // 消息变化时滚动到底部
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      // 创建临时消息对象用于UI立即显示
      const tempMsg: Message = {
        id: `temp-${Date.now()}`,
        sender: 'user',
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
      }
      
      // 立即更新UI
      setMessages([...messages, tempMsg])
      const messageContent = newMessage
      setNewMessage('')
      
      try {
        // 发送消息到服务器
        const response = await messagesAPI.sendMessage(chatId, messageContent)
        
        // 用服务器返回的消息替换临时消息
        setMessages(prev => prev.map(msg => 
          msg.id === tempMsg.id ? {
            ...msg,
            id: response.id || msg.id,
            // 确保使用正确的发送者标识
            sender: 'user',
            timestamp: response.createdAt ? new Date(response.createdAt).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
          } : msg
        ))
      } catch (err) {
        console.error('发送消息失败:', err)
        // 标记临时消息为发送失败
        setMessages(prev => prev.map(msg => 
          msg.id === tempMsg.id ? { ...msg, content: `${msg.content} (发送失败)` } : msg
        ))
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji)
  }

  return (
    <div className="relative flex flex-col h-full border border-border rounded-2xl overflow-hidden bg-white dark:bg-gray-800 bg-opacity-70 dark:bg-opacity-70">
      
      {/* 顶部区域 */}
      <div className="fixed-header backdrop-blur-md absolute top-0 left-0 right-0 h-[48px] z-30">
        <div className="p-2 flex items-center bg-white/70 dark:bg-gray-800/70 h-full">
          {/* 终端窗口顶部按钮 */}
          <div className="absolute top-0 left-0 right-0 h-8 flex items-center px-4 mt-2">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>

            <div className="flex items-center mx-auto px-2">
              <Avatar className="h-7 w-7 mr-3">
                <AvatarImage src={chatPartner.avatar} alt="Chat partner" />
                <AvatarFallback>{chatPartner.name[0]}</AvatarFallback>
              </Avatar>
              <h2 className="font-medium text-gray-800 dark:text-gray-200">{chatPartner.name}</h2>
            </div>
          </div>
        </div>
        {/* 渐变横线 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"></div>
      </div>

      {/* 聊天内容区域 */}
      <div className="relative z-10 flex-grow overflow-y-auto p-4 pt-[52px] text-white">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center h-full text-center p-4">
            <div className="text-red-500 mb-2">{error}</div>
            <div className="text-gray-500 text-sm mb-4">可能是因为您尚未登录或登录已过期</div>
            <a href="/login" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
              前往登录
            </a>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            暂无消息记录，发送第一条消息开始对话吧
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`mt-6 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.sender !== 'user' && (
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src="/images/lon.jpg" alt="User avatar" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            )}
            <div className="flex flex-col">
              <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm'
                  : 'bg-gray-700 text-gray-200 rounded-2xl rounded-tl-sm'
              } p-3 shadow-md`}>
                <p className="text-sm">{message.content}</p>
              </div>
              <span className="text-xs text-gray-700 dark:text-gray-300 mt-1">{message.timestamp}</span>
            </div>
            {message.sender === 'user' && (
              <Avatar className="h-8 w-8 ml-2">
                <AvatarImage src="/images/avt.jpg" alt="User avatar" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            )}
          </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 聊天输入框 */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-700 mt-auto text-white bg-opacity-60 dark:bg-opacity-60">
        <div className="relative">
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
        </div>
        <div className="flex items-center space-x-2 mt-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="在这里输入内容..."
            className="flex-grow bg-blue-50 dark:bg-gray-800 border-gray-600 text-black dark:text-white placeholder-gray-400 focus:ring-0"
          />
          <Button 
            onClick={handleSendMessage}
            variant="ghost" 
            size="icon" 
            className="rounded-lg bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700"
          >
            <Send className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-800 hover:text-blue-600 dark:hover:text-blue-300">
              <FileText className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-800 hover:text-blue-600 dark:hover:text-blue-300">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-800 hover:text-blue-600 dark:hover:text-blue-300">
              <Sticker className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

