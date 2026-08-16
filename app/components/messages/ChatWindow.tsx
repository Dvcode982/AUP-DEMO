'use client'

import { useState, useRef, useEffect } from 'react'
import UserAvatar from '../UserAvatar'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Smile, 
  ImageIcon, 
  Mic, 
  Send, 
  FileText, 
  Paperclip, 
  Sticker, 
  X, 
  Phone,
  Video,
  MoreVertical,
  Download,
  Reply,
  Forward,
  Heart,
  Zap,
  Users,
  Star
} from 'lucide-react'
import EmojiPicker from '../create-post/EmojiPicker'
import { useTheme } from 'next-themes'
import { messagesAPI  } from '@/lib/api'
import toast from 'react-hot-toast'
import { EmojiButton } from './EmojiButton'
import UserSearchModal from './UserSearchModal'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import {
  getRelativeTime,
  formatTime as formatTimeUtil,
  getSmartTimeDisplay,
  getMessageGroupLabel,
  shouldGroupMessages,
  isToday
} from '@/lib/timeUtils'

interface Message {
  id: string
  sender: 'user' | 'other'
  content: string
  type?: 'text' | 'image'
  timestamp: string
  isRead?: boolean
  reactions?: string[]
  imageData?: {
    url: string;
    width?: number;
    height?: number;
  };
}

interface ChatWindowProps {
  chatId: string
}

const initialMessages: Message[] = []

