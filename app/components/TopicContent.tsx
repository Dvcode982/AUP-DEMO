import { useTranslation } from '../hooks/useTranslation'

interface TopicContentProps {
  topic: string;
  color: string;
  onTagClick?: (tag: string) => void;
  selectedTag?: string | null;
}

export default function TopicContent({ topic, color, onTagClick, selectedTag }: TopicContentProps) {
  const { t } = useTranslation()
  
  const adjustColor = (color: string) => {
    color = color.trim();
    
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      
      // 计算颜色的亮度 (0-255)
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      
      // 根据背景亮度分级调整颜色
      let adjustFactor;
      if (brightness <= 64) {         // 非常暗
        adjustFactor = 2.0;
      } else if (brightness <= 128) { // 较暗
        adjustFactor = 1.6;
      } else if (brightness <= 192) { // 较亮
        adjustFactor = 1;
      } else {                        // 非常亮
        adjustFactor = 0.6;
      }
      
      const adjustValue = (value: number) => 
        Math.min(255, Math.max(0, Math.round(value * adjustFactor)));
      
      return `rgba(${adjustValue(r)}, ${adjustValue(g)}, ${adjustValue(b)}, 0.95)`;
    }
    
    return color;
  };

  const getTopicTags = (topic: string) => {
    // 将翻译后的主题名称映射回翻译键
    const topicKeyMap: { [key: string]: string } = {
      [t('academicExchange')]: 'academicExchange',
      [t('resourceSharing')]: 'resourceSharing',
      [t('competitionExchange')]: 'competitionExchange',
      [t('campusLife')]: 'campusLife',
      [t('campusChat')]: 'campusChat',
      [t('techExchange')]: 'techExchange',
      [t('confessionWall')]: 'confessionWall',
      [t('jobPartTime')]: 'jobPartTime',
      [t('topicCategories')]: 'topicCategories'
    };

    const topicKey = topicKeyMap[topic] || topic;

    const tagMap: { [key: string]: string[] } = {
      'academicExchange': [
        '计导坛', '数分坛', '英语坛', '线代坛', 
        '网导坛', '信通坛', '心导坛', '数学坛', 
        '物理坛', '生物学坛', '地质学坛', '气象学坛', 
        '经济学坛', '政治学坛', '社会学坛', '量子力学坛', 
        '机械工程坛', '土木工程坛', '电气工程坛'
      ],
      'resourceSharing': [
        '电子书籍', '视频资源', '学习资料', '考试题库',
        '课件分享', '软件工具', '学习笔记', '实验资料'
      ],
      'competitionExchange': [
        '数学建模', '程序设计', '创新创业', '学科竞赛',
        '挑战杯', '创青春', '互联网+'
      ],
      'campusLife': [
        '美食推荐', '社团活动', '校园风景', '运动健身',
        '宿舍生活', '校园趣事', '学生会', '文艺活动'
      ],
      'campusChat': [
        '校园新闻', '活动通知', '失物招领', '二手交易',
        '闲聊灌水', '情感交流', '校园趣闻'
      ],
      'techExchange': [
        '编程开发', '人工智能', '网络技术', '硬件维修',
        '数据分析', '云计算', '区块链', '物联网'
      ],
      'confessionWall': [
        '表白专区', '脱单攻略', '情感故事', '暗恋专栏',
        '恋爱相談', '心动瞬间'
      ],
      'jobPartTime': [
        '实习信息', '校招信息', '求职经验', '简历指导',
        '面试技巧', '职业规划', '兼职信息'
      ],
      'topicCategories': []
    };
    return tagMap[topicKey] || [];
  };

  return (
    <>
      <div className="text-lg font-bold mb-4" style={{ color: adjustColor(color) }}>
        {topic}
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {getTopicTags(topic).map((tag) => {
          const isSelected = selectedTag === `#${tag}`;
          const translatedTag = t(`tags.${tag}`);
          return (
            <span 
              key={tag}
              onClick={() => {
                if (onTagClick) {
                  onTagClick(`#${tag}`);
                } else {
                  // 如果没有提供onTagClick回调，则直接导航到主题详情页
                  window.location.href = `/topic-block/${encodeURIComponent(topic)}?tag=${encodeURIComponent(tag)}`;
                }
              }}
              className={`relative text-sm transition-all cursor-pointer
                       hover:scale-105 hover:font-semibold
                       active:scale-95 duration-150
                       flex items-center gap-1 group
                       ${isSelected ? 'font-bold scale-105' : ''}`}
              style={{ 
                color: adjustColor(color),
                '--hover-glow': color,
                backgroundColor: isSelected ? `${adjustColor(color)}20` : 'transparent',
                padding: isSelected ? '2px 8px' : '2px 0',
                borderRadius: isSelected ? '9999px' : '0',
              } as React.CSSProperties}
            >
              <span className="relative z-10">#{translatedTag}</span>
              <svg 
                className={`w-3 h-3 transition-all duration-300 
                           transform group-hover:translate-x-1 
                           ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-label={t('clickToViewTagPosts')}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </span>
          );
        })}
      </div>
    </>
  );
}
