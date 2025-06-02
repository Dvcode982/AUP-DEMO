'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Home, Search, User, Palette, HelpCircle, LogIn, LogOut, Sun, Moon, Contact, Shapes, Settings, UserCircle } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useBackground } from '../contexts/BackgroundContext'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

const Sidebar = () => {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { isCustomBackground, toggleBackground } = useBackground()
  const { isAuthenticated, user, logout } = useAuth()
  const { t } = useLanguage()

  useEffect(() => {
    setMounted(true)
  }, [])

  // 如果还未加载客户端，返回 null 以避免 Hydration 错误
  if (!mounted) {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const menuItems = [
    { href: '/messages', label: t('nav.messages'), icon: Contact },
    { href: '/lost-and-found', label: t('nav.lostAndFound'), icon: Search },
    { href: '/', label: t('nav.home'), icon: Home },
    { href: '/topic-block', label: t('nav.topic'), icon: Shapes },
    { href: '/setting', label: t('nav.settings'), icon: Settings },
    { href: '/feedback', label: t('nav.feedback'), icon: HelpCircle },
  ]

  return (
    <aside className="flex flex-col w-16 md:w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300">
      {/* 用户信息区域 */}
      <div className="p-4">
        {isAuthenticated && user ? (
          <Link href="/my-profile" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.username || t('common.unnamed')}
                  fill
                  className="object-cover"
                />
              ) : (
                <UserCircle className="w-full h-full text-gray-400 dark:text-gray-500" />
              )}
            </div>
            <div className="flex-1 hidden md:block">
              <div className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1">
                {user.username || t('common.unnamed')}
                {user.role && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 ml-2">
                    {user.role}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                {user.grade} {user.department || ''}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 truncate">
                {user.email}
              </p>
            </div>
          </Link>
        ) : (
          <Link href="/login" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600">
              <UserCircle className="w-full h-full text-gray-400 dark:text-gray-500" />
            </div>
            <div className="flex-1 hidden md:block">
              <div className="font-medium text-gray-800 dark:text-gray-200">
                {t('nav.login')}
              </div>
            </div>
          </Link>
        )}
        <div className="bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent h-[1px] hidden md:block"></div>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center p-2 rounded-lg transition-colors duration-200 ${
                  pathname === item.href
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-800 hover:text-blue-600 dark:hover:text-blue-300'
                }`}
              >
                <item.icon className="w-4 h-4 md:mr-3" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            </li>
          ))}
          
          {/* 主题与外观设置 */}
          <li>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center w-full p-2 text-left rounded-lg text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-800 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 md:mr-3" /> : <Moon className="w-4 h-4 md:mr-3" />}
              <span className="hidden md:inline">{theme === 'dark' ? t('settings.theme.light') : t('settings.theme.dark')}</span>
            </button>
          </li>
          
          <li>
            <button
              onClick={toggleBackground}
              className="flex items-center w-full p-2 text-left rounded-lg text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-800 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200"
            >
              <Palette className="w-4 h-4 md:mr-3" />
              <span className="hidden md:inline">{isCustomBackground ? t('settings.background.off') : t('settings.background.on')}</span>
            </button>
          </li>
          
          {/* 登出按钮，仅在登录状态显示 */}
          {isAuthenticated && (
            <li className="mt-4">
              <button
                onClick={handleLogout}
                className="flex items-center w-full p-2 text-left rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-300 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 md:mr-3" />
                <span className="hidden md:inline">{t('nav.logout')}</span>
              </button>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
