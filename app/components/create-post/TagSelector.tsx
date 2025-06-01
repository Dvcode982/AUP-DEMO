'use client'

import { useState, useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tag } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from '@/app/contexts/LanguageContext'

interface TagSelectorProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  topic?: string | null
  addTagButtonText: string
}

export default function TagSelector({ selectedTags, onTagsChange, topic, addTagButtonText }: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const { t } = useLanguage()

  // 根据主题获取可用标签
  useEffect(() => {
    setAvailableTags(getTopicTags(topic || ''))
  }, [topic])

  const getTopicTags = (topic: string) => {
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
      ],
    };
    return tagMap[topic] || [];
  };

  const handleTagSelect = (tag: string) => {
    // 移除#号
    const tagWithoutHash = tag.startsWith('#') ? tag.substring(1) : tag;
    
    // 检查标签是否已经被选中
    if (selectedTags.includes(tagWithoutHash)) {
      // 如果已选中，则移除
      onTagsChange(selectedTags.filter(t => t !== tagWithoutHash));
    } else {
      // 如果未选中，则添加
      onTagsChange([...selectedTags, tagWithoutHash]);
    }
  };

  const handleTopicChange = (value: string) => {
    // 当选择主题时，更新可用标签
    setAvailableTags(getTopicTags(value));
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <Select onValueChange={handleTopicChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('createPost.selectCategoryPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="学术交流">{t('topic.学术交流')}</SelectItem>
            <SelectItem value="资源分享">{t('topic.资源分享')}</SelectItem>
            <SelectItem value="竞赛交流">{t('topic.竞赛交流')}</SelectItem>
            <SelectItem value="校园生活">{t('topic.校园生活')}</SelectItem>
            <SelectItem value="校园杂谈">{t('topic.校园杂谈')}</SelectItem>
            <SelectItem value="技术交流">{t('topic.技术交流')}</SelectItem>
            <SelectItem value="表白墙">{t('topic.表白墙')}</SelectItem>
            <SelectItem value="就业兼职">{t('topic.就业兼职')}</SelectItem>
          </SelectContent>
        </Select>

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
            >
              <Tag size={16} />
              <span>{addTagButtonText}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2">
            <div className="max-h-60 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {availableTags.map((tag) => {
                  const tagWithoutHash = tag.startsWith('#') ? tag.substring(1) : tag;
                  const isSelected = selectedTags.includes(tagWithoutHash);
                  
                  return (
                    <button
                      key={tag}
                      onClick={() => handleTagSelect(tag)}
                      className={`px-2 py-1 text-xs rounded-full transition-colors ${isSelected ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                    >
                      {t(`topic.${tag}` as keyof typeof t)}
                    </button>
                  );
                })}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* 显示已选标签 */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedTags.map((tag, index) => (
            <span 
              key={index} 
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center"
            >
              {t(`topic.#${tag}` as keyof typeof t)}
              <button 
                onClick={() => onTagsChange(selectedTags.filter(t => t !== tag))}
                className="ml-1 text-blue-500 hover:text-blue-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}