'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// 模拟数据,实际应用中应该从API获取
const posts = [
  {
    id: 1,
    author: '用户A',
    avatar: '/placeholder.svg?height=40&width=40',
    content: '今天天气真好!',
    image: '/placeholder.svg?height=200&width=300',
    time: '2023-07-01 10:00',
    tags: ['天气', '心情', '分享'],
    comments: [
      { id: 1, author: '用户B', content: '确实很好!', time: '2023-07-01 10:30' },
      { id: 2, author: '用户C', content: '羡慕,我这里在下雨', time: '2023-07-01 11:00' },
    ]
  },
  // 添加更多帖子...
]

export default function PostPage() {
  const { id } = useParams()
  const post = posts.find(p => p.id === Number(id))
  const [newComment, setNewComment] = useState('')

  if (!post) return <div>帖子不存在</div>

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    // 这里应该调用API来保存评论
    console.log('提交评论:', newComment)
    setNewComment('')
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Link href="/" className="flex items-center mb-4 text-blue-500 hover:underline">
        <ArrowLeft className="mr-2" />
        返回帖子列表
      </Link>
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex items-center mb-2">
          <Image src={post.avatar} alt={post.author} width={40} height={40} className="rounded-full mr-2" />
          <h2 className="font-bold">{post.author}</h2>
        </div>
        {post.image && (
          <Image src={post.image} alt="Post image" width={600} height={400} className="w-full h-auto rounded mb-2" />
        )}
        <p className="text-gray-700 mb-2">{post.content}</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {post.tags.map((tag, index) => (
            <span key={index} className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
              {tag}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-500 text-right">{post.time}</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h3 className="font-bold mb-2">评论</h3>
        {post.comments.map(comment => (
          <div key={comment.id} className="mb-2 pb-2 border-b last:border-b-0">
            <p className="font-semibold">{comment.author}</p>
            <p className="text-gray-700">{comment.content}</p>
            <p className="text-xs text-gray-500">{comment.time}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmitComment} className="bg-white rounded-lg shadow-md p-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="写下你的评论..."
          className="w-full p-2 border rounded mb-2"
          rows={3}
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          提交评论
        </button>
      </form>
    </div>
  )
}

