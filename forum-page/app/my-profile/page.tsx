import Sidebar from '../components/Sidebar'
import { User, Mail, BookOpen } from 'lucide-react'

export default function MyProfile() {
  return (
    <div className="flex h-screen gradient-bg">
      <Sidebar />
      <main className="flex-1 p-8 overflow-hidden">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">我的资料</h1>
          <div className="card p-6 space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                JD
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">John Doe</h2>
                <p className="text-gray-600">会员since 2023</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="text-blue-500" />
                <input type="text" className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="John Doe" />
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="text-blue-500" />
                <input type="email" className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="johndoe@example.com" />
              </div>
              <div className="flex items-start space-x-2">
                <BookOpen className="text-blue-500 mt-2" />
                <textarea className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} defaultValue="这里是个人简介...你可以写一些关于自己的介绍。"></textarea>
              </div>
            </div>
            <button className="btn-primary w-full">保存更改</button>
          </div>
        </div>
      </main>
    </div>
  )
}

