'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { User, Mail, BookOpen, Building, GraduationCap, Calendar, Pencil } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '../components/ProtectedRoute'
import Image from 'next/image'

export default function MyProfile() {
  const { theme } = useTheme()
  const { user, updateUserProfile, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  
  // 编辑状态字段
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    department: '',
    grade: '',
    role: ''
  })

  // 初始化表单数据
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        department: user.department || '',
        grade: user.grade || '',
        role: user.role || ''
      })
    }
  }, [user])

  // 处理表单输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (user) {
      updateUserProfile(formData)
      setIsEditing(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* 页面标题 */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">我的个人资料</h1>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                {isEditing ? '取消编辑' : '编辑资料'}
              </button>
            </div>
            
            {/* 个人资料卡片 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
              {/* 顶部信息区 */}
              <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 h-40">
                <div className="absolute -bottom-16 left-8">
                  {user?.avatar && user.avatar !== "" ? (
                    <Image
                      src={user.avatar}
                      alt="用户头像"
                      width={96}
                      height={96}
                      className="rounded-full border-4 border-white dark:border-gray-800"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-violet-600 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white dark:border-gray-800">
                      {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
              </div>
              
              {/* 用户信息 */}
              <div className="pt-20 px-8 pb-8">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          用户名
                        </label>
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                          <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                            <User className="w-5 h-5" />
                          </span>
                          <input
                            type="text"
                            name="username"
                            className="block w-full px-3 py-2 border-0 focus:ring-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="您的昵称"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          邮箱
                        </label>
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                          <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                            <Mail className="w-5 h-5" />
                          </span>
                          <input
                            type="email"
                            name="email"
                            className="block w-full px-3 py-2 border-0 focus:ring-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="您的邮箱地址"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          院系
                        </label>
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                          <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                            <Building className="w-5 h-5" />
                          </span>
                          <input
                            type="text"
                            name="department"
                            className="block w-full px-3 py-2 border-0 focus:ring-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={formData.department}
                            onChange={handleChange}
                            placeholder="您所在的院系"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          年级
                        </label>
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                          <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                            <Calendar className="w-5 h-5" />
                          </span>
                          <input
                            type="text"
                            name="grade"
                            className="block w-full px-3 py-2 border-0 focus:ring-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={formData.grade}
                            onChange={handleChange}
                            placeholder="例如：2024级"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          身份
                        </label>
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                          <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                            <GraduationCap className="w-5 h-5" />
                          </span>
                          <input
                            type="text"
                            name="role"
                            className="block w-full px-3 py-2 border-0 focus:ring-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={formData.role}
                            onChange={handleChange}
                            placeholder="例如：学生/教师"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          个人简介
                        </label>
                        <div className="flex items-start border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                          <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                            <BookOpen className="w-5 h-5" />
                          </span>
                          <textarea
                            name="bio"
                            rows={4}
                            className="block w-full px-3 py-2 border-0 focus:ring-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="写一些关于您自己的介绍..."
                          ></textarea>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        保存修改
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {user?.username || '未设置昵称'}
                      </h2>
                      {user?.role && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mt-2">
                          {user.role}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">邮箱</p>
                          <p className="text-gray-900 dark:text-white">{user?.email || '未设置邮箱'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Building className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">院系</p>
                          <p className="text-gray-900 dark:text-white">{user?.department || '未设置院系'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">年级</p>
                          <p className="text-gray-900 dark:text-white">{user?.grade || '未设置年级'}</p>
                        </div>
                      </div>
                    </div>
                    
                    {(user?.bio && user.bio.length > 0) && (
                      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">关于我</h3>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{user.bio}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

