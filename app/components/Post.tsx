import Image from 'next/image'
import { Check, MessageCircle, Heart, Share2 } from 'lucide-react'
import { useState } from 'react'
import { postsAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'

interface PostProps {
  id: number
  author: string
  avatar: string
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
  onClick?: () => void
  isSelected?: boolean
}

const Post = ({ id, author, avatar, content, image, images = [], time, tags, isLostAndFound, isReturned, returnedTime, postType = 'forum', likes = 0, comments = 0, shares = 0, onClick, isSelected }: PostProps) => {
  // 状态管理
  const [likeCount, setLikeCount] = useState(likes);
  const [shareCount, setShareCount] = useState(shares);
  const [isLiked, setIsLiked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  
  // 处理图片显示逻辑
  const hasMultipleImages = image && images.length > 0 ? true : (images.length > 1);
  const displayImage = image || (images.length > 0 ? images[0] : undefined);
  const additionalImagesCount = images.length > 0 ? images.length - 1 : 0;
  
  // 处理点赞
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); // 阻止链接跳转
    e.stopPropagation(); // 阻止事件冒泡
    
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      const response = await postsAPI.likePost(id.toString());
      setLikeCount(response.likes);
      setIsLiked(response.liked);
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // 处理分享
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault(); // 阻止链接跳转
    e.stopPropagation(); // 阻止事件冒泡
    
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      // 创建分享链接
      const shareUrl = `${window.location.origin}/${postType === 'lostAndFound' ? 'lost-and-found' : 'post'}/${id}`;
      
      // 尝试使用Web Share API
      if (navigator.share) {
        await navigator.share({
          title: `${author}的帖子`,
          text: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
          url: shareUrl
        });
      } else {
        // 回退到复制链接
        await navigator.clipboard.writeText(shareUrl);
        alert('链接已复制到剪贴板');
      }
      
      // 记录分享行为
      const response = await postsAPI.sharePost(id.toString());
      setShareCount(response.shares);
    } catch (error) {
      console.error('Error sharing post:', error);
      // 如果是用户取消分享，不显示错误
      if (error instanceof Error && error.name !== 'AbortError') {
        alert('分享失败，请重试');
      }
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white 
        dark:bg-gray-800 
        rounded-lg 
        p-4
        shadow-sm 
        hover:shadow-md
        relative 
        border 
        border-gray-100 
        dark:border-gray-700 
        transition-all 
        duration-300
        cursor-pointer
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
      `}
    >
      <div className="flex items-center mb-3">
        <Image
          src={avatar}
          alt={author}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div className="ml-3">
          <h3 className="font-bold text-gray-800 dark:text-gray-200">{author}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{time}</p>
        </div>
      </div>

      <p className="text-gray-700 dark:text-gray-300 mb-3">
        {content}
      </p>

      {displayImage && (
        <div className="mb-3 rounded-lg overflow-hidden">
          <div className="relative">
            <Image 
              src={displayImage} 
              alt="Post image" 
              width={400}
              height={300}
              className="w-full h-auto"
            />
            {hasMultipleImages && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                +{additionalImagesCount}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map((tag, index) => (
          <span 
            key={index} 
            className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs"
          >
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
        <div className="flex items-center space-x-1">
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
  )
}

export default Post

