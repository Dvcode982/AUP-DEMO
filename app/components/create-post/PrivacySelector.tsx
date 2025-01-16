'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PrivacySelectorProps {
  value: string
  onChange: (value: string) => void
}

const privacyOptions = [
  { value: 'public', label: '公开' },
  { value: 'friends', label: '仅好友可见' },
  { value: 'private', label: '私密' },
]

export default function PrivacySelector({ value, onChange }: PrivacySelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="选择隐私设置" />
      </SelectTrigger>
      <SelectContent>
        {privacyOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

