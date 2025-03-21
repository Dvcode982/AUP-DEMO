'use client';

import { useState, useEffect } from 'react';
import { FilterIcon, SearchIcon, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SearchBarProps {
  onSearch?: (query: string, filters?: any) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps = {}) => {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const pathname = usePathname();
  
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
    <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 opacity-80">
      {/* 搜索框 */}
      <div className="relative flex-1 ">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder={isLostAndFound ? "搜索失物招领..." : "搜索帖子..."}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-blue-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>

      {/* 搜索按钮 */}
      <button 
        onClick={handleSearch}
        className="flex items-center p-2 rounded-lg bg-blue-500 text-white border border-blue-600 hover:bg-blue-600 transition-colors duration-200"
      >
        <SearchIcon className="w-5 h-5" />
      </button>

      {/* 筛选按钮 */}
      <button 
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center p-2 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-800 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200"
      >
        <FilterIcon className="w-5 h-5" />
      </button>

      {/* 发帖按钮 */}
      <Link href="/create-post" className="flex items-center p-2 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-800 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200">
        <PlusCircle className="w-5 h-5" />
      </Link>
    </div>
  );
};

export default SearchBar;
