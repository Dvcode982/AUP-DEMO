'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, MessageCircle, Share2, ArrowLeft, Clock, User, Send, Tag, Building } from 'lucide-react'
import { postsAPI, topicAggregationAPI } from '@/lib/api'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/app/contexts/LanguageContext'

interface PostData {
  id: string | number
  author: string
  author_id?: string | number
  author_email?: string
  author_avatar?: string
  author_role?: string
  author_department?: string
  author_grade?: string
  author_bio?: string
  avatar?: string // 兼容旧数据
  content: string
  image?: string
  time: string
  tags?: string[]
  category?: string
  likes?: number
  shares?: number
  comments?: number
}

interface CommentData {
  id: string | number
  author: string
  author_role?: string
  author_department?: string
  author_avatar?: string
  avatar?: string
  content: string
  time: string
}

export default function PostPage() {
  const { id } = useParams()
  const { t } = useLanguage()
  const [post, setPost] = useState<PostData | null>(null)
  const [comments, setComments] = useState<CommentData[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [commentLoading, setCommentLoading] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [shareCount, setShareCount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  // 在组件加载时请求数据
  useEffect(() => {
    async function fetchData() {
      if (id) {
        try {
          setLoading(true)
          // 获取帖子详情
          const postData = await postsAPI.getPostById(id.toString())
          setPost(postData)
          
          // 设置点赞和分享数量
          if (postData.likes) setLikeCount(postData.likes)
          if (postData.shares) setShareCount(postData.shares)
          
          // 获取帖子评论
          const commentsData = await postsAPI.getPostComments(id.toString())
          setComments(commentsData)
          
          // 检查用户是否已点赞
          if (isAuthenticated) {
            try {
              const likedStatus = await postsAPI.checkLiked(id.toString())
              setIsLiked(likedStatus.liked)
            } catch (error) {
              console.error('Error checking like status:', error)
            }
          }
        } catch (error) {
          console.error('Error fetching post data:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    
    fetchData()
  }, [id, isAuthenticated]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !id) return
    
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    try {
      setCommentLoading(true)
      // 调用API添加评论
      await postsAPI.addComment(id.toString(), newComment)
      
      // 重新获取评论列表
      const commentsData = await postsAPI.getPostComments(id.toString())
      setComments(commentsData)
      setNewComment('')
      
      // 记录用户行为
      if (post) {
        await topicAggregationAPI.trackInteraction({
          postId: id.toString(),
          topic: post.category,
          tag: post.tags?.[0],
          actionType: 'comment'
        })
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setCommentLoading(false)
    }
  }
  
  // 处理点赞
  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (isProcessing || !id) return
    
    try {
      setIsProcessing(true)
      const response = await postsAPI.likePost(id.toString())
      setLikeCount(response.likes)
      setIsLiked(response.liked)
      
      // 记录用户行为
      if (response.liked && post) {
        await topicAggregationAPI.trackInteraction({
          postId: id.toString(),
          topic: post.category,
          tag: post.tags?.[0],
          actionType: 'like'
        })
      }
    } catch (error) {
      console.error('Error liking post:', error)
    } finally {
      setIsProcessing(false)
    }
  }
  
  // 处理分享
  const handleShare = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (isProcessing || !id) return
    
    try {
      setIsProcessing(true)
      
      // 记录分享行为
      const response = await postsAPI.sharePost(id.toString())
      setShareCount(response.shares)
      
      // 记录用户行为
      if (post) {
        await topicAggregationAPI.trackInteraction({
          postId: id.toString(),
          topic: post.category,
          tag: post.tags?.[0],
          actionType: 'share'
        })
      }
      
      // 复制链接到剪贴板
      const postUrl = `${window.location.origin}/post/${id}`
      await navigator.clipboard.writeText(postUrl)
      
      // 显示成功提示
      const toast = document.createElement('div')
      toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-up'
      toast.textContent = '链接已复制到剪贴板'
      document.body.appendChild(toast)
      
      setTimeout(() => {
        toast.classList.add('animate-fade-out-down')
        setTimeout(() => toast.remove(), 300)
      }, 2000)
    } catch (error) {
      console.error('Error sharing post:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // 获取角色标签的样式
  const getRoleBadgeStyle = (role?: string) => {
    if (!role) return '';
    
    const roleStyles: Record<string, string> = {
      '学生': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      '教师': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      '管理员': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      '校友': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    };
    
    return roleStyles[role] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
      </div>
    </div>
  )

  if (!post) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">{t('error.notFound')}</p>
        <Link href="/" className="mt-4 inline-flex items-center text-blue-500 hover:text-blue-600">
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t('common.back')}
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* 顶部导航 */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">{t('common.back')}</span>
          </Link>
        </div>
        
        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧主内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 帖子内容卡片 */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
              {/* 作者信息头部 */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {post.author_avatar || post.avatar ? (
                      <Image 
                        src={post.author_avatar || post.avatar || '/placeholder.svg?height=48&width=48'} 
                        alt={post.author} 
                        width={48} 
                        height={48} 
                        className="rounded-full border-2 border-gray-200 dark:border-gray-600" 
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                        {post.author.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="ml-4">
                      <div className="flex items-center">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{post.author}</h2>
                        {post.author_role && (
                          <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeStyle(post.author_role)}`}>
                            {post.author_role}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{post.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 帖子内容 */}
              <div className="p-6">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{post.content}</p>
                </div>
                
                {/* 图片展示 */}
                {post.image && (
                  <div className="mt-4 relative aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={post.image}
                      alt={t('post.image')}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                
                {/* 标签 */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 互动按钮 */}
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleLike}
                    disabled={isProcessing}
                    className={`flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors ${
                      isLiked ? 'text-blue-500 dark:text-blue-400' : ''
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{likeCount}</span>
                  </button>
                  <button
                    onClick={handleShare}
                    disabled={isProcessing}
                    className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>{shareCount}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 评论区 */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-blue-500" />
                {t('post.comment')}
              </h3>

              {/* 评论列表 */}
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map(comment => (
                    <div key={comment.id} className="flex gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex-shrink-0">
                        {comment.author_avatar ? (
                          <Image
                            src={comment.author_avatar}
                            alt={comment.author}
                            width={40}
                            height={40}
                            className="rounded-full border-2 border-gray-200 dark:border-gray-600"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {comment.author.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-gray-100">{comment.author}</span>
                            {comment.author_role && (
                              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getRoleBadgeStyle(comment.author_role)}`}>
                                {comment.author_role}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{comment.time}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <MessageCircle className="mx-auto mb-2 opacity-30" size={48} />
                  <p>{t('post.noComments')}</p>
                </div>
              )}

              {/* 评论输入框 */}
              <form onSubmit={handleSubmitComment} className="mt-6">
                <div className="flex gap-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={t('post.writeComment')}
                    className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  <button
                    type="submit"
                    disabled={commentLoading || !newComment.trim()}
                    className="self-end px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* 右侧边栏 */}
          <div className="space-y-6">
            {/* 作者信息卡片 */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <h4 className="font-semibold mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-500" />
                {t('post.author')}
              </h4>
              <div className="text-center">
                {post.author_avatar || post.avatar ? (
                  <Image 
                    src={post.author_avatar || post.avatar || '/placeholder.svg?height=80&width=80'} 
                    alt={post.author} 
                    width={80} 
                    height={80} 
                    className="rounded-full mx-auto mb-3 border-4 border-gray-100 dark:border-gray-700" 
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                    {post.author.charAt(0).toUpperCase()}
                  </div>
                )}
                <h3 className="font-semibold text-lg mb-1">{post.author}</h3>
                {post.author_role && (
                  <span className={`inline-block px-2 py-1 rounded text-sm font-medium mb-2 ${getRoleBadgeStyle(post.author_role)}`}>
                    {post.author_role}
                  </span>
                )}
                {post.author_department && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <Building className="w-4 h-4 inline mr-1" />
                    {post.author_department}
                  </p>
                )}
                {post.author_grade && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {post.author_grade}
                  </p>
                )}
                {post.author_bio && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-left">
                    {post.author_bio}
                  </p>
                )}
              </div>
            </div>

            {/* 相关推荐 */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <h4 className="font-semibold mb-4">{t('post.relatedPosts')}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('post.comingSoon')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
