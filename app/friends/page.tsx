'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search, MessageSquare } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'

interface Friend {
  id: string
  name: string
  avatar: string
  department?: string
  grade?: string
  bio?: string
}

// 模拟坪友数据
const mockFriends: Friend[] = [
  {
    id: '1',
    name: '艾米·科尔',
    avatar: '/images/avt.jpg',
    department: '计算机科学与技术',
    grade: '2024级',
    bio: '热爱编程和设计的学生'
  },
  {
    id: '2',
    name: '杰西卡·李',
    avatar: '/images/lon.jpg',
    department: '人工智能',
    grade: '2023级',
    bio: '对AI和机器学习充满热情'
  },
  {
    id: '3',
    name: '布鲁斯',
    avatar: '/placeholder.svg?height=32&width=32',
    department: '软件工程',
    grade: '2022级',
    bio: '软件开发爱好者'
  },
  {
    id: '4',
    name: '莎拉·王',
    avatar: '/placeholder.svg?height=32&width=32',
    department: '数据科学',
    grade: '2024级',
    bio: '数据分析和可视化专家'
  },
  {
    id: '5',
    name: '马克·张',
    avatar: '/placeholder.svg?height=32&width=32',
    department: '网络安全',
    grade: '2023级',
    bio: '网络安全研究者'
  },
]

export default function FriendsList() {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [friends, setFriends] = useState<Friend[]>(mockFriends)
  const [searchTerm, setSearchTerm] = useState('')

  // 添加mounted状态管理
  useEffect(() => {
    setMounted(true)
    
    // 这里可以添加获取真实坪友列表的API调用
    // 例如：fetchFriends()
  }, [])

  // 计算主题相关的样式
  const bgColor = mounted && theme === 'dark' ? 'bg-gray-800' : 'bg-white'
  const hoverBgColor = mounted && theme === 'dark' ? 'hover:bg-indigo-700' : 'hover:bg-indigo-300'

  // 过滤搜索结果
  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (friend.department && friend.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (friend.bio && friend.bio.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // 处理点击好友，跳转到私信页面
  const handleFriendClick = (friendId: string) => {
    router.push(`/messages?chat=${friendId}`)
  }

  // 防止水合不匹配
  if (!mounted) {
    return null // 或者返回一个加载占位符
  }

  return (
    <div className="flex h-screen text-foreground">
      <Sidebar />
      <main className="flex-1 p-4 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">坪友列表</h1>
          
          {/* 搜索框 */}
          <div className="mb-6">
            <div className="relative opacity-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type="text"
                placeholder="搜索坪友..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 bg-blue-200/80 dark:bg-gray-900 border-0 text-black dark:text-gray-200 placeholder-gray-500 focus:ring-0"
              />
            </div>
          </div>
          
          {/* 坪友列表 */}
          <div className={`${bgColor} rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-opacity-70`}>
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 240px)' }}>
              {filteredFriends.length > 0 ? (
                filteredFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className={`flex items-center p-4 cursor-pointer ${hoverBgColor}`}
                    onClick={() => handleFriendClick(friend.id)}
                  >
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src={friend.avatar} alt={friend.name} />
                      <AvatarFallback>{friend.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {friend.name}
                        </span>
                        <button 
                          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFriendClick(friend.id);
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          <span className="text-sm">私信</span>
                        </button>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 flex flex-wrap gap-2">
                        {friend.department && (
                          <span className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded-full text-xs">
                            {friend.department}
                          </span>
                        )}
                        {friend.grade && (
                          <span className="bg-green-100 dark:bg-green-900 px-2 py-0.5 rounded-full text-xs">
                            {friend.grade}
                          </span>
                        )}
                      </div>
                      {friend.bio && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                          {friend.bio}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  没有找到匹配的坪友
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}