import Image from 'next/image'
import Link from 'next/link'
import { Check } from 'lucide-react'

interface PostProps {
  id: number
  author: string
  avatar: string
  content: string
  image?: string
  time: string
  tags: string[]
  isLostAndFound?: boolean
  isReturned?: boolean
  returnedTime?: string
  postType?: 'forum' | 'lostAndFound'
}

const Post = ({ id, author, avatar, content, image, time, tags, isLostAndFound, isReturned, returnedTime, postType = 'forum' }: PostProps) => {
  return (
    <Link href={postType === 'lostAndFound' ? `/lost-and-found/${id}` : `/post/${id}`} className="block">
      <div className="bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 rounded-lg shadow-sm overflow-hidden hover-lift relative">
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
          <Image
            src={avatar}
            alt={author}
            width={40}
            height={40}
            className="rounded-full absolute top-2 left-2"
          />
          <div className="ml-12 mb-2">
            <h3 className="font-bold">{author}</h3>
          </div>
          {image && (
            <div className="mb-2">
              <Image src={image} alt="Post image" width={300} height={200} className="w-full h-auto rounded" />
            </div>
          )}
          <p className="text-gray-700 dark:text-gray-300 mb-2">{content}</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, index) => (
              <span key={index} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-right">{time}</p>
        </div>
      </div>
    </Link>
  )
}

export default Post

