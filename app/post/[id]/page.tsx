'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { postsAPI } from '@/lib/api'

export default function PostPage() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [commentLoading, setCommentLoading] = useState(false)

  // 在组件加载时请求数据
  useEffect(() => {
    async function fetchData() {
      if (id) {
        try {
          setLoading(true)
          // 获取帖子详情
          const postData = await postsAPI.getPostById(id.toString())
          setPost(postData)
          
          // 获取帖子评论
          const commentsData = await postsAPI.getPostComments(id.toString())
          setComments(commentsData)
        } catch (error) {
          console.error('Error fetching post data:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    
    fetchData()
  }, [id]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    
    try {
      setCommentLoading(true)
      // 调用API添加评论
      await postsAPI.addComment(id.toString(), newComment)
      
      // 重新获取评论列表
      const commentsData = await postsAPI.getPostComments(id.toString())
      setComments(commentsData)
      setNewComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setCommentLoading(false)
    }
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
        {comments.length > 0 ? (
          comments.map(comment => (
            <div key={comment.id} className="mb-2 pb-2 border-b last:border-b-0">
              <p className="font-semibold">{comment.author}</p>
              <p className="text-gray-700">{comment.content}</p>
              <p className="text-xs text-gray-500">{comment.time}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">暂无评论</p>
        )}
      </div>

      {/* 评论表单 */}
      <form onSubmit={handleSubmitComment} className="bg-white rounded-lg shadow-md p-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="写下你的评论..."
          className="w-full p-2 border rounded mb-2"
          rows={3}
          disabled={commentLoading}
        />
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={commentLoading || !newComment.trim()}
        >
          {commentLoading ? '提交中...' : '提交评论'}
        </button>
      </form>
    </div>
  )
}
