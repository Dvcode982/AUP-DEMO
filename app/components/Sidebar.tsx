'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Home, Search, User, Palette, HelpCircle, LogIn, LogOut, Sun, Moon, Contact, Shapes, Settings, UserCircle } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useBackground } from '../contexts/BackgroundContext'
import { useAuth } from '../contexts/AuthContext'

const Sidebar = () => {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { isCustomBackground, toggleBackground } = useBackground()
  const { isAuthenticated, user, logout } = useAuth()

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
    { href: '/messages', label: '坪友列表', icon: Contact },
    { href: '/lost-and-found', label: '失物找寻', icon: Search },
    { href: '/', label: '论坛', icon: Home },
    { href: '/topic-block', label: '主题板块', icon: Shapes },
    { href: '/setting', label: '设置', icon: Settings },
    { href: '/feedback', label: '反馈', icon: HelpCircle },
  ];

  return (
    <aside className="flex flex-col w-[60px] md:w-60 bg-white dark:bg-gray-800 shadow-sm p-1 md:p-2 transition-all duration-300 h-screen">
      <div className="mb-3 md:mb-6 p-2 md:p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <h1 className="text-sm md:text-xl text-gray-800 dark:text-gray-200 mb-2 md:mb-4 text-center hidden md:block">爱邮坪AUP</h1>
        <h1 className="text-sm text-gray-800 dark:text-gray-200 mb-2 text-center md:hidden">AUP</h1>
        
        {isAuthenticated && user ? (
          // 已登录状态显示用户信息
          <Link href="/my-profile" className="block">
            <div className="flex flex-col md:flex-row items-center md:space-x-3 p-1 md:p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-800 hover:text-blue-600 dark:hover:text-blue-300 transition-colors">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt="用户头像"
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-blue-400"
                />
              ) : (
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="flex-1 hidden md:block">
                <div className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1">
                  {user.username || '未设置昵称'}
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
            </div>
            <div className="mt-2 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent h-[1px] hidden md:block"></div>
            <div className="text-center text-xs text-blue-600 dark:text-blue-400 mt-2 hover:underline hidden md:block">
              点击编辑个人资料
            </div>
          </Link>
        ) : (
          // 未登录状态显示登录入口
          <div className="bg-blue-50 dark:bg-gray-700 rounded-lg md:p-3 text-center shadow-sm">
            <div className="flex justify-center md:mb-2">
              <UserCircle className="w-8 h-8 md:w-12 md:h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mb-2 md:mb-3 hidden md:block">登录后体验更多功能</p>
            <div className="flex flex-col md:flex-row gap-1 md:gap-2">
              <Link
                href="/login"
                className="flex-1 py-1 md:py-1.5 px-2 md:px-3 bg-blue-600 hover:bg-blue-800 text-white text-xs md:text-sm rounded-md transition-colors duration-200 flex items-center justify-center"
              >
                <LogIn className="w-3 h-3 md:w-3.5 md:h-3.5 md:mr-1" />
                <span className="hidden md:inline">登录</span>
              </Link>
              <Link
                href="/register"
                className="flex-1 py-1 md:py-1.5 px-2 md:px-3 border border-blue-400 text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 text-xs md:text-sm rounded-md transition-colors duration-200 flex items-center justify-center"
              >
                <span className="hidden md:inline">注册</span>
                <span className="md:hidden">注</span>
              </Link>
            </div>
          </div>
        )}
      </div>
      
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
          <li className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center w-full p-2 text-left rounded-lg text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-800 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 md:mr-3" /> : <Moon className="w-4 h-4 md:mr-3" />}
              <span className="hidden md:inline">{theme === 'dark' ? '日间模式' : '夜间模式'}</span>
            </button>
            
            <button
              onClick={toggleBackground}
              className="flex items-center w-full p-2 text-left rounded-lg text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-800 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200"
            >
              <Palette className="w-4 h-4 md:mr-3" />
              <span className="hidden md:inline">界面主题切换</span>
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
                <span className="hidden md:inline">退出登录</span>
              </button>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
