'use client'

import { useState, useRef, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Smile, ImageIcon, Mic, Send, FileText, Paperclip, Sticker, X } from 'lucide-react'
import EmojiPicker from '../create-post/EmojiPicker'
import { useTheme } from 'next-themes'
import { messagesAPI  } from '@/lib/api'  // 修改为正确的路径
import toast from 'react-hot-toast'
import { EmojiButton } from './EmojiButton'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

interface Message {
  id: string
  sender: 'user' | 'other'
  content: string
  type?: 'text' | 'image'  // 添加消息类型
  timestamp: string
  isRead?: boolean
  imageData?: {
    url: string;
    width?: number;
    height?: number;
  };
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
  const [imageUploading, setImageUploading] = useState(false);
  const [pastedImage, setPastedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // 获取聊天历史
  useEffect(() => {
    async function fetchMessages() {
      if (!chatId) return;
      
      try {
        setLoading(true);
        const data = await messagesAPI.getMessages(chatId);
        console.log('Received messages data:', data);

        if (!data) {
          throw new Error('Failed to fetch messages');
        }

        const formattedMessages = (data.messages || []).map((msg: any) => {
          let timestamp;
          try {
            // 使用服务器返回的时间戳，而不是创建新的 Date 对象
            timestamp = msg.timestamp || msg.created_at;
          } catch (err) {
            console.error('Error formatting timestamp:', err);
            timestamp = '未知时间';
          }

          return {
            id: msg.id.toString(),
            sender: msg.sender,
            content: msg.content,
            type: msg.type || 'text',
            timestamp
          };
        });

        setMessages(formattedMessages);
        
        if (data.partnerName) {
          setChatPartner({
            name: data.partnerName,
            avatar: data.partnerAvatar || '/images/lon.jpg'
          });
        }
      } catch (err) {
        console.error('获取聊天历史失败:', err);
        setError('无法加载聊天历史');
      } finally {
        setLoading(false);
        scrollToBottom();
      }
    }

    fetchMessages();
  }, [chatId]);
  
  // 消息变化时滚动到底部
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    const hasImage = pastedImage && imagePreview;
    const hasText = newMessage.trim().length > 0;
    
    if (!hasImage && !hasText) return;

    try {
      // 保存当前输入内容
      const currentMessage = newMessage;
      const currentImage = pastedImage;
      const currentPreview = imagePreview;

      // 清空输入
      setNewMessage('');
      clearPastedImage();

      // 处理图片消息
      if (hasImage && currentImage) {
        const tempId = `temp-${Date.now()}`;
        
        try {
          // 添加临时预览
          setMessages(prev => [...prev, {
            id: tempId,
            sender: 'user',
            content: currentPreview || '',
            type: 'image',
            timestamp: new Date().toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            })
          }]);

          console.log('Preparing to upload image...');
          const formData = new FormData();
          formData.append('image', currentImage);

          // 使用 uploadImage 作为 messagesAPI 的方法
          const uploadResult = await messagesAPI.uploadImage(chatId, formData);

          // 发送图片消息
          const sendResponse = await messagesAPI.sendMessage(chatId, uploadResult.url, 'image');
          console.log('Image message sent:', sendResponse);

          // 更新消息列表
          setMessages(prev => prev.map(msg => 
            msg.id === tempId ? {
              ...sendResponse,
              type: 'image',
              content: uploadResult.url
            } : msg
          ));

        } catch (err) {
          console.error('Failed to send image:', err);
          toast.error('图片发送失败');
          setMessages(prev => prev.filter(msg => msg.id !== tempId));
        }
      }

      // 处理文本消息
      if (hasText) {
        const tempTextId = `temp-${Date.now()}-text`;
        try {
          // 添加临时消息
          setMessages(prev => [...prev, {
            id: tempTextId,
            sender: 'user',
            content: currentMessage,
            type: 'text',
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })
          }]);

          // 发送消息
          const textMessage = await messagesAPI.sendMessage(chatId, currentMessage, 'text');
          
