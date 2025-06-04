'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { User, Mail, BookOpen, Building, GraduationCap, Calendar, Pencil, Save, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '../components/ProtectedRoute'
import Image from 'next/image'
import { usersAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { useTranslation } from '../hooks/useTranslation'

export default function MyProfile() {
  const { theme } = useTheme()
  const { user, updateUserProfile, isAuthenticated } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // 编辑状态字段
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    department: '',
    grade: '',
    role: ''
  })

  // 从后端获取用户资料
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        const profile = await usersAPI.getCurrentUserProfile()
        
        // 更新本地状态
        setFormData({
          username: profile.username || '',
          email: profile.email || '',
          bio: profile.bio || '',
          department: profile.department || '',
          grade: profile.grade || '',
          role: profile.role || ''
        })
        
        // 更新AuthContext中的用户信息
        updateUserProfile({
          email: profile.email,
          username: profile.username,
          bio: profile.bio,
          department: profile.department,
          grade: profile.grade,
          role: profile.role,
          avatar: profile.avatar
        })
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
        toast.error(t('fetchProfileError'))
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchUserProfile()
    }
  }, [isAuthenticated])

  // 处理表单输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      
      // 调用API更新用户资料
      const updatedProfile = await usersAPI.updateUserProfile({
        username: formData.username,
        bio: formData.bio,
        department: formData.department,
        grade: formData.grade,
        role: formData.role
      })
      
      // 更新本地状态
      updateUserProfile({
        username: updatedProfile.username,
        bio: updatedProfile.bio,
        department: updatedProfile.department,
        grade: updatedProfile.grade,
        role: updatedProfile.role
      })
      
      toast.success(t('profileUpdate.success'))
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error(t('profileUpdate.error'))
    } finally {
      setSaving(false)
    }
  }

  // 取消编辑，恢复原始数据
  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
      department: user?.department || '',
      grade: user?.grade || '',
      role: user?.role || ''
    })
    setIsEditing(false)
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-8"></div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* 页面标题 */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('myProfile')}</h1>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  {t('editProfile')}
                </button>
              )}
            </div>
            
            {/* 个人资料卡片 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
              {/* 顶部信息区 */}
              <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 h-40">
                <div className="absolute -bottom-16 left-8">
                  {user?.avatar && user.avatar !== "" ? (
                    <Image
                      src={user.avatar}
                      alt={t('userAvatar')}
                      width={96}
                      height={96}
                      className="rounded-full border-4 border-white dark:border-gray-800"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-violet-600 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white dark:border-gray-800">
                      {formData.username ? formData.username.charAt(0).toUpperCase() : 'U'}
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
                          {t('username')}
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
                            placeholder={t('placeholder.username')}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('email')}
                        </label>
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden opacity-60">
                          <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                            <Mail className="w-5 h-5" />
                          </span>
                          <input
                            type="email"
                            name="email"
                            className="block w-full px-3 py-2 border-0 focus:ring-0 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                            value={formData.email}
                            disabled
                            readOnly
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('department')}
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
                            placeholder={t('placeholder.department')}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('grade')}
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
                            placeholder={t('placeholder.grade')}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('role')}
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
                            placeholder={t('placeholder.role')}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('bio')}
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
                            placeholder={t('placeholder.bio')}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                    
                    {/* 编辑按钮 */}
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                      >
                        <X className="w-5 h-5" />
                        {t('cancel')}
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="w-5 h-5" />
                        {saving ? t('saving') : t('save')}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formData.username || t('notSet.username')}
                      </h2>
                      {formData.role && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mt-2">
                          {formData.role}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t('email')}</p>
                          <p className="text-gray-900 dark:text-white">{formData.email || t('notSet.email')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Building className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t('department')}</p>
                          <p className="text-gray-900 dark:text-white">{formData.department || t('notSet.department')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t('grade')}</p>
                          <p className="text-gray-900 dark:text-white">{formData.grade || t('notSet.grade')}</p>
                        </div>
                      </div>
                    </div>
                    
                    {(formData.bio && formData.bio.length > 0) && (
                      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('aboutMe')}</h3>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{formData.bio}</p>
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

