'use client' // 必须添加在文件最顶部

import Sidebar from '../components/Sidebar'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Send, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Feedback() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    type: '功能建议',
    content: '',
    email: '',
    priority: '普通'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // 防止 hydration 不匹配
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // 提交反馈
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.content.trim()) {
      toast.error('请填写反馈内容')
      return
    }

    try {
      setIsSubmitting(true)
      
      // 模拟API调用 - 实际项目中应该调用真实的API
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 将反馈保存到本地存储（实际项目中应该发送到服务器）
      const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]')
      const newFeedback = {
        id: Date.now(),
        ...formData,
        timestamp: new Date().toISOString(),
        status: '已提交'
      }
      feedbacks.push(newFeedback)
      localStorage.setItem('feedbacks', JSON.stringify(feedbacks))
      
      setSubmitSuccess(true)
      toast.success('反馈提交成功！我们会尽快处理您的反馈')
      
      // 清空表单
      setFormData({
        type: '功能建议',
        content: '',
        email: '',
        priority: '普通'
      })
      
      // 3秒后隐藏成功状态
      setTimeout(() => setSubmitSuccess(false), 3000)
      
    } catch (error) {
      console.error('提交反馈失败:', error)
      toast.error('提交失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 动态颜色变量
  const themeClasses = {
    background: theme === 'dark' 
      ? 'bg-gray-900' 
      : 'bg-gradient-to-br from-yellow-50 to-red-50',
    card: theme === 'dark' 
      ? 'bg-gray-800 text-gray-200' 
      : 'bg-white text-gray-800',
    input: theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-gray-200'
      : 'bg-white border-gray-300 text-gray-700',
    label: theme === 'dark' 
      ? 'text-gray-300' 
      : 'text-gray-600'
  }

  if (submitSuccess) {
    return (
      <div className={`flex h-screen ${themeClasses.background}`}>
        <Sidebar />
        <main className="flex-1 p-4 overflow-hidden">
          <div className="max-w-2xl mx-auto flex items-center justify-center h-full">
            <div className={`${themeClasses.card} rounded-lg shadow-lg p-8 text-center`}>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">反馈提交成功！</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                感谢您的反馈，我们会认真处理您的建议和问题。
              </p>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                继续反馈
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={`flex h-screen ${themeClasses.background}`}>
      <Sidebar />
      <main className="flex-1 p-4 overflow-hidden">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center space-x-3 mb-6">
            <MessageSquare className={`w-8 h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
              用户反馈
            </h1>
          </div>
          
          <div className={`${themeClasses.card} rounded-xl shadow-lg p-6`}>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">我们重视您的每一条反馈</h2>
              <p className="text-gray-600 dark:text-gray-400">
                您的建议和问题报告将帮助我们不断改善产品体验
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.label} mb-2`}>
                    反馈类型 <span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition-colors`}
                  >
                    <option value="功能建议">功能建议</option>
                    <option value="问题报告">问题报告</option>
                    <option value="界面优化">界面优化</option>
                    <option value="性能问题">性能问题</option>
                    <option value="其他">其他</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${themeClasses.label} mb-2`}>
                    优先级
                  </label>
                  <select 
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition-colors`}
                  >
                    <option value="低">低</option>
                    <option value="普通">普通</option>
                    <option value="高">高</option>
                    <option value="紧急">紧急</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className={`block text-sm font-medium ${themeClasses.label} mb-2`}>
                  联系邮箱 (可选)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="用于接收反馈处理结果"
                  className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition-colors`}
                />
              </div>
              
              <div className="mb-6">
                <label className={`block text-sm font-medium ${themeClasses.label} mb-2`}>
                  反馈内容 <span className="text-red-500">*</span>
                </label>
                <textarea 
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition-colors resize-none`} 
                  rows={6} 
                  placeholder="请详细描述您的反馈、建议或遇到的问题..."
                  required
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {formData.content.length}/500
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>我们承诺在24小时内回复您的反馈</span>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isSubmitting || !formData.content.trim()}
                  className="flex items-center space-x-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>提交中...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>提交反馈</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* 反馈统计 */}
          <div className={`${themeClasses.card} rounded-xl shadow-lg p-6 mt-6`}>
            <h3 className="text-lg font-semibold mb-4">反馈统计</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {JSON.parse(localStorage.getItem('feedbacks') || '[]').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">总反馈数</div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">24h</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">平均响应时间</div>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">98%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">问题解决率</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