          // 更新消息状态
          setMessages(prev => prev.map(msg => 
            msg.id === tempTextId ? {
              ...textMessage,
              type: 'text'
            } : msg
          ));
        } catch (err) {
          console.error('文本发送失败:', err);
          toast.error('发送失败');
          // 移除临时消息
          setMessages(prev => prev.filter(msg => msg.id !== tempTextId));
        }
      }
    } catch (err) {
      console.error('发送失败:', err);
      toast.error('发送失败');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  // 处理粘贴事件
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    const item = items?.[0];

    if (item?.type.indexOf('image') === 0) {
      e.preventDefault();
      const file = item.getAsFile();
      if (file) {
        setPastedImage(file);
        const preview = URL.createObjectURL(file);
        setImagePreview(preview);
      }
    }
  };

  // 清除已粘贴的图片
  const clearPastedImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setPastedImage(null);
    setImagePreview(null);
  };

  // 修改消息显示部分
  const renderMessageContent = (message: Message) => {
    if (message.type === 'image') {
      return (
        <div className="relative cursor-pointer" onClick={() => setSelectedImage(message.content)}>
          <img 
            src={message.content}
            alt="图片消息"
            className="rounded-lg max-w-[240px] hover:opacity-90 transition-opacity"
            style={{ maxHeight: '300px', objectFit: 'contain' }}
            onError={(e) => {
              console.warn('Image load warning:', message.content.substring(0, 100) + '...');
              (e.currentTarget as HTMLImageElement).src = message.content;
              e.currentTarget.onerror = null;
            }}
            loading="lazy"
          />
        </div>
      );
    }
    return (
      <div className={`${
        message.sender === 'user'
          ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm'
          : 'bg-gray-700 text-gray-200 rounded-2xl rounded-tl-sm'
      } p-3 shadow-md`}>
        <p className="text-sm break-words">{message.content}</p>
      </div>
    );
  };

  return (
    <>
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
                  <AvatarImage 
                    src={chatPartner.avatar || undefined} 
                    alt={chatPartner.name} 
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/lon.jpg';
                      e.currentTarget.onerror = null;
                    }} 
                  />
                  <AvatarFallback>{chatPartner.name?.[0] || "?"}</AvatarFallback>
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
                    <AvatarImage src={chatPartner.avatar || "/images/lon.jpg"} alt={`${chatPartner.name} avatar`} />
                    <AvatarFallback>{chatPartner.name?.[0] || "U"}</AvatarFallback>
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
                </div>
                {message.sender === 'user' && (
                  <Avatar className="h-8 w-8 ml-2">
                    <AvatarImage 
                      src="/images/avt.jpg" 
                      alt="User avatar" 
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/lon.jpg';
                        e.currentTarget.onerror = null;
                      }} 
                    />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
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
              <div key={message.id} className={`mt-6 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} items-start`}>
                {message.sender !== 'user' && (
                  <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                    <AvatarImage 
                      src={chatPartner.avatar || '/images/lon.jpg'}
                      alt={`${chatPartner.name} avatar`}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/lon.jpg';
                        e.currentTarget.onerror = null;
                      }}
                    />
                    <AvatarFallback>{chatPartner.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                )}
                
                <div className="flex flex-col">
                  <div className={message.type === 'image' ? 'max-w-[240px]' : 'max-w-xs lg:max-w-md xl:max-w-lg'}>
                    {renderMessageContent(message)}
                  </div>
                  <span className={`text-xs text-gray-700 dark:text-gray-300 mt-1 ${
                    message.sender === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {message.timestamp}
                  </span>
                </div>
                
                {message.sender === 'user' && (
                  <Avatar className="h-8 w-8 ml-2 flex-shrink-0">
                    <AvatarImage 
                      src="/images/avt.jpg"
                      alt="User avatar"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/lon.jpg';
                        e.currentTarget.onerror = null;
                      }}
                    />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 聊天输入框 */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-700 mt-auto text白 bg-opacity-60 dark:bg-opacity-60">
          {imagePreview && (
            <div className="mb-2 relative inline-block">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-h-[100px] rounded-lg"
              />
              <button
                onClick={clearPastedImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Input 
              type="text" 
              placeholder="输入消息..." 
              value={newMessage} 
              onChange={(e) => setNewMessage(e.target.value)} 
              onKeyPress={handleKeyPress}
              onPaste={handlePaste}
              className="flex-grow rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-400 dark:border-gray-600 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
            />
            <Button 
              onClick={handleSendMessage} 
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
              <EmojiButton onSelect={handleEmojiSelect} />
            </div>
          </div>
        </div>
      </div>

      {/* 图片预览对话框 */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-transparent border-0">
          <DialogTitle className="sr-only">查看图片</DialogTitle>
          <div className="relative w-full h-full flex items-center justify-center">
            {selectedImage && (  // 只在有图片时渲染 img 标签
              <img
                src={selectedImage}
                alt="预览图片"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <button
              className="absolute top-2 right-2 p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-full text-white"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

