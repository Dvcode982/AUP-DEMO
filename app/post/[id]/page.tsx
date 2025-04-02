'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import { postsAPI } from '@/lib/api'
import { useBackground } from '@/app/contexts/BackgroundContext'

export default function PostPage() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [commentLoading, setCommentLoading] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [shareCount, setShareCount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  // 在组件加载时请求数据
  useEffect(() => {
    async function fetchData() {
      if (id) {
        try {
          setLoading(true)
          // 获取帖子详情
          const postData = await postsAPI.getPostById(id.toString())
          setPost(postData)
          
          // 设置点赞和分享数量
          if (postData.likes) setLikeCount(postData.likes)
          if (postData.shares) setShareCount(postData.shares)
          
          // 获取帖子评论
          const commentsData = await postsAPI.getPostComments(id.toString())
          setComments(commentsData)
          
          // 检查用户是否已点赞
          try {
            const likedStatus = await postsAPI.checkLiked(id.toString())
            setIsLiked(likedStatus.liked)
          } catch (error) {
            console.error('Error checking like status:', error)
          }
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
  
  // 处理点赞
  const handleLike = async () => {
    if (isProcessing) return
    
    try {
      setIsProcessing(true)
      const response = await postsAPI.likePost(id.toString())
      setLikeCount(response.likes)
      setIsLiked(response.liked)
    } catch (error) {
      console.error('Error liking post:', error)
    } finally {
      setIsProcessing(false)
    }
  }
  
  // 处理分享
  const handleShare = async () => {
    if (isProcessing) return
    
    try {
      setIsProcessing(true)
      
      // 创建分享链接
      const shareUrl = `${window.location.origin}/post/${id}`
      
      // 尝试使用Web Share API
      if (navigator.share) {
        await navigator.share({
          title: post ? `${post.author}的帖子` : '分享帖子',
          text: post ? (post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '')) : '',
          url: shareUrl
        })
      } else {
        // 回退到复制链接
        await navigator.clipboard.writeText(shareUrl)
        alert('链接已复制到剪贴板')
      }
      
      // 记录分享行为
      const response = await postsAPI.sharePost(id.toString())
      setShareCount(response.shares)
    } catch (error) {
      console.error('Error sharing post:', error)
      // 如果是用户取消分享，不显示错误
      if (error instanceof Error && error.name !== 'AbortError') {
        alert('分享失败，请重试')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm rounded-lg shadow-md p-8">
        <div className="text-center">加载中...</div>
      </div>
    </div>
  )

  if (!post) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm rounded-lg shadow-md p-8">
        <div className="text-center">帖子不存在或加载失败</div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col items-center min-h-screen py-8 px-4">
      <div className="w-full max-w-3xl">
        <Link href="/" className="flex items-center mb-4 text-blue-500 hover:text-blue-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          返回帖子列表
        </Link>
        
        {/* 帖子内容卡片 */}
        <div className="bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm rounded-lg shadow-md p-6 mb-6 transition-all duration-300 hover:shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <Image 
              src={post.avatar || '/placeholder.svg?height=48&width=48'} 
              alt={post.author} 
              width={48} 
              height={48} 
              className="rounded-full mr-3 border-2 border-gray-200 dark:border-gray-600" 
            />
            <div>
              <h2 className="font-bold text-lg">{post.author}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{post.time}</p>
            </div>
          </div>

          {post.image && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <Image 
                src={post.image} 
                alt="Post image" 
                width={800} 
                height={500} 
                className="w-full h-auto object-cover rounded-lg transition-transform duration-300 hover:scale-[1.01]" 
              />
            </div>
          )}

          <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg leading-relaxed">{post.content}</p>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, index) => (
                <span key={index} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 hover:bg-blue-200 dark:hover:bg-blue-800">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button 
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${isLiked ? 'text-red-500 bg-red-50 dark:bg-red-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              onClick={handleLike}
            >
              <Heart size={20} className={isLiked ? "fill-red-500" : ""} />
              <span>{likeCount} 点赞</span>
            </button>
            
            <div className="flex items-center space-x-2 px-4 py-2">
              <MessageCircle size={20} />
              <span>{comments.length} 评论</span>
            </div>
            
            <button 
              className="flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={handleShare}
            >
              <Share2 size={20} />
              <span>{shareCount} 分享</span>
            </button>
          </div>
        </div>

        {/* 评论部分 */}
        <div className="bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm rounded-lg shadow-md p-6 mb-6 transition-all duration-300 hover:shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-xl mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">评论 ({comments.length})</h3>
          
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="pb-4 last:pb-0 border-b last:border-b-0 border-gray-100 dark:border-gray-700">
                  <div className="flex items-start">
                    <Image 
                      src={comment.avatar || '/placeholder.svg?height=32&width=32'} 
                      alt={comment.author} 
                      width={32} 
                      height={32} 
                      className="rounded-full mr-3 mt-1" 
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-semibold">{comment.author}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{comment.time}</p>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MessageCircle className="mx-auto mb-2 opacity-50" size={32} />
              <p>暂无评论，来发表第一条评论吧</p>
            </div>
          )}
        </div>

        {/* 评论表单 */}
        <form onSubmit={handleSubmitComment} className="bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-xl mb-4">发表评论</h3>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="写下你的评论..."
            className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 dark:text-white"
            rows={4}
            disabled={commentLoading}
          />
          <button 
            type="submit" 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center"
            disabled={commentLoading || !newComment.trim()}
          >
            {commentLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                提交中...
              </>
            ) : '提交评论'}
          </button>
        </form>
      </div>
    </div>
  )
}
