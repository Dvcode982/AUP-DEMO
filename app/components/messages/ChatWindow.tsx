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
    <div className="bg-gray-200 dark:bg-gray-800 text-foreground rounded-xl overflow-hidden flex flex-col h-full border border-border">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <div className="flex items-center mx-auto">
          <Avatar className="h-8 w-8 mr-3">
            <AvatarImage src="/images/lon.jpg" alt="Chat partner" />
            <AvatarFallback>CP</AvatarFallback>
          </Avatar>
          <h2 className="font-medium text-gray-800 dark:text-gray-200">杰西卡·李</h2>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4" style={{ height: 'calc(100vh - 180px)' }}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-6 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* 我方聊天条 */}
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
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-sm'
              } p-3 shadow-md`}>
                <p className="text-sm">{message.content}</p>
              </div>
              <span className="text-xs text-gray-400 mt-1">
                {message.timestamp}
              </span>
            </div>

            {/* 对方聊天条 */}
            {message.sender === 'user' && (
              <Avatar className="h-8 w-8 ml-2">
                <AvatarImage src="/images/avt.jpg" alt="User avatar" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start mb-6">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User avatar" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className={`p-3 ${theme === 'dark' ? 'bg-gray-800' : 'bg-[#2A2D35]'} rounded-2xl rounded-tl-sm`}>
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-75"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="flex items-center space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="在这里输入内容..."
            className="flex-grow bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-0"
          />
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <FileText className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Sticker className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
