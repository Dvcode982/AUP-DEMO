'use client'

import { useEffect } from 'react'

export default function FontSizeProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // 从本地存储中获取保存的字体大小
        const savedFontSize = localStorage.getItem('fontSize') || 'medium'
        const root = document.documentElement

        // 应用保存的字体大小
        switch (savedFontSize) {
            case 'small':
                root.style.setProperty('--font-size-base', '14px')
                break
            case 'medium':
                root.style.setProperty('--font-size-base', '16px')
                break
            case 'large':
                root.style.setProperty('--font-size-base', '18px')
                break
        }
    }, [])

    return <>{children}</>
} 