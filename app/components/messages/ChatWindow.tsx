'use client'

import { useState, useRef, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, FileText, Paperclip, Sticker, X } from 'lucide-react'
import { messagesAPI, topicAggregationAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { EmojiButton } from './EmojiButton'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from '@/app/contexts/AuthContext'

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
  const { user } = useAuth();
  const currentUserId = user?.id;
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [partnerName, setPartnerName] = useState('');
  const [partnerAvatar, setPartnerAvatar] = useState('/images/lon.jpg');
  const [pastedImage, setPastedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMessages() {
      if (!chatId) return;
      
      try {
        setLoading(true);
        console.log('Fetching messages for:', chatId, isComment ? '(comment mode)' : '(chat mode)');
        
        const data = await messagesAPI.getMessages(chatId);
        console.log('Received data:', data);

        if (!data?.messages) {
          throw new Error('No messages data received');
        }

        let formattedMessages;
        if (isComment) {
          // 评论区：只用 userId 判断 sender
          formattedMessages = data.messages.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            type: msg.type || 'text',
            sender: String(msg.userId) === String(currentUserId) ? 'user' : 'other',
            timestamp: msg.timestamp || msg.time || msg.created_at,
            userId: msg.userId,
            // 修正：优先 msg.username，其次 msg.author，其次 msg.email
            username: msg.username || msg.author || msg.email || '匿名',
          }));
        } else {
          // 私信
          formattedMessages = data.messages.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            type: msg.type || 'text',
            sender: msg.sender,
            timestamp: msg.timestamp || msg.created_at,
            userId: msg.userId,
            username: msg.username
          }));
        }

        console.log('Formatted messages:', formattedMessages);
        setMessages(formattedMessages);

        // 设置对话信息
        if (!isComment && data.partnerName) {
          setPartnerName(data.partnerName);
          setPartnerAvatar(data.partnerAvatar || '/images/lon.jpg');
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('加载失败');
      } finally {
        setLoading(false);
      }
    }

    // 首次加载
    fetchMessages();

    // 移除自动刷新 setInterval
  }, [chatId, isComment, currentUserId]);

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
        const tempMessage: Message = {
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

          const sendFunction = isComment ? messagesAPI.sendMessage : messagesAPI.sendMessage;
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
        // 修正：临时消息加上 username 和 userId
        const tempMessage: Message & { username?: string; userId?: string } = {
          id: tempId,
          content: currentMessage,
          type: 'text',
          sender: 'user',
          timestamp: new Date().toLocaleTimeString(),
          username: user?.username || user?.email || '我',
          userId: user?.id ? String(user.id) : undefined,
        };
        setMessages(prev => [...prev, tempMessage]);

        try {
          const sendFunction = isComment ? messagesAPI.sendMessage : messagesAPI.sendMessage;
          const response = await sendFunction(chatId, currentMessage, 'text');

          setMessages(prev => prev.map(msg => 
            msg.id === tempId ? {
              ...msg,
              id: response.id.toString(),
              sender: 'user',
              // 保持 username 和 userId 不变
            } : msg
          ));
          
          // 如果是评论，记录用户的评论行为
          if (isComment && chatId.startsWith('post-')) {
            try {
              const postId = chatId.replace('post-', '');
              await topicAggregationAPI.trackInteraction({
                postId: postId,
                topic: '校园杂谈', // 默认主题，理想情况下应该从帖子数据获取
                actionType: 'comment'
              });
              console.log('Tracked comment interaction for post:', postId);
            } catch (trackError) {
              console.error('Failed to track comment interaction:', trackError);
            }
          }
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

  const userColorMap: Record<string, string> = {};
  const colorPalette = [
    'text-blue-400',
    'text-green-400',
    'text-pink-400',
    'text-purple-400',
    'text-cyan-400',
    'text-yellow-300',
    'text-amber-400',
    'text-rose-400',
    'text-lime-400',
    'text-orange-400',
  ];
  function getUserColor(username: string | undefined, userId: string | undefined) {
    if (!username && !userId) return colorPalette[0];
    const key = String(userId || username);
    if (!userColorMap[key]) {
      // hash分配颜色
      let hash = 0;
      for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);
      const idx = Math.abs(hash) % colorPalette.length;
      userColorMap[key] = colorPalette[idx];
    }
    return userColorMap[key];
  }

  const renderMessageContent = (message: Message & { username?: string; userId?: string }) => {
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
    const visibleContent = (message.content || '').replace(/[\s\u3000\t\r\n]+/g, '');
    if (isComment) {
      const isUser = message.sender === 'user';
      const colorClass = getUserColor(message.username, message.userId);
      return (
        <div className="min-w-[48px] max-w-2xl mb-2">
          <span className={`font-bold text-lg align-middle ${colorClass}`}>
            {message.username || '匿名'}
          </span>
          <span className="font-bold text-lg align-middle text-gray-300">：</span>
          <span className="ml-1 text-base align-middle text-gray-100">{visibleContent.length > 0 ? visibleContent : <span className="opacity-60">(无内容)</span>}</span>
        </div>
      );
    }
    // 私聊消息：user消息蓝底色
    return (
      <div
        className={`
          ${
            !isComment && message.sender === 'user'
              ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm'
              : 'bg-gray-700 text-gray-200 rounded-2xl rounded-tl-sm'
          }
          p-3 shadow-md max-w-xs lg:max-w-md xl:max-w-lg min-w-[48px]
        `}
        style={{
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
          whiteSpace: 'pre-line',
        }}
      >
        <p className="text-sm text-wrap-anywhere min-h-[1.5em]">
          {visibleContent.length > 0 ? visibleContent : <span className="opacity-60">(无内容)</span>}
        </p>
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
                        src={partnerAvatar} 
                        alt={partnerName} 
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/lon.jpg';
                          e.currentTarget.onerror = null;
                        }} 
                      />
                      <AvatarFallback>{partnerName?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <h2 className="font-medium text-gray-800 dark:text-gray-200">{partnerName || '加载中...'}</h2>
                  </>
                ) : (
                  <h2 className="font-medium text-gray-800 dark:text-gray-200">{title || '评论区'}</h2>
                )}
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"></div>
        </div>

        {/* 恢复原本的内容区样式 */}
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
            messages.map((message, idx) => (
              <div key={message.id} className="mb-4">
                {isComment ? (
                  <>
                    {renderMessageContent(message)}
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-400">{message.timestamp}</span>
                      <span className="text-xs text-amber-300">#{idx + 1}楼</span>
                    </div>
                  </>
                ) : (
                  <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} items-start mt-6`}>
                    {message.sender !== 'user' && (
                      <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                        <AvatarImage src="/images/lon.jpg" alt="User avatar" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex flex-col">
                      <div className={message.type === 'image' ? 'max-w-[240px]' : 'max-w-xs lg:max-w-md xl:max-w-lg'}>
                        {renderMessageContent(message)}
                      </div>
                      <span className={`text-xs text-gray-700 dark:text-gray-300 mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
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
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-700 mt-auto text-white bg-opacity-60 dark:bg-opacity-60">
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

