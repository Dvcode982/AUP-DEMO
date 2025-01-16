'use client'

import { useState, useRef, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Smile, ImageIcon, Mic, Send, FileText, Paperclip, Sticker } from 'lucide-react'
import EmojiPicker from '../create-post/EmojiPicker'

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
    <div className="bg-[#1E2028] rounded-lg overflow-hidden flex flex-col h-full border border-gray-700">
      <div className="p-4 border-b border-gray-700 flex items-center">
        <div className="flex space-x-2 absolute left-4 top-4">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="flex items-center mx-auto">
          <Avatar className="h-8 w-8 mr-3">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Chat partner" />
            <AvatarFallback>CP</AvatarFallback>
          </Avatar>
          <h2 className="font-medium text-gray-200">杰西卡·李</h2>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 240px)' }}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-6 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender !== 'user' && (
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User avatar" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            )}
            <div className="flex flex-col">
              <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                message.sender === 'user'
                  ? 'bg-[#4B5BFB] text-white rounded-2xl rounded-tr-sm'
                  : 'bg-[#2A2D35] text-gray-100 rounded-2xl rounded-tl-sm'
              } p-3 shadow-md`}>
                <p className="text-sm">{message.content}</p>
              </div>
              <span className="text-xs text-gray-500 mt-1">
                {message.timestamp}
              </span>
            </div>
            {message.sender === 'user' && (
              <Avatar className="h-8 w-8 ml-2">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User avatar" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 bg-[#2A2D35]">
        <div className="flex items-center space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="在这里输入内容..."
            className="flex-grow bg-[#1E2028] border-0 text-gray-200 placeholder-gray-500 focus:ring-0"
          />
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-300">
              <FileText className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-300">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-300">
              <Sticker className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

