'use client' // 必须添加在文件最顶部

import Sidebar from '../components/Sidebar'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { useBackground } from '../contexts/BackgroundContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function Feedback() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { toggleBackground } = useBackground()
  const { t } = useLanguage()

  // 防止 hydration 不匹配
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null // 或者加载占位符
  }

  // 动态颜色变量
  const themeClasses = {
    background: theme === 'dark' 
      ? 'bg-gray-900' 
      : 'bg-gradient-to-br from-yellow-50 to-red-50',
    card: theme === 'dark' 
      ? 'bg-gray-800/70 text-gray-200' 
      : 'bg-white/70 text-gray-800',
    input: theme === 'dark'
      ? 'bg-gray-700/70 border-gray-600 text-gray-200'
      : 'bg-white/70 border-gray-300 text-gray-700',
    label: theme === 'dark' 
      ? 'text-gray-300' 
      : 'text-gray-600'
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <button onClick={toggleBackground} className="absolute top-4 right-4 p-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
        {t('settings.background.toggle')}
      </button>
      
      <main className="flex-1 p-4 overflow-hidden">
        <div className="max-w-2xl mx-auto">
          <h1 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
            {t('feedback.title')}
          </h1>
          <div className={`${themeClasses.card} rounded-lg shadow-sm p-4 backdrop-blur-sm`}>
            <form>
              <div className="mb-4">
                <label className={`block text-sm font-medium ${themeClasses.label} mb-2`}>
                  {t('feedback.type')}
                </label>
                <select className={`mt-1 block w-full rounded-md border ${themeClasses.input} shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 backdrop-blur-sm`}>
                  <option>{t('feedback.type.suggestion')}</option>
                  <option>{t('feedback.type.bug')}</option>
                  <option>{t('feedback.type.other')}</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className={`block text-sm font-medium ${themeClasses.label} mb-2`}>
                  {t('feedback.content')}
                </label>
                <textarea 
                  className={`mt-1 block w-full rounded-md border ${themeClasses.input} shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 backdrop-blur-sm`} 
                  rows={5} 
                  placeholder={t('feedback.content.placeholder')}
                />
              </div>

              <button 
                type="submit" 
                className="bg-blue-500/90 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                {t('feedback.submit')}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

