'use client'
import Sidebar from '../components/Sidebar'
import TopicCard from '../components/TopicCard'

// 主题颜色配置表
const TOPIC_COLORS: Record<string, { border: string; glow: string }> = {
  '学术交流': { border: '#267DFF', glow: 'rgba(38,125,255,0.3)' },
  '资源分享': { border: '#00C4CC', glow: 'rgba(0,196,204,0.3)' },
  '竞赛交流': { border: '#FF6B6B', glow: 'rgba(255,107,107,0.3)' },
  '校园生活': { border: '#A66CFF', glow: 'rgba(166,108,255,0.3)' },
  '校园杂谈': { border: '#FFAA64', glow: 'rgba(255,170,100,0.3)' },
  '技术交流': { border: '#4CD964', glow: 'rgba(76,217,100,0.3)' },
  '表白墙': { border: '#FF69B4', glow: 'rgba(255,105,180,0.3)' },
  '就业兼职': { border: '#FFA500', glow: 'rgba(255,165,0,0.3)' },
  '主题分类': { border: '#8A2BE2', glow: 'rgba(138,43,226,0.3)' } // Add this line
}

export default function TopicBlock() {
  const topicCards = [
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
    <div className="flex h-screen text-white">
      <Sidebar />
      
      <main className="flex-1 flex flex-col p-8 overflow-y-auto">
        {/* 搜索框 */}
        <div className="mb-10">
          <input
            type="text"
            placeholder="搜索主题..."
            className="w-full p-3.5 bg-[#191919] text-[#E0E0E0] rounded-xl 
                   placeholder:text-[#5A5A5A] focus:outline-none focus:ring-2 
                   focus:ring-[#007AFF] border border-[#333333] text-sm"
          />
        </div>

        {/* 主题卡片区 */}
        <div className="relative h-full border border-border rounded-2xl overflow-hidden bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 flex-grow">
          <div className="absolute top-0 left-0 right-0 h-3 bg-white dark:bg-gray-800 flex items-center px-4 z-20 mt-2 bg-opacity-0 dark:bg-opacity-0">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="absolute top-0 left-0 right-0 
            h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 z-20 mt-6 overflow-hidden"></div>
          </div>
        
          <div className="grid grid-cols-6 gap-3 p-4 pt-12 content-start w-full max-w-[1200px] mx-auto">
          <div className="col-span-2 row-span-1 flex items-center justify-center">
            <div className="w-full h-full bg-[#1A1A1A] rounded-2xl border-2 border-[#8A2BE2] p-6  flex items-center justify-center">
              <h2 className="text-[35px] font-semibold text-[#9B59B6]">主题分类</h2>
            </div>
          </div>
            {topicCards.map(({ topic, sizeClass }) => (
              <TopicCard
                key={topic}
                topic={topic}
                colors={TOPIC_COLORS[topic as keyof typeof TOPIC_COLORS]}
                sizeClass={sizeClass}
                fontSize={topic === '学术交流' ? 'text-[50px]' : 'text-[30px]'}
                
              />
            ))}
          </div>
        </div>

      </main>
      {/* 标签区 */}
      <div className="relative flex flex-col flex-none basis-80 p-4">
        <div className="relative flex flex-col h-full border border-border rounded-2xl overflow-hidden bg-white dark:bg-gray-800 bg-opacity-70 dark:bg-opacity-70">
          <div className="absolute top-0 left-0 right-0 h-3 bg-white dark:bg-gray-800 flex items-center px-4 z-20 mt-2 bg-opacity-0 dark:bg-opacity-0">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 z-20 mt-6 overflow-hidden"></div>
          </div>
          <div className="relative z-10 flex-grow overflow-y-auto p-4 pt-12">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[#8F8F8F]">
              {[
                '#计导坛', '#数分坛', '#英语坛', '#线代坛',
                '#网导坛', '#信通坛', '#心导坛', '#数学坛',
                '#物理坛', '#生物学坛', '#地质学坛', '#气象学坛',
                '#经济学坛', '#政治学坛', '#社会学坛', '#量子力学坛',
                '#机械工程坛', '#土木工程坛', '#电气工程坛'
              ].map((tag) => (
                <span 
                  key={tag}
                  className="text-sm hover:text-[#E0E0E0] transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}