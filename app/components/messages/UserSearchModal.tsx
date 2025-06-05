'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import UserAvatar from '../UserAvatar'
import { Search, UserPlus, Mail } from 'lucide-react'
import { usersAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  created_at: string
  username?: string
  avatar?: string
  department?: string
  grade?: string
}

interface UserSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectUser: (userId: string) => void
}

export default function UserSearchModal({ isOpen, onClose, onSelectUser }: UserSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 搜索用户
  const searchUsers = async () => {
    if (!searchTerm.trim()) {
      return
    }

    try {
      setLoading(true)
      setError('')
      const data = await usersAPI.searchUserByEmail(searchTerm)
      setUsers(data)
    } catch (err) {
      console.error('搜索用户失败:', err)
      setError('搜索用户失败')
      toast.error('搜索用户失败')
    } finally {
      setLoading(false)
    }
  }

  // 处理搜索按钮点击
  const handleSearch = () => {
    searchUsers()
  }

  // 处理回车键搜索
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      searchUsers()
    }
  }

  // 选择用户
  const handleSelectUser = (userId: string) => {
    onSelectUser(userId)
    onClose()
    setSearchTerm('')
    setUsers([])
  }

  // 重置状态
  const handleClose = () => {
    onClose()
    setSearchTerm('')
    setUsers([])
    setError('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <UserPlus className="w-5 h-5 text-blue-500" />
            <span>搜索用户</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 搜索输入区域 */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="输入用户邮箱进行搜索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={loading || !searchTerm.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>搜索中</span>
                </div>
              ) : (
                '搜索'
              )}
            </Button>
          </div>

          {/* 错误信息 */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                {error}
              </p>
            </div>
          )}

          {/* 搜索结果 */}
          <div className="max-h-[320px] overflow-y-auto">
            {users.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                  {searchTerm ? '未找到匹配的用户' : '开始搜索用户'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {searchTerm ? '请检查邮箱地址是否正确' : '输入邮箱地址搜索用户'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-700 group"
                    onClick={() => handleSelectUser(user.id)}
                  >
                    <UserAvatar 
                      src={user.avatar}
                      alt={user.username || user.email}
                      username={user.username || user.email}
                      size={40}
                      className="mr-3"
                      showBorder={false}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                          {user.username || user.email.split('@')[0]}
                        </h4>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="ghost" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                            <UserPlus className="w-4 h-4 mr-1" />
                            添加
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      {(user.department || user.grade) && (
                        <div className="flex items-center space-x-2 mt-1">
                          {user.department && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                              {user.department}
                            </span>
                          )}
                          {user.grade && (
                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                              {user.grade}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 底部提示 */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              💡 提示：点击用户即可开始与他们的对话
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}