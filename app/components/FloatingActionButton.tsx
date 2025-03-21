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
    <Link href={createLink} className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-colors duration-200">
      <Plus size={24} />
    </Link>
  )
}

