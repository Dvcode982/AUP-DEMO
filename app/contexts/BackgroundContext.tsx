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
    
    const updateBackground = () => {
      if (isCustomBackground) {
        const overlay = theme === 'dark'
          ? "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.6))"
          : "linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.7))"

        document.body.style.cssText = `
          background-image: ${overlay}, url('/images/EVA_BG.jpg') !important;
          background-size: cover !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
          background-attachment: fixed !important;
          transition: background-image 0.3s ease-in-out !important;
        `
      } else {
        document.body.style.cssText = `
          background-image: none !important;
          background-color: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'} !important;
          transition: background-color 0.3s ease-in-out !important;
        `
      }
    }

    updateBackground()
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