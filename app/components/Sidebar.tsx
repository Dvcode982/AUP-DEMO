'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Home, Search, Calendar, User, Palette, HelpCircle, LogIn, LogOut, Sun, Moon, Contact, Shapes } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'

const Sidebar = () => {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 这应该由认证系统来控制
  const { theme, setTheme } = useTheme();

  // 控制背景图片切换的状态
  const [isCustomBackground, setIsCustomBackground] = useState(false);

  useEffect(() => {
    setMounted(true); // 客户端加载完成后将 mounted 设置为 true
  }, []);

  // 切换背景图片函数
  const toggleBackgroundImage = () => {
    if (!isCustomBackground) {
      // 设置为指定背景图片，请替换为你实际的图片路径
      document.body.style.backgroundImage = "url('/images/EVA_BG.jpg')";
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundRepeat = "no-repeat";
      setIsCustomBackground(true);
    } else {
      // 恢复原来的背景
      document.body.style.backgroundImage = "";
      setIsCustomBackground(false);
    }
  };

  // 如果还未加载客户端，返回 null 以避免 Hydration 错误
  if (!mounted) {
    return null;
  }

  const menuItems = [
    { href: '/messages', label: '坪友列表', icon: Contact },
    { href: '/lost-and-found', label: '失物找寻', icon: Search },
    { href: '/', label: '论坛', icon: Home },
    { href: '/2', label: '主题板块', icon: Shapes },
    { href: '/1', label: '设置', icon: User },
    { href: '/feedback', label: '反馈', icon: HelpCircle },
  ];

  const handleLogout = () => {
    setIsLoggedIn(false); // 处理登出逻辑
  };

  return (
    <aside className="w-54 bg-white dark:bg-gray-800 shadow-sm p-2">
      <div className="mb-6 p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl text-gray-800 dark:text-gray-200 mb-4 text-center">爱邮坪AUP</h1>
        <Link href="/my-profile">
          <button className="flex items-center space-x-3 p-1 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-800 hover:text-blue-600 dark:hover:text-blue-300 transition-colors bg-white dark:bg-gray-800">
            <Image
              src="/images/avt.jpg"
              alt="User avatar"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <h2 className="font-medium text-gray-800 dark:text-gray-200">BYD</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">2024级学生</p>
            </div>
          </button>
        </Link>
      </div>
      <nav>
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center p-1 rounded-lg transition-colors duration-200 ${
                  pathname === item.href
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-800 hover:text-blue-600 dark:hover:text-blue-300'
                }`}
              >
                <item.icon className="w-4 h-5 mr-2" />
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
                className={`flex items-center p-1 rounded-lg transition-colors duration-200 ${
                  pathname === '/login'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-800 hover:text-blue-600 dark:hover:text-blue-300'
                }`}
              >
                <LogIn className="w-4 h-5 mr-2" />
                <span>登录</span>
              </Link>
            )}
          </li>
          <li>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center w-full p-1 text-left rounded-lg text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-800 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200"
            >
              {theme === 'dark' ? <Sun className="w-4 h-5 mr-2" /> : <Moon className="w-4 h-5 mr-2" />}
              <span>{theme === 'dark' ? '日间模式' : '夜间模式'}</span>
            </button>
            <button
              onClick={toggleBackgroundImage}
              className="flex items-center w-full p-1 text-left rounded-lg text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-800 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200"
            >
              <Palette className="w-4 h-5 mr-2" />
              <span>界面主题切换</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
