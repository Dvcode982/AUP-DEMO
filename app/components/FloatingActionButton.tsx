'use client'

import { PlusCircle, Package, MessageSquare, Camera } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslation } from '../hooks/useTranslation'
import { useState, useCallback } from 'react'

interface FloatingActionButtonProps {
  label?: string
}

const FloatingActionButton = ({ label }: FloatingActionButtonProps = {}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useTranslation()
  
  // 根据当前路径确定发帖链接和主题颜色
  const getThemeColors = () => {
    if (pathname?.includes('lost-and-found')) {
      return {
        button: 'from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600',
        pulse: 'from-orange-500 to-red-500'
      }
    }
    return {
      button: 'from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700',
      pulse: 'from-blue-500 to-purple-600'
    }
  }

  // 根据当前页面确定快捷操作
  const getQuickActions = () => {
    if (pathname?.includes('lost-and-found')) {
      return [
        {
          icon: Package,
          label: t('lostFound.publishLost') || '发布寻物',
          href: '/create-lost-found?type=lost',
          color: 'from-red-500 to-pink-500',
          hoverColor: 'hover:from-red-600 hover:to-pink-600'
        },
        {
          icon: Package,
          label: t('lostFound.publishFound') || '发布招领',
          href: '/create-lost-found?type=found',
          color: 'from-green-500 to-emerald-500',
          hoverColor: 'hover:from-green-600 hover:to-emerald-600'
        },
        {
          icon: Camera,
          label: t('lostFound.cameraRecognition') || '拍照识别',
          href: '/lost-and-found/camera',
          color: 'from-purple-500 to-indigo-500',
          hoverColor: 'hover:from-purple-600 hover:to-indigo-600'
        }
      ]
    }
    
    return [
      {
        icon: MessageSquare,
        label: t('createPost') || '发布话题',
        href: '/create-post',
        color: 'from-blue-500 to-cyan-500',
        hoverColor: 'hover:from-blue-600 hover:to-cyan-600'
      },
      {
        icon: Package,
        label: t('lostFound.title') || '失物招领',
        href: '/lost-and-found',
        color: 'from-orange-500 to-red-500',
        hoverColor: 'hover:from-orange-600 hover:to-red-600'
      }
    ]
  }

  const quickActions = getQuickActions()
  const isLostAndFound = pathname?.includes('lost-and-found')
  const themeColors = getThemeColors()

  // 处理链接点击事件
  const handleLinkClick = useCallback(async (href: string) => {
    console.log('按钮被点击，准备跳转到:', href)
    try {
      setIsExpanded(false)
      console.log('开始导航到:', href)
      await router.push(href)
      console.log('导航完成')
    } catch (error) {
      console.error('导航失败:', error)
      window.location.href = href
    }
  }, [router])

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* 快捷操作菜单 */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 space-y-3">
          {quickActions.map((action, index) => (
            <a
              key={index}
              href={action.href}
              onClick={(e) => {
                e.preventDefault()
                handleLinkClick(action.href)
              }}
              className={`flex items-center space-x-3 bg-gradient-to-r ${action.color} ${action.hoverColor} text-white px-4 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group min-w-max cursor-pointer select-none`}
              role="button"
              tabIndex={0}
              aria-label={action.label}
            >
              <action.icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
            </a>
          ))}
        </div>
      )}

      {/* 主按钮 */}
      <button
        type="button"
        onClick={() => {
          console.log('主按钮被点击，当前状态:', isExpanded)
          setIsExpanded(!isExpanded)
        }}
        className={`relative flex items-center justify-center w-14 h-14 bg-gradient-to-r ${themeColors.button} text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer select-none ${
          isExpanded ? 'rotate-45' : 'rotate-0'
        }`}
        aria-label={isExpanded ? '关闭菜单' : '打开菜单'}
      >
        <PlusCircle className="w-6 h-6" />
        
        {/* 主按钮标签 */}
        <div className={`absolute right-16 top-1/2 transform -translate-y-1/2 transition-all duration-300 pointer-events-none ${
          isExpanded ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}>
          <div className="bg-gray-900/80 text-white px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap backdrop-blur-sm">
            {label || (isLostAndFound ? t('lostFound.publishPost') || '发布失物信息' : t('createPost') || '发布话题')}
          </div>
        </div>

        {/* 脉冲动画 */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${themeColors.pulse} animate-ping opacity-20 pointer-events-none`}></div>
      </button>

      {/* 背景遮罩 */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => {
            console.log('背景遮罩被点击')
            setIsExpanded(false)
          }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

export default FloatingActionButton

