'use client';

import { useState, useEffect } from 'react';
import { FilterIcon, SearchIcon, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../contexts/LanguageContext';

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps = {}) => {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();
  
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

  if (!mounted) return null;

  return (
    <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* 搜索框 */}
      <div className="relative flex-1">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder={isLostAndFound ? t('search.lostAndFoundPlaceholder') : t('search.postsPlaceholder')}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 bg-opacity-60 dark:bg-opacity-60 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700 focus:border-blue-400 dark:focus:border-blue-600 transition-all duration-200"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>

      {/* 搜索按钮 */}
      <button 
        onClick={handleSearch}
        className="flex items-center justify-center p-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white border border-blue-600 shadow-sm transition-all duration-200 hover:shadow-md"
      >
        <SearchIcon className="w-5 h-5" />
      </button>

      {/* 筛选按钮 */}
      <button 
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center justify-center p-2.5 rounded-lg bg-white dark:bg-gray-800 bg-opacity-60 dark:bg-opacity-60 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-300 shadow-sm transition-all duration-200 hover:shadow-md"
      >
        <FilterIcon className="w-5 h-5" />
      </button>

      {/* 发帖按钮 */}
      <Link href="/create-post" className="flex items-center justify-center p-2.5 rounded-lg bg-white dark:bg-gray-800 bg-opacity-60 dark:bg-opacity-60 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-300 shadow-sm transition-all duration-200 hover:shadow-md">
        <PlusCircle className="w-5 h-5" />
      </Link>
    </div>
  );
};

export default SearchBar;
