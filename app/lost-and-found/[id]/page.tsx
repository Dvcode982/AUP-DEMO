'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { lostAndFoundAPI } from '@/lib/api'

export default function LostAndFoundItemPage() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

  // 在组件加载时请求数据
  useEffect(() => {
    async function fetchData() {
      if (id) {
        try {
          setLoading(true)
          // 获取失物招领详情
          const itemData = await lostAndFoundAPI.getLostAndFoundItemById(id.toString())
          setItem(itemData)
        } catch (error) {
          console.error('Error fetching lost and found item data:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    
    fetchData()
  }, [id]);

  if (loading) return <div className="max-w-2xl mx-auto p-4 text-center">加载中...</div>
  if (!item) return <div className="max-w-2xl mx-auto p-4 text-center">物品不存在或加载失败</div>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Link href="/lost-and-found" className="flex items-center mb-4 text-blue-500 hover:underline">
        返回失物招领列表
      </Link>
      
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex items-center mb-2">
          <Image src={item.avatar || '/placeholder.svg?height=40&width=40'} alt={item.author} width={40} height={40} className="rounded-full mr-2" />
          <h2 className="font-bold">{item.author}</h2>
        </div>

        <p className="text-gray-700 mb-2">{item.content}</p>

        <div className="flex flex-wrap gap-2 mb-2">
          {item.tags && item.tags.map((tag, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 p-2 bg-gray-50 rounded">
          <p className="text-sm font-medium">
            状态: {item.isReturned ? (
              <span className="text-green-500">已找到/已归还 ({item.returnedTime})</span>
            ) : (
              <span className="text-red-500">未找到/未归还</span>
            )}
          </p>
        </div>

        <p className="text-xs text-gray-500 text-right mt-2">{item.time}</p>
      </div>
    </div>
  )
}