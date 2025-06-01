'use client'

import { useState, useEffect, useRef } from 'react'
import { Textarea } from "@/components/ui/textarea"
import dynamic from 'next/dynamic'
import { useLanguage } from '@/app/contexts/LanguageContext'

const EmojiPicker = dynamic(() => import('./EmojiPicker'), { ssr: false })

interface TextInputProps {
  value: string
  onChange: (value: string) => void
  onEmojiSelect: (emoji: string) => void
  placeholder?: string
}

export default function TextInput({ value, onChange, onEmojiSelect, placeholder }: TextInputProps) {
  const [charCount, setCharCount] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { t } = useLanguage()

  useEffect(() => {
    setCharCount(value.length)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    if (newValue.length <= 10000) {
      onChange(newValue)
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    onEmojiSelect(emoji)
    textareaRef.current?.focus()
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          placeholder={placeholder || t('createPost.textInputPlaceholder')}
          className="min-h-[100px]"
        />
        <EmojiPicker onEmojiSelect={handleEmojiSelect} />
      </div>
      <div className="text-right text-sm text-gray-500">
        {charCount}/10000
      </div>
    </div>
  )
}

