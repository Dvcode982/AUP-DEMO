'use client'

import { useSearchParams } from 'next/navigation'
import Sidebar from '../components/Sidebar'
import CreateLostFound from '../components/create-lost-found'
import { useTranslation } from '../hooks/useTranslation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CreateLostFoundPage() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type') as 'lost' | 'found' || 'lost'
  const { t } = useTranslation()

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航栏 */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="/lost-and-found"
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('lostFound.createPost')}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {type === 'lost' ? t('lostFound.lostDescription') : t('lostFound.foundDescription')}
                </p>
              </div>
              
              {/* 类型指示器 */}
              <div className={`px-4 py-2 rounded-xl text-sm font-medium ${
                type === 'lost' 
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' 
                  : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              }`}>
                {type === 'lost' ? '🔍 ' + t('lostFound.lostItem') : '📦 ' + t('lostFound.foundItem')}
              </div>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <CreateLostFound initialType={type} />
          </div>
        </div>
      </main>
    </div>
  )
}