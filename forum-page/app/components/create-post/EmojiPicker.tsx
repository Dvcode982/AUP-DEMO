'use client'

import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Smile } from 'lucide-react'
import dynamic from 'next/dynamic'

const Picker = dynamic(() => import('@emoji-mart/react'), { ssr: false })

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
}

export default function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleEmojiSelect = (emoji: any) => {
    onEmojiSelect(emoji.native)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="absolute right-2 bottom-2 text-gray-500 hover:text-gray-700"
        >
          <Smile size={20} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        {isOpen && (
          <Picker
            onEmojiSelect={handleEmojiSelect}
            theme="light"
          />
        )}
      </PopoverContent>
    </Popover>
  )
}

