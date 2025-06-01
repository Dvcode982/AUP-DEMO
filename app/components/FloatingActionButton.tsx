'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useLanguage } from '../contexts/LanguageContext'

export default function FloatingActionButton() {
  const pathname = usePathname()
  const { t } = useLanguage()
  
  // 根据当前路径决定创建按钮的链接
  const createLink = pathname.includes('/lost-and-found') 
    ? '/create-lost-found' 
    : '/create-post'
  
  return (
    <Link 
      href={createLink} 
      className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl backdrop-blur-sm border border-blue-400 z-50 group"
      aria-label={pathname.includes('/lost-and-found') ? t('fab.createLostAndFound') : t('fab.createPost')}
    >
      <Plus size={24} />
      <span className="absolute -top-10 right-0 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 text-gray-800 dark:text-gray-200 text-xs py-1 px-2 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        {pathname.includes('/lost-and-found') ? t('fab.createLostAndFound') : t('fab.createPost')}
      </span>
    </Link>
  )
}

