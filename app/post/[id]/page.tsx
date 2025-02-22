'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

// 假设我们有一个 API 请求来获取数据
async function fetchPostData(id: string) {
  // 这里模拟 API 请求，实际开发中你需要替换为实际的 API 调用
  const response = await fetch(`/api/posts/${id}`);
  const data = await response.json();
  return data;
}

export default function PostPage() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [newComment, setNewComment] = useState('')

  // 在组件加载时请求数据
  useEffect(() => {
    if (id) {
      fetchPostData(id).then((data) => setPost(data));
    }
  }, [id]);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    // 提交评论逻辑，实际应用中应该调用 API 来保存评论
    console.log('提交评论:', newComment)
    setNewComment('')
  }

  if (!post) return <div>帖子不存在或加载失败</div>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Link href="/" className="flex items-center mb-4 text-blue-500 hover:underline">
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

      {/* 评论部分 */}
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

      {/* 评论表单 */}
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
