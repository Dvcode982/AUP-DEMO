'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Home, Search, Calendar, User, MessageCircle, HelpCircle, LogIn, LogOut, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'

const Sidebar = () => {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false) // This should be managed by your auth system
  const { theme, setTheme } = useTheme()

  const handleLogout = () => {
    // Handle logout logic here
    setIsLoggedIn(false)
  }

  const menuItems = [
    { href: '/lost-and-found', label: '失物找寻', icon: Search },
    { href: '/', label: '看看帖', icon: Home },
    { href: '/ai-planner', label: '我的AI规划师', icon: Calendar },
    { href: '/my-profile', label: '我的', icon: User },
    { href: '/messages', label: '私信', icon: MessageCircle },
    { href: '/feedback', label: '反馈', icon: HelpCircle },
  ]

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-sm p-4">
      <div className="mb-6 p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">爱邮坪AUP</h1>
        <div className="flex items-center space-x-3">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-54nShoDlD5GQ9jy3XJEdfm49DiSOZP.png"
            alt="User avatar"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <h2 className="font-medium text-gray-800 dark:text-gray-200">BYD</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">2024级学生</p>
          </div>
        </div>
      </div>
      <nav>
        <ul className="space-y-2">
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
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
          <li>
            {isLoggedIn ? (
              <button 
                onClick={handleLogout}
                className="flex items-center w-full p-2 text-left rounded-lg text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-800 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200"
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span>登出</span>
              </button>
            ) : (
              <Link 
                href="/login" 
                className={`flex items-center p-2 rounded-lg transition-colors duration-200 ${
                  pathname === '/login'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-800 hover:text-blue-600 dark:hover:text-blue-300'
                }`}
              >
                <LogIn className="w-5 h-5 mr-3" />
                <span>登录</span>
              </Link>
            )}
          </li>
          <li>
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center w-full p-2 text-left rounded-lg text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-800 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 mr-3" /> : <Moon className="w-5 h-5 mr-3" />}
              <span>{theme === 'dark' ? '日间模式' : '夜间模式'}</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar

