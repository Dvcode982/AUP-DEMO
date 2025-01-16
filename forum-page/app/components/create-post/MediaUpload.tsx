'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { X } from 'lucide-react'

interface MediaUploadProps {
  onFileSelect: (files: File[]) => void
}

export default function MediaUpload({ onFileSelect }: MediaUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')
      const isValidVideo = isVideo && file.size <= 100 * 1024 * 1024 // 100MB limit for videos
      return isImage || isValidVideo
    }).slice(0, 9) // Limit to 9 files

    setSelectedFiles(validFiles)
    onFileSelect(validFiles)
  }

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    onFileSelect(newFiles)
  }

  return (
    <div className="space-y-2">
      <input
        type="file"
        id="media-upload"
        multiple
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button asChild>
        <label htmlFor="media-upload">上传图片或视频</label>
      </Button>
      <div className="grid grid-cols-3 gap-2">
        {selectedFiles.map((file, index) => (
          <div key={index} className="relative">
            {file.type.startsWith('image/') ? (
              <img
                src={URL.createObjectURL(file)}
                alt={`Selected ${index + 1}`}
                className="w-full h-24 object-cover rounded"
              />
            ) : (
              <video
                src={URL.createObjectURL(file)}
                className="w-full h-24 object-cover rounded"
              />
            )}
            <button
              onClick={() => removeFile(index)}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

