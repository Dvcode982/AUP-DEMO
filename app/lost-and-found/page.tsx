import Sidebar from '../components/Sidebar'
import Post from '../components/Post'
import SearchBar from '../components/SearchBar'
import FloatingActionButton from '../components/FloatingActionButton'

const lostAndFoundPosts = [
  {
    id: 1,
    author: '用户A',
    avatar: '/placeholder.svg?height=40&width=40',
    content: '在图书馆丢失了一本红色封面的书，如有人看到请联系我。',
    time: '2023-07-01 10:00',
    tags: ['失物', '图书馆', '书籍'],
    isLostAndFound: true,
    isReturned: false
  },
  {
    id: 2,
    author: '用户B',
    avatar: '/placeholder.svg?height=40&width=40',
    content: '在操场上捡到一个蓝色钱包，请失主尽快认领。',
    time: '2023-07-01 11:30',
    tags: ['招领', '操场', '钱包'],
    isLostAndFound: true,
    isReturned: true,
    returnedTime: '2023-07-02 14:00'
  },
  {
    id: 3,
    author: '用户C',
    avatar: '/placeholder.svg?height=40&width=40',
    content: '在食堂丢失了一副眼镜，黑框，度数较高。如有人拾到请与我联系。',
    time: '2023-07-03 09:15',
    tags: ['失物', '食堂', '眼镜'],
    isLostAndFound: true,
    isReturned: false
  }
]

export default function LostAndFound() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <Sidebar />
      <main className="flex-1 p-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <SearchBar />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 overflow-y-auto" style={{maxHeight: 'calc(100vh - 140px)'}}>
            {lostAndFoundPosts.map(post => (
              <Post key={post.id} {...post} />
            ))}
          </div>
          <FloatingActionButton />
        </div>
      </main>
    </div>
  )
}

