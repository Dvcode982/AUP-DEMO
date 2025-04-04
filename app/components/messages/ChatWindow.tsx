'use client'

import { useState, useRef, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Smile, ImageIcon, Mic, Send, FileText, Paperclip, Sticker, X } from 'lucide-react'
import EmojiPicker from '../create-post/EmojiPicker'
import { useTheme } from 'next-themes'
import { messagesAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { EmojiButton } from './EmojiButton'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

interface Message {
  id: string
  sender: 'user' | 'other'
  content: string
  type?: 'text' | 'image'
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
  title?: string
  showUserInfo?: boolean
  isComment?: boolean
}

export default function ChatWindow({ chatId, title, showUserInfo = true, isComment = false }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [chatPartner, setChatPartner] = useState({ name: '加载中...', avatar: '/images/lon.jpg' })
  const [imageUploading, setImageUploading] = useState(false)
  const [pastedImage, setPastedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMessages() {
      if (!chatId) return;
      
      try {
        setLoading(true);
        const data = await messagesAPI.getMessages(chatId);
        console.log('Fetched messages data:', data);

        if (!data) {
          throw new Error('Invalid message data');
        }

        // 统一处理消息格式
        const formattedMessages = data.messages.map((msg: any) => ({
          id: msg.id.toString(),
          content: msg.content,
          type: msg.type || 'text',
          sender: msg.sender,  // 直接使用API返回的sender值
          timestamp: msg.timestamp || msg.created_at || new Date().toLocaleString()
        }));

        setMessages(formattedMessages);
        
        // 处理私聊对象信息
        if (!isComment && data.partnerInfo) {
          setChatPartner({
            name: data.partnerInfo.name || '未知用户',
            avatar: data.partnerInfo.avatar || '/images/lon.jpg'
          });
        }
      } catch (err) {
        console.error('获取消息失败:', err);
        setError('加载失败');
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, [chatId, isComment]);

  const handleSendMessage = async () => {
    const hasImage = pastedImage && imagePreview;
    const hasText = newMessage.trim().length > 0;
    
    if (!hasImage && !hasText) return;

    try {
      const currentMessage = newMessage;
      const currentImage = pastedImage;
      const currentPreview = imagePreview;

      setNewMessage('');
      clearPastedImage();

      if (hasImage && currentImage) {
        const tempId = `temp-${Date.now()}`;
        const tempMessage = {
          id: tempId,
          sender: 'user',
          content: currentPreview || '',
          type: 'image',
          timestamp: new Date().toLocaleString()
        };

        setMessages(prev => [...prev, tempMessage]);

        try {
          const formData = new FormData();
          formData.append('image', currentImage);
          const uploadResult = await messagesAPI.uploadImage(chatId, formData);

          const sendFunction = isComment ? messagesAPI.sendComment : messagesAPI.sendMessage;
          const response = await sendFunction(chatId, uploadResult.url, 'image');

          setMessages(prev => prev.map(msg => 
            msg.id === tempId ? {
              ...msg,
              id: response.id.toString(),
              content: uploadResult.url
            } : msg
          ));
        } catch (err) {
          console.error('图片发送失败:', err);
          toast.error('图片发送失败');
          setMessages(prev => prev.filter(msg => msg.id !== tempId));
        }
      }

      if (hasText) {
        const tempId = `temp-${Date.now()}-text`;
        const tempMessage = {
          id: tempId,
          content: currentMessage,
          type: 'text',
          sender: 'user',
          timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, tempMessage]);

        try {
          const sendFunction = isComment ? messagesAPI.sendComment : messagesAPI.sendMessage;
          const response = await sendFunction(chatId, currentMessage, 'text');

          setMessages(prev => prev.map(msg => 
            msg.id === tempId ? {
              ...msg,
              id: response.id.toString(),
              sender: 'user'
            } : msg
          ));
        } catch (err) {
          console.error('文本发送失败:', err);
          toast.error('发送失败');
          setMessages(prev => prev.filter(msg => msg.id !== tempId));
        }
      }
    } catch (err) {
      console.error('发送失败:', err);
      toast.error('发送失败');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

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

  const clearPastedImage = () => {
    setPastedImage(null);
    setImagePreview(null);
  };

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
        <div className="fixed-header backdrop-blur-md absolute top-0 left-0 right-0 h-[48px] z-30">
          <div className="p-2 flex items-center bg-white/70 dark:bg-gray-800/70 h-full">
            <div className="absolute top-0 left-0 right-0 h-8 flex items-center px-4 mt-2">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
              <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>

              <div className="flex items-center mx-auto px-2">
                {showUserInfo && !isComment ? (
                  <>
                    <Avatar className="h-7 w-7 mr-3">
                      <AvatarImage 
                        src={chatPartner?.avatar || "/images/lon.jpg"} 
                        alt={chatPartner?.name || "未知用户"} 
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/lon.jpg';
                          e.currentTarget.onerror = null;
                        }} 
                      />
                      <AvatarFallback>{chatPartner?.name?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <h2 className="font-medium text-gray-800 dark:text-gray-200">{chatPartner?.name || '加载中...'}</h2>
                  </>
                ) : (
                  <h2 className="font-medium text-gray-800 dark:text-gray-200">{title || '评论区'}</h2>
                )}
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"></div>
        </div>

        <div className="relative z-10 flex-grow overflow-y-auto p-4 pt-[52px] text白">
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
                      src="/images/lon.jpg"
                      alt="User avatar"
                    />
                    <AvatarFallback>U</AvatarFallback>
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
                    />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

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

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-transparent border-0">
          <DialogTitle className="sr-only">查看图片</DialogTitle>
          <div className="relative w-full h-full flex items-center justify-center">
            {selectedImage && (
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

