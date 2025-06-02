'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { lostAndFoundAPI } from '@/lib/api'
import { useLanguage } from '@/app/contexts/LanguageContext'

interface LostAndFoundItemData {
  id: string | number;
  author?: string | null;
  avatar?: string | null;
  content?: string;
  isReturned?: boolean;
  returnedTime?: string | null;
  tags?: string[];
  time?: string;
}

interface LostAndFoundCommentData {
  id: string | number;
  author?: string | null;
  content?: string;
  time?: string;
}

export default function LostAndFoundItemPage() {
  const { id } = useParams()
  const { t } = useLanguage()
  const [item, setItem] = useState<LostAndFoundItemData | null>(null)
  const [comments, setComments] = useState<LostAndFoundCommentData[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [commentLoading, setCommentLoading] = useState(false)
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)

  // 在组件加载时请求数据
  useEffect(() => {
    async function fetchData() {
      if (id) {
        try {
          setLoading(true)
          // 获取失物招领详情
          const itemData: LostAndFoundItemData = await lostAndFoundAPI.getLostAndFoundItemById(id.toString())
          setItem(itemData)
          
          // 获取评论列表
          const commentsData: LostAndFoundCommentData[] = await lostAndFoundAPI.getLostAndFoundComments(id.toString())
          setComments(commentsData)
        } catch (error) {
          console.error('Error fetching lost and found item data:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    
    fetchData()
  }, [id]);

  // 提交评论
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !id) return
    
    try {
      setCommentLoading(true)
      // 调用API添加评论
      await lostAndFoundAPI.addLostAndFoundComment(id.toString(), newComment)
      
      // 重新获取评论列表
      const commentsData: LostAndFoundCommentData[] = await lostAndFoundAPI.getLostAndFoundComments(id.toString())
      setComments(commentsData)
      setNewComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setCommentLoading(false)
    }
  }

  // 标记为已找到/已归还
  const handleMarkAsReturned = async () => {
    if (!item || item.isReturned || !id) return
    
    try {
      setStatusUpdateLoading(true)
      // 调用API标记为已归还
      await lostAndFoundAPI.markAsReturned(id.toString())
      
      // 重新获取物品详情
      const itemData: LostAndFoundItemData = await lostAndFoundAPI.getLostAndFoundItemById(id.toString())
      setItem(itemData)
      
      // 添加系统评论，记录状态更新
      await lostAndFoundAPI.addLostAndFoundComment(id.toString(), '物品已标记为找到/归还')
      
      // 重新获取评论列表
      const commentsData: LostAndFoundCommentData[] = await lostAndFoundAPI.getLostAndFoundComments(id.toString())
      setComments(commentsData)
    } catch (error) {
      console.error('Error marking item as returned:', error)
    } finally {
      setStatusUpdateLoading(false)
    }
  }

  if (loading) return <div className="max-w-2xl mx-auto p-4 text-center">{t('common.loading')}</div>
  if (!item) return <div className="max-w-2xl mx-auto p-4 text-center">{t('error.notFound')}</div>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Link href="/lost-and-found" className="flex items-center mb-4 text-blue-500 hover:underline">
        {t('lostAndFound.backToList')}
      </Link>
      
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex items-center mb-2">
          <Image src={item?.avatar || '/placeholder.svg?height=40&width=40'} alt={item?.author || ''} width={40} height={40} className="rounded-full mr-2" />
          <h2 className="font-bold">{item?.author || ''}</h2>
        </div>

        <p className="text-gray-700 mb-2">{item?.content}</p>

        <div className="flex flex-wrap gap-2 mb-2">
          {item?.tags && item.tags.map((tag: string, index: number) => (
            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              {t(`topic.#${tag}`, { tag: tag })}
            </span>
          ))}
        </div>

        <div className="mt-4 p-2 bg-gray-50 rounded">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">
              {t('common.status')}: {item?.isReturned ? (
                <span className="text-green-500">{t('post.status.returned', { returnedTime: item.returnedTime ? `(${item.returnedTime})` : '' })}</span>
              ) : (
                <span className="text-red-500">{t('post.status.notFound')}</span>
              )}
            </p>
            {!item?.isReturned && (
              <button 
                onClick={handleMarkAsReturned}
                disabled={statusUpdateLoading}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:bg-gray-400"
              >
                {t('lostAndFound.markAsReturnedButton')}
              </button>
            )}
            {!item?.isReturned && statusUpdateLoading && (
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('lostAndFound.submittingComment')}</span>
             )}
          </div>
        </div>

        <p className="text-xs text-gray-500 text-right mt-2">{item?.time}</p>
      </div>
      
      {/* 评论部分 */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h3 className="font-bold mb-2">{t('post.comment')}</h3>
        {comments.length > 0 ? (
          comments.map(comment => (
            <div key={comment.id} className="mb-2 pb-2 border-b last:border-b-0">
              <p className="font-semibold">{comment.author}</p>
              <p className="text-gray-700">{comment.content}</p>
              <p className="text-xs text-gray-500">{comment.time}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">{t('post.noComments')}</p>
        )}
      </div>

      {/* 评论表单 */}
      <form onSubmit={handleSubmitComment} className="bg-white rounded-lg shadow-md p-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={t('lostAndFound.writeComment')}
          className="w-full p-2 border rounded mb-2"
          rows={3}
          disabled={commentLoading}
        />
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={commentLoading || !newComment.trim()}
        >
          {commentLoading ? t('lostAndFound.submittingComment') : t('lostAndFound.submitComment')}
        </button>
      </form>
    </div>
  )
}