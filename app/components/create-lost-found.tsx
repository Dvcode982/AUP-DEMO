'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from '../hooks/useTranslation'
import { lostAndFoundAPI } from '@/lib/api'
import { 
  Package, 
  Calendar, 
  MapPin, 
  Phone, 
  Gift, 
  Camera, 
  X, 
  Info, 
  CheckCircle2,
  AlertCircle,
  Upload,
  Eye
} from 'lucide-react'

interface CreateLostFoundProps {
  initialType?: 'lost' | 'found'
}

interface FormData {
  type: 'lost' | 'found'
  itemName: string
  description: string
  location: string
  time: string
  contactInfo: string
  reward: string
  category: string
  images: File[]
}

const CATEGORIES = [
  'electronics',
  'documents', 
  'keys',
  'clothing',
  'books',
  'sports',
  'bags',
  'jewelry',
  'others'
]

export default function CreateLostFound({ initialType = 'lost' }: CreateLostFoundProps) {
  const router = useRouter()
  const { t } = useTranslation()
  
  const [formData, setFormData] = useState<FormData>({
    type: initialType,
    itemName: '',
    description: '',
    location: '',
    time: '',
    contactInfo: '',
    reward: '',
    category: '',
    images: []
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.itemName.trim()) {
      newErrors.itemName = t('lostFound.validation.itemNameRequired')
    }
    
    if (!formData.description.trim()) {
      newErrors.description = t('lostFound.validation.descriptionRequired')
    }
    
    if (!formData.location.trim()) {
      newErrors.location = t('lostFound.validation.locationRequired')
    }
    
    if (!formData.time) {
      newErrors.time = t('lostFound.validation.timeRequired')
    }
    
    if (!formData.contactInfo.trim()) {
      newErrors.contactInfo = t('lostFound.validation.contactRequired')
    }
    
    if (!formData.category) {
      newErrors.category = t('lostFound.validation.categoryRequired')
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + formData.images.length > 6) {
      alert('最多只能上传6张图片')
      return
    }
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }))
  }

  // 移除图片
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      setIsSubmitting(true)
      
      // 准备提交数据 - 确保所有必要字段都被设置
      const submitData = {
        // 基本信息
        itemName: formData.itemName,
        itemType: formData.type, // 'lost' 或 'found'
        content: formData.description,
        
        // 分类和标签
        category: formData.category,
        
        // 位置和时间
        location: formData.location,
        time: formData.time,
        
        // 联系信息
        contactInfo: formData.contactInfo,
        reward: formData.reward || '',
        
        // 图片信息
        images: formData.images
      }
      
      console.log('Submitting lost and found item:', submitData)
      
      const response = await lostAndFoundAPI.createLostAndFoundItem(submitData)
      
      // 显示成功消息
      alert(t('lostFound.success.published'))
      
      // 跳转到失物招领列表
      router.push('/lost-and-found')
    } catch (error) {
      console.error('Error creating lost and found item:', error)
      alert(t('lostFound.error.publishFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // 保存草稿
  const handleSaveDraft = () => {
    localStorage.setItem('lostFoundDraft', JSON.stringify(formData))
    alert(t('lostFound.success.draftSaved'))
  }

  // 加载草稿
  useEffect(() => {
    const draft = localStorage.getItem('lostFoundDraft')
    if (draft) {
      try {
        const draftData = JSON.parse(draft)
        setFormData(prev => ({ ...prev, ...draftData }))
      } catch (error) {
        console.error('Error loading draft:', error)
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* 帖子类型选择器 */}
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>{t('lostFound.postType')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 寻物启事 */}
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'lost' }))}
              className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                formData.type === 'lost'
                  ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700'
                  : 'border-gray-200 bg-white dark:bg-gray-700 dark:border-gray-600 hover:border-red-200 hover:bg-red-50/50 dark:hover:bg-red-900/10'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <span className="text-2xl">🔍</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t('lostFound.lostItem')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('lostFound.lostDescription')}
                  </p>
                </div>
              </div>
            </button>

            {/* 招领启事 */}
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'found' }))}
              className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                formData.type === 'found'
                  ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700'
                  : 'border-gray-200 bg-white dark:bg-gray-700 dark:border-gray-600 hover:border-green-200 hover:bg-green-50/50 dark:hover:bg-green-900/10'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t('lostFound.foundItem')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('lostFound.foundDescription')}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 主表单 */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：主要信息 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本信息 */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="w-5 h-5" />
                  <span>基本信息</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 物品名称 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('lostFound.itemName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.itemName}
                    onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
                    placeholder={t('lostFound.placeholder.itemName')}
                    className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.itemName ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.itemName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.itemName}</span>
                    </p>
                  )}
                </div>

                {/* 物品分类 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('lostFound.category')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.category ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">{t('lostFound.placeholder.category')}</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {t(`lostFound.categories.${cat}`)}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.category}</span>
                    </p>
                  )}
                </div>

                {/* 详细描述 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('lostFound.itemDescription')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={t('lostFound.placeholder.itemDescription')}
                    rows={4}
                    className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                      errors.description ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.description}</span>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 时间地点信息 */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>时间地点</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 地点 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {formData.type === 'lost' ? t('lostFound.lostLocation') : t('lostFound.foundLocation')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder={formData.type === 'lost' ? t('lostFound.placeholder.lostLocation') : t('lostFound.placeholder.foundLocation')}
                      className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.location ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.location}</span>
                      </p>
                    )}
                  </div>

                  {/* 时间 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {formData.type === 'lost' ? t('lostFound.lostTime') : t('lostFound.foundTime')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.time ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {errors.time && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.time}</span>
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 联系信息 */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="w-5 h-5" />
                  <span>联系信息</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 联系方式 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('lostFound.contactInfo')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.contactInfo}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactInfo: e.target.value }))}
                      placeholder={t('lostFound.placeholder.contactInfo')}
                      className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.contactInfo ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {errors.contactInfo && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.contactInfo}</span>
                      </p>
                    )}
                  </div>

                  {/* 酬谢 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('lostFound.reward')}
                    </label>
                    <input
                      type="text"
                      value={formData.reward}
                      onChange={(e) => setFormData(prev => ({ ...prev, reward: e.target.value }))}
                      placeholder={t('lostFound.placeholder.reward')}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 图片上传 */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="w-5 h-5" />
                  <span>图片上传</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                    (最多6张)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 上传按钮 */}
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">{t('lostFound.selectImages')}</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          支持 PNG, JPG, JPEG 格式
                        </p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* 图片预览 */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {formData.images.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：操作面板和提示 */}
          <div className="space-y-6">
            {/* 操作按钮 */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl transition-colors"
                >
                  {isSubmitting ? t('lostFound.publishing') : t('lostFound.publishPost')}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  className="w-full py-3 rounded-xl"
                >
                  {t('lostFound.draft')}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full py-3 rounded-xl"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {t('lostFound.preview')}
                </Button>
              </CardContent>
            </Card>

            {/* 发布小贴士 */}
            <Card className="border-0 shadow-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                  <Info className="w-5 h-5" />
                  <span>{t('lostFound.tips.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-300">
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{t('lostFound.tips.tip1')}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{t('lostFound.tips.tip2')}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{t('lostFound.tips.tip3')}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{t('lostFound.tips.tip4')}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}