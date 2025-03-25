import Image from 'next/image'
import Link from 'next/link'
import { Check, MessageCircle, Heart, Share2 } from 'lucide-react'

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
}

const Post = ({ id, author, avatar, content, image, images = [], time, tags, isLostAndFound, isReturned, returnedTime, postType = 'forum', likes = 0, comments = 0, shares = 0 }: PostProps) => {
  // 处理图片显示逻辑
  const hasMultipleImages = image && images.length > 0 ? true : (images.length > 1);
  const displayImage = image || (images.length > 0 ? images[0] : undefined);
  const additionalImagesCount = images.length > 0 ? images.length - 1 : 0;
  return (
    <Link href={postType === 'lostAndFound' ? `/lost-and-found/${id}` : `/post/${id}`} className="block w-full h-full">
      <div className="bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm rounded-lg shadow-sm overflow-hidden hover-lift relative border border-gray-100 dark:border-gray-700 h-full flex flex-col group card-dynamic-height transition-all duration-300 hover:shadow-md">
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
              src={avatar}
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
          
          {displayImage && (
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
            <div className="flex items-center space-x-1 hover:text-blue-500 transition-colors cursor-pointer">
              <Heart size={18} className={likes > 0 ? "text-red-500" : ""} />
              <span className="text-xs">{likes > 0 ? likes : "点赞"}</span>
            </div>
            <div className="flex items-center space-x-1 hover:text-blue-500 transition-colors cursor-pointer">
              <MessageCircle size={18} />
              <span className="text-xs">{comments > 0 ? comments : "评论"}</span>
            </div>
            <div className="flex items-center space-x-1 hover:text-blue-500 transition-colors cursor-pointer">
              <Share2 size={18} />
              <span className="text-xs">{shares > 0 ? shares : "分享"}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default Post

