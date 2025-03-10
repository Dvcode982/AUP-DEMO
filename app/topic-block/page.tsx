'use client'
import Sidebar from '../components/Sidebar'

// 主题颜色配置表
const TOPIC_COLORS = {
  '学术交流': { border: '#267DFF', glow: 'rgba(38,125,255,0.3)' },
  '资源分享': { border: '#00C4CC', glow: 'rgba(0,196,204,0.3)' },
  '竞赛交流': { border: '#FF6B6B', glow: 'rgba(255,107,107,0.3)' },
  '校园生活': { border: '#A66CFF', glow: 'rgba(166,108,255,0.3)' },
  '校园杂谈': { border: '#FFAA64', glow: 'rgba(255,170,100,0.3)' },
  '技术交流': { border: '#4CD964', glow: 'rgba(76,217,100,0.3)' }
}

export default function TopicBlock() {
  return (
    <div className="flex h-screen text-white">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
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
        <div className="relative flex flex-col h-full border border-border rounded-2xl overflow-hidden bg-white dark:bg-gray-800 bg-opacity-50 dark:bg-opacity-50">
        <div className="absolute top-0 left-0 right-0 h-3 bg-white dark:bg-gray-800 flex items-center px-4 z-20 mt-2 bg-opacity-50 dark:bg-opacity-50">
        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <div className="absolute top-0  left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 z-20 mt-6 overflow-hidden"></div>
        </div>
        
          <div className="grid grid-cols-2 gap-5 flex-auto relative z-10 flex-grow overflow-y-auto p-4 pt-12">
            {Object.entries(TOPIC_COLORS).map(([topic, colors]) => (
              <div
                key={topic}
                className="group relative p-6 bg-[#1A1A1A] rounded-2xl border-2 
                        transition-all cursor-pointer shadow-[0_4px_24px_rgba(0,0,0,0.25)]
                        hover:shadow-[0_8px_32px_var(--glow)]"
                style={{
                  borderColor: colors.border,
                  '--glow': colors.glow
                }}
              >
                {/* 发光效果 */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 
                              transition-opacity bg-[var(--glow)] blur-xl" />
                
                <div className="relative text-center font-semibold text-[17px] 
                              group-hover:scale-105 transition-transform">
                  {topic}
                </div>
              </div>
            ))}
          </div>

          
        </div>
      </main>
      {/* 标签区 */}
      <div className="w-[320px] bg-[#1A1A1A] p-5 rounded-2xl 
                        border border-[#2D2D2D] shadow-[0_4px_24px_rgba(0,0,0,0.25)]">
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
  )
}