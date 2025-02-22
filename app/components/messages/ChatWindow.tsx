'use client'

import { useState, useRef, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Smile, ImageIcon, Mic, Send, FileText, Paperclip, Sticker } from 'lucide-react'
import EmojiPicker from '../create-post/EmojiPicker'
import { useTheme } from 'next-themes'


interface Message {
  id: string
  sender: 'user' | 'other'
  content: string
  timestamp: string
}

interface ChatWindowProps {
  chatId: string
}

const mockMessages: Message[] = [
  { id: '1', sender: 'other', content: '嗨，大卫，附上一些产品', timestamp: '下午 6:53' },
  { id: '2', sender: 'user', content: '没问题，一会就弄', timestamp: '下午 10:57' },
]

export default function ChatWindow({ chatId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg: Message = {
        id: Date.now().toString(),
        sender: 'user',
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
      }
      setMessages([...messages, newMsg])
      setNewMessage('')
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
    <div className="relative flex flex-col h-full border border-border rounded-2xl overflow-hidden bg-white dark:bg-gray-800">
      
      <div className="p-2 border-b border-white dark:border-gray-900 flex items-center z-20">
      {/* 终端窗口顶部按钮 */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-white dark:bg-gray-800 flex items-center px-4 z-20 mt-2 ">
        <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
        <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
        <div className="w-4 h-4 bg-green-500 rounded-full"></div>

        
        <div className="flex items-center mx-auto px-2">
          <Avatar className="h-7 w-7 mr-3">
            <AvatarImage src="/images/lon.jpg" alt="Chat partner" />
            <AvatarFallback>CP</AvatarFallback>
          </Avatar>
          <h2 className="font-medium text-gray-800 dark:text-gray-200">杰西卡·李</h2>
        </div>
      </div>
      </div>
      {/* 渐变横线 */}
      <div className="absolute top-4 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 z-20 mt-6 overflow-hidden"></div>

      {/* 聊天内容 */}
      <div className="relative z-10 flex-grow overflow-y-auto p-4 pt-12 text-white">

        {messages.map((message) => (
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
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 聊天输入框 */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-700 mt-auto text-white">
        <div className="flex items-center space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="在这里输入内容..."
            className="flex-grow bg-blue-50 dark:bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:ring-0"
          />
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

