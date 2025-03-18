'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import TextInput from './create-post/TextInput'
import MediaUpload from './create-post/MediaUpload'
import EmojiPicker from './create-post/EmojiPicker'
import { postsAPI } from '@/lib/api'

export default function CreatePost() {
  const [content, setContent] = useState('')
  const [media, setMedia] = useState<File[]>([])
  const [tags, setTags] = useState<string[]>([])

  // 当内容变化时，解析标签
  useEffect(() => {
    // 使用正则表达式匹配所有 #标签
    const tagRegex = /#([\u4e00-\u9fa5a-zA-Z0-9_]+)/g
    const matches = content.match(tagRegex)
    
    if (matches) {
      // 提取标签文本（去掉#符号）
      const extractedTags = matches.map(tag => tag.substring(1))
      setTags(extractedTags)
    } else {
      setTags([])
    }
  }, [content])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // 调用API发布帖子
      const response = await postsAPI.createPost({
        content,
        media: media.length > 0 ? URL.createObjectURL(media[0]) : null,
        tags
      })
      
      console.log('Post created:', response)
      
      // 重置表单
      setContent('')
      setMedia([])
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>创建新帖子</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <TextInput
            value={content}
            onChange={setContent}
            onEmojiSelect={(emoji) => setContent(prev => prev + emoji)}
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <MediaUpload onFileSelect={setMedia} />
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">发布帖子</Button>
        </CardFooter>
      </form>
    </Card>
  )
}

