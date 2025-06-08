'use client';

import { useState, useEffect } from 'react';
import { FilterIcon, SearchIcon, PlusCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '../hooks/useTranslation';

interface SearchBarProps {
  onSearch?: (query: string, filters?: any) => void;
  placeholder?: string;
  resultCount?: number;
}

const SearchBar = ({ onSearch, placeholder, resultCount }: SearchBarProps = {}) => {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [pendingSearch, setPendingSearch] = useState<string | null>(null);
  const pathname = usePathname();
  const { t } = useTranslation();
  
  // 判断当前页面类型
  const isLostAndFound = pathname?.includes('lost-and-found');
  
  // 组件挂载后再渲染，避免 Hydration 错误
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // 处理搜索
  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      // 默认搜索行为
      if (isLostAndFound) {
        window.location.href = `/lost-and-found?search=${encodeURIComponent(searchQuery)}`;
      } else {
        window.location.href = `/?search=${encodeURIComponent(searchQuery)}`;
      }
    }
  };
  
  // 处理回车键搜索
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 热门搜索建议
  const popularSearches = isLostAndFound 
    ? ['手机', '钥匙', '钱包', '身份证', '眼镜', '耳机']
    : ['学习', '生活', '技术', '兼职'];

  // 自动搜索 useEffect
  useEffect(() => {
    if (pendingSearch && searchQuery === pendingSearch) {
      if (onSearch) {
        onSearch(pendingSearch);
      } else {
        if (isLostAndFound) {
          window.location.href = `/lost-and-found?search=${encodeURIComponent(pendingSearch)}`;
        } else {
          window.location.href = `/?search=${encodeURIComponent(pendingSearch)}`;
        }
      }
      setPendingSearch(null);
    }
  }, [searchQuery, pendingSearch]);

  if (!mounted) return null;

  return (
    <div className="w-full">
      {/* 主搜索栏 */}
      <div className="relative">
        <div className={`flex items-center bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl border transition-all duration-300 shadow-lg ${
          isFocused 
            ? 'border-blue-300 dark:border-blue-600 shadow-blue-100 dark:shadow-blue-900/20 ring-4 ring-blue-50 dark:ring-blue-900/20' 
            : 'border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600'
        }`}>
          {/* 搜索图标 */}
          <div className="pl-6 pr-2">
            <SearchIcon className={`w-5 h-5 transition-colors duration-200 ${
              isFocused ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'
            }`} />
          </div>

          {/* 搜索输入框 */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={placeholder || (isLostAndFound ? '搜索失物信息...' : t('searchPlaceholder'))}
              className="w-full py-4 pr-4 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            
            {/* 清除按钮 */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* 右侧按钮组 */}
          <div className="flex items-center space-x-2 pr-2">
            {/* 搜索按钮 */}
            <button 
              onClick={handleSearch}
              className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                searchQuery 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              }`}
              disabled={!searchQuery}
            >
              <SearchIcon className="w-5 h-5" />
            </button>

            {/* 分隔线 */}
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-600"></div>

            {/* AI智能搜索按钮 */}
            <button 
              onClick={() => {
                if (!searchQuery.trim()) {
                  alert('请先输入搜索内容');
                  return;
                }
                // 触发AI智能推荐事件
                window.dispatchEvent(new CustomEvent('aiSmartRecommend', {
                  detail: { keyword: searchQuery }
                }));
                // 执行搜索
                handleSearch();
              }}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-200 hover:shadow-lg"
              title="AI智能搜索"
            >
              <Sparkles className="w-5 h-5" />
            </button>

            {/* 筛选按钮 */}
            <button 
              onClick={() => {
                if (onSearch) {
                  setShowFilters(!showFilters);
                } else {
                  // 默认筛选行为
                  alert('筛选功能：可按时间、类型等条件筛选内容');
                }
              }}
              className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                showFilters 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <FilterIcon className="w-5 h-5" />
            </button>

            {/* 发帖按钮 */}
            <Link 
              href={isLostAndFound ? "/create-lost-found" : "/create-post"}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-500 hover:bg-green-600 text-white transition-all duration-200 hover:shadow-lg"
              title={isLostAndFound ? "发布失物信息" : "创建帖子"}
            >
              <PlusCircle className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* 搜索建议下拉 */}
        {isFocused && !searchQuery && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-hidden">
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {isLostAndFound ? '热门搜索' : '推荐搜索'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(term);
                      setPendingSearch(term);
                    }}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
            {isLostAndFound && (
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  💡 提示：可以搜索物品名称、丢失地点或联系方式
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 快速操作栏 */}
      {isLostAndFound && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">快速筛选:</span>
            {['今日新增', '附近地点', '已解决'].map((filter, index) => (
              <button
                key={index}
                className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
              >
                {filter}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <span>共找到 {resultCount || 0} 条记录</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
