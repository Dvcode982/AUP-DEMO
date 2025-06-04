import Image from 'next/image'
import Link from 'next/link'
import { Check, MapPin, Calendar, MessageCircle, Share2, Clock, User, Tag, ExternalLink, Package, Phone, Gift, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { lostAndFoundAPI } from '@/lib/api'
import { useTranslation } from '../hooks/useTranslation'

interface LostFoundCardProps {
  id: number
  author: string
  avatar: string
  content: string
  itemName?: string // 物品名称
  category?: string // 物品分类
  location?: string // 地点
  contactInfo?: string // 联系方式
  reward?: string // 酬谢
  image?: string
  images?: string[] // 支持多图片数组
  time: string
  tags: string[]
  isReturned: boolean
  returnedTime?: string
  itemType?: 'lost' | 'found' // 物品类型：丢失或找到
  comments?: number
  shares?: number
  views?: number
  likes?: number
  viewMode?: 'grid' | 'list'
}

const LostFoundCard = ({
  id,
  author,
  avatar,
  content,
  itemName,
  category,
  location,
  contactInfo,
  reward,
  image,
  images = [],
  time,
  tags,
  isReturned,
  returnedTime,
  itemType = 'lost',
  comments = 0,
  shares = 0,
  views = 0,
  likes = 0,
  viewMode = 'grid'
}: LostFoundCardProps) => {
  // 状态管理
  const [shareCount, setShareCount] = useState(shares);
  const [isProcessing, setIsProcessing] = useState(false);
  const { t } = useTranslation();
  
  // 处理图片显示逻辑
  const hasMultipleImages = image && images.length > 0 ? true : (images.length > 1);
  const displayImage = image || (images.length > 0 ? images[0] : undefined);
  const additionalImagesCount = images.length > 0 ? images.length - 1 : 0;
  
  // 统一头像显示逻辑 - 采用论坛设定
  const displayAvatar = avatar || '/placeholder.svg?height=40&width=40';
  
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
          title: `${itemType === 'lost' ? t('lostFound.lostItem') : t('lostFound.foundItem')}: ${itemName || content.substring(0, 30)}...`,
          text: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
          url: shareUrl
        });
      } else {
        // 回退到复制链接
        await navigator.clipboard.writeText(shareUrl);
        alert(t('copyLinkSuccess'));
      }
      
      // 记录分享行为
      const response = await lostAndFoundAPI.sharePost(id.toString());
      setShareCount(response.shares);
    } catch (error) {
      console.error('Error sharing post:', error);
      // 如果是用户取消分享，不显示错误
      if (error instanceof Error && error.name !== 'AbortError') {
        alert(t('shareFailed'));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // 获取物品分类显示文本
  const getCategoryText = (category: string) => {
    if (!category) return ''
    return t(`lostFound.categories.${category}`) || category
  }

  // 根据物品类型设置颜色主题
  const getThemeColors = () => {
    if (itemType === 'lost') {
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

  const themeColors = getThemeColors();

  // 格式化时间显示
  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr;
    }
  }

  if (viewMode === 'list') {
    return (
      <Link href={`/lost-and-found/${id}`} className="block w-full">
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-lg p-6">
          <div className="flex items-start space-x-4">
            {/* 左侧图片 */}
            {displayImage && (
              <div className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                <Image 
                  src={displayImage} 
                  alt={itemName || "物品图片"} 
                  width={128} 
                  height={128} 
                  className="w-full h-full object-cover"
                />
                {hasMultipleImages && additionalImagesCount > 0 && (
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    +{additionalImagesCount}
                  </div>
                )}
              </div>
            )}

            {/* 主要内容 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${themeColors.badge}`}>
                    {themeColors.icon} {itemType === 'lost' ? t('lostFound.lostItem') : t('lostFound.foundItem')}
                  </span>
                  {category && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      <Package size={10} className="mr-1" />
                      {getCategoryText(category)}
                    </span>
                  )}
                  {isReturned && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-700 text-green-700 dark:text-green-300">
                      <Check size={12} className="mr-1" />
                      已解决
                    </span>
                  )}
                </div>
                <ExternalLink size={16} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                {itemName || content}
              </h3>

              {/* 用户信息 */}
              <div className="flex items-center space-x-3 mb-3">
                <Image
                  src={displayAvatar}
                  alt={author}
                  width={32}
                  height={32}
                  className="rounded-full border-2 border-gray-200 dark:border-gray-600"
                />
                <div>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">{author}</span>
                  <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                    <Clock size={12} />
                    <span>{formatTime(time)}</span>
                  </div>
                </div>
              </div>

              {/* 详细信息网格 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {location && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                    <MapPin size={16} className="text-blue-500" />
                    <span className="truncate">{location}</span>
                  </div>
                )}
                {contactInfo && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                    <Phone size={16} className="text-green-500" />
                    <span className="truncate">{contactInfo}</span>
                  </div>
                )}
                {reward && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-lg">
                    <Gift size={16} className="text-yellow-600" />
                    <span className="truncate">{reward}</span>
                  </div>
                )}
              </div>

              {/* 描述文本 */}
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-2 mb-3">
                {content}
              </p>

              {/* 标签 */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {tags.slice(0, 4).map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      <Tag size={10} className="mr-1" />
                      {tag}
                    </span>
                  ))}
                  {tags.length > 4 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">+{tags.length - 4}</span>
                  )}
                </div>
              )}

              {/* 底部操作栏 */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
                    <MessageCircle size={16} />
                    <span>{comments}</span>
                  </div>
                  <div 
                    className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                    onClick={handleShare}
                  >
                    <Share2 size={16} />
                    <span>{shareCount}</span>
                  </div>
                  {views > 0 && (
                    <span className="text-xs text-gray-400">{views} 次查看</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // 网格视图 (默认)
  return (
    <Link href={`/lost-and-found/${id}`} className="block w-full h-full group">
      <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col overflow-hidden">
        {/* 顶部状态栏 */}
        <div className={`px-4 py-3 ${themeColors.bg} border-b ${themeColors.border}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${themeColors.primary}`}>
                {themeColors.icon} {itemType === 'lost' ? t('lostFound.lostItem') : t('lostFound.foundItem')}
              </span>
              {category && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300">
                  <Package size={10} className="mr-1" />
                  {getCategoryText(category)}
                </span>
              )}
            </div>
            {isReturned && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                <Check size={12} className="mr-1" />
                已解决
              </span>
            )}
          </div>
        </div>

        {/* 图片区域 */}
        {displayImage && (
          <div className="relative h-48 overflow-hidden">
            <Image 
              src={displayImage} 
              alt={itemName || "物品图片"} 
              width={400} 
              height={200} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {hasMultipleImages && additionalImagesCount > 0 && (
              <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium">
                +{additionalImagesCount} 张
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}

        {/* 内容区域 */}
        <div className="p-4 flex-1 flex flex-col">
          {/* 用户信息 */}
          <div className="flex items-center space-x-3 mb-3">
            <Image
              src={displayAvatar}
              alt={author}
              width={32}
              height={32}
              className="rounded-full border-2 border-gray-200 dark:border-gray-600"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">{author}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">{formatTime(time)}</p>
            </div>
          </div>

          {/* 物品名称和描述 */}
          <div className="flex-1 mb-3">
            {itemName && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {itemName}
              </h3>
            )}
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">
              {content}
            </p>
          </div>

          {/* 详细信息 */}
          <div className="space-y-2 mb-3">
            {location && (
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
                <MapPin size={12} className="text-blue-500" />
                <span className="truncate">{location}</span>
              </div>
            )}
            
            {contactInfo && (
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
                <Phone size={12} className="text-green-500" />
                <span className="truncate">{contactInfo}</span>
              </div>
            )}

            {reward && (
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
                <Gift size={12} className="text-yellow-600" />
                <span className="truncate">{reward}</span>
              </div>
            )}
          </div>

          {/* 标签 */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.slice(0, 2).map((tag, index) => (
                <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  <Tag size={10} className="mr-1" />
                  {tag}
                </span>
              ))}
              {tags.length > 2 && (
                <span className="text-xs text-gray-400 dark:text-gray-500 self-center">+{tags.length - 2}</span>
              )}
            </div>
          )}

          {/* 底部操作栏 */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700 mt-auto">
            <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">
                <MessageCircle size={14} />
                <span>{comments}</span>
              </div>
              <div 
                className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                onClick={handleShare}
              >
                <Share2 size={14} />
                <span>{shareCount}</span>
              </div>
            </div>
            <div className="group-hover:opacity-100 opacity-0 transition-opacity">
              <ExternalLink size={14} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default LostFoundCard;