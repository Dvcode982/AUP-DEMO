'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import TextInput from './create-post/TextInput'
import MediaUpload from './create-post/MediaUpload'
import EmojiPicker from './create-post/EmojiPicker'
import CategorySelector from './create-post/CategorySelector'
import PrivacySelector from './create-post/PrivacySelector'
import LocationPicker from './create-post/LocationPicker'

export default function CreatePost() {
  const [content, setContent] = useState('')
  const [media, setMedia] = useState<File[]>([])
  const [category, setCategory] = useState('')
  const [privacy, setPrivacy] = useState('public')
  const [location, setLocation] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the post data to your backend
    console.log({ content, media, category, privacy, location })
    // Reset form after submission
    setContent('')
    setMedia([])
    setCategory('')
    setPrivacy('public')
    setLocation('')
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
          <MediaUpload onFileSelect={setMedia} />
          <div className="flex space-x-4">
            <CategorySelector value={category} onChange={setCategory} />
            <PrivacySelector value={privacy} onChange={setPrivacy} />
          </div>
          <LocationPicker value={location} onChange={setLocation} />
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">发布帖子</Button>
        </CardFooter>
      </form>
    </Card>
  )
}

