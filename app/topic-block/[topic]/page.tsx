'use client'

import { useParams, useSearchParams } from 'next/navigation'
import Sidebar from '../../components/Sidebar'
import Post, { PostProps } from '../../components/Post'
import TopicContent from '../../components/TopicContent'
import { useState, useEffect } from 'react'
import { postsAPI } from '@/lib/api'
import Link from 'next/link'
import { ArrowLeft, Filter } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'

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
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<PostProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const { t } = useTranslation();
  
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
    async function fetchPosts() {
      try {
        setLoading(true);
        // 直接使用API获取特定主题的帖子
        const data = await postsAPI.getPosts(undefined, topic);
        
        // 获取带有当前主题标签的所有帖子
        const mainTagPosts = await postsAPI.getPosts(undefined, undefined, getTopicMainTag(topic));
        
        // 合并两种帖子并去重
        const allPosts = [...data];
        
        // 将主标签帖子添加到结果中（避免重复）
        mainTagPosts.forEach((tagPost: PostProps) => {
          if (!allPosts.some(post => post.id === tagPost.id)) {
            allPosts.push(tagPost);
          }
        });
        
        // 获取主题下的所有子标签
        const subTags = getTopicSubTags(topic);
        
        // 对每个子标签获取相关帖子
        for (const subTag of subTags) {
          const tagText = subTag.replace('#', '');
          const subTagPosts = await postsAPI.getPosts(undefined, undefined, tagText);
          
          // 将子标签帖子添加到结果中（避免重复）
          subTagPosts.forEach((tagPost: PostProps) => {
            if (!allPosts.some(post => post.id === tagPost.id)) {
              allPosts.push(tagPost);
            }
          });
        }
        
        setPosts(allPosts);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError(t('errorLoadingPosts'));
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [topic, t]);
  
  // 获取主题对应的主标签
  const getTopicMainTag = (topicName: string) => {
    const tagMap: { [key: string]: string } = {
      '学术交流': '学术',
      '资源分享': '资源',
      '竞赛交流': '竞赛',
      '校园生活': '校园',
      '校园杂谈': '杂谈',
      '技术交流': '技术',
      '表白墙': '表白',
      '就业兼职': '就业'
    };
    return tagMap[topicName] || topicName;
  };
  
  // 获取主题对应的子标签列表
  const getTopicSubTags = (topicName: string) => {
    const tagMap: { [key: string]: string[] } = {
      '学术交流': [
        '#计导坛', '#数分坛', '#英语坛', '#线代坛', 
        '#网导坛', '#信通坛', '#心导坛', '#数学坛', 
        '#物理坛', '#生物学坛', '#地质学坛', '#气象学坛', 
        '#经济学坛', '#政治学坛', '#社会学坛', '#量子力学坛', 
        '#机械工程坛', '#土木工程坛', '#电气工程坛'
      ],
      '资源分享': [
        '#电子书籍', '#视频资源', '#学习资料', '#考试题库',
        '#课件分享', '#软件工具', '#学习笔记', '#实验资料'
      ],
      '竞赛交流': [
        '#数学建模', '#程序设计', '#创新创业', '#学科竞赛',
        '#挑战杯', '#创青春', '#互联网+'
      ],
      '校园生活': [
        '#美食推荐', '#社团活动', '#校园风景', '#运动健身',
        '#宿舍生活', '#校园趣事', '#学生会', '#文艺活动'
      ],
      '校园杂谈': [
        '#校园新闻', '#活动通知', '#失物招领', '#二手交易',
        '#闲聊灌水', '#情感交流', '#校园趣闻'
      ],
      '技术交流': [
        '#编程开发', '#人工智能', '#网络技术', '#硬件维修',
        '#数据分析', '#云计算', '#区块链', '#物联网'
      ],
      '表白墙': [
        '#表白专区', '#脱单攻略', '#情感故事', '#暗恋专栏',
        '#恋爱相談', '#心动瞬间'
      ],
      '就业兼职': [
        '#实习信息', '#校招信息', '#求职经验', '#简历指导',
        '#面试技巧', '#职业规划', '#兼职信息'
      ]
    };
    return tagMap[topicName] || [];
  };
  
  // 当选中标签变化时，重新获取帖子
  useEffect(() => {
    async function fetchPostsByTag() {
      if (!selectedTag) return;
      
      try {
        setLoading(true);
        const tagText = selectedTag.replace('#', '');
        // 使用API获取特定标签的帖子
        const data = await postsAPI.getPosts(undefined, topic, tagText);
        setFilteredPosts(data || []);
      } catch (err) {
        console.error('Error fetching posts by tag:', err);
        setError(t('errorLoadingTagPosts'));
      } finally {
        setLoading(false);
      }
    }

    if (selectedTag) {
      fetchPostsByTag();
    } else {
      setFilteredPosts(posts);
    }
  }, [selectedTag, topic, t]);

  // 处理标签点击事件
  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null); // 取消选中
    } else {
      setSelectedTag(tag); // 选中新标签
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <div className="flex flex-1">
          <div className="max-w-4xl mx-auto w-full">
            {/* 标题区域 */}
            <div className="mb-4 flex items-center justify-between bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <Link href="/topic-block" className="mr-4 hover:scale-110 transition-transform">
                  <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </Link>
                <h1 className={`text-3xl font-bold ${topicColor.text}`} style={{ borderColor: topicColor.border }}>
                  {topic}
                </h1>
              </div>
              <button 
                onClick={() => setShowTagFilter(!showTagFilter)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 rounded-lg shadow hover:shadow-md transition-all hover:-translate-y-1 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
              >
                <Filter className="w-4 h-4" />
                <span>{t('filterTags')}</span>
              </button>
            </div>
            
            {/* 标签筛选区域 */}
            {showTagFilter && (
              <div className="mb-4 bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="mb-2 text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between">
                  <span>{t('selectTagsToFilter')}</span>
                  {selectedTag && (
                    <button 
                      onClick={() => setSelectedTag(null)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {t('clearFilter')}
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
                <div className="text-center text-red-500 p-8 bg-red-50 dark:bg-red-900/30 rounded-lg">{t('errorLoadingPosts')}</div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center p-16 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-lg mb-4 text-gray-700 dark:text-gray-300">
                    {selectedTag 
                      ? t('noPostsWithTag', { tag: selectedTag })
                      : t('noPostsInTopic')
                    }
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {selectedTag 
                      ? t('tryOtherTags')
                      : t('stayTuned')
                    }
                  </p>
                </div>
              ) : (
                <>
                  {selectedTag && (
                    <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-sm text-blue-800 dark:text-blue-300 flex items-center justify-between">
                      <span>{t('currentFilter')}: {selectedTag}</span>
                      <span className="text-xs">{t('foundResults', { count: filteredPosts.length })}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>  
                    {filteredPosts.map(post => (
                      <Post key={post.id} {...post} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}