import Post, { PostProps } from './Post'

interface PostListProps {
  posts?: PostProps[]
}

const PostList = ({ posts = [] }: PostListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 overflow-y-auto grid-fluid" style={{maxHeight: 'calc(100vh - 120px)'}}>
      {posts.map(post => (
        <Post key={post.id} {...post} />
      ))}
    </div>
  )
}

export default PostList
