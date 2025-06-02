'use client'

import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import TopicCard from '../components/TopicCard'
import TopicContent from '../components/TopicContent'
import { useBackground } from '../contexts/BackgroundContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { TopicCardProps } from '../components/TopicCard'

// 主题颜色配置表
const TOPIC_COLORS: Record<string, { border: string; glow: string; bg: string; text: string }> = {
  '学术交流': { 
    border: '#267DFF', 
    glow: 'rgba(38,125,255,0.3)',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-800 dark:text-blue-300'
  },
  '资源分享': { 
    border: '#00C4CC', 
    glow: 'rgba(0,196,204,0.3)',
    bg: 'bg-cyan-100 dark:bg-cyan-900/30',
    text: 'text-cyan-800 dark:text-cyan-300'
  },
  '竞赛交流': { 
    border: '#FF6B6B', 
    glow: 'rgba(255,107,107,0.3)',
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-300'
  },
  '校园生活': { 
    border: '#A66CFF', 
    glow: 'rgba(166,108,255,0.3)',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-800 dark:text-purple-300'
  },
  '校园杂谈': { 
    border: '#FFAA64', 
    glow: 'rgba(255,170,100,0.3)',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-800 dark:text-orange-300'
  },
  '技术交流': { 
    border: '#4CD964', 
    glow: 'rgba(76,217,100,0.3)',
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-300'
  },
  '表白墙': { 
    border: '#FF69B4', 
    glow: 'rgba(255,105,180,0.3)',
    bg: 'bg-pink-100 dark:bg-pink-900/30',
    text: 'text-pink-800 dark:text-pink-300'
  },
  '就业兼职': { 
    border: '#FFA500', 
    glow: 'rgba(255,165,0,0.3)',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-800 dark:text-amber-300'
  },
  '主题分类': { 
    border: '#8A2BE2', 
    glow: 'rgba(138,43,226,0.3)',
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
    text: 'text-indigo-800 dark:text-indigo-300'
  }
}

// 添加一个静态卡片组件
function StaticTopicCard({ topic, colors, sizeClass }: Omit<TopicCardProps, 'onClick'>) {
  const { t } = useLanguage()
  return (
    <div
      className={`relative p-6 bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm rounded-2xl border-2 shadow-sm hover:shadow-md transition-all duration-300 ${sizeClass}`}
      style={{
        borderColor: colors.border,
      }}
    >
      <div className="relative flex flex-col items-center justify-center h-full">
        <div className="text-center font-semibold text-[17px] text-gray-800 dark:text-gray-200">
          {t(`topic.${topic}`)}
        </div>
      </div>
    </div>
  );
}

export default function TopicBlock() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>("学术交流");  // 设置默认选中主题
  const { toggleBackground } = useBackground()
  const { t } = useLanguage()

  const topicCards = [
    { topic: '主题分类', sizeClass: 'col-span-2 row-span-1' },
    { topic: '资源分享', sizeClass: 'col-span-2 row-span-1' },
    { topic: '竞赛交流', sizeClass: 'col-span-2 row-span-1' },
    { topic: '学术交流', sizeClass: 'col-span-3 row-span-2' },
    { topic: '校园生活', sizeClass: 'col-span-2 row-span-1' },
    { topic: '校园杂谈', sizeClass: 'col-span-2 row-span-1' },
    { topic: '技术交流', sizeClass: 'col-span-2 row-span-2' },
    { topic: '表白墙', sizeClass: 'col-span-2 row-span-1' },
    { topic: '就业兼职', sizeClass: 'col-span-2 row-span-1' }
  ];

  return (
    <div className="flex h-screen">
      <Sidebar />
      <button onClick={toggleBackground} className="absolute top-4 right-4 p-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
        {t('settings.background.toggle')}
      </button>
      
      <main className="flex-1 flex flex-col p-4">
        {/* 搜索框 */}
        <div className="mb-4">
          <input
            type="text"
            placeholder={t('topic.searchPlaceholder')}
            className="w-full p-3.5 bg-white/70 dark:bg-gray-800/70 text-gray-800 dark:text-gray-200 rounded-xl 
                   placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 
                   focus:ring-blue-500 border border-gray-200 dark:border-gray-700 text-sm 
                   backdrop-blur-sm shadow-sm"
          />
        </div>

        {/* 主题卡片区 */}
        <div className="relative flex-grow">
          <div className="absolute top-0 left-0 right-0 h-3 flex items-center px-4 z-20 mt-2">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 z-20 mt-6 overflow-hidden"></div>
          </div>
        
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 flex-auto relative z-10 flex-grow p-4 pt-12 custom-scrollbar">
            {topicCards.map(({ topic, sizeClass }) => {
              if (topic === '主题分类') {
                return (
                  <StaticTopicCard
                    key={topic}
                    topic={topic}
                    colors={TOPIC_COLORS[topic]}
                    sizeClass={sizeClass}
                  />
                );
              }
              return (
                <TopicCard
                  key={topic}
                  topic={topic}
                  colors={TOPIC_COLORS[topic]}
                  sizeClass={sizeClass}
                  onClick={() => {
                    setSelectedTopic(topic);
                    window.location.href = `/topic-block/${encodeURIComponent(topic)}`;
                  }}
                  onMouseEnter={() => setSelectedTopic(topic)}
                />
              );
            })}
          </div>
        </div>
      </main>

      {/* 标签区 */}
      <div className="relative flex flex-col flex-none basis-80 p-4">
        <div className="relative flex flex-col h-full border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm shadow-md">
          <div className="absolute top-0 left-0 right-0 h-3 bg-white dark:bg-gray-800 flex items-center px-4 z-20 mt-2 bg-opacity-0 dark:bg-opacity-0">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 z-20 mt-6 overflow-hidden"></div>
          </div>
          <div className="relative z-10 flex-grow overflow-y-auto p-4 pt-16 item">
            {selectedTopic && (
              <TopicContent 
                topic={selectedTopic} 
                color={TOPIC_COLORS[selectedTopic]?.border || '#ffffff'}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}