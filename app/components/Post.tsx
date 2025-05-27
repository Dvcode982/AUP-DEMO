'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Check, MessageCircle, Heart, Share2, MapPin, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'
import { postsAPI, topicAggregationAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'

interface PostProps {
  id: string | number
  author: string
  avatar?: string
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

const Post = ({ id, author, avatar, content, image, images = [], time, tags, isLostAndFound, isReturned, returnedTime, postType = 'forum', likes = 0, comments = 0, shares = 0, category }: PostProps) => {
  // 状态管理
  const [likeCount, setLikeCount] = useState(likes);
  const [shareCount, setShareCount] = useState(shares);
  const [isLiked, setIsLiked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
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
  return (
    <Link href={postType === 'lostAndFound' ? `/lost-and-found/${id}` : `/post/${id}`} className="block w-full h-full">
      <div className="bg-white dark:bg-gray-800 bg-opacity-50 dark:bg-opacity-50  rounded-lg shadow-sm overflow-hidden hover-lift relative border border-gray-100 dark:border-gray-700 h-full flex flex-col group card-dynamic-height transition-all duration-300 hover:shadow-md">
        {isLostAndFound && (
          <div className="absolute top-2 right-2 flex items-center bg-white bg-opacity-90 rounded-full px-2 py-1 text-xs font-medium shadow-sm">
            {isReturned ? (
              <>
                <Check className="text-green-500 mr-1" size={16} />
                <span className="text-xs text-green-500">已返还 {returnedTime}</span>
              </>
            ) : (
              <span className="text-xs text-red-500">未返还</span>
            )}
          </div>
        )}
        <div className="p-4 relative">
          <div className="flex items-center mb-3">
            <Image
              src={avatar || '/placeholder.svg?height=40&width=40'}
              alt={author}
              width={40}
              height={40}
              className="rounded-full border-2 border-blue-100 dark:border-blue-900"
            />
            <div className="ml-3">
              <h3 className="font-bold text-gray-800 dark:text-gray-200">{author}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{time}</p>
            </div>
          </div>
          
          <div className="text-fade-container mb-3">
            <div className="text-fade-content text-gray-700 dark:text-gray-300 leading-relaxed">
              <p className={`${displayImage ? 'line-clamp-3' : 'line-clamp-4'} text-expand-animation break-words`}>
                {content}
              </p>
            </div>
            {content.length > (displayImage ? 120 : 160) && (
              <div className="text-fade-mask"></div>
            )}
          </div>
          
          {displayImage && displayImage !== "" && (
            <div className="mb-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative">
              <div className="relative">
                <Image src={displayImage} alt="Post image" width={300} height={200} className="w-full h-auto image-fade" />
                {hasMultipleImages && additionalImagesCount > 0 && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-md text-xs font-medium">
                    +{additionalImagesCount}
                  </div>
                )}
                <div className="image-fade-mask"></div>
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 mb-3 overflow-hidden">
            {tags.map((tag, index) => (
              <span key={index} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium truncate max-w-full">
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex justify-between text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700 mt-auto">
            <div 
              className="flex items-center space-x-1 hover:text-blue-500 transition-colors cursor-pointer"
              onClick={handleLike}
            >
              <Heart size={18} className={isLiked || likeCount > 0 ? "text-red-500" : ""} />
              <span className="text-xs">{likeCount > 0 ? likeCount : "点赞"}</span>
            </div>
            <div className="flex items-center space-x-1 hover:text-blue-500 transition-colors cursor-pointer">
              <MessageCircle size={18} />
              <span className="text-xs">{comments > 0 ? comments : "评论"}</span>
            </div>
            <div 
              className="flex items-center space-x-1 hover:text-blue-500 transition-colors cursor-pointer"
              onClick={handleShare}
            >
              <Share2 size={18} />
              <span className="text-xs">{shareCount > 0 ? shareCount : "分享"}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default Post

