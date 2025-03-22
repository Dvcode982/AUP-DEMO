'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search } from 'lucide-react'
import { usersAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  created_at: string
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
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>搜索用户</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type="text"
                placeholder="输入用户邮箱..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? '搜索中...' : '搜索'}
            </Button>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {users.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                {searchTerm ? '未找到匹配的用户' : '输入邮箱搜索用户'}
              </p>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer"
                  onClick={() => handleSelectUser(user.id)}
                >
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src="/images/lon.jpg" alt={user.email} onError={(e) => {
                      e.currentTarget.src = null;
                      e.currentTarget.onerror = null;
                    }} />
                    <AvatarFallback>{user.email[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.email.split('@')[0]}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}