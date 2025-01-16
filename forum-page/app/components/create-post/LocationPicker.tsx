'use client'

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPin } from 'lucide-react'

interface LocationPickerProps {
  value: string
  onChange: (value: string) => void
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [isLocating, setIsLocating] = useState(false)

  const getLocation = () => {
    setIsLocating(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          // Here you would typically use a reverse geocoding service to get the location name
          // For this example, we'll just use the coordinates
          onChange(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
          setIsLocating(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          setIsLocating(false)
        }
      )
    } else {
      console.error('Geolocation is not supported by this browser.')
      setIsLocating(false)
    }
  }

  return (
    <div className="flex space-x-2">
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="输入或选择位置"
        className="flex-grow"
      />
      <Button onClick={getLocation} disabled={isLocating}>
        <MapPin className="mr-2 h-4 w-4" />
        {isLocating ? '定位中...' : '获取位置'}
      </Button>
    </div>
  )
}

