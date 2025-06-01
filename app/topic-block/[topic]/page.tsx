'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useBackground } from '@/app/contexts/BackgroundContext'
import Sidebar from '../../components/Sidebar'
import Post, { PostProps } from '../../components/Post'
import TopicContent from '../../components/TopicContent'
import { useState, useEffect } from 'react'
import { postsAPI } from '@/lib/api'
import Link from 'next/link'
import { ArrowLeft, Filter } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import TopicRecommendations from '../../components/TopicRecommendations'

// 主题颜色配置表
const TOPIC_COLORS: Record<string, { border: string; glow: string; bg: string; text: string }> = {
  '学术交流': { 
    border: '#267DFF', 
    glow: 'rgba(38,125,255,0.3)',
    bg: 'bg-blue-100 dark:bg-blue-950',
    text: 'text-blue-800 dark:text-blue-300'
  },
  '资源分享': { 
    border: '#00C4CC', 
    glow: 'rgba(0,196,204,0.3)',
    bg: 'bg-cyan-100 dark:bg-cyan-950',
    text: 'text-cyan-800 dark:text-cyan-300'
  },
  '竞赛交流': { 
    border: '#FF6B6B', 
    glow: 'rgba(255,107,107,0.3)',
    bg: 'bg-red-100 dark:bg-red-950',
    text: 'text-red-800 dark:text-red-300'
  },
  '校园生活': { 
    border: '#A66CFF', 
    glow: 'rgba(166,108,255,0.3)',
    bg: 'bg-purple-100 dark:bg-purple-950',
    text: 'text-purple-800 dark:text-purple-300'
  },
  '校园杂谈': { 
    border: '#FFAA64', 
    glow: 'rgba(255,170,100,0.3)',
    bg: 'bg-orange-100 dark:bg-orange-950',
    text: 'text-orange-800 dark:text-orange-300'
  },
  '技术交流': { 
    border: '#4CD964', 
    glow: 'rgba(76,217,100,0.3)',
    bg: 'bg-green-100 dark:bg-green-950',
    text: 'text-green-800 dark:text-green-300'
  },
  '表白墙': { 
    border: '#FF69B4', 
    glow: 'rgba(255,105,180,0.3)',
    bg: 'bg-pink-100 dark:bg-pink-950',
    text: 'text-pink-800 dark:text-pink-300'
  },
  '就业兼职': { 
    border: '#FFA500', 
    glow: 'rgba(255,165,0,0.3)',
    bg: 'bg-amber-100 dark:bg-amber-950',
    text: 'text-amber-800 dark:text-amber-300'
  },
};

