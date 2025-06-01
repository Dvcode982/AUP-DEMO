'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import TextInput from './create-post/TextInput'
import { lostAndFoundAPI } from '@/lib/api'
import { useLanguage } from '@/app/contexts/LanguageContext'

export default function CreateLostFound() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) return
    
    try {
      setIsSubmitting(true)
      // 调用API发布失物招领
      const response = await lostAndFoundAPI.createLostAndFoundItem({
        content
      })
      
      console.log('Lost and found item created:', response)
      
      // 创建成功后跳转到失物招领列表页面
      router.push('/lost-and-found')
    } catch (error) {
      console.error('Error creating lost and found item:', error)
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{t('lostAndFound.publishInfoTitle')}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('lostAndFound.descriptionLabel')}</label>
            <TextInput
              value={content}
              onChange={setContent}
              onEmojiSelect={(emoji) => setContent(prev => prev + emoji)}
              placeholder={t('lostAndFound.descriptionPlaceholder')}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? t('lostAndFound.publishingButton') : t('lostAndFound.publishButton')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}