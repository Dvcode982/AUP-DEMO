'use client'

import { useState, useEffect } from 'react'
import { topicAggregationAPI } from '@/lib/api'
import { useAuth } from '../contexts/AuthContext'
import Link from 'next/link'
import { Tag, Sparkles } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

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
  const { t } = useLanguage()
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
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-blue-500" />
          {t('recommendations.forYou')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-xs">
          {t('recommendations.loginToView')}
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700">
        <p className="text-red-500 text-xs">{error}</p>
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
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
        <Sparkles className="w-4 h-4 text-blue-500" />
        {t('recommendations.forYou')}
      </h3>

      {/* 推荐主题 */}
      {recommendations.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">{t('recommendations.topicsTitle')}</h4>
          <div className="space-y-2">
            {recommendations.slice(0, 3).map((rec) => (
              <Link
                key={rec.topic}
                href={`/topic-block/${encodeURIComponent(rec.topic)}`}
                className="block"
              >
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTopicColor(rec.topic)}`}>
                      {t(`topic.${rec.topic}`) || rec.topic}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {Math.round(rec.score)}°
                    </span>
                  </div>
                  {rec.relatedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {rec.relatedTags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.tag}
                          className="text-xs px-1.5 py-0.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                        >
                          {t(`topic.#${tag.tag}`) || `#${tag.tag}`}
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
          <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {t('recommendations.tagsTitle')}
          </h4>
          <div className="flex flex-wrap gap-1">
            {topTags.slice(0, 8).map((tag) => (
              <Link
                key={tag.tag}
                href={`/search?tag=${encodeURIComponent(tag.tag)}`}
                className="inline-flex items-center px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                {t(`topic.#${tag.tag}`) || `#${tag.tag}`}
              </Link>
            ))}
          </div>
        </div>
      )}

      {recommendations.length === 0 && topTags.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-xs">
          {t('recommendations.noContent')}
        </p>
      )}
    </div>
  )
} 