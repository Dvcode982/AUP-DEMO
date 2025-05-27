'use client'

import { useState, useEffect } from 'react'
import { topicAggregationAPI } from '@/lib/api'
import { useAuth } from '../contexts/AuthContext'
import Link from 'next/link'
import { TrendingUp, Tag } from 'lucide-react'

interface TopicRecommendation {
  topic: string
  score: number
  relatedTags: Array<{ tag: string; count: number }>
}

interface TagRecommendation {
  tag: string
  score: number
}

export default function TopicRecommendations() {
  const { isAuthenticated } = useAuth()
  const [recommendations, setRecommendations] = useState<TopicRecommendation[]>([])
  const [topTags, setTopTags] = useState<TagRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    fetchRecommendations()
  }, [isAuthenticated])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      const data = await topicAggregationAPI.getTopicRecommendations()
      setRecommendations(data.recommendations || [])
      setTopTags(data.topTags || [])
    } catch (err) {
      console.error('Failed to fetch recommendations:', err)
      setError('无法加载推荐内容')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          为您推荐
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          登录后查看个性化推荐
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    )
  }

  // 主题颜色配置
  const getTopicColor = (topic: string) => {
    const colors: Record<string, string> = {
      '学术交流': 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30',
      '资源分享': 'text-cyan-600 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-900/30',
      '竞赛交流': 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30',
      '校园生活': 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/30',
      '校园杂谈': 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/30',
      '技术交流': 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30',
      '表白墙': 'text-pink-600 bg-pink-50 dark:text-pink-400 dark:bg-pink-900/30',
      '就业兼职': 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30'
    }
    return colors[topic] || 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/30'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-500" />
        为您推荐
      </h3>

      {/* 推荐主题 */}
      {recommendations.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">推荐主题</h4>
          <div className="space-y-3">
            {recommendations.slice(0, 3).map((rec) => (
              <Link
                key={rec.topic}
                href={`/topic-block/${encodeURIComponent(rec.topic)}`}
                className="block"
              >
                <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all hover:-translate-y-0.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTopicColor(rec.topic)}`}>
                      {rec.topic}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      热度 {Math.round(rec.score)}
                    </span>
                  </div>
                  {rec.relatedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {rec.relatedTags.slice(0, 5).map((tag) => (
                        <span
                          key={tag.tag}
                          className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                        >
                          #{tag.tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 热门标签 */}
      {topTags.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1">
            <Tag className="w-4 h-4" />
            热门标签
          </h4>
          <div className="flex flex-wrap gap-2">
            {topTags.slice(0, 10).map((tag) => (
              <Link
                key={tag.tag}
                href={`/search?tag=${encodeURIComponent(tag.tag)}`}
                className="inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                #{tag.tag}
                <span className="ml-1 text-blue-400 dark:text-blue-500">
                  {Math.round(tag.score)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {recommendations.length === 0 && topTags.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          继续浏览和互动，我们将为您推荐感兴趣的内容
        </p>
      )}
    </div>
  )
} 