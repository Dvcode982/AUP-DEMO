'use client'

import Image from 'next/image'
import { useState } from 'react'

interface UserAvatarProps {
  src?: string | null
  alt?: string
  username?: string
  size?: number
  className?: string
  showBorder?: boolean
  fallbackBg?: string
}

const UserAvatar = ({ 
  src, 
  alt = '用户头像', 
  username = 'U', 
  size = 40, 
  className = '', 
  showBorder = true,
  fallbackBg = 'from-blue-500 to-purple-600'
}: UserAvatarProps) => {
  const [imageError, setImageError] = useState(false)
  
  // 统一的默认头像
  const defaultAvatar = '/placeholder.svg?height=40&width=40'
  
  // 获取用户名首字母
  const getInitials = (name: string) => {
    if (!name) return 'U'
    return name.charAt(0).toUpperCase()
  }
  
  // 如果没有头像或加载失败，显示梯度背景+首字母
  if (!src || imageError) {
    return (
      <div 
        className={`flex items-center justify-center rounded-full text-white font-bold bg-gradient-to-br ${fallbackBg} ${showBorder ? 'border-2 border-gray-200 dark:border-gray-600' : ''} ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {getInitials(username)}
      </div>
    )
  }
  
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full object-cover ${showBorder ? 'border-2 border-gray-200 dark:border-gray-600' : ''} ${className}`}
      onError={() => setImageError(true)}
      onLoad={() => setImageError(false)}
    />
  )
}

export default UserAvatar 