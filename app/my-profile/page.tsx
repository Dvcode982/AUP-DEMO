'use client'

import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { User, Mail, BookOpen } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function MyProfile() {
  const { theme } = useTheme()
  const [name, setName] = useState('John Doe')
  const [email, setEmail] = useState('johndoe@example.com')
  const [bio, setBio] = useState('这里是个人简介...你可以写一些关于自己的介绍。')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically handle the profile update logic
    console.log('Profile updated:', { name, email, bio })
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">我的资料</h1>
          <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{name}</h2>
                <p className="text-gray-600 dark:text-gray-400">会员since 2023</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="text-blue-500" />
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 dark:text-white"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="text-blue-500" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 dark:text-white"
                />
              </div>
              <div className="flex items-start space-x-2">
                <BookOpen className="text-blue-500 mt-2" />
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="flex-1 dark:text-white"
                />
              </div>
            </div>
            <Button type="submit" className="w-full">保存更改</Button>
          </form>
        </div>
      </main>
    </div>
  )
}

