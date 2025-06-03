'use client'
import Sidebar from './components/Sidebar'
import Post from './components/Post'
import SearchBar from './components/SearchBar'
import ChatWindow from './components/messages/ChatWindow'
import FloatingActionButton from './components/FloatingActionButton'
import TopicRecommendations from './components/TopicRecommendations'
import { useState, useEffect, useRef } from 'react'
import { postsAPI, topicAggregationAPI } from '@/lib/api'
import { useAuth } from './contexts/AuthContext'
import { X, Sparkles, Grid3X3 } from 'lucide-react'
import Image from 'next/image'

// 类型声明
interface ForumPost {
  id: number;
  title?: string;
  content: string;
  isLostAndFound?: boolean;
  author: string;
  avatar: string;
  time: string;
  tags: string[];
  image?: string;
  images?: string[];
  postType?: 'forum' | 'lostAndFound';
  likes?: number;
  comments?: number;
  shares?: number;
}

export default function Home() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'aggregated'>('all');
  const { isAuthenticated } = useAuth();
  const [returnTextColor, setReturnTextColor] = useState('text-blue-700 hover:text-blue-900');
  const colorCheckTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!selectedPost) {
      fetchPosts(searchQuery);
    }
    // eslint-disable-next-line
  }, [viewMode, isAuthenticated]);

  useEffect(() => {
    // 保持原有的URL search参数同步
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
      fetchPosts(searchParam);
    } else if (!selectedPost) {
      fetchPosts('');
    }
    // eslint-disable-next-line
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    await fetchPosts(query);
  }

  const fetchPosts = async (query: string) => {
    try {
      setLoading(true);
      let data: any[] = [];
      if (viewMode === 'aggregated' && isAuthenticated && !query) {
        data = await topicAggregationAPI.getAggregatedPosts(50);
      } else {
        data = await postsAPI.getPosts(query);
      }
      // 只显示非失物招领
      const forumPosts = data.filter((post: any) => !post.isLostAndFound);
      const postsWithAvatars = forumPosts.map((post: any) => ({
        ...post,
        avatar: post.avatar || '/placeholder.svg?height=40&width=40',
        postType: 'forum',
        author: post.author || '未知用户',
        time: post.time || '',
        tags: post.tags || [],
        content: post.content || '',
        id: typeof post.id === 'number' ? post.id : Number(post.id),
        likes: post.likes || 0,
        comments: post.comments || 0,
        shares: post.shares || 0,
      }));
      setPosts(postsWithAvatars);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  // 主页点击帖子卡片时展开评论区
  const handlePostClick = (post: ForumPost) => {
    setSelectedPost(post);
  }

  const closePostDetail = () => {
    setSelectedPost(null);
  }

  // 调色函数：根据当前背景色自动适配返回列表按钮颜色，提高对比度
  useEffect(() => {
    function getContrastYIQ(r: number, g: number, b: number) {
      // YIQ公式，返回黑/白
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;
      return yiq >= 180 ? 'text-blue-800 hover:text-blue-900' : 'text-blue-100 hover:text-blue-200';
    }
    function parseRgb(str: string) {
      // 支持 rgb/rgba/hex
      if (str.startsWith('rgb')) {
        const arr = str.match(/\d+(\.\d+)?/g);
        if (!arr) return [255, 255, 255, 1];
        return [
          parseInt(arr[0], 10),
          parseInt(arr[1], 10),
          parseInt(arr[2], 10),
          arr[3] !== undefined ? parseFloat(arr[3]) : 1
        ];
      }
      if (str.startsWith('#')) {
        let hex = str.replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
        const num = parseInt(hex, 16);
        return [
          (num >> 16) & 255,
          (num >> 8) & 255,
          num & 255,
          1
        ];
      }
      // fallback
      return [255, 255, 255, 1];
    }
    function updateColor() {
      let color = 'text-blue-700 hover:text-blue-900';
      if (typeof window !== 'undefined') {
        // 取body背景色
        let bg = window.getComputedStyle(document.body).backgroundColor;
        // 如果body是透明，尝试取html背景色
        if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
          bg = window.getComputedStyle(document.documentElement).backgroundColor;
        }
        const [r, g, b, a] = parseRgb(bg);
        // 透明度低时用深蓝，否则根据亮度自动切换
        if (a < 0.7) {
          color = 'text-blue-800 hover:text-blue-900';
        } else {
          color = getContrastYIQ(r, g, b);
        }
        // 深色模式下再加一层判断
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDark && a > 0.7) {
          color = 'text-blue-100 hover:text-blue-200';
        }
      }
      setReturnTextColor(color);
    }
    updateColor();

    // 监听主题切换
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', updateColor);

    // 监听背景色变化（轮询，防止透明度/背景切换）
    colorCheckTimer.current = setInterval(updateColor, 500);

    return () => {
      mq.removeEventListener('change', updateColor);
      if (colorCheckTimer.current) clearInterval(colorCheckTimer.current);
    };
  }, []);

  return (
    <div className="flex h-screen ">
      <Sidebar />

      <main className="flex-1 pt-4 pb-4 pl-4 pr-4 overflow-hidden flex">
        {/* 左侧区域 */}
        <div className={`flex flex-col transition-all duration-300 ${selectedPost ? 'w-1/2' : 'w-full'} h-full`}>
          <SearchBar onSearch={handleSearch} />

          {selectedPost ? (
            // 显示选中的帖子详情（半透明风格）
            <div className="flex-1 flex flex-col mt-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-4"
                 style={{ maxHeight: 'calc(100vh - 140px)' }}>
              <button
                onClick={closePostDetail}
                className={`mb-4 text-sm flex items-center font-semibold transition-colors ${returnTextColor}`}
                style={{ textShadow: '0 1px 4px rgba(255,255,255,0.7), 0 1px 4px rgba(0,0,0,0.2)' }}
              >
                <X className="h-4 w-4 mr-1" />
                返回列表
              </button>
              <Post 
                {...selectedPost}
                isSelected={true}
                disableLink
              />
            </div>
          ) : (
            <div className="flex flex-1 min-h-0">
              {/* 主内容区 */}
              <div className="flex flex-col flex-1 min-h-0 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-2 sm:p-3">
                {/* 视图切换按钮 */}
                {isAuthenticated && (
                  <div className="mb-3 flex gap-2">
                    <button
                      onClick={() => setViewMode('all')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        viewMode === 'all'
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                      全部帖子
                    </button>
                    <button
                      onClick={() => setViewMode('aggregated')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        viewMode === 'aggregated'
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      为您推荐
                    </button>
                  </div>
                )}

                {/* 帖子网格（半透明风格） */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">加载中...</p>
                      </div>
                    </div>
                  ) : posts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3 auto-rows-max">
                      {posts.map(post => (
                        <Post 
                          key={post.id} 
                          {...post} 
                          disableLink
                          onClick={() => handlePostClick(post)}
                          cardClassName="bg-white/80 dark:bg-gray-800/80 backdrop-blur"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {viewMode === 'aggregated' ? '暂无推荐内容，多浏览一些帖子吧！' : '暂无论坛帖子'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {/* 右侧推荐区 - 半透明紧凑风格 */}
              <div className="hidden lg:block w-1/5 p-4 bg-opacity-80">
                <div className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-2xl h-full">
                  <TopicRecommendations />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 右侧区域（评论展开时显示评论区，否则由上方右侧推荐区承担） */}
        {selectedPost && (
          <div className="w-1/2 pl-4">
            <ChatWindow 
              chatId={`post-${selectedPost.id}`}
              title={`评论区 - ${selectedPost.title ? selectedPost.title : (selectedPost.content ? selectedPost.content.substring(0, 20) : '无标题')}`}
              showUserInfo={false}
              isComment={true}
            />
          </div>
        )}
        <FloatingActionButton />
      </main>
    </div>
  )
}
