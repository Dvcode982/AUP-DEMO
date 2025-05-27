'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Sidebar from '../components/Sidebar'
import Post from '../components/Post'
import { postsAPI } from '@/lib/api'
import { Search, Tag } from 'lucide-react'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchTag, setSearchTag] = useState('')

  useEffect(() => {
    const query = searchParams.get('q') || ''
    const tag = searchParams.get('tag') || ''
    
    setSearchQuery(query)
    setSearchTag(tag)
    
    searchPosts(query, tag)
  }, [searchParams])

  const searchPosts = async (query: string, tag: string) => {
    try {
      setLoading(true)
      const data = await postsAPI.getPosts(query, undefined, tag)
      setPosts(data || [])
    } catch (error) {
      console.error('Error searching posts:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (searchTag) params.set('tag', searchTag)
    
    window.history.pushState({}, '', `/search?${params.toString()}`)
    searchPosts(searchQuery, searchTag)
  }

  return (
    <div className="flex h-screen bg-gradient-to-br">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">搜索结果</h1>
          
          {/* 搜索表单 */}
          <form onSubmit={handleSearch} className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Search className="inline w-4 h-4 mr-1" />
                  关键词搜索
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="输入搜索关键词..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Tag className="inline w-4 h-4 mr-1" />
                  标签搜索
                </label>
                <input
                  type="text"
                  value={searchTag}
                  onChange={(e) => setSearchTag(e.target.value)}
                  placeholder="输入标签名称（不含#）..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              搜索
            </button>
          </form>

          {/* 当前搜索条件 */}
          {(searchQuery || searchTag) && (
            <div className="mb-6 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>当前搜索：</span>
              {searchQuery && (
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                  关键词: {searchQuery}
                </span>
              )}
              {searchTag && (
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full">
                  标签: #{searchTag}
                </span>
              )}
            </div>
          )}

          {/* 搜索结果 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-500 dark:text-gray-400">搜索中...</p>
              </div>
            ) : posts.length > 0 ? (
              posts.map(post => (
                <Post key={post.id} {...post} />
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">
                  没有找到相关内容
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 