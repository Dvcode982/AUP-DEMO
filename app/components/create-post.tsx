'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import TextInput from './create-post/TextInput'
import MediaUpload from './create-post/MediaUpload'
import TagSelector from './create-post/TagSelector'
import { postsAPI } from '@/lib/api'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/app/contexts/LanguageContext'

export default function CreatePost() {
  const [content, setContent] = useState('')
  const [media, setMedia] = useState<File[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [category, setCategory] = useState<string>('')
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  
  // 从URL获取主题参数
  useEffect(() => {
    const topicParam = searchParams.get('topic')
    if (topicParam) {
      setCategory(topicParam)
    }
  }, [searchParams])

  // 当内容变化时，解析标签
  useEffect(() => {
    // 使用正则表达式匹配所有 #标签
    const tagRegex = /#([\u4e00-\u9fa5a-zA-Z0-9_]+)/g
    const matches = content.match(tagRegex)
    
    if (matches) {
      // 提取标签文本（去掉#符号）
      const extractedTags = matches.map(tag => tag.substring(1))
      // 合并从内容中提取的标签和手动选择的标签，去重
      const allTags = Array.from(new Set([...tags, ...extractedTags]))
      setTags(allTags)
    }
  }, [content])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // 处理图片上传
      let mediaBase64 = null
      if (media.length > 0) {
        // 将图片转换为base64格式
        mediaBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(media[0])
        })
      }
      
      // 调用API发布帖子
      const response = await postsAPI.createPost({
        content,
        media: mediaBase64, // 使用base64格式的图片数据
        tags,
        category
      })
      
      console.log('Post created:', response)
      
      // 重置表单
      setContent('')
      setMedia([])
      setTags([])
      
      // 可以添加成功提示或跳转到帖子列表页
      alert(t('createPost.success'))
    } catch (error) {
      console.error('Error creating post:', error)
      alert(t('createPost.failure'))
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{t('createPost.title')}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <TextInput
            value={content}
            onChange={setContent}
            onEmojiSelect={(emoji) => setContent(prev => prev + emoji)}
          />
          
          <TagSelector 
            selectedTags={tags} 
            onTagsChange={setTags} 
            topic={category} 
            addTagButtonText={t('createPost.addTagButton')}
          />
          
          <MediaUpload onFileSelect={setMedia} />
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">{t('createPost.publishButton')}</Button>
        </CardFooter>
      </form>
    </Card>
  )
}

