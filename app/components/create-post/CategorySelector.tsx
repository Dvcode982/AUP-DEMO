'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CategorySelectorProps {
  value: string
  onChange: (value: string) => void
}

const categories = [
  '校园资讯',
  '学习交流',
  '生活分享',
  '失物招领',
  '社团活动',
]

export default function CategorySelector({ value, onChange }: CategorySelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="选择分类" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category} value={category}>
            {category}
          </SelectItem>
        ))}
        <SelectItem value="custom">自定义</SelectItem>
      </SelectContent>
    </Select>
  )
}

