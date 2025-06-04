'use client'

import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import TopicCard from '../components/TopicCard'
import TopicContent from '../components/TopicContent'
import { useTranslation } from '../hooks/useTranslation'

interface TopicCardProps {
  topic: string;
  colors: {
    border: string;
    glow: string;
    bg: string;
    text: string;
  };
  sizeClass: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
}

type TopicKey = 'topicCategories' | 'resourceSharing' | 'competitionExchange' | 'academicExchange' | 
                'campusLife' | 'campusChat' | 'techExchange' | 'confessionWall' | 'jobPartTime';

// 主题颜色配置表
const TOPIC_COLORS: Record<TopicKey, { border: string; glow: string; bg: string; text: string }> = {
  'topicCategories': { 
    border: '#8A2BE2', 
    glow: 'rgba(138,43,226,0.3)',
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
    text: 'text-indigo-800 dark:text-indigo-300'
  },
  'resourceSharing': { 
    border: '#00C4CC', 
    glow: 'rgba(0,196,204,0.3)',
    bg: 'bg-cyan-100 dark:bg-cyan-900/30',
    text: 'text-cyan-800 dark:text-cyan-300'
  },
  'competitionExchange': { 
    border: '#FF6B6B', 
    glow: 'rgba(255,107,107,0.3)',
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-300'
  },
  'academicExchange': { 
    border: '#267DFF', 
    glow: 'rgba(38,125,255,0.3)',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-800 dark:text-blue-300'
  },
  'campusLife': { 
    border: '#A66CFF', 
    glow: 'rgba(166,108,255,0.3)',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-800 dark:text-purple-300'
  },
  'campusChat': { 
    border: '#FFAA64', 
    glow: 'rgba(255,170,100,0.3)',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-800 dark:text-orange-300'
  },
  'techExchange': { 
    border: '#4CD964', 
    glow: 'rgba(76,217,100,0.3)',
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-300'
  },
  'confessionWall': { 
    border: '#FF69B4', 
    glow: 'rgba(255,105,180,0.3)',
    bg: 'bg-pink-100 dark:bg-pink-900/30',
    text: 'text-pink-800 dark:text-pink-300'
  },
  'jobPartTime': { 
    border: '#FFA500', 
    glow: 'rgba(255,165,0,0.3)',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-800 dark:text-amber-300'
  }
}

// 添加一个静态卡片组件
function StaticTopicCard({ topic, colors, sizeClass }: Omit<TopicCardProps, 'onClick'>) {
  return (
    <div
      className={`relative p-6 bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm rounded-2xl border-2 shadow-sm hover:shadow-md transition-all duration-300 ${sizeClass}`}
      style={{
        borderColor: colors.border,
      }}
    >
      <div className="relative flex flex-col items-center justify-center h-full">
        <div className="text-center font-semibold text-[17px] text-gray-800 dark:text-gray-200">
          {topic}
        </div>
      </div>
    </div>
  );
}

export default function TopicBlock() {
  const { t } = useTranslation();
  const [selectedTopic, setSelectedTopic] = useState<TopicKey | null>('academicExchange');

  const topicCards: Array<{ topic: string; topicKey: TopicKey; sizeClass: string }> = [
    { topic: t('topicCategories'), topicKey: 'topicCategories', sizeClass: 'col-span-2 row-span-1' },
    { topic: t('resourceSharing'), topicKey: 'resourceSharing', sizeClass: 'col-span-2 row-span-1' },
    { topic: t('competitionExchange'), topicKey: 'competitionExchange', sizeClass: 'col-span-2 row-span-1' },
    { topic: t('academicExchange'), topicKey: 'academicExchange', sizeClass: 'col-span-3 row-span-2' },
    { topic: t('campusLife'), topicKey: 'campusLife', sizeClass: 'col-span-2 row-span-1' },
    { topic: t('campusChat'), topicKey: 'campusChat', sizeClass: 'col-span-2 row-span-1' },
    { topic: t('techExchange'), topicKey: 'techExchange', sizeClass: 'col-span-2 row-span-2' },
    { topic: t('confessionWall'), topicKey: 'confessionWall', sizeClass: 'col-span-2 row-span-1' },
    { topic: t('jobPartTime'), topicKey: 'jobPartTime', sizeClass: 'col-span-2 row-span-1' }
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-indigo-950 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm">
      <Sidebar />
      
      <main className="flex-1 flex flex-col p-4">
        {/* 搜索框 */}
        <div className="mb-4">
          <input
            type="text"
            placeholder={t('searchTopics')}
            className="w-full p-3.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl 
                   placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 
                   focus:ring-blue-500 border border-gray-200 dark:border-gray-700 text-sm 
                   bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm shadow-sm"
          />
        </div>

        {/* 主题卡片区 */}
        <div className="relative h-full border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm shadow-md flex-grow">
          <div className="absolute top-0 left-0 right-0 h-3 bg-white dark:bg-gray-800 flex items-center px-4 z-20 mt-2 bg-opacity-0 dark:bg-opacity-0">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 z-20 mt-6 overflow-hidden"></div>
          </div>
        
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 flex-auto relative z-10 flex-grow p-4 pt-12 overflow-y-auto" style={{maxHeight: 'calc(100vh - 140px)'}}>
            {topicCards.map(({ topic, topicKey, sizeClass }) => {
              if (topicKey === 'topicCategories') {
                return (
                  <StaticTopicCard
                    key={topicKey}
                    topic={topic}
                    colors={TOPIC_COLORS[topicKey]}
                    sizeClass={sizeClass}
                  />
                );
              }
              return (
                <TopicCard
                  key={topicKey}
                  topic={topic}
                  colors={TOPIC_COLORS[topicKey]}
                  sizeClass={sizeClass}
                  onClick={() => {
                    setSelectedTopic(topicKey);
                    window.location.href = `/topic-block/${encodeURIComponent(topic)}`;
                  }}
                  onMouseEnter={() => setSelectedTopic(topicKey)}
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
                topic={t(selectedTopic)} 
                color={TOPIC_COLORS[selectedTopic]?.border || '#ffffff'}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}