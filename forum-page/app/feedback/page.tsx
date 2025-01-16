import Sidebar from '../components/Sidebar'

export default function Feedback() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 to-red-50">
      <Sidebar />
      <main className="flex-1 p-4 overflow-hidden">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">反馈</h1>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <form>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">反馈类型</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                  <option>功能建议</option>
                  <option>问题报告</option>
                  <option>其他</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">反馈内容</label>
                <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" rows={5} placeholder="请详细描述您的反馈..."></textarea>
              </div>
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">提交反馈</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

