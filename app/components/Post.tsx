'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Check, MessageCircle, Heart, Share2, MapPin, Calendar, User, Building, Tag } from 'lucide-react'
import { useState, useEffect } from 'react'
import { postsAPI, topicAggregationAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

export interface PostProps {
  id: string | number
  author: string
  author_id?: string | number
  author_email?: string
  author_avatar?: string
  author_role?: string
  author_department?: string
  avatar?: string // 兼容旧数据
  content: string
  image?: string
  images?: string[] // 支持多图片数组
  time: string
  tags: string[]
  isLostAndFound?: boolean
  isReturned?: boolean
  returnedTime?: string
  postType?: string // 改为 string 类型
  likes?: number
  comments?: number
  shares?: number
  category?: string
}

const Post = ({ 
  id, 
  author, 
  author_id,
  author_email,
  author_avatar,
  author_role,
  author_department,
  avatar, 
  content, 
  image, 
  images = [], 
  time, 
  tags = [], 
  isLostAndFound = false, 
  isReturned = false, 
  returnedTime, 
  postType = 'forum', 
  likes = 0, 
  comments = 0, 
  shares = 0,
  category
}: PostProps) => {
  const { t } = useLanguage()
  // 状态管理
  const [likeCount, setLikeCount] = useState(likes);
  const [shareCount, setShareCount] = useState(shares);
  const [isLiked, setIsLiked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  // 使用新的头像字段，如果没有则使用旧的
  const displayAvatar = author_avatar || avatar;
  
  // 检查用户是否已点赞
  useEffect(() => {
    const checkLiked = async () => {
      if (!isAuthenticated) return;
      
      try {
        const response = await postsAPI.checkLiked(id.toString());
        setIsLiked(response.liked);
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };

    checkLiked();
  }, [id, isAuthenticated]);
  
  // 处理图片显示逻辑
  const hasMultipleImages = image && images.length > 0 ? true : (images.length > 1);
  const displayImage = image || (images.length > 0 ? images[0] : undefined);
  const additionalImagesCount = images.length > 0 ? images.length - 1 : 0;
  
  // 处理点赞
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      const response = await postsAPI.likePost(id.toString());
      setIsLiked(response.liked);
      setLikeCount(response.likes);
      
      // 记录用户行为
      if (response.liked) {
        await topicAggregationAPI.trackInteraction({
          postId: id.toString(),
          topic: category,
          tag: tags?.[0],
          actionType: 'like'
        });
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // 处理分享
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      const response = await postsAPI.sharePost(id.toString());
      setShareCount(response.shares);
      
      // 记录用户行为
      await topicAggregationAPI.trackInteraction({
        postId: id.toString(),
        topic: category,
        tag: tags?.[0],
        actionType: 'share'
      });
      
      // 复制链接到剪贴板
      const postUrl = `${window.location.origin}/post/${id}`
      await navigator.clipboard.writeText(postUrl)
      
      // 显示成功提示
      const toast = document.createElement('div')
      toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
      toast.textContent = '链接已复制到剪贴板'
      document.body.appendChild(toast)
      
      setTimeout(() => {
        toast.remove()
      }, 2000)
    } catch (error) {
      console.error('Failed to share post:', error);
      // 如果是用户取消分享，不显示错误
      if (error instanceof Error && error.name !== 'AbortError') {
        alert('分享失败，请稍后再试');
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
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
  
  // 在组件内部处理 postType 的类型
  const normalizedPostType = postType === 'lostAndFound' ? 'lostAndFound' : 'forum'
  
  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="p-4">
        {/* 作者信息 */}
        <div className="flex items-center mb-3">
          <div className="relative">
            {author_avatar || avatar ? (
              <Image
                src={author_avatar || avatar || '/placeholder.svg?height=40&width=40'}
                alt={author}
                width={40}
                height={40}
                className="rounded-full border-2 border-gray-200 dark:border-gray-600"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                {author.charAt(0).toUpperCase()}
              </div>
            )}
            {author_role && (
              <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {author_role}
              </span>
            )}
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <div className="flex items-center">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {author}
              </p>
              {author_department && (
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  {author_department}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {time}
            </p>
          </div>
        </div>

        {/* 帖子内容 */}
        <Link href={`/post/${id}`} className="block">
          <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3 mb-3">
            {content}
          </p>
        </Link>

        {/* 图片预览 */}
        {displayImage && (
          <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
            <Image
              src={displayImage}
              alt={t('post.image')}
              fill
              className="object-cover"
            />
            {hasMultipleImages && (
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                +{additionalImagesCount}
              </div>
            )}
          </div>
        )}

        {/* 标签 */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 互动按钮 */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
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
            <Link
              href={`/post/${id}`}
              className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{comments}</span>
            </Link>
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
    </div>
  )
}

export default Post

