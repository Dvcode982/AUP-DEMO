'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function FloatingActionButton() {
  const pathname = usePathname()
  
  // 根据当前路径决定创建按钮的链接
  const createLink = pathname.includes('/lost-and-found') 
    ? '/create-lost-found' 
    : '/create-post'
  
  return (
    <Link 
      href={createLink} 
      className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl backdrop-blur-sm border border-blue-400 z-50 group"
      aria-label="创建新帖子"
    >
      <Plus size={24} />
      <span className="absolute -top-10 right-0 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 text-gray-800 dark:text-gray-200 text-xs py-1 px-2 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        {pathname.includes('/lost-and-found') ? '发布失物招领' : '发布新帖子'}
      </span>
    </Link>
  )
}

