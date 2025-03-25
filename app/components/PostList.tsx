import Post from './Post'

const posts = [
  {
    id: 1,
    author: '用户A',
    avatar: '/placeholder.svg?height=40&width=40',
    content: '今天天气真好!',
    image: '/placeholder.svg?height=200&width=300',
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
  // 添加更多帖子...
]

const PostList = ({ posts = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 overflow-y-auto grid-fluid" style={{maxHeight: 'calc(100vh - 120px)'}}>
      {posts.map(post => (
        <Post key={post.id} {...post} />
      ))}
    </div>
  )
}

export default PostList

