'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import Sidebar from '../../components/Sidebar'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CreatePostPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isGeneratingTags, setIsGeneratingTags] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 生成标签
  const generateTags = async () => {
    if (!content.trim()) {
      toast.error('请先输入帖子内容')
      return
    }

    try {
      setIsGeneratingTags(true)
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-608efd7fe0304c8e9c7a974f270f495e'
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "你是一个专业的标签生成助手。请分析用户提供的文本内容，生成3-5个最相关的标签。标签应该是简短的词语或短语，用逗号分隔。只返回标签，不要其他解释。"
            },
            {
              role: "user",
              content: content
            }
          ],
          temperature: 0.7,
          max_tokens: 100
        })
      })

      const data = await response.json()
      if (data.choices && data.choices[0]) {
        const generatedTags = data.choices[0].message.content
          .split(',')
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag.length > 0)
        
        setTags(prevTags => {
          const newTags = [...prevTags]
          generatedTags.forEach((tag: string) => {
            if (!newTags.includes(tag)) {
              newTags.push(tag)
            }
          })
          return newTags
        })
      }
    } catch (error) {
      console.error('生成标签失败:', error)
      toast.error('生成标签失败，请稍后重试')
    } finally {
      setIsGeneratingTags(false)
    }
  }

  // 添加标签
  const addTag = () => {
    if (!newTag.trim()) return
    if (tags.includes(newTag.trim())) {
      toast.error('该标签已存在')
      return
    }
    setTags([...tags, newTag.trim()])
    setNewTag('')
  }

  // 删除标签
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  // 发布帖子
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('请填写标题和内容')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          content,
          tags
        })
      })

      if (!response.ok) {
        throw new Error('发布失败')
      }

      toast.success('发布成功')
      router.push('/posts')
    } catch (error) {
      console.error('发布帖子失败:', error)
      toast.error('发布失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">请先登录</h2>
            <Button onClick={() => router.push('/login')}>前往登录</Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <Sidebar />
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">发布新帖子</h1>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">标题</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="请输入帖子标题"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">内容</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="请输入帖子内容"
                className="w-full min-h-[200px]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">标签</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateTags}
                  disabled={isGeneratingTags || !content.trim()}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  {isGeneratingTags ? '生成中...' : 'AI 生成标签'}
                </Button>
              </div>
              
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  placeholder="输入标签后按回车添加"
                  className="flex-grow"
                />
                <Button onClick={addTag} disabled={!newTag.trim()}>
                  添加
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
              >
                取消
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !title.trim() || !content.trim()}
              >
                {isSubmitting ? '发布中...' : '发布'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 