export default function ChatWindow({ chatId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [mounted, setMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [chatPartner, setChatPartner] = useState({ 
    name: '加载中...', 
    avatar: '/images/lon.jpg',
    isOnline: false,
    lastSeen: ''
  })
  const [imageUploading, setImageUploading] = useState(false);
  const [pastedImage, setPastedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    messageId: string;
    messageContent: string;
    messageType: string;
  } | null>(null);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [forwardTarget, setForwardTarget] = useState<{ content: string; type: string } | null>(null);

  useEffect(() => {
    setMounted(true)
  }, [])

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
            timestamp,
            reactions: []
          };
        });

        setMessages(formattedMessages);
        
        // 增强聊天伙伴信息
        if (data.partnerName) {
          setChatPartner({
            name: data.partnerName,
            avatar: data.partnerAvatar || '/images/lon.jpg',
            isOnline: Math.random() > 0.5,
            lastSeen: Math.random() > 0.3 ? '刚刚' : `${Math.floor(Math.random() * 60)}分钟前`
          });
        }

        // 自动标记对话为已读
        try {
          await messagesAPI.markConversationAsRead(chatId);
          console.log('Conversation marked as read');
        } catch (err) {
          console.error('Failed to mark conversation as read:', err);
        }
      } catch (err) {
        console.error('获取聊天历史失败:', err);
        setError('无法加载聊天历史');
      } finally {
        setLoading(false);
        scrollToBottom();
      }
    }

    if (mounted) {
      fetchMessages();
    }
  }, [chatId, mounted]);
  
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
      const currentMessage = newMessage;
      const currentImage = pastedImage;
      const currentPreview = imagePreview;

      setNewMessage('');
      clearPastedImage();

      // 处理图片消息
      if (hasImage && currentImage) {
        const tempId = `temp-${Date.now()}`;
        
        try {
          setImageUploading(true);
          setUploadProgress(0);
          setCompressionInfo('正在压缩图片...');

          setMessages(prev => [...prev, {
            id: tempId,
            sender: 'user',
            content: currentPreview || '',
            type: 'image',
            timestamp: new Date().toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            }),
            reactions: []
          }]);

          console.log('Preparing to upload image...');
          const formData = new FormData();
          formData.append('image', currentImage);

          const uploadResult = await messagesAPI.uploadImage(chatId, formData, (progress) => {
            setUploadProgress(progress);
            if (progress === 100) {
              setCompressionInfo(null);
            }
          });

          if (uploadResult.compressed) {
            toast.success('图片已压缩并发送');
          } else {
            toast.success('图片发送成功');
          }

          const sendResponse = await messagesAPI.sendMessage(chatId, uploadResult.url, 'image');
          console.log('Image message sent:', sendResponse);

          setMessages(prev => prev.map(msg => 
            msg.id === tempId ? {
              ...sendResponse,
              type: 'image',
              content: uploadResult.url,
              reactions: []
            } : msg
          ));

        } catch (err: any) {
          console.error('Failed to send image:', err);
          if (err.message.includes('图片太大')) {
            toast.error('图片太大，请选择小于10MB的文件');
          } else {
            toast.error('图片发送失败');
          }
          setMessages(prev => prev.filter(msg => msg.id !== tempId));
        } finally {
          setImageUploading(false);
          setUploadProgress(0);
          setCompressionInfo(null);
        }
      }

      // 处理文本消息
      if (hasText) {
        const tempTextId = `temp-${Date.now()}-text`;
        try {
          setMessages(prev => [...prev, {
            id: tempTextId,
            sender: 'user',
            content: currentMessage,
            type: 'text',
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }),
            reactions: []
          }]);

          const textMessage = await messagesAPI.sendMessage(chatId, currentMessage, 'text');
          
          setMessages(prev => prev.map(msg => 
            msg.id === tempTextId ? {
              ...textMessage,
              type: 'text',
              reactions: []
            } : msg
          ));
        } catch (err) {
          console.error('文本发送失败:', err);
          toast.error('发送失败');
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

  // 消息反应
  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const hasReaction = reactions.includes(emoji);
        return {
          ...msg,
          reactions: hasReaction 
            ? reactions.filter(r => r !== emoji)
            : [...reactions, emoji]
        };
      }
      return msg;
    }));
  };

  // 格式化时间显示
  const formatMessageTime = (timestamp: string): string => {
    if (!timestamp) return '';
    
    try {
      return getSmartTimeDisplay(timestamp);
    } catch {
      return timestamp;
    }
  }

  // 获取消息时间戳（兼容不同的时间格式）
  const getMessageTimestamp = (message: any): number => {
    if (message.timestamp && typeof message.timestamp === 'number') {
      return message.timestamp;
    }
    if (message.created_at) {
      return new Date(message.created_at).getTime();
    }
    return Date.now();
  }

  // 渲染消息内容
  const renderMessageContent = (message: Message) => {
    if (message.type === 'image') {
      return (
        <div className="relative group">
          <div 
            className="relative cursor-pointer rounded-xl overflow-hidden max-w-[280px] hover:scale-105 transition-transform duration-200" 
            onClick={() => setSelectedImage(message.content)}
          >
            <img 
              src={message.content}
              alt="图片消息"
              className="w-full h-auto"
              style={{ maxHeight: '320px', objectFit: 'cover' }}
              onError={(e) => {
                console.warn('Image load warning:', message.content.substring(0, 100) + '...');
                (e.currentTarget as HTMLImageElement).src = message.content;
                e.currentTarget.onerror = null;
              }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="bg-white/90 text-gray-700 hover:bg-white"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="group relative">
        <div className={`inline-block px-4 py-3 rounded-2xl max-w-xs lg:max-w-md xl:max-w-lg relative ${
          message.sender === 'user'
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md shadow-lg'
            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md shadow-lg border border-gray-200 dark:border-gray-600'
        }`}>
          <p className="text-sm break-words leading-relaxed">{message.content}</p>
        </div>
        
        {/* 快速反应按钮 */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-600 px-2 py-1">
            {['❤️', '👍', '😂', '😮', '😢', '😡'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(message.id, emoji)}
                className="w-6 h-6 flex items-center justify-center hover:scale-125 transition-transform duration-150"
                title={`添加反应 ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
        
        {/* 显示反应 */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex items-center space-x-1 mt-2">
            {Array.from(new Set(message.reactions)).map((emoji) => {
              const count = message.reactions!.filter(r => r === emoji).length;
              return (
                <button
                  key={emoji}
                  onClick={() => handleReaction(message.id, emoji)}
                  className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1 text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <span>{emoji}</span>
                  <span className="text-gray-600 dark:text-gray-400">{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // 消息长按处理
  const handleMessageLongPress = (e: React.MouseEvent, message: Message) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      messageId: message.id,
      messageContent: message.content,
      messageType: message.type || 'text'
    });
  };

  // 右键菜单处理
  const handleMessageRightClick = (e: React.MouseEvent, message: Message) => {
    e.preventDefault();
    handleMessageLongPress(e, message);
  };

  // 关闭上下文菜单
  const closeContextMenu = () => {
    setContextMenu(null);
  };

  // 复制消息
  const copyMessage = async (content: string, type: string) => {
    try {
      if (type === 'image') {
        toast('图片消息无法复制文本');
        return;
      }
      await navigator.clipboard.writeText(content);
      toast.success('消息已复制到剪贴板');
    } catch (err) {
      toast.error('复制失败');
    }
    closeContextMenu();
  };

  // 删除消息
  const deleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    toast.success('消息已删除');
    closeContextMenu();
  };

  // 转发消息
  const forwardMessage = (content: string, type: string) => {
    // 打开用户搜索模态框，选择转发目标后发送
    setForwardTarget({ content, type: type || 'text' });
    setIsForwardModalOpen(true);
    closeContextMenu();
  };

  // 确认转发给目标用户
  const handleForwardToUser = async (userId: string) => {
    if (!forwardTarget) return;
    try {
      await messagesAPI.sendMessage(userId, forwardTarget.content, forwardTarget.type as 'text' | 'image');
      toast.success('消息已转发');
    } catch (error) {
      console.error('Failed to forward message:', error);
      toast.error('转发失败');
    } finally {
      setForwardTarget(null);
    }
  };

  // 全局点击关闭菜单
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu) {
        closeContextMenu();
      }
    };

    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  if (!mounted) {
    return null
  }

  return (
    <>
      <div className="h-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden flex flex-col">
        {/* 聊天头部 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200/50 dark:border-gray-700/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1"></div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <UserAvatar 
                  src={chatPartner.avatar}
                  alt={chatPartner.name}
                  username={chatPartner.name}
                  size={48}
                  showBorder={false}
                />
                {chatPartner.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                )}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  {chatPartner.name}
                  {chatPartner.isOnline && (
                    <span className="ml-2 text-xs text-green-500 flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                      在线
                    </span>
                  )}
                </h2>
                {!chatPartner.isOnline && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    最后上线：{chatPartner.lastSeen}
                  </p>
                )}
                {isTyping && (
                  <p className="text-sm text-blue-500 animate-pulse">正在输入...</p>
                )}
              </div>
            </div>
            <div className="flex-1 flex justify-end">
              <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 聊天内容区域 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">加载消息中...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col justify-center items-center h-full text-center p-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">{error}</h3>
              <p className="text-gray-500 text-sm mb-4">可能是因为您尚未登录或登录已过期</p>
              <Button 
                onClick={() => window.location.href = '/login'}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                前往登录
              </Button>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">开始对话</h3>
                <p className="text-gray-500 dark:text-gray-400">发送第一条消息开始与 {chatPartner.name} 的对话吧</p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => {
              const showAvatar = index === 0 || messages[index - 1].sender !== message.sender;
              const currentTimestamp = getMessageTimestamp(message);
              const previousTimestamp = index > 0 ? getMessageTimestamp(messages[index - 1]) : null;
              const shouldShowTimeGroup = shouldGroupMessages(currentTimestamp, previousTimestamp);
              
              return (
                <div key={message.id}>
                  {/* 时间分组标签 */}
                  {shouldShowTimeGroup && (
                    <div className="flex justify-center my-4">
                      <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-600 dark:text-gray-300">
                        {getMessageGroupLabel(currentTimestamp)}
                      </div>
                    </div>
                  )}
                  
                  {/* 消息内容 */}
                  <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} items-end space-x-2 mb-2`}>
                    {message.sender !== 'user' && showAvatar && (
                      <UserAvatar 
                        src={chatPartner.avatar}
                        alt={chatPartner.name}
                        username={chatPartner.name}
                        size={32}
                        showBorder={false}
                        className="mb-1"
                      />
                    )}
                    {message.sender !== 'user' && !showAvatar && (
                      <div className="w-8"></div>
                    )}
                    
                    <div 
                      className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'} max-w-[70%] group`}
                      onContextMenu={(e) => handleMessageRightClick(e, message)}
                      onTouchStart={(e) => {
                        const touchTimeout = setTimeout(() => {
                          handleMessageLongPress(e as any, message);
                        }, 500);
                        const handleTouchEnd = () => {
                          clearTimeout(touchTimeout);
                          document.removeEventListener('touchend', handleTouchEnd);
                        };
                        document.addEventListener('touchend', handleTouchEnd);
                      }}
                    >
                      {renderMessageContent(message)}
                      
                      {/* 详细时间显示（鼠标悬停时显示） */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {getSmartTimeDisplay(currentTimestamp)}
                      </div>
                    </div>
                    
                    {message.sender === 'user' && showAvatar && (
                      <UserAvatar 
                        src="/images/avt.jpg"
                        alt="You"
                        username="You"
                        size={32}
                        showBorder={false}
                        className="mb-1"
                      />
                    )}
                    {message.sender === 'user' && !showAvatar && (
                      <div className="w-8"></div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 p-4">
          {/* 上传进度显示 */}
          {imageUploading && (
            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  {compressionInfo || '上传中...'}
                </span>
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* 图片预览 */}
          {imagePreview && (
            <div className="mb-3 relative inline-block">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-h-[120px] rounded-lg border border-gray-200 dark:border-gray-600"
              />
              <button
                onClick={clearPastedImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                disabled={imageUploading}
              >
                <X className="w-3 h-3" />
              </button>
              {imageUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <div className="text-white text-sm">上传中...</div>
                </div>
              )}
            </div>
          )}
          
          {/* 输入框和工具栏 */}
          <div className="flex items-end space-x-3">
            {/* 附件工具栏 */}
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                <FileText className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30">
                <ImageIcon className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30">
                <Paperclip className="w-4 h-4" />
              </Button>
            </div>

            {/* 输入框 */}
            <div className="flex-1 relative">
              <Input 
                type="text" 
                placeholder="输入消息... (Ctrl+V 粘贴图片)" 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
                onKeyPress={handleKeyPress}
                onPaste={handlePaste}
                className="w-full pr-12 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <EmojiButton onSelect={handleEmojiSelect} />
              </div>
            </div>

            {/* 发送按钮 */}
            <Button 
              onClick={handleSendMessage} 
              disabled={!newMessage.trim() && !imagePreview}
              className={`rounded-full w-10 h-10 p-0 transition-all duration-200 ${
                newMessage.trim() || imagePreview
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              }`}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 上下文菜单 */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 min-w-[160px]"
          style={{
            left: `${Math.min(contextMenu.x, window.innerWidth - 180)}px`,
            top: `${Math.min(contextMenu.y, window.innerHeight - 200)}px`,
          }}
        >
          <button
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            onClick={() => copyMessage(contextMenu.messageContent, contextMenu.messageType)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            复制
          </button>
          
          <button
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            onClick={() => forwardMessage(contextMenu.messageContent, contextMenu.messageType)}
          >
            <Forward className="w-4 h-4 mr-2" />
            转发
          </button>
          
          <button
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            onClick={() => handleReaction(contextMenu.messageId, '❤️')}
          >
            <Heart className="w-4 h-4 mr-2" />
            添加反应
          </button>
          
          <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
          
          <button
            className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
            onClick={() => deleteMessage(contextMenu.messageId)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            删除
          </button>
        </div>
      )}

      {/* 图片预览对话框 */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-transparent border-0">
          <DialogTitle className="sr-only">查看图片</DialogTitle>
          <div className="relative w-full h-full flex items-center justify-center">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="预览图片"
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <button
              className="absolute top-4 right-4 p-2 bg-gray-900/70 hover:bg-gray-800/70 rounded-full text-white transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 转发用户搜索模态框 */}
      <UserSearchModal
        isOpen={isForwardModalOpen}
        onClose={() => {
          setIsForwardModalOpen(false);
          setForwardTarget(null);
        }}
        onSelectUser={handleForwardToUser}
      />
    </>
  );
}

