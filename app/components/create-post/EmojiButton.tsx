'use client'

import { Button } from "@/components/ui/button"
import { Smile } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// 动态导入 emoji picker
const Picker = dynamic(
  () => import('@emoji-mart/react').then((mod) => mod.default),
  { ssr: false }
)

interface EmojiButtonProps {
  onSelect: (emoji: string) => void;
}

export function EmojiButton({ onSelect }: EmojiButtonProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-800 hover:text-blue-600 dark:hover:text-blue-300"
        >
          <Smile className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
          <Picker 
            data={async () => {
              const response = await fetch(
                'https://cdn.jsdelivr.net/npm/@emoji-mart/data'
              )
              return response.json()
            }}
            onEmojiSelect={(emoji: any) => onSelect(emoji.native)} 
          />
        </Suspense>
      </PopoverContent>
    </Popover>
  )
}
