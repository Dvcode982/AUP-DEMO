'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

const BackgroundContext = createContext<{
  isCustomBackground: boolean
  toggleBackground: () => void
} | undefined>(undefined)

export function BackgroundProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [isCustomBackground, setIsCustomBackground] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    if (isCustomBackground) {
      const overlay = theme === 'dark'
        ? "linear-gradient(rgba(35, 35, 35, 0.39), rgba(43, 43, 43, 0.39))"
        : "linear-gradient(rgba(43, 43, 43, 0.19), rgba(255, 255, 255, 0.19))"

      document.body.style.backgroundImage = `${overlay}, url('/images/EVA_BG.jpg')`
      document.body.style.backgroundSize = "cover"
      document.body.style.backgroundPosition = "center"
      document.body.style.backgroundRepeat = "no-repeat"
      document.body.style.backgroundAttachment = "fixed"
    } else {
      document.body.style.backgroundImage = ""
      document.body.style.backgroundAttachment = ""
    }
  }, [theme, isCustomBackground, mounted])

  const toggleBackground = () => {
    setIsCustomBackground(prev => !prev)
  }

  return (
    <BackgroundContext.Provider value={{ isCustomBackground, toggleBackground }}>
      {children}
    </BackgroundContext.Provider>
  )
}

export function useBackground() {
  const context = useContext(BackgroundContext)
  if (!context) {
    throw new Error('useBackground must be used within a BackgroundProvider')
  }
  return context
}