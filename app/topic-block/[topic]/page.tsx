'use client'

import { useParams } from 'next/navigation'
import Sidebar from '../../components/Sidebar'
import PostList from '../../components/PostList'
import { useState, useEffect } from 'react'
import { postsAPI } from '@/lib/api'
import Link from 'next/link'
import { ArrowLeft, PlusCircle } from 'lucide-react'

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
  const topic = decodeURIComponent(params.topic as string);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const topicColor = TOPIC_COLORS[topic] || { 
    border: '#8A2BE2', 
    glow: 'rgba(138,43,226,0.3)', 
    bg: 'bg-indigo-100 dark:bg-indigo-950',
    text: 'text-indigo-800 dark:text-indigo-300'
  };

  useEffect(() => {
    async function fetchPosts() {
      try {
        // 在实际应用中，这里应该调用获取特定主题帖子的API
        const data = await postsAPI.getPosts();
        // 假设我们过滤出与当前主题相关的帖子
        const filteredPosts = data.filter((post: any) => 
          post.category === topic || post.tags?.includes(topic)
        );
        setPosts(filteredPosts || []);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('无法加载帖子，请稍后再试');
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [topic]);

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <main className={`flex-1 p-8 overflow-y-auto ${topicColor.bg}`}>
        <div className="max-w-4xl mx-auto">
          {/* 标题区域 */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/topic-block" className="mr-4">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className={`text-3xl font-bold ${topicColor.text}`} style={{ borderColor: topicColor.border }}>
                {topic}
              </h1>
            </div>
            <Link href={`/create-post?topic=${encodeURIComponent(topic)}`} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
              <PlusCircle className="w-4 h-4" />
              <span>发布内容</span>
            </Link>
          </div>
          
          {/* 帖子列表 */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-8">{error}</div>
          ) : posts.length === 0 ? (
            <div className="text-center p-16">
              <p className="text-lg mb-4">这个主题还没有任何帖子</p>
              <p>来发布第一条内容吧！</p>
            </div>
          ) : (
            <PostList posts={posts} />
          )}
        </div>
      </main>
    </div>
  );
} 