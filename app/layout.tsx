import './globals.css'
import './styles/card-text-fade.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { BackgroundProvider } from './contexts/BackgroundContext'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import AIAssistant from './components/AIAssistant'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: '社区论坛',
  description: '一个轻盈的社区论坛应用',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider>
          <BackgroundProvider>
            <AuthProvider>
              {children}
              <AIAssistant />
            </AuthProvider>
          </BackgroundProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}