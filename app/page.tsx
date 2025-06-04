'use client'
import Sidebar from './components/Sidebar'
import Post from './components/Post'
import SearchBar from './components/SearchBar'
import ChatWindow from './components/messages/ChatWindow'
import FloatingActionButton from './components/FloatingActionButton'
import TopicRecommendations from './components/TopicRecommendations'
import SmartRecommendations from './components/SmartRecommendations'
import { useState, useEffect, useRef } from 'react'
import { postsAPI, topicAggregationAPI } from '@/lib/api'
import { useAuth } from './contexts/AuthContext'
import { useTranslation } from './hooks/useTranslation'
import { X, Sparkles, Grid3X3 } from 'lucide-react'

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
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'all' | 'aggregated' | 'smart'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null)
  const [aiTriggered, setAiTriggered] = useState(false)
  const [recommendationStats, setRecommendationStats] = useState<{total: number, displayed: number, query?: string} | null>(null)
  const { isAuthenticated } = useAuth()
  const { t } = useTranslation()
  const [returnTextColor, setReturnTextColor] = useState('text-blue-700 hover:text-blue-900')
  const colorCheckTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!selectedPost) {
      fetchPosts()
    }
  }, [viewMode, isAuthenticated])

  useEffect(() => {
    // 监听AI助手的智能推荐事件
    const handleAISmartRecommend = (event: any) => {
      const { keyword } = event.detail
      console.log('收到AI智能推荐请求:', keyword)
      
      // 设置AI触发状态
      setAiTriggered(true)
      
      // 切换到智能推荐模式
      setViewMode('smart')
      setSearchQuery(keyword)
      
      // 清除AI触发状态
      setTimeout(() => {
        setAiTriggered(false)
      }, 3000)
    }
    
    window.addEventListener('aiSmartRecommend', handleAISmartRecommend)
    
    return () => {
      window.removeEventListener('aiSmartRecommend', handleAISmartRecommend)
    }
  }, [])

  // 调色函数：根据当前背景色自动适配返回列表按钮颜色，提高对比度
  useEffect(() => {
    function getContrastYIQ(r: number, g: number, b: number) {
      // YIQ公式，返回黑/白
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;
      return yiq >= 128 ? 'text-blue-600 hover:text-blue-900' : 'text-blue-100 hover:text-blue-200';
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
      let color = 'text-blue-400 hover:text-blue-900 drop-shadow-sm';
      
      if (typeof window !== 'undefined') {
        try {
          // 获取当前元素的实际背景色
          const detailElement = document.querySelector('.post-detail-container');
          let bg = 'rgba(255, 255, 255, 0.4)'; // 默认半透明白色
          
          if (detailElement) {
            bg = window.getComputedStyle(detailElement).backgroundColor;
          } else {
            // 如果没有找到元素，使用body背景色
            bg = window.getComputedStyle(document.body).backgroundColor;
            if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
              bg = window.getComputedStyle(document.documentElement).backgroundColor;
            }
          }
          
          const [r, g, b, a] = parseRgb(bg);
          
          // 根据透明度和亮度综合判断
          if (a < 0.5) {
            // 透明度很低，使用深色文字
            color = 'text-blue-800 hover:text-blue-900 drop-shadow-lg';
          } else {
            // 根据亮度判断
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            if (brightness > 180) {
              // 亮背景，使用深色文字
              color = 'text-blue-800 hover:text-blue-900 drop-shadow-lg';
            } else if (brightness > 100) {
              // 中等亮度，使用中等对比度
              color = 'text-blue-700 hover:text-blue-800 drop-shadow-lg';
            } else {
              // 暗背景，使用亮文字
              color = 'text-blue-100 hover:text-blue-200 drop-shadow-lg';
            }
          }
          
          // 深色模式额外处理
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (isDark) {
            const darkBrightness = (r * 299 + g * 587 + b * 114) / 1000;
            if (darkBrightness < 100) {
              color = 'text-blue-200 hover:text-blue-100 drop-shadow-lg';
            } else {
              color = 'text-blue-800 hover:text-blue-900 drop-shadow-lg';
            }
          }
          
        } catch (error) {
          console.warn('Color adaptation error:', error);
          color = 'text-blue-700 hover:text-blue-900 drop-shadow-lg';
        }
      }
      
      setReturnTextColor(color);
    }
    
    updateColor();

    // 监听主题切换
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', updateColor);

    // 监听背景色变化（轮询间隔减少以提高响应性）
    colorCheckTimer.current = setInterval(updateColor, 300);

    // 监听窗口大小变化（可能影响布局和背景）
    window.addEventListener('resize', updateColor);

    return () => {
      mq.removeEventListener('change', updateColor);
      window.removeEventListener('resize', updateColor);
      if (colorCheckTimer.current) clearInterval(colorCheckTimer.current);
    };
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true)
      let data
      
      if (viewMode === 'aggregated' && isAuthenticated) {
        // 获取智能聚合的帖子
        data = await topicAggregationAPI.getAggregatedPosts(50)
      } else if (viewMode === 'smart') {
        // 使用智能推荐（将在组件中处理）
        setLoading(false)
        return
      } else {
        // 获取所有帖子
        data = await postsAPI.getPosts()
      }
      
      // 只显示非失物招领
      const forumPosts = data.filter((post: any) => !post.isLostAndFound)
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
      }))
      setPosts(postsWithAvatars)
    } catch (error) {
      console.error('Error fetching posts:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    try {
      setLoading(true)
      setSearchQuery(query)
      
      if (query.trim()) {
        // 如果有搜索词，切换到智能推荐模式
        setViewMode('smart')
      } else {
        // 没有搜索词，显示所有帖子
        setViewMode('all')
        const data = await postsAPI.getPosts()
        const forumPosts = data.filter((post: any) => !post.isLostAndFound)
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
        }))
        setPosts(postsWithAvatars)
      }
    } catch (error) {
      console.error('Error searching posts:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  // 主页点击帖子卡片时展开评论区
  const handlePostClick = async (post: ForumPost) => {
    setSelectedPost(post)
    
    // 记录用户查看帖子的交互行为
    if (isAuthenticated) {
      try {
        // 基于标签推断主题
        let topic = '校园杂谈' // 默认主题
        if (post.tags && post.tags.length > 0) {
          const firstTag = post.tags[0]
          // 根据标签推断主题
          if (['计导坛', '数分坛', '线代坛', '英语坛', '网导坛'].includes(firstTag)) {
            topic = '学术交流'
          } else if (['编程开发', '人工智能', '前端开发', '技术交流'].includes(firstTag)) {
            topic = '技术交流'
          } else if (['美食推荐', '社团活动', '运动健身', '校园风景'].includes(firstTag)) {
            topic = '校园生活'
          } else if (['电子书籍', '视频资源', '学习资料'].includes(firstTag)) {
            topic = '资源分享'
          } else if (['数学建模', '程序设计', '创新创业'].includes(firstTag)) {
            topic = '竞赛交流'
          } else if (['表白专区', '脱单攻略', '情感故事'].includes(firstTag)) {
            topic = '表白墙'
          } else if (['实习信息', '校招信息', '求职经验'].includes(firstTag)) {
            topic = '就业兼职'
          }
        }
        
        await topicAggregationAPI.trackInteraction({
          postId: String(post.id),
          topic: topic,
          tag: post.tags && post.tags.length > 0 ? post.tags[0] : undefined,
          actionType: 'view'
        })
        console.log('Tracked post view interaction:', post.id, 'topic:', topic)
      } catch (error) {
        console.error('Failed to track interaction:', error)
      }
    }
  }

  const closePostDetail = () => {
    setSelectedPost(null)
  }

  const renderContent = () => {
    if (viewMode === 'smart') {
      return (
        <SmartRecommendations
          query={searchQuery}
          maxItems={20}
          showHeader={false}
          className="h-full"
          onStatsUpdate={(stats) => setRecommendationStats(stats)}
        />
      )
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{t('loading')}</p>
          </div>
        </div>
      )
    }

    if (posts.length > 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3 auto-rows-max">
          {posts.map(post => (
            <Post 
              key={post.id} 
              {...post} 
              disableLink
              onClick={() => handlePostClick(post)}
              cardClassName="bg-white/80 dark:bg-gray-800/80"
            />
          ))}
        </div>
      )
    }

    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {viewMode === 'aggregated' ? t('noRecommendedContent') : t('noPosts')}
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex-1 pt-4 pb-4 pl-4 pr-4 overflow-hidden flex">
        {/* 左侧区域 */}
        <div className={`flex flex-col transition-all duration-300 ${selectedPost ? 'w-1/2' : 'w-full'} h-full`}>
          <SearchBar onSearch={handleSearch} placeholder={t('searchPlaceholder')} />

          {selectedPost ? (
            // 显示选中的帖子详情（半透明风格）
            <div className="flex-1 flex flex-col mt-4 bg-white/40 dark:bg-gray-800/40 rounded-lg p-4 post-detail-container"
                 style={{ maxHeight: 'calc(100vh - 140px)' }}>
              <button
                onClick={closePostDetail}
                className={`mb-4 text-sm flex items-center font-semibold transition-all duration-200 ${returnTextColor}`}
                style={{ 
                  textShadow: '0 1px 3px rgba(0,0,0,0.3), 0 1px 6px rgba(255,255,255,0.4)',
                  filter: 'contrast(1.2)'
                }}
              >
                <X className="h-4 w-4 mr-1" />
                返回主页
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
              <div className="flex flex-col flex-1 min-h-0 bg-white/40 dark:bg-gray-800/40 rounded-lg p-2 sm:p-3">
                {/* 视图切换按钮 */}
                <div className="mb-3 flex gap-2">
                  <button
                    onClick={() => {
                      setViewMode('all')
                      setSearchQuery('')
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      viewMode === 'all'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                    {t('allPosts')}
                  </button>
                  
                  {isAuthenticated && (
                    <button
                      onClick={() => setViewMode('aggregated')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        viewMode === 'aggregated'
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      主题推荐
                    </button>
                  )}
                  
                  <button
                    onClick={() => setViewMode('smart')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      viewMode === 'smart'
                        ? aiTriggered
                          ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg animate-pulse'
                          : 'bg-green-500 text-white shadow-md'
                        : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                    }`}
                  >
                    <Sparkles className={`w-4 h-4 ${aiTriggered ? 'animate-spin' : ''}`} />
                    智能推荐
                    {aiTriggered && <span className="text-xs ml-1">🤖</span>}
                  </button>
                </div>

                {/* 当前搜索提示 */}
                {viewMode === 'smart' && searchQuery && (
                  <div className="mb-3 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        🎯 基于 "<span className="font-medium">{searchQuery}</span>" 的智能推荐
                      </p>
                      {recommendationStats && (
                        <div className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-800/30 px-2 py-1 rounded">
                          共找到 {recommendationStats.total} 个相关帖子
                          {recommendationStats.displayed < recommendationStats.total && 
                            ` (显示前 ${recommendationStats.displayed} 个)`
                          }
                        </div>
                      )}
                    </div>
                    {aiTriggered && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                        <span>🤖</span> AI助手自动为您推荐
                      </p>
                    )}
                  </div>
                )}

                {/* 帖子网格（半透明风格） */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                  {renderContent()}
                </div>
              </div>
              {/* 右侧推荐区 - 半透明紧凑风格 */}
              <div className="hidden lg:block w-1/5 p-4 bg-opacity-80">
                <div className="bg-white dark:bg-gray-800 rounded-2xl h-full">
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
        {/* 只在没有展开帖子时显示浮动按钮 */}
        {!selectedPost && <FloatingActionButton label={t('createPost')} />}
      </main>
    </div>
  )
}
