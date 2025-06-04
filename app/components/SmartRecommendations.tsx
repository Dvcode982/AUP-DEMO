'use client'

import { useState, useEffect } from 'react'
import Post from './Post'
import { Sparkles, TrendingUp, Clock } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'

interface SmartRecommendationsProps {
  query?: string
  userId?: string
  title?: string
  maxItems?: number
  showHeader?: boolean
  className?: string
  onStatsUpdate?: (stats: { total: number, displayed: number, query?: string }) => void
}

export default function SmartRecommendations({
  query,
  userId,
  title,
  maxItems = 6,
  showHeader = true,
  className = '',
  onStatsUpdate
}: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { t } = useTranslation()

  useEffect(() => {
    fetchRecommendations()
  }, [query, userId])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      setError('')
      
      const params = new URLSearchParams()
      if (query) params.append('query', query)
      if (userId) params.append('userId', userId)
      
      const response = await fetch(`/api/smart-recommendations?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('获取推荐失败')
      }
      
      const data = await response.json()
      
      // 处理新的API响应格式
      const posts = data.posts || []
      const total = data.total || 0
      
      setRecommendations(posts.slice(0, maxItems))
      setTotalCount(total)
      
      // 回调统计信息
      if (onStatsUpdate) {
        onStatsUpdate({
          total,
          displayed: Math.min(posts.length, maxItems),
          query: query
        })
      }
    } catch (err: any) {
      console.error('获取智能推荐失败:', err)
      setError(err.message || '获取推荐失败')
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`${className}`}>
        {showHeader && (
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">{title || '智能推荐'}</h3>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${className}`}>
        {showHeader && (
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold">{title || '智能推荐'}</h3>
          </div>
        )}
        <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={fetchRecommendations}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className={`${className}`}>
        {showHeader && (
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold">{title || '智能推荐'}</h3>
          </div>
        )}
        <div className="text-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">暂无推荐内容</p>
        </div>
      </div>
    )
  }

  const getRecommendationType = () => {
    if (query) {
      return {
        icon: <TrendingUp className="w-5 h-5 text-green-500" />,
        label: '相关推荐',
        description: `基于"${query}"为您推荐`,
        stats: totalCount > 0 ? `找到 ${totalCount} 个相关帖子` : ''
      }
    }
    return {
      icon: <Clock className="w-5 h-5 text-blue-500" />,
      label: '热门推荐',
      description: '基于热度和时间为您推荐',
      stats: totalCount > 0 ? `共 ${totalCount} 个帖子` : ''
    }
  }

  const recType = getRecommendationType()

  return (
    <div className={`${className}`}>
      {showHeader && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {recType.icon}
              <h3 className="text-lg font-semibold">{title || recType.label}</h3>
            </div>
            {recType.stats && (
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">
                📊 {recType.stats}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{recType.description}</p>
          {totalCount > recommendations.length && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              显示前 {recommendations.length} 个结果
            </p>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {recommendations.map((post, index) => (
          <div key={post.id} className="relative">
            <Post {...post} />
            {/* 推荐评分指示器 */}
            {(post.relevanceScore > 0 || post.popularityScore > 0) && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                #{index + 1}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {recommendations.length >= maxItems && (
        <div className="mt-4 text-center">
          <button
            onClick={fetchRecommendations}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            查看更多推荐
          </button>
        </div>
      )}
    </div>
  )
} 