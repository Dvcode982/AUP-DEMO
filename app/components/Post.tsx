'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Check, MessageCircle, Heart, Share2, MapPin, Calendar, User, Building } from 'lucide-react'
import { useState, useEffect } from 'react'
import { postsAPI, topicAggregationAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from '../hooks/useTranslation'

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
  postType?: 'forum' | 'lostAndFound'
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
  tags, 
  isLostAndFound, 
  isReturned, 
  returnedTime, 
  postType = 'forum', 
  likes = 0, 
  comments = 0, 
  shares = 0, 
  category 
}: PostProps) => {
  // 状态管理
  const [likeCount, setLikeCount] = useState(likes);
  const [shareCount, setShareCount] = useState(shares);
  const [isLiked, setIsLiked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  
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
      toast.textContent = t('copyLinkSuccess')
      document.body.appendChild(toast)
      
      setTimeout(() => {
        toast.remove()
      }, 2000)
    } catch (error) {
      console.error('Failed to share post:', error);
      // 如果是用户取消分享，不显示错误
      if (error instanceof Error && error.name !== 'AbortError') {
        alert(t('shareFailed'));
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  // 获取角色标签的样式和文本
  const getRoleInfo = (role?: string) => {
    if (!role) return { style: '', text: '' };
    
    const roleInfo: Record<string, { style: string; text: string }> = {
      '学生': { 
        style: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        text: t('roleStudent')
      },
      '教师': { 
        style: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        text: t('roleTeacher')
      },
      '管理员': { 
        style: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        text: t('roleAdmin')
      },
      '校友': { 
        style: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        text: t('roleAlumni')
      },
    };
    
    return roleInfo[role] || { 
      style: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      text: role 
    };
  };
  
  return (
    <Link href={postType === 'lostAndFound' ? `/lost-and-found/${id}` : `/post/${id}`} className="block w-full h-full">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-lg relative border border-gray-100 dark:border-gray-700 h-full flex flex-col group transition-all duration-300 hover:scale-[1.02] hover:border-blue-200 dark:hover:border-blue-700">
        {isLostAndFound && (
          <div className="absolute top-2 right-2 flex items-center bg-white bg-opacity-90 rounded-full px-2 py-1 text-xs font-medium shadow-sm z-10">
            {isReturned ? (
              <>
                <Check className="text-green-500 mr-1" size={16} />
                <span className="text-xs text-green-500">{t('returned')} {returnedTime}</span>
              </>
            ) : (
              <span className="text-xs text-red-500">{t('notReturned')}</span>
            )}
          </div>
        )}
        
        {/* 图片区域 - 放在顶部 */}
        {displayImage && displayImage !== "" && (
          <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-900">
            <Image 
              src={displayImage} 
              alt={t('postImage')} 
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300" 
            />
            {hasMultipleImages && additionalImagesCount > 0 && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm">
                +{additionalImagesCount} {t('moreImages')}
              </div>
            )}
          </div>
        )}
        
        <div className="p-3 flex-1 flex flex-col">
          {/* 用户信息 - 更丰富的展示 */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center flex-1 min-w-0">
              {displayAvatar ? (
                <Image
                  src={displayAvatar}
                  alt={author}
                  width={36}
                  height={36}
                  className="rounded-full border border-gray-200 dark:border-gray-700 flex-shrink-0"
                />
              ) : (
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {author.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="ml-2.5 flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{author}</h3>
                  {author_role && (
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getRoleInfo(author_role).style}`}>
                      {getRoleInfo(author_role).text}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{time}</span>
                  {author_department && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <Building className="w-3 h-3" />
                        {author_department}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            {category && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs font-medium ml-2 flex-shrink-0">
                {category}
              </span>
            )}
          </div>
          
          {/* 内容区域 - 优化行高和间距 */}
          <div className="mb-2 flex-1">
            <p className={`text-gray-700 dark:text-gray-300 text-sm leading-relaxed ${displayImage ? 'line-clamp-2' : 'line-clamp-3'} break-words`}>
              {content}
            </p>
          </div>
          
          {/* 标签区域 - 更紧凑 */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs font-medium">
                  #{tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 px-1">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}
          
          {/* 互动区域 - 更紧凑的设计 */}
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700 mt-auto">
            <button 
              className="flex items-center gap-1 hover:text-red-500 transition-colors group/like"
              onClick={handleLike}
            >
              <Heart 
                size={16} 
                className={`${isLiked ? "fill-red-500 text-red-500" : ""} group-hover/like:scale-110 transition-transform`} 
              />
              <span className="text-xs font-medium">{likeCount || 0}</span>
            </button>
            
            <button className="flex items-center gap-1 hover:text-blue-500 transition-colors group/comment">
              <MessageCircle size={16} className="group-hover/comment:scale-110 transition-transform" />
              <span className="text-xs font-medium">{comments || 0}</span>
            </button>
            
            <button 
              className="flex items-center gap-1 hover:text-green-500 transition-colors group/share"
              onClick={handleShare}
            >
              <Share2 size={16} className="group-hover/share:scale-110 transition-transform" />
              <span className="text-xs font-medium">{shareCount || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default Post