export default function TopicDetail() {
  const params = useParams();
  const searchParams = useSearchParams();
  const topic = decodeURIComponent(params.topic as string);
  const { t } = useLanguage();
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<PostProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const { toggleBackground } = useBackground();
  
  // 从URL查询参数中获取标签
  useEffect(() => {
    const tagParam = searchParams.get('tag');
    if (tagParam) {
      setSelectedTag(`#${tagParam}`);
      setShowTagFilter(true);
    }
  }, [searchParams]);

  const topicColor = TOPIC_COLORS[topic] || { 
    border: '#8A2BE2', 
    glow: 'rgba(138,43,226,0.3)', 
    bg: 'bg-indigo-100 dark:bg-indigo-950',
    text: 'text-indigo-800 dark:text-indigo-300'
  };

  // 根据选中的标签筛选帖子
  useEffect(() => {
    if (selectedTag) {
      const filtered = posts.filter((post: PostProps) => 
        post.tags?.some((tag: string) => tag.includes(selectedTag.replace('#', '')))
      );
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(posts);
    }
  }, [selectedTag, posts]);

  // 获取帖子数据
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const allPosts: PostProps[] = await postsAPI.getPosts(undefined, topic) as PostProps[];
        
        setPosts(allPosts || [])
        setFilteredPosts(allPosts || [])
      } catch (err) {
        console.error('Error fetching posts:', err)
        setError(t('error.loadFailed'))
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [topic, t])
  
  // 当选中标签变化时，重新获取帖子
  useEffect(() => {
    async function fetchPostsByTag() {
      if (!selectedTag) return;
      
      try {
        setLoading(true);
        const tagText = selectedTag.replace('#', '');
        // 使用API获取特定标签的帖子
        const data: PostProps[] = await postsAPI.getPosts(undefined, topic, tagText) as PostProps[];
        setFilteredPosts(data || []);
      } catch (err) {
        console.error('Error fetching posts by tag:', err);
        setError(t('error.loadFailed'));
      } finally {
        setLoading(false);
      }
    }

    if (selectedTag) {
      fetchPostsByTag();
    } else {
      setFilteredPosts(posts);
    }
  }, [selectedTag, topic]);

  // 处理标签点击事件
  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null); // 取消选中
    } else {
      setSelectedTag(tag); // 选中新标签
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg">
              {t('error.loadFailed')}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <button onClick={toggleBackground} className="absolute top-4 right-4 p-2 bg-gray-200 dark:bg-gray-700 rounded">切换背景</button>
      
      <main className={`flex-1 p-8 overflow-y-auto bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-indigo-950 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm`}>
        <div className="max-w-4xl mx-auto">
          {/* 标题区域 */}
          <div className="mb-4 flex items-center justify-between bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Link href="/topic-block" className="mr-4 hover:scale-110 transition-transform">
                <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </Link>
              <h1 className={`text-3xl font-bold ${topicColor.text}`} style={{ borderColor: topicColor.border }}>
                {t(`topic.${topic}`)}
              </h1>
            </div>
            <button 
              onClick={() => setShowTagFilter(!showTagFilter)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 rounded-lg shadow hover:shadow-md transition-all hover:-translate-y-1 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
            >
              <Filter className="w-4 h-4" />
              <span>{t('topic.filterTagsButton')}</span>
            </button>
          </div>
          
          {/* 标签筛选区域 */}
          {showTagFilter && (
            <div className="mb-4 bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="mb-2 text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between">
                <span>{t('topic.selectTagToFilter')}</span>
                {selectedTag && (
                  <button 
                    onClick={() => setSelectedTag(null)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {t('topic.clearFilterButton')}
                  </button>
                )}
              </div>
              <div className="relative">
                <TopicContent 
                  topic={topic} 
                  color={topicColor.border} 
                  onTagClick={handleTagClick}
                  selectedTag={selectedTag}
                />
              </div>
            </div>
          )}
          
          {/* 帖子列表 */}
          <div className="bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 p-8 bg-red-50 dark:bg-red-900/30 rounded-lg">{error}</div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center p-16 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-lg mb-4 text-gray-700 dark:text-gray-300">
                  {selectedTag ? t('topic.noPostsWithTag', { tag: selectedTag }) : t('topic.noPostsInTopic')}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  {selectedTag ? t('topic.selectTagToFilter') : t('topic.noPosts')}
                </p>
              </div>
            ) : (
              <>
                {selectedTag && (
                  <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-sm text-blue-800 dark:text-blue-300 flex items-center justify-between">
                    <span>{t('topic.currentFilter', { tag: selectedTag })}</span>
                    <span className="text-xs">{t('topic.resultsFound', { count: filteredPosts.length })}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>  
                  {filteredPosts.map(post => {
                    // 确保每个帖子都有必要的属性
                    const postWithDefaults = {
                      ...post,
                      avatar: post.avatar || '/placeholder.svg?height=40&width=40',
                      postType: 'forum'
                    };
                    return <Post key={post.id} {...postWithDefaults} />;
                  })}
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="md:col-span-2 space-y-4">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {t('topic.noPosts')}
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <Post key={post.id} {...post} />
                ))
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  {t('recommendations.tagsTitle')}
                </h2>
                <TopicContent
                  topic={topic}
                  color={topicColor.border}
                  onTagClick={setSelectedTag}
                  selectedTag={selectedTag}
                />
              </div>

              <TopicRecommendations />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}