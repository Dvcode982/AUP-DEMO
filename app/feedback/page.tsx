import Sidebar from '../components/Sidebar'
import { useTheme } from 'next-themes'

export default function Feedback() {
  const { theme } = useTheme()

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-yellow-50 to-red-50'}`}>
      <Sidebar />
      <main className="flex-1 p-4 overflow-hidden">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-gray-200">反馈</h1>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-4`}>
            <form>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-200 mb-2">反馈类型</label>
                <select className={`mt-1 block w-full rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}>
                  <option>功能建议</option>
                  <option>问题报告</option>
                  <option>其他</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-200 mb-2">反馈内容</label>
                <textarea className={`mt-1 block w-full rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`} rows={5} placeholder="请详细描述您的反馈..."></textarea>
              </div>
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200">提交反馈</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

