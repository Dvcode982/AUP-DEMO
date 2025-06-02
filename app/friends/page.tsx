'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Sidebar from '../components/Sidebar'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, MessageSquare, UserPlus, UserCheck, UserX, Clock, Check, X, Users, Hash, Loader2 } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { friendsAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  username?: string
  avatar?: string
  department?: string
  grade?: string
  bio?: string
  friendship_status?: 'friend' | 'pending_sent' | 'pending_received' | 'none'
}

interface Friend extends User {
  friendship_date?: string
}

interface FriendRequest extends User {
  request_id: string
  request_date: string
}

interface RecommendedUser extends User {
  mutual_friends_count?: number
  same_department?: number
  tags?: string[]
  matching_tags_count?: number
  recommendation_score?: number
}

export default function FriendsPage() {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  
  // 状态管理
  const [activeTab, setActiveTab] = useState('friends')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([])
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([])
  const [recommendations, setRecommendations] = useState<RecommendedUser[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // 添加mounted状态管理
  useEffect(() => {
    setMounted(true)
    if (isAuthenticated) {
      loadFriendsData()
    }
  }, [isAuthenticated])

  // 加载好友数据
  const loadFriendsData = async () => {
    try {
      setIsLoading(true)
      const [friendsList, requests, recommendationsData] = await Promise.all([
        friendsAPI.getFriendsList(),
        friendsAPI.getFriendRequests(),
        friendsAPI.getRecommendations(0, 10)
      ])
      
      setFriends(friendsList.friends || [])
      setReceivedRequests(requests.received || [])
      setSentRequests(requests.sent || [])
      setRecommendations(recommendationsData.recommendations || [])
      setHasMore(recommendationsData.hasMore || false)
      setOffset(10)
    } catch (error) {
      console.error('Load friends data error:', error)
      toast.error('加载好友数据失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 加载更多推荐
  const loadMoreRecommendations = useCallback(async () => {
    if (isLoadingMore || !hasMore) return
    
    try {
      setIsLoadingMore(true)
      const response = await friendsAPI.getRecommendations(offset, 10)
      
      if (response.recommendations && response.recommendations.length > 0) {
        setRecommendations(prev => [...prev, ...response.recommendations])
        setOffset(prev => prev + response.recommendations.length)
        setHasMore(response.hasMore || false)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Load more recommendations error:', error)
      toast.error('加载更多推荐失败')
    } finally {
      setIsLoadingMore(false)
    }
  }, [offset, hasMore, isLoadingMore])

  // 处理滚动事件
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || searchQuery) return
    
    const container = scrollContainerRef.current
    const scrollPosition = container.scrollTop + container.clientHeight
    const scrollHeight = container.scrollHeight
    
    // 当滚动到距离底部100px时加载更多
    if (scrollHeight - scrollPosition < 100 && hasMore && !isLoadingMore) {
      loadMoreRecommendations()
    }
  }, [hasMore, isLoadingMore, loadMoreRecommendations, searchQuery])

  // 搜索用户
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    try {
      setIsSearching(true)
      const response = await friendsAPI.searchUsers(searchQuery)
      setSearchResults(response.users || [])
    } catch (error) {
      console.error('Search error:', error)
      toast.error('搜索失败')
    } finally {
      setIsSearching(false)
    }
  }

  // 发送好友请求
  const handleSendRequest = async (userId: string) => {
    try {
      await friendsAPI.sendFriendRequest(userId)
      toast.success('好友请求已发送')
      
      // 如果是从推荐列表发送请求，更新推荐列表
      if (!searchQuery) {
        setRecommendations(prev => prev.filter(user => user.id !== userId))
      } else {
        handleSearch() // 刷新搜索结果
      }
      
      // 刷新请求列表
      const requests = await friendsAPI.getFriendRequests()
      setReceivedRequests(requests.received || [])
      setSentRequests(requests.sent || [])
    } catch (error: any) {
      toast.error(error.message || '发送好友请求失败')
    }
  }

  // 接受好友请求
  const handleAcceptRequest = async (requestId: string) => {
    try {
      await friendsAPI.acceptFriendRequest(requestId)
      toast.success('已接受好友请求')
      loadFriendsData()
    } catch (error: any) {
      toast.error(error.message || '接受好友请求失败')
    }
  }

  // 拒绝好友请求
  const handleRejectRequest = async (requestId: string) => {
    try {
      await friendsAPI.rejectFriendRequest(requestId)
      toast.success('已拒绝好友请求')
      loadFriendsData()
    } catch (error: any) {
      toast.error(error.message || '拒绝好友请求失败')
    }
  }

  // 取消好友请求
  const handleCancelRequest = async (requestId: string) => {
    try {
      await friendsAPI.cancelFriendRequest(requestId)
      toast.success('已取消好友请求')
      loadFriendsData()
    } catch (error: any) {
      toast.error(error.message || '取消好友请求失败')
    }
  }

  // 删除好友
  const handleDeleteFriend = async (friendId: string) => {
    if (!confirm('确定要删除该好友吗？')) return
    
    try {
      await friendsAPI.deleteFriend(friendId)
      toast.success('已删除好友')
      loadFriendsData()
    } catch (error: any) {
      toast.error(error.message || '删除好友失败')
    }
  }

  // 跳转到私信页面
  const handleChatWithFriend = (friendId: string) => {
    router.push(`/messages?chat=${friendId}`)
  }

  // 获取用户显示名称
  const getUserDisplayName = (user: User) => {
    return user.username || user.email.split('@')[0]
  }

  // 计算主题相关的样式
  const bgColor = mounted && theme === 'dark' ? 'bg-gray-800' : 'bg-white'
  const cardBgColor = mounted && theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
  const hoverBgColor = mounted && theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'

  // 防止水合不匹配
  if (!mounted) {
    return null
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">请先登录</h2>
            <Button onClick={() => router.push('/login')}>前往登录</Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <Sidebar />
      <main className="flex-1 p-4 overflow-hidden">
        <div className="max-w-5xl mx-auto h-full flex flex-col">
          <h1 className="text-2xl font-bold mb-4">寻找坪友</h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="friends" className="relative">
                好友列表
                {friends.length > 0 && (
                  <Badge className="ml-2" variant="secondary">{friends.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="requests" className="relative">
                好友请求
                {(receivedRequests.length + sentRequests.length) > 0 && (
                  <Badge className="ml-2" variant="secondary">
                    {receivedRequests.length + sentRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="search">搜索用户</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden mt-4">
              {/* 好友列表 */}
              <TabsContent value="friends" className="h-full overflow-hidden">
                <div className={`${bgColor} rounded-lg h-full overflow-y-auto p-4`} style={{ maxHeight: 'calc(100vh - 200px)' }}>
                  {isLoading ? (
                    <div className="text-center py-8 text-gray-500">加载中...</div>
                  ) : friends.length > 0 ? (
                    <div className="space-y-3">
                      {friends.map((friend) => (
                        <div
                          key={friend.id}
                          className={`flex items-center p-4 rounded-lg ${cardBgColor} ${hoverBgColor} transition-colors`}
                        >
                          <Avatar className="h-12 w-12 mr-4">
                            <AvatarImage src={friend.avatar || '/images/lon.jpg'} alt={getUserDisplayName(friend)} />
                            <AvatarFallback>{getUserDisplayName(friend)[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-grow">
                            <div className="font-medium">{getUserDisplayName(friend)}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
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
                              <p className="text-sm text-gray-500 mt-1 line-clamp-1">{friend.bio}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleChatWithFriend(friend.id)}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              私信
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteFriend(friend.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="mb-4">还没有添加好友</p>
                      <Button onClick={() => setActiveTab('search')}>搜索用户</Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* 好友请求 */}
              <TabsContent value="requests" className="h-full overflow-hidden">
                <div className={`${bgColor} rounded-lg h-full overflow-y-auto p-4`} style={{ maxHeight: 'calc(100vh - 200px)' }}>
                  {receivedRequests.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3">收到的请求</h3>
                      <div className="space-y-3">
                        {receivedRequests.map((request) => (
                          <div
                            key={request.request_id}
                            className={`flex items-center p-4 rounded-lg ${cardBgColor}`}
                          >
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage src={request.avatar || '/images/lon.jpg'} alt={getUserDisplayName(request)} />
                              <AvatarFallback>{getUserDisplayName(request)[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow">
                              <div className="font-medium">{getUserDisplayName(request)}</div>
                              <div className="text-sm text-gray-500">{request.department || request.email}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleAcceptRequest(request.request_id)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                接受
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectRequest(request.request_id)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                拒绝
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {sentRequests.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">发送的请求</h3>
                      <div className="space-y-3">
                        {sentRequests.map((request) => (
                          <div
                            key={request.request_id}
                            className={`flex items-center p-4 rounded-lg ${cardBgColor}`}
                          >
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage src={request.avatar || '/images/lon.jpg'} alt={getUserDisplayName(request)} />
                              <AvatarFallback>{getUserDisplayName(request)[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow">
                              <div className="font-medium">{getUserDisplayName(request)}</div>
                              <div className="text-sm text-gray-500">{request.department || request.email}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">
                                <Clock className="h-3 w-3 mr-1" />
                                等待回应
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelRequest(request.request_id)}
                              >
                                取消
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {receivedRequests.length === 0 && sentRequests.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      暂无好友请求
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* 搜索用户 */}
              <TabsContent value="search" className="h-full overflow-hidden">
                <div className="space-y-4 h-full flex flex-col">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="搜索用户名、邮箱或院系..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="flex-grow"
                    />
                    <Button onClick={handleSearch} disabled={isSearching}>
                      <Search className="h-4 w-4 mr-1" />
                      搜索
                    </Button>
                  </div>

                  <div 
                    ref={scrollContainerRef}
                    className={`${bgColor} rounded-lg flex-1 overflow-y-auto p-4`}
                    style={{ maxHeight: 'calc(100vh - 250px)' }}
                    onScroll={handleScroll}
                  >
                    {/* 推荐好友部分 */}
                    {!searchQuery && recommendations.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center">
                          <Users className="h-5 w-5 mr-2 text-blue-500" />
                          推荐好友
                        </h3>
                        <div className="space-y-3">
                          {recommendations.map((user) => (
                            <div
                              key={user.id}
                              className={`flex items-center p-4 rounded-lg ${cardBgColor}`}
                            >
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage src={user.avatar || '/images/lon.jpg'} alt={getUserDisplayName(user)} />
                                <AvatarFallback>{getUserDisplayName(user)[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-grow">
                                <div className="font-medium">{getUserDisplayName(user)}</div>
                                <div className="text-sm text-gray-500">
                                  {user.department ? `${user.department} ${user.grade || ''}` : user.email}
                                </div>
                                {user.bio && (
                                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">{user.bio}</p>
                                )}
                                {/* 显示标签 */}
                                {user.tags && user.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {user.tags.map((tag, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        <Hash className="h-3 w-3 mr-1" />
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                                {/* 推荐原因 */}
                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                  {user.mutual_friends_count && user.mutual_friends_count > 0 && (
                                    <span>共同好友: {user.mutual_friends_count}</span>
                                  )}
                                  {user.same_department === 1 && (
                                    <span className="text-blue-500">同院系</span>
                                  )}
                                  {user.matching_tags_count && user.matching_tags_count > 0 && (
                                    <span>相似标签: {user.matching_tags_count}</span>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleSendRequest(user.id)}
                              >
                                <UserPlus className="h-4 w-4 mr-1" />
                                添加好友
                              </Button>
                            </div>
                          ))}
                          
                          {/* 加载更多指示器 */}
                          {isLoadingMore && (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                              <span className="ml-2 text-gray-500">加载更多...</span>
                            </div>
                          )}
                          
                          {!hasMore && recommendations.length > 0 && (
                            <div className="text-center py-4 text-gray-500 text-sm">
                              已显示所有用户
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 搜索结果 */}
                    {isSearching ? (
                      <div className="text-center py-8 text-gray-500">搜索中...</div>
                    ) : searchResults.length > 0 ? (
                      <div className="space-y-3">
                        <h3 className="font-semibold mb-3">搜索结果</h3>
                        {searchResults.map((user) => (
                          <div
                            key={user.id}
                            className={`flex items-center p-4 rounded-lg ${cardBgColor}`}
                          >
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage src={user.avatar || '/images/lon.jpg'} alt={getUserDisplayName(user)} />
                              <AvatarFallback>{getUserDisplayName(user)[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow">
                              <div className="font-medium">{getUserDisplayName(user)}</div>
                              <div className="text-sm text-gray-500">
                                {user.department ? `${user.department} ${user.grade || ''}` : user.email}
                              </div>
                              {user.bio && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{user.bio}</p>
                              )}
                            </div>
                            <div>
                              {user.friendship_status === 'friend' ? (
                                <Badge variant="secondary">
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  已是好友
                                </Badge>
                              ) : user.friendship_status === 'pending_sent' ? (
                                <Badge variant="secondary">
                                  <Clock className="h-3 w-3 mr-1" />
                                  已发送请求
                                </Badge>
                              ) : user.friendship_status === 'pending_received' ? (
                                <Badge variant="secondary">
                                  <UserPlus className="h-3 w-3 mr-1" />
                                  待接受
                                </Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleSendRequest(user.id)}
                                >
                                  <UserPlus className="h-4 w-4 mr-1" />
                                  添加好友
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : searchQuery ? (
                      <div className="text-center py-8 text-gray-500">
                        没有找到匹配的用户
                      </div>
                    ) : !recommendations.length ? (
                      <div className="text-center py-8 text-gray-500">
                        暂无推荐用户
                      </div>
                    ) : null}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  )
}