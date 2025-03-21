'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import TextInput from './create-post/TextInput'
import { lostAndFoundAPI } from '@/lib/api'

export default function CreateLostFound() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        <CardTitle>发布失物招领信息</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">描述</label>
            <TextInput
              value={content}
              onChange={setContent}
              onEmojiSelect={(emoji) => setContent(prev => prev + emoji)}
              placeholder="请详细描述物品特征、丢失/拾获地点和时间等信息..."
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? '发布中...' : '发布信息'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}