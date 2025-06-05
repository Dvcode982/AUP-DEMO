'use client'

import Image from 'next/image'
import Link from 'next/link'
<<<<<<< HEAD
import { Check, MessageCircle, Heart, Share2, MapPin, Calendar, User, Building, ExternalLink, Package, Clock, Eye } from 'lucide-react'
=======
import { Check, MessageCircle, Heart, Share2, Building, User } from 'lucide-react'
>>>>>>> 803e0c25696cfdebff4345d0de587bf1f5b817ed
import { useState, useEffect } from 'react'
import { postsAPI, topicAggregationAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from '../hooks/useTranslation'
import UserAvatar from './UserAvatar'

interface PostProps {
  id: string | number
  author: string
  author_id?: string | number
  author_email?: string
  author_avatar?: string
  author_role?: string
  author_department?: string
  avatar?: string
  content: string
  image?: string
  images?: string[]
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
  disableLink?: boolean
  onClick?: () => void
  isSelected?: boolean
  author_bio?: string
  author_grade?: string
  cardClassName?: string; // 新增：主页卡片自定义样式
}

const Post = ({
  id,
  author,
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
  category,
  disableLink = false,
  onClick,
  isSelected = false,
  author_bio,
  author_grade,
  cardClassName = "",
}: PostProps) => {
  const [likeCount, setLikeCount] = useState(likes)
  const [shareCount, setShareCount] = useState(shares)
  const [isLiked, setIsLiked] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { t } = useTranslation()

  const displayAvatar = author_avatar || avatar
  const hasMultipleImages = image && images.length > 0 ? true : images.length > 1
  const displayImage = image || (images.length > 0 ? images[0] : undefined)
  const additionalImagesCount = images.length > 0 ? images.length - 1 : 0

  useEffect(() => {
    const checkLiked = async () => {
      if (!isAuthenticated) return
      try {
        const response = await postsAPI.checkLiked(id.toString())
        setIsLiked(response.liked)
      } catch (error) {
        console.error('Error checking like status:', error)
      }
    }
    checkLiked()
  }, [id, isAuthenticated])

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (isProcessing) return

    try {
      setIsProcessing(true)
      const response = await postsAPI.likePost(id.toString())
      setIsLiked(response.liked)
      setLikeCount(response.likes)

      if (response.liked) {
        await topicAggregationAPI.trackInteraction({
          postId: id.toString(),
          topic: category,
          tag: tags?.[0],
          actionType: 'like',
        })
      }
    } catch (error) {
      console.error('Failed to like post:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (isProcessing) return

    try {
      setIsProcessing(true)
      const response = await postsAPI.sharePost(id.toString())
      setShareCount(response.shares)

      await topicAggregationAPI.trackInteraction({
        postId: id.toString(),
        topic: category,
        tag: tags?.[0],
        actionType: 'share',
      })

      const postUrl = `${window.location.origin}/post/${id}`
      await navigator.clipboard.writeText(postUrl)

      const toast = document.createElement('div')
      toast.className =
        'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
      toast.textContent = t('copyLinkSuccess')
      document.body.appendChild(toast)

      setTimeout(() => {
        toast.remove()
      }, 2000)
    } catch (error) {
      console.error('Failed to share post:', error)
      if (error instanceof Error && error.name !== 'AbortError') {
        alert(t('shareFailed'))
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const getRoleBadgeStyle = (role?: string) => {
    if (!role) return ''
    const roleStyles: Record<string, string> = {
      学生: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      教师: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      管理员: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      校友: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    }
    return roleStyles[role] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  }

  const contentBlock = (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-lg relative border border-gray-100 dark:border-gray-700 h-full flex flex-col group transition-all duration-300 ${
        isSelected ? '' : 'hover:scale-[1.02] hover:border-blue-200 dark:hover:border-blue-700'
      } ${cardClassName}`}
      onClick={disableLink && onClick ? onClick : undefined}
      style={{ cursor: disableLink && onClick ? 'pointer' : 'default' }}
    >
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

      {displayImage && displayImage !== '' && (
        <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-900">
          <Image
            src={displayImage}
            alt="Post image"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {hasMultipleImages && additionalImagesCount > 0 && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-md text-xs font-medium">
              +{additionalImagesCount} 
            </div>
          )}
        </div>
      )}

      <div className="p-3 flex-1 flex flex-col">
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
<<<<<<< HEAD
          </div>
        )}
        
        <div className="p-3 flex-1 flex flex-col">
          {/* 用户信息 - 更丰富的展示 */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center flex-1 min-w-0">
              <UserAvatar 
                src={displayAvatar}
                alt={author}
                username={author}
                size={36}
                className="flex-shrink-0"
              />
              <div className="ml-2.5 flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{author}</h3>
                  {author_role && (
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getRoleInfo(author_role).style}`}>
                      {getRoleInfo(author_role).text}
=======
            <div className="ml-2.5 flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{author}</h3>
                {author_role && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-xs font-medium ${getRoleBadgeStyle(
                      author_role
                    )}`}
                  >
                    {author_role}
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
>>>>>>> 803e0c25696cfdebff4345d0de587bf1f5b817ed
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

        <div className="mb-2 flex-1">
          <p
            className={`text-gray-700 dark:text-gray-300 text-sm leading-relaxed ${
              displayImage ? 'line-clamp-2' : 'line-clamp-3'
            } break-words`}
          >
            {content}
          </p>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs font-medium"
              >
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

        <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700 mt-auto">
          <button
            className={`flex items-center gap-1 hover:text-red-500 transition-colors group/like`}
            onClick={handleLike}
          >
            <Heart
              size={16}
              className={`${isLiked ? 'fill-red-500 text-red-500' : ''} group-hover/like:scale-110 transition-transform`}
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
  )

  // 详情页内容（isSelected=true时显示）
  // 修正：让整个左侧内容区可滚动，相关推荐和作者信息始终能滑到
  const detailBlock = (
    <div className="bg-white/70 dark:bg-gray-800/50 rounded-2xl shadow-lg flex flex-col p-0 h-full overflow-hidden">
      {/* 作者信息头部 */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {displayAvatar ? (
              <Image
                src={displayAvatar}
                alt={author}
                width={48}
                height={48}
                className="rounded-full border-2 border-gray-200 dark:border-gray-600"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                {author.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="ml-4">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{author}</h2>
                {author_role && (
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeStyle(author_role)}`}>
                    {author_role}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <span>{time}</span>
                </div>
                {author_department && (
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-1" />
                    <span>{author_department}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {category && (
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
              {category}
            </span>
          )}
        </div>
      </div>

      {/* 主体内容+作者信息+相关推荐整体可滚动 */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col">
          {/* 帖子内容 */}
          <div className="p-6 flex flex-col">
            {/* 图片区域 */}
            {(typeof image === 'string' && image.trim() !== '') ? (
              <div className="mb-6 rounded-xl overflow-hidden">
                <Image
                  src={image}
                  alt="Post image"
                  width={800}
                  height={500}
                  className="w-full h-auto object-cover"
                />
              </div>
            ) : (Array.isArray(images) && images.length > 0 && typeof images[0] === 'string' && images[0].trim() !== '') ? (
              <div className="mb-6 rounded-xl overflow-hidden">
                <Image
                  src={images[0]}
                  alt="Post image"
                  width={800}
                  height={500}
                  className="w-full h-auto object-cover"
                />
              </div>
            ) : null}

            {/* 标题 */}
            {content && (
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 break-words">
                {content.length > 40 ? content.slice(0, 40) + '...' : content}
              </h2>
            )}

            <div className="prose prose-lg max-w-none dark:prose-invert">
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{content}</p>
            </div>

            {/* 标签 */}
            {tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 互动栏 */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-around">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isLiked
                  ? 'bg-red-50 dark:bg-red-900/30 text-red-500'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
              onClick={handleLike}
              disabled={isProcessing}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-medium">{likeCount}</span>
            </button>

            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">{comments || 0}</span>
            </div>

            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-all"
              onClick={handleShare}
              disabled={isProcessing}
            >
              <Share2 className="w-5 h-5" />
              <span className="font-medium">{shareCount}</span>
            </button>
          </div>

          {/* --- 作者信息和相关推荐 --- */}
          <div className="p-6 space-y-6">
            {/* 作者信息卡片 */}
            <div className="bg-white/50 dark:bg-gray-800/80 rounded-2xl shadow-lg p-6">
              <h4 className="font-semibold mb-4 flex items-center text-gray-900 dark:text-gray-100">
                <User className="w-5 h-5 mr-2 text-blue-500" />
                作者信息
              </h4>
              <div className="text-center">
                {displayAvatar ? (
                  <Image
                    src={displayAvatar}
                    alt={author}
                    width={80}
                    height={80}
                    className="rounded-full mx-auto mb-3 border-4 border-gray-100 dark:border-gray-700"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                    {author.charAt(0).toUpperCase()}
                  </div>
                )}
                <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-gray-100">{author}</h3>
                {author_role && (
                  <span className={`inline-block px-2 py-1 rounded text-sm font-medium mb-2 ${getRoleBadgeStyle(author_role)}`}>
                    {author_role}
                  </span>
                )}
                {author_department && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <Building className="w-4 h-4 inline mr-1" />
                    {author_department}
                  </p>
                )}
                {author_grade && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {author_grade}
                  </p>
                )}
                {author_bio && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-left">
                    {author_bio}
                  </p>
                )}
              </div>
            </div>
            {/* 相关推荐卡片 */}
            <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-lg p-6">
              <h4 className="font-semibold mb-4 flex items-center text-gray-900 dark:text-gray-100">
                <span className="w-5 h-5 mr-2 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full flex items-center justify-center text-white text-base font-bold">荐</span>
                相关推荐
              </h4>
              <ul className="space-y-2">
                <li className="text-sm text-gray-500 dark:text-gray-400">更多精彩内容即将推出...</li>
                {/* <li>
                  <a href="/post/123" className="text-blue-500 hover:underline">示例推荐帖子标题</a>
                </li> */}
              </ul>
            </div>
          </div>
          {/* --- END --- */}
        </div>
      </div>
    </div>
  )

  if (disableLink && isSelected) {
    // 展开详情模式
    return (
      <div className="block w-full h-full">
        {detailBlock}
      </div>
    )
  }

  if (disableLink) {
    // 主页卡片模式
    return (
      <div className="block w-full h-full" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
        {contentBlock}
      </div>
    )
  }

  // 其它页面用，允许跳转
  return (
    <Link href={postType === 'lostAndFound' ? `/lost-and-found/${id}` : `/post/${id}`} className="block w-full h-full">
      {contentBlock}
    </Link>
  )
}

export default Post

