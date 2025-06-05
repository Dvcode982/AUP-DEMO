'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import UserAvatar from '../components/UserAvatar'
import { Input } from "@/components/ui/input"
import { 
  Search, 
  MessageSquare, 
  UserPlus, 
  Filter, 
  SortAsc, 
  MapPin, 
  Calendar,
  Users,
  Star,
  MoreHorizontal,
  Grid3X3,
  List,
  Sparkles,
  BookOpen,
  Trophy,
  Heart
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from '../hooks/useTranslation'

interface Friend {
  id: string
  name: string
  username: string
  avatar: string
  department?: string
  grade?: string
  bio?: string
  tags?: string[]
  isOnline?: boolean
  lastSeen?: string
  mutualFriends?: number
  joinDate?: string
  location?: string
  achievements?: string[]
  mood?: string
  relationshipStatus?: 'none' | 'friend' | 'requested' | 'pending'
}

// 优化的模拟坪友数据
const mockFriends: Friend[] = [
  {
    id: '1',
    name: '艾米·科尔',
    username: 'amy_cole',
    avatar: '/images/avt.jpg',
    department: '计算机科学与技术学院',
    grade: '2024级',
    bio: '热爱编程和UI设计的学生，目前专注于前端开发和用户体验设计',
    tags: ['前端开发', 'UI设计', '编程', 'React'],
    isOnline: true,
    lastSeen: '刚刚',
    mutualFriends: 12,
    joinDate: '2024年9月',
    location: '南京',
    achievements: ['编程达人', '设计新秀'],
    mood: '今天心情不错！✨',
    relationshipStatus: 'friend'
  },
  {
    id: '2',
    name: '杰西卡·李',
    username: 'jessica_li',
    avatar: '/images/lon.jpg',
    department: '人工智能学院',
    grade: '2023级',
    bio: '对AI和机器学习充满热情，正在研究深度学习在图像识别中的应用',
    tags: ['人工智能', '机器学习', '深度学习', 'Python'],
    isOnline: false,
    lastSeen: '2小时前',
    mutualFriends: 8,
    joinDate: '2023年9月',
    location: '北京',
    achievements: ['AI先锋', '学术新星'],
    mood: '正在学习新技术中...',
    relationshipStatus: 'friend'
  },
  {
    id: '3',
    name: '布鲁斯·韦恩',
    username: 'bruce_wayne',
    avatar: '',
    department: '软件工程学院',
    grade: '2022级',
    bio: '软件开发爱好者，擅长后端开发和系统架构设计',
    tags: ['后端开发', '系统架构', 'Java', '微服务'],
    isOnline: true,
    lastSeen: '在线',
    mutualFriends: 15,
    joinDate: '2022年9月',
    location: '上海',
    achievements: ['架构师', '代码大师'],
    mood: '代码改变世界！',
    relationshipStatus: 'none'
  },
  {
    id: '4',
    name: '莎拉·王',
    username: 'sarah_wang',
    avatar: '',
    department: '数据科学学院',
    grade: '2024级',
    bio: '数据分析和可视化专家，喜欢从数据中发现规律和趋势',
    tags: ['数据分析', '数据可视化', 'Python', 'R语言'],
    isOnline: false,
    lastSeen: '昨天',
    mutualFriends: 6,
    joinDate: '2024年9月',
    location: '深圳',
    achievements: ['数据达人'],
    mood: '数据告诉我们真相',
    relationshipStatus: 'requested'
  },
  {
    id: '5',
    name: '马克·张',
    username: 'mark_zhang',
    avatar: '',
    department: '网络安全学院',
    grade: '2023级',
    bio: '网络安全研究者，专注于漏洞挖掘和安全防护',
    tags: ['网络安全', '漏洞挖掘', '渗透测试', '安全防护'],
    isOnline: true,
    lastSeen: '5分钟前',
    mutualFriends: 9,
    joinDate: '2023年9月',
    location: '杭州',
    achievements: ['安全专家', '白帽子'],
    mood: '安全第一！',
    relationshipStatus: 'pending'
  },
  {
    id: '6',
    name: '琳达·陈',
    username: 'linda_chen',
    avatar: '',
    department: '设计学院',
    grade: '2024级',
    bio: '视觉设计师，热爱创意和艺术，擅长品牌设计和插画',
    tags: ['视觉设计', '品牌设计', '插画', 'Adobe套件'],
    isOnline: false,
    lastSeen: '3小时前',
    mutualFriends: 11,
    joinDate: '2024年9月',
    location: '广州',
    achievements: ['设计新星'],
    mood: '设计让生活更美好 🎨',
    relationshipStatus: 'friend'
  },
  {
    id: '7',
    name: '汤姆·刘',
    username: 'tom_liu',
    avatar: '',
    department: '商学院',
    grade: '2022级',
    bio: '创业爱好者，对商业模式和市场营销有深入研究',
    tags: ['创业', '商业模式', '市场营销', '项目管理'],
    isOnline: true,
    lastSeen: '在线',
    mutualFriends: 20,
    joinDate: '2022年9月',
    location: '成都',
    achievements: ['创业先锋', '商业达人'],
    mood: '机会总是留给有准备的人',
    relationshipStatus: 'friend'
  }
]

type SortType = 'name' | 'online' | 'mutual' | 'recent'
type ViewMode = 'grid' | 'list'

export default function FriendsList() {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { t } = useTranslation()
  
  const [friends, setFriends] = useState<Friend[]>(mockFriends)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedGrade, setSelectedGrade] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortType>('online')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [showFilters, setShowFilters] = useState(false)

  // 添加mounted状态管理
  useEffect(() => {
    setMounted(true)
  }, [])

  // 获取所有院系
  const departments = Array.from(new Set(friends.map(f => f.department).filter(Boolean)))
  
  // 获取所有年级
  const grades = Array.from(new Set(friends.map(f => f.grade).filter(Boolean)))

  // 过滤和排序逻辑
  const filteredAndSortedFriends = () => {
    let filtered = friends.filter(friend => {
      const matchesSearch = friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        friend.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (friend.department && friend.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (friend.bio && friend.bio.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (friend.tags && friend.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))

      const matchesDepartment = selectedDepartment === 'all' || friend.department === selectedDepartment
      const matchesGrade = selectedGrade === 'all' || friend.grade === selectedGrade

      return matchesSearch && matchesDepartment && matchesGrade
    })

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'online':
          if (a.isOnline !== b.isOnline) {
            return a.isOnline ? -1 : 1
          }
          return a.name.localeCompare(b.name)
        case 'mutual':
          return (b.mutualFriends || 0) - (a.mutualFriends || 0)
        case 'recent':
          // 这里可以根据lastSeen字段进行排序
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    return filtered
  }

  // 处理点击好友
  const handleFriendClick = (friendId: string) => {
    router.push(`/messages?chat=${friendId}`)
  }

  // 处理好友请求
  const handleFriendRequest = (friendId: string, action: 'add' | 'accept' | 'reject') => {
    setFriends(prev => prev.map(friend => {
      if (friend.id === friendId) {
        switch (action) {
          case 'add':
            return { ...friend, relationshipStatus: 'requested' as const }
          case 'accept':
            return { ...friend, relationshipStatus: 'friend' as const }
          case 'reject':
            return { ...friend, relationshipStatus: 'none' as const }
          default:
            return friend
        }
      }
      return friend
    }))
  }

  // 获取在线状态样式
  const getOnlineStatus = (friend: Friend) => {
    if (friend.isOnline) {
      return (
        <div className="flex items-center text-green-500 text-xs">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
          在线
        </div>
      )
    }
    return (
      <div className="text-gray-500 text-xs">
        {friend.lastSeen}
      </div>
    )
  }

  // 获取关系状态按钮
  const getRelationshipButton = (friend: Friend) => {
    switch (friend.relationshipStatus) {
      case 'friend':
        return (
          <button 
            className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            onClick={(e) => {
              e.stopPropagation()
              handleFriendClick(friend.id)
            }}
          >
            <MessageSquare className="w-4 h-4" />
            <span>私信</span>
          </button>
        )
      case 'requested':
        return (
          <button 
            className="px-3 py-1 bg-gray-300 text-gray-600 rounded-lg text-sm cursor-not-allowed"
            disabled
          >
            已发送请求
          </button>
        )
      case 'pending':
        return (
          <div className="flex space-x-2">
            <button 
              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
              onClick={(e) => {
                e.stopPropagation()
                handleFriendRequest(friend.id, 'accept')
              }}
            >
              接受
            </button>
            <button 
              className="px-3 py-1 bg-gray-300 text-gray-600 rounded-lg hover:bg-gray-400 transition-colors text-sm"
              onClick={(e) => {
                e.stopPropagation()
                handleFriendRequest(friend.id, 'reject')
              }}
            >
              拒绝
            </button>
          </div>
        )
      default:
        return (
          <button 
            className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm"
            onClick={(e) => {
              e.stopPropagation()
              handleFriendRequest(friend.id, 'add')
            }}
          >
            <UserPlus className="w-4 h-4" />
            <span>添加好友</span>
          </button>
        )
    }
  }

  const filteredFriends = filteredAndSortedFriends()

  // 防止水合不匹配
  if (!mounted) {
    return null
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部标题栏 */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col space-y-4">
              {/* 标题和统计 */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                    <Users className="w-8 h-8 mr-3 text-blue-500" />
                    坪友列表
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    发现和联系校友同学
                  </p>
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{filteredFriends.length}</div>
                    <div className="text-gray-500 dark:text-gray-400">总计</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{filteredFriends.filter(f => f.isOnline).length}</div>
                    <div className="text-gray-500 dark:text-gray-400">在线</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">{filteredFriends.filter(f => f.relationshipStatus === 'friend').length}</div>
                    <div className="text-gray-500 dark:text-gray-400">好友</div>
                  </div>
                </div>
              </div>

              {/* 搜索栏 */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="搜索坪友姓名、用户名、院系、标签..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* 筛选和视图控制 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* 筛选按钮 */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                      showFilters 
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Filter size={18} />
                    <span>筛选</span>
                  </button>

                  {/* 排序选择 */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortType)}
                    className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="online">在线优先</option>
                    <option value="name">按姓名</option>
                    <option value="mutual">共同好友</option>
                    <option value="recent">最近活跃</option>
                  </select>
                </div>

                {/* 视图切换 */}
                <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                    title="列表视图"
                  >
                    <List size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                    title="网格视图"
                  >
                    <Grid3X3 size={18} />
                  </button>
                </div>
              </div>

              {/* 高级筛选面板 */}
              {showFilters && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 院系筛选 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        院系
                      </label>
                      <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="all">全部院系</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    {/* 年级筛选 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        年级
                      </label>
                      <select
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="all">全部年级</option>
                        {grades.map(grade => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            {filteredFriends.length > 0 ? (
              viewMode === 'grid' ? (
                /* 网格视图 */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredFriends.map((friend) => (
                    <div
                      key={friend.id}
                      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 p-6 cursor-pointer"
                      onClick={() => handleFriendClick(friend.id)}
                    >
                      {/* 头像和在线状态 */}
                      <div className="relative mb-4">
                        <UserAvatar 
                          src={friend.avatar}
                          alt={friend.name}
                          username={friend.name}
                          size={64}
                          className="mx-auto"
                        />
                        {friend.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                        )}
                      </div>

                      {/* 用户信息 */}
                      <div className="text-center mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{friend.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">@{friend.username}</p>
                        {getOnlineStatus(friend)}
                      </div>

                      {/* 院系和年级 */}
                      <div className="space-y-2 mb-4">
                        {friend.department && (
                          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                            <BookOpen className="w-3 h-3 mr-1" />
                            <span className="truncate">{friend.department}</span>
                          </div>
                        )}
                        {friend.grade && (
                          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>{friend.grade}</span>
                          </div>
                        )}
                        {friend.location && (
                          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span>{friend.location}</span>
                          </div>
                        )}
                      </div>

                      {/* 心情状态 */}
                      {friend.mood && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 mb-4">
                          <p className="text-xs text-gray-600 dark:text-gray-400 text-center line-clamp-2">
                            {friend.mood}
                          </p>
                        </div>
                      )}

                      {/* 标签 */}
                      {friend.tags && friend.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {friend.tags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                              {tag}
                            </span>
                          ))}
                          {friend.tags.length > 2 && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 self-center">+{friend.tags.length - 2}</span>
                          )}
                        </div>
                      )}

                      {/* 操作按钮 */}
                      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        {getRelationshipButton(friend)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* 列表视图 */
                <div className="space-y-4">
                  {filteredFriends.map((friend) => (
                    <div
                      key={friend.id}
                      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-lg p-6 cursor-pointer"
                      onClick={() => handleFriendClick(friend.id)}
                    >
                      <div className="flex items-start space-x-4">
                        {/* 头像 */}
                        <div className="relative flex-shrink-0">
                          <UserAvatar 
                            src={friend.avatar}
                            alt={friend.name}
                            username={friend.name}
                            size={56}
                          />
                          {friend.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                          )}
                        </div>

                        {/* 主要信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{friend.name}</h3>
                                <span className="text-sm text-gray-500 dark:text-gray-400">@{friend.username}</span>
                                {friend.achievements && friend.achievements.length > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <Trophy className="w-4 h-4 text-yellow-500" />
                                    <span className="text-xs text-yellow-600 dark:text-yellow-400">{friend.achievements[0]}</span>
                                  </div>
                                )}
                              </div>
                              {getOnlineStatus(friend)}
                            </div>
                            <div className="flex items-center space-x-2">
                              {friend.mutualFriends && friend.mutualFriends > 0 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                  {friend.mutualFriends} 个共同好友
                                </span>
                              )}
                              {getRelationshipButton(friend)}
                            </div>
                          </div>

                          {/* 院系年级信息 */}
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {friend.department && (
                              <div className="flex items-center space-x-1">
                                <BookOpen className="w-4 h-4" />
                                <span>{friend.department}</span>
                              </div>
                            )}
                            {friend.grade && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{friend.grade}</span>
                              </div>
                            )}
                            {friend.location && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{friend.location}</span>
                              </div>
                            )}
                          </div>

                          {/* 心情和简介 */}
                          {friend.mood && (
                            <div className="mb-2">
                              <div className="flex items-center space-x-1 text-sm">
                                <Sparkles className="w-4 h-4 text-purple-500" />
                                <span className="text-gray-600 dark:text-gray-400">{friend.mood}</span>
                              </div>
                            </div>
                          )}
                          
                          {friend.bio && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">
                              {friend.bio}
                            </p>
                          )}

                          {/* 标签 */}
                          {friend.tags && friend.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {friend.tags.slice(0, 4).map((tag, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                  {tag}
                                </span>
                              ))}
                              {friend.tags.length > 4 && (
                                <span className="text-xs text-gray-400 dark:text-gray-500 self-center">+{friend.tags.length - 4}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* 空状态 */
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {searchTerm ? '没有找到匹配的坪友' : '还没有坪友'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {searchTerm 
                      ? '试试其他搜索条件或调整筛选器' 
                      : '开始探索和添加你的校友同学吧'
                    }
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedDepartment('all')
                        setSelectedGrade('all')
                      }}
                      className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      查看所有坪友
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}