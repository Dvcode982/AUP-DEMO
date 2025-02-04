import Sidebar from './components/Sidebar'
import Post from './components/Post'
import SearchBar from './components/SearchBar'
import FloatingActionButton from './components/FloatingActionButton'

const posts = [
  {
    id: 1,
    author: '用户A',
    avatar: '/placeholder.svg?height=40&width=40',
    content: '今天天气真好！',
    time: '2023-07-01 10:00',
    tags: ['天气', '心情', '分享']
  },
  {
    id: 2,
    author: '用户B',
    avatar: '/placeholder.svg?height=40&width=40',
    content: '推荐一本好书《百年孤独》',
    time: '2023-07-01 11:30',
    tags: ['读书', '推荐', '文学']
  },
  {
    id: 3,
    author: '用户C',
    avatar: '/placeholder.svg?height=40&width=40',
    content: '分享一道美食：红烧肉',
    image: '/placeholder.svg?height=200&width=300',
    time: '2023-07-01 12:45',
    tags: ['美食', '烹饪', '分享']
  }
]

export default function Home() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      {/* 左侧功能框 Sidebar 保持不变 */}
      <Sidebar />
      
      <main className="flex-1 p-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <SearchBar />
          
          {/* 竖直排列的帖子内容 */}
          <div className="flex flex-col space-y-4 mt-4 overflow-y-auto" style={{maxHeight: 'calc(100vh - 140px)'}}>
            {posts.map(post => (
              <Post key={post.id} {...post} />
            ))}
          </div>

          {/* 浮动按钮 */}
          <FloatingActionButton />
        </div>
      </main>
    </div>
  )
}

