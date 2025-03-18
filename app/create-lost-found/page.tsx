import Sidebar from '../components/Sidebar'
import CreateLostFound from '../components/create-lost-found'

export default function CreateLostFoundPage() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <Sidebar />
      <main className="flex-1 p-4 overflow-hidden">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">创建失物招领</h1>
          <CreateLostFound />
        </div>
      </main>
    </div>
  )
}