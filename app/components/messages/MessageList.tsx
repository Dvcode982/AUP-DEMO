'use client'

import { useState, useEffect } from 'react'
import UserAvatar from '../UserAvatar'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, UserPlus, MessageCircle, Clock, CheckCircle2 } from 'lucide-react'
import { useTheme } from 'next-themes'
import { messagesAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import UserSearchModal from './UserSearchModal'
import { getRelativeTime, getSmartTimeDisplay } from '@/lib/timeUtils'

interface Message {
  id: string
  user: {
    name: string
    avatar: string
    email?: string
    isOnline?: boolean
    lastSeen?: string
  }
  lastMessage: string
  timestamp: string
  unread: boolean
  messageCount?: number
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
  const [searchFilters, setSearchFilters] = useState({
    type: 'all', // 'all', 'unread', 'recent'
    sortBy: 'time', // 'time', 'relevance'
    timeRange: 'all' // 'all', 'today', 'yesterday', 'week', 'month'
  })

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
        // 增强数据，添加在线状态和消息统计
        const enhancedData = data.map((msg: any) => ({
          ...msg,
          user: {
            ...msg.user,
            isOnline: Math.random() > 0.5, // 模拟在线状态
            lastSeen: Math.random() > 0.3 ? '刚刚' : `${Math.floor(Math.random() * 60)}分钟前`
          },
          messageCount: Math.floor(Math.random() * 50) + 1
        }))
        setMessages(enhancedData)
        setError('')
      } catch (err: any) {
        console.error('获取对话列表失败:', err)
        if (err.message && err.message.includes('Authentication token required')) {
          return;
        } else {
          setError('无法加载对话列表')
          toast.error('获取对话列表失败')
        }
      } finally {
        setLoading(false)
      }
    }

    if (mounted) {
      fetchConversations()
    }
  }, [mounted])

  const filteredMessages = messages.filter(message => {
    // 基础文本搜索
    const matchesSearch = !searchTerm || (
      (message.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (message.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (message.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    );

    // 类型过滤
    if (searchFilters.type === 'unread' && !message.unread) {
      return false;
    }

    if (searchFilters.type === 'recent') {
      const messageTime = new Date(message.timestamp);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (messageTime < oneDayAgo) {
        return false;
      }
    }

    // 时间范围过滤
    if (searchFilters.timeRange !== 'all') {
      const messageTime = new Date(message.timestamp);
      const now = new Date();
      
      switch (searchFilters.timeRange) {
        case 'today':
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          if (messageTime < today) return false;
          break;
        
        case 'yesterday':
          const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          if (messageTime < yesterday || messageTime >= yesterdayEnd) return false;
          break;
        
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (messageTime < weekAgo) return false;
          break;
        
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (messageTime < monthAgo) return false;
          break;
      }
    }

    return matchesSearch;
  }).sort((a, b) => {
    if (searchFilters.sortBy === 'relevance' && searchTerm) {
      // 简单的相关性排序：优先显示用户名匹配的结果
      const aNameMatch = a.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const bNameMatch = b.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
    }
    
    // 默认按时间排序
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // 处理用户选择
  const handleUserSelect = async (userId: string) => {
    try {
      await messagesAPI.sendMessage(userId, '你好，很高兴认识你！');
      onSelectChat(userId);
      toast.success('成功创建新对话');
    } catch (err) {
      console.error('创建对话失败:', err);
      toast.error('创建对话失败，请稍后再试');
    }
  }

  // 检测消息是否为base64编码的图片
  const isBase64Image = (content: string): boolean => {
    return content?.startsWith('data:image') || false;
  }

  // 格式化消息内容
  const formatMessageContent = (content: string): string => {
    if (isBase64Image(content)) {
      return '[图片]';
    }
    return content || '';
  }

  // 格式化时间显示
  const formatTime = (timestamp: string): string => {
    if (!timestamp) return '';
    
    try {
      return getRelativeTime(timestamp);
    } catch {
      return timestamp;
    }
  }

  // 防止水合不匹配
  if (!mounted) {
    return null
  }
  
  return (
    <div className="h-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden flex flex-col">
      {/* 顶部搜索区域 */}
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-blue-500" />
            对话列表
          </h2>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setIsUserSearchOpen(true)}
            className="bg-white/80 dark:bg-gray-700/80 hover:bg-white dark:hover:bg-gray-700 transition-colors"
            title="开始新对话"
          >
            <UserPlus className="w-4 h-4 mr-1" />
            新建
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="搜索联系人或消息..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/90 dark:bg-gray-700/90 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* 搜索过滤器 */}
        {(searchTerm || searchFilters.type !== 'all' || searchFilters.timeRange !== 'all') && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <select
                  value={searchFilters.type}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                >
                  <option value="all">全部</option>
                  <option value="unread">未读</option>
                  <option value="recent">最近</option>
                </select>
                
                {searchTerm && (
                  <select
                    value={searchFilters.sortBy}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                    className="text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                  >
                    <option value="time">按时间</option>
                    <option value="relevance">按相关性</option>
                  </select>
                )}
              </div>
              
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSearchFilters({ type: 'all', sortBy: 'time', timeRange: 'all' });
                }}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                清除
              </button>
            </div>
            
            {/* 时间范围过滤器 */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">时间范围:</span>
              <select
                value={searchFilters.timeRange}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                className="text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
              >
                <option value="all">全部时间</option>
                <option value="today">今天</option>
                <option value="yesterday">昨天</option>
                <option value="week">最近一周</option>
                <option value="month">最近一月</option>
              </select>
            </div>
          </div>
        )}
      </div>
      
      {/* 用户搜索模态框 */}
      <UserSearchModal 
        isOpen={isUserSearchOpen} 
        onClose={() => setIsUserSearchOpen(false)} 
        onSelectUser={handleUserSelect} 
      />

      {/* 消息列表区域 */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">加载对话中...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-red-500 dark:text-red-400 mb-2 font-medium">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                size="sm"
                className="text-gray-600 dark:text-gray-300"
              >
                重新加载
              </Button>
            </div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                {searchTerm ? '没有找到匹配的对话' : '暂无对话'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                {searchTerm ? '试试其他搜索关键词' : '点击上方"新建"按钮开始对话'}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setIsUserSearchOpen(true)}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  开始新对话
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className="flex items-center p-3 cursor-pointer rounded-lg transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-sm border border-transparent hover:border-blue-200 dark:hover:border-blue-700 group"
                onClick={() => onSelectChat(message.id)}
              >
                {/* 头像区域 */}
                <div className="relative flex-shrink-0 mr-3">
                  <UserAvatar 
                    src={message.user?.avatar}
                    alt={message.user?.name || '未知用户'}
                    username={message.user?.name || '未知用户'}
                    size={48}
                    showBorder={false}
                  />
                  {/* 在线状态指示器 */}
                  {message.user?.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                  )}
                  {/* 未读消息数量 */}
                  {message.unread && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {message.messageCount && message.messageCount > 99 ? '99+' : message.messageCount}
                    </div>
                  )}
                </div>

                {/* 主要内容区域 */}
                <div className="flex-1 min-w-0">
                  {/* 用户名和时间 */}
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate flex items-center">
                      {message.user?.name || '未知用户'}
                      {message.user?.isOnline && (
                        <span className="ml-2 text-xs text-green-500 flex items-center">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                          在线
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(message.timestamp)}</span>
                    </div>
                  </div>
                  
                  {/* 邮箱信息 */}
                  {message.user?.email && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">
                      {message.user.email}
                    </div>
                  )}
                  
                  {/* 最后一条消息 */}
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate mr-2 ${
                      message.unread 
                        ? 'text-gray-900 dark:text-white font-medium' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {formatMessageContent(message.lastMessage)}
                    </p>
                    
                    {/* 状态指示器 */}
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      {message.unread ? (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      ) : (
                        <CheckCircle2 className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {/* 最后上线时间 */}
                  {!message.user?.isOnline && message.user?.lastSeen && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      最后上线：{message.user.lastSeen}
                    </div>
                  )}
                </div>

                {/* 右侧箭头指示器 */}
                <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部统计信息 */}
      <div className="p-3 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>共 {filteredMessages.length} 个对话</span>
          <span className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
            {filteredMessages.filter(m => m.user?.isOnline).length} 人在线
          </span>
        </div>
      </div>
    </div>
  )
}

 