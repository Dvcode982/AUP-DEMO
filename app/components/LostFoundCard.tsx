import Image from 'next/image'
import Link from 'next/link'
import { Check, MapPin, Calendar, MessageCircle, Share2 } from 'lucide-react'
import { useState } from 'react'
import { lostAndFoundAPI } from '@/lib/api'

interface LostFoundCardProps {
  id: number
  author: string
  avatar: string
  content: string
  image?: string
  images?: string[] // 支持多图片数组
  time: string
  tags: string[]
  isReturned: boolean
  returnedTime?: string
  location?: string
  itemType?: 'lost' | 'found' // 物品类型：丢失或找到
  contactInfo?: string // 联系方式
  comments?: number
  shares?: number
}

const LostFoundCard = ({
  id,
  author,
  avatar,
  content,
  image,
  images = [],
  time,
  tags,
  isReturned,
  returnedTime,
  location,
  itemType = 'lost',
  contactInfo,
  comments = 0,
  shares = 0
}: LostFoundCardProps) => {
  // 状态管理
  const [shareCount, setShareCount] = useState(shares);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 处理图片显示逻辑
  const hasMultipleImages = image && images.length > 0 ? true : (images.length > 1);
  const displayImage = image || (images.length > 0 ? images[0] : undefined);
  const additionalImagesCount = images.length > 0 ? images.length - 1 : 0;
  
  // 处理分享
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault(); // 阻止链接跳转
    e.stopPropagation(); // 阻止事件冒泡
    
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      // 创建分享链接
      const shareUrl = `${window.location.origin}/lost-and-found/${id}`;
      
      // 尝试使用Web Share API
      if (navigator.share) {
        await navigator.share({
          title: `${itemType === 'lost' ? '寻物启事' : '招领启事'}: ${content.substring(0, 30)}...`,
          text: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
          url: shareUrl
        });
      } else {
        // 回退到复制链接
        await navigator.clipboard.writeText(shareUrl);
        alert('链接已复制到剪贴板');
      }
      
      // 记录分享行为
      const response = await lostAndFoundAPI.sharePost(id.toString());
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
    <Link href={`/lost-and-found/${id}`} className="block w-full h-full">
      <div className="bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm rounded-lg shadow-sm overflow-hidden hover-lift relative border border-gray-100 dark:border-gray-700 h-full flex flex-col group card-dynamic-height transition-all duration-300 hover:shadow-md">
        {/* 物品状态标签 - 移至右上角并增加左边距，避免与用户信息重叠 */}
        <div className="absolute top-2 right-2 flex items-center bg-white dark:bg-gray-700 bg-opacity-90 dark:bg-opacity-90 rounded-full px-2 py-1 text-xs font-medium shadow-sm z-10 max-w-[50%]">
          {isReturned ? (
            <>
              <Check className="text-green-500 mr-1 flex-shrink-0" size={16} />
              <span className="text-xs text-green-500 truncate">已找到/已归还 {returnedTime && `(${returnedTime})`}</span>
            </>
          ) : (
            <span className="text-xs text-red-500 truncate">未找到/未归还</span>
          )}
        </div>

        <div className="p-4 relative flex flex-col h-full">
          <div className="flex items-center mb-3">
            <Image
              src={avatar}
              alt={author}
              width={40}
              height={40}
              className="rounded-full border-2 border-blue-100 dark:border-blue-900 z-0"
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
          
          {displayImage && (
            <div className="mb-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative">
              <div className="relative">
                <Image src={displayImage} alt="Lost and found item image" width={300} height={200} className="w-full h-auto image-fade" />
                {hasMultipleImages && additionalImagesCount > 0 && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-md text-xs font-medium">
                    +{additionalImagesCount}
                  </div>
                )}
                <div className="image-fade-mask"></div>
              </div>
            </div>
          )}
          
          {/* 失物招领特有信息 - 修改布局防止重叠 */}
          <div className="space-y-2 mb-3">
            {location && (
              <div className="flex items-start text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
                <MapPin size={14} className="mr-1 flex-shrink-0 mt-0.5" />
                <span className="flex-1 break-words">{location}</span>
              </div>
            )}
            
            {contactInfo && (
              <div className="flex items-start text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
                <span className="font-medium mr-1 flex-shrink-0">联系方式:</span>
                <span className="flex-1 break-words">{contactInfo}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3 overflow-hidden">
            {tags.map((tag, index) => (
              <span key={index} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium truncate max-w-full">
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex justify-between text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700 mt-auto">
            <div className="flex items-center space-x-1">
              <Calendar size={16} />
              <span className="text-xs">{time.split(' ')[0]}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle size={16} />
              <span className="text-xs">{comments > 0 ? comments : "评论"}</span>
            </div>
            <div 
              className="flex items-center space-x-1 hover:text-blue-500 transition-colors cursor-pointer"
              onClick={handleShare}
            >
              <Share2 size={16} />
              <span className="text-xs">{shareCount > 0 ? shareCount : "分享"}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default LostFoundCard;