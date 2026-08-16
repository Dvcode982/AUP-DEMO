'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { lostAndFoundAPI } from '@/lib/api'
import { useTranslation } from '../../hooks/useTranslation'
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Phone, 
  Gift, 
  Package, 
  User,
  MessageCircle,
  Share2,
  Check,
  Clock,
  Tag,
  AlertCircle,
  Send,
  Eye,
  Heart,
  X,
  Undo2
} from 'lucide-react'
import Sidebar from '../../components/Sidebar'

interface LostFoundItem {
  id: number
  author: string
  avatar: string
  content: string
  itemName?: string
  category?: string
  location?: string
  contactInfo?: string
  reward?: string
  image?: string
  images?: string[]
  time: string
  tags: string[]
  isReturned: boolean
  returnedTime?: string
  itemType?: 'lost' | 'found'
  comments?: number
  shares?: number
  views?: number
  likes?: number
}

interface Comment {
  id: number
  author: string
  avatar?: string
  content: string
  time: string
  isSystemComment?: boolean
}

export default function LostAndFoundItemPage() {
  const params = useParams()
  const id = params?.id as string | string[] | undefined
  const router = useRouter()
  const { t } = useTranslation()
  
  const [item, setItem] = useState<LostFoundItem | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [commentLoading, setCommentLoading] = useState(false)
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // 获取数据
  useEffect(() => {
    async function fetchData() {
      if (id) {
        try {
          setLoading(true)
          // 获取失物招领详情
          const itemData = await lostAndFoundAPI.getLostAndFoundItemById(id.toString())
          
          // 为数据添加必要的字段，统一头像显示逻辑
          const enhancedItem = {
            ...itemData,
            avatar: itemData.avatar || '/placeholder.svg?height=40&width=40',
            comments: itemData.comments || 0,
            shares: itemData.shares || 0,
            views: itemData.views || 1,
            likes: itemData.likes || 0
          }
          
          setItem(enhancedItem)
          
          // 获取评论列表
          const commentsData = await lostAndFoundAPI.getLostAndFoundComments(id.toString())
          const enhancedComments = commentsData.map((comment: any) => ({
            ...comment,
            avatar: comment.avatar || '/placeholder.svg?height=32&width=32'
          }))
          setComments(enhancedComments)
        } catch (error) {
          console.error('Error fetching lost and found item data:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    
    fetchData()
  }, [id])

  // 提交评论
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !id) return
    
    try {
      setCommentLoading(true)
      // 调用API添加评论
      await lostAndFoundAPI.addLostAndFoundComment(Array.isArray(id) ? id[0] : id, newComment)
      
      // 重新获取评论列表
      const commentsData = await lostAndFoundAPI.getLostAndFoundComments(Array.isArray(id) ? id[0] : id)
      setComments(commentsData)
      setNewComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setCommentLoading(false)
    }
  }

  // 标记为已找到/已归还
  const handleMarkAsReturned = async () => {
    if (!item || item.isReturned || !id) return
    
    try {
      setStatusUpdateLoading(true)
      const itemId = Array.isArray(id) ? id[0] : id
      
      // 调用API标记为已归还
      await lostAndFoundAPI.markAsReturned(itemId)
      
      // 重新获取物品详情
      const itemData = await lostAndFoundAPI.getLostAndFoundItemById(itemId)
      setItem(prev => prev ? { ...prev, ...itemData, isReturned: true } : null)
      
      // 添加系统评论
      await lostAndFoundAPI.addLostAndFoundComment(itemId, '物品已标记为找到/归还')
      
      // 重新获取评论列表
      const commentsData = await lostAndFoundAPI.getLostAndFoundComments(itemId)
      setComments(commentsData)
    } catch (error) {
      console.error('Error marking item as returned:', error)
    } finally {
      setStatusUpdateLoading(false)
    }
  }

  // 取消已解决状态
  const handleCancelReturned = async () => {
    if (!item || !item.isReturned || !id) return
    
    if (!confirm('确定要取消已解决状态吗？这将使物品重新显示为待解决状态。')) {
      return
    }
    
    try {
      setStatusUpdateLoading(true)
      const itemId = Array.isArray(id) ? id[0] : id
      
      // 调用API取消已归还状态
      await lostAndFoundAPI.cancelReturned(itemId)
      
      // 重新获取物品详情
      const itemData = await lostAndFoundAPI.getLostAndFoundItemById(itemId)
      setItem(prev => prev ? { ...prev, ...itemData, isReturned: false, returnedTime: undefined } : null)
      
      // 添加系统评论
      await lostAndFoundAPI.addLostAndFoundComment(itemId, '已解决状态已取消，物品重新标记为待解决')
      
      // 重新获取评论列表
      const commentsData = await lostAndFoundAPI.getLostAndFoundComments(itemId)
      setComments(commentsData)
    } catch (error) {
      console.error('Error cancelling returned status:', error)
    } finally {
      setStatusUpdateLoading(false)
    }
  }

  // 分享功能
  const handleShare = async () => {
    if (!id) return
    const itemId = Array.isArray(id) ? id[0] : id
    const shareUrl = `${window.location.origin}/lost-and-found/${itemId}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${item?.itemType === 'lost' ? '寻物启事' : '招领启事'}: ${item?.itemName || item?.content?.substring(0, 30)}`,
          text: item?.content,
          url: shareUrl
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      alert('链接已复制到剪贴板')
    }
  }

  // 点赞功能
  const handleLike = () => {
    setIsLiked(!isLiked)
    if (item) {
      setItem(prev => prev ? {
        ...prev,
        likes: isLiked ? (prev.likes || 0) - 1 : (prev.likes || 0) + 1
      } : null)
    }
  }

  // 获取物品分类显示文本
  const getCategoryText = (category: string) => {
    if (!category) return ''
    return t(`lostFound.categories.${category}`) || category
  }

  // 获取主题颜色
  const getThemeColors = () => {
    if (item?.itemType === 'lost') {
      return {
        primary: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
        icon: '🔍'
      }
    } else {
      return {
        primary: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
        icon: '📦'
      }
    }
  }

  // 格式化时间显示
  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr;
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">{t('loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              物品不存在
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              该失物信息可能已被删除或不存在
            </p>
            <Link 
              href="/lost-and-found"
              className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回失物列表
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const themeColors = getThemeColors()
  const displayImages = item.images?.length ? item.images : (item.image ? [item.image] : [])

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {/* 顶部导航 */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {item.itemName || item.content?.substring(0, 30)}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${themeColors.badge}`}>
                    {themeColors.icon} {item.itemType === 'lost' ? t('lostFound.lostItem') : t('lostFound.foundItem')}
                  </span>
                  {item.category && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      <Package className="w-3 h-3 mr-1" />
                      {getCategoryText(item.category)}
                    </span>
                  )}
                </div>
              </div>
              
              {/* 操作按钮 */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isLiked
                      ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{item.likes || 0}</span>
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-1 px-3 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{item.shares || 0}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容 */}
        <div className="max-w-4xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：主要信息 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 物品信息卡片 */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                {/* 发布者信息 */}
                <div className="flex items-center space-x-3 mb-4">
                  <Image
                    src={item.avatar}
                    alt={item.author}
                    width={48}
                    height={48}
                    className="rounded-full border-2 border-gray-200 dark:border-gray-600"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.author}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(item.time)}</span>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{item.views} 次查看</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 状态指示器和操作按钮 */}
                  <div className="flex items-center space-x-2">
                    {item.isReturned ? (
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center px-3 py-2 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                          <Check className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium">已解决</span>
                        </div>
                        <button
                          onClick={handleCancelReturned}
                          disabled={statusUpdateLoading}
                          className="flex items-center px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium transition-colors disabled:bg-gray-400"
                          title="取消已解决状态"
                        >
                          <Undo2 className="w-4 h-4 mr-1" />
                          {statusUpdateLoading ? '处理中...' : '取消'}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleMarkAsReturned}
                        disabled={statusUpdateLoading}
                        className="flex items-center px-3 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors disabled:bg-gray-400"
                      >
                        {statusUpdateLoading ? '更新中...' : '标记为已解决'}
                      </button>
                    )}
                  </div>
                </div>

                {/* 物品描述 */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    详细描述
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {item.content}
                  </p>
                </div>

                {/* 图片展示 */}
                {displayImages.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      物品图片
                    </h4>
                    <div className="space-y-4">
                      {/* 主图片 */}
                      <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <Image
                          src={displayImages[currentImageIndex]}
                          alt={`物品图片 ${currentImageIndex + 1}`}
                          width={600}
                          height={400}
                          className="w-full h-auto max-h-96 object-cover"
                        />
                      </div>
                      
                      {/* 缩略图 */}
                      {displayImages.length > 1 && (
                        <div className="flex space-x-2 overflow-x-auto">
                          {displayImages.map((img, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`flex-shrink-0 relative rounded-lg overflow-hidden border-2 transition-colors ${
                                index === currentImageIndex
                                  ? 'border-blue-500'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                              }`}
                            >
                              <Image
                                src={img}
                                alt={`缩略图 ${index + 1}`}
                                width={80}
                                height={60}
                                className="w-20 h-15 object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 标签 */}
                {item.tags?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      标签
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-lg text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 评论区域 */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  评论 ({comments.length})
                </h3>

                {/* 评论表单 */}
                <form onSubmit={handleSubmitComment} className="mb-6">
                  <div className="flex space-x-3 items-start">
                    <Image
                      src="/images/avt.jpg"
                      alt="我的头像"
                      width={40}
                      height={40}
                      className="rounded-full border-2 border-gray-200 dark:border-gray-600 shadow-md object-cover"
                    />
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="写下你的评论或提供线索..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none shadow-sm"
                        rows={3}
                        disabled={commentLoading}
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          type="submit"
                          disabled={commentLoading || !newComment.trim()}
                          className="flex items-center px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold shadow transition-colors disabled:bg-gray-400"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {commentLoading ? '发送中...' : '发送评论'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* 评论列表 */}
                <div className="space-y-4">
                  {comments.length > 0 ? (
                    comments.map(comment => (
                      <div key={comment.id} className="flex space-x-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 shadow-sm items-start">
                        <Image
                          src={comment.avatar || '/images/avt.jpg'}
                          alt={comment.author}
                          width={40}
                          height={40}
                          className="rounded-full border border-gray-200 dark:border-gray-600 shadow object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-base">
                              {comment.author}
                            </h4>
                            <span className="text-xs text-gray-400">
                              {formatTime(comment.time)}
                            </span>
                            {comment.isSystemComment && (
                              <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                                系统消息
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">还没有评论，成为第一个评论的人吧！</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 右侧：详细信息 */}
            <div className="space-y-6">
              {/* 物品详情卡片 */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  物品信息
                </h3>
                
                <div className="space-y-4">
                  {item.itemName && (
                    <div className="flex items-start space-x-3">
                      <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">物品名称</p>
                        <p className="font-medium text-gray-900 dark:text-white">{item.itemName}</p>
                      </div>
                    </div>
                  )}

                  {item.category && (
                    <div className="flex items-start space-x-3">
                      <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">物品分类</p>
                        <p className="font-medium text-gray-900 dark:text-white">{getCategoryText(item.category)}</p>
                      </div>
                    </div>
                  )}

                  {item.location && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.itemType === 'lost' ? '丢失地点' : '拾获地点'}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">{item.location}</p>
                      </div>
                    </div>
                  )}

                  {item.contactInfo && (
                    <div className="flex items-start space-x-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">联系方式</p>
                        <p className="font-medium text-gray-900 dark:text-white">{item.contactInfo}</p>
                      </div>
                    </div>
                  )}

                  {item.reward && (
                    <div className="flex items-start space-x-3">
                      <Gift className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">酬谢</p>
                        <p className="font-medium text-gray-900 dark:text-white">{item.reward}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">发布时间</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatTime(item.time)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 状态卡片 */}
              <div className={`rounded-xl border p-6 ${themeColors.bg} ${themeColors.border}`}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  状态信息
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">当前状态</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.isReturned 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                    }`}>
                      {item.isReturned ? '已解决' : '未解决'}
                    </span>
                  </div>
                  
                  {item.isReturned && item.returnedTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">解决时间</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatTime(item.returnedTime)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">评论数</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {comments.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* 帮助提示 */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-3">
                  💡 寻找提示
                </h3>
                <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-300">
                  <li>• 仔细查看物品描述和图片</li>
                  <li>• 如有线索请在评论中告知</li>
                  <li>• 联系失主时请核实物品特征</li>
                  <li>• 归还物品后记得标记为已解决</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}