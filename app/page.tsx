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
      <Sidebar />
      <main className="flex-1 p-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">看看贴</h1>
          <SearchBar />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 overflow-y-auto" style={{maxHeight: 'calc(100vh - 140px)'}}>
            {posts.map(post => (
              <Post key={post.id} {...post} />
            ))}
          </div>
          <FloatingActionButton />
        </div>
      </main>
    </div>
  )
}

