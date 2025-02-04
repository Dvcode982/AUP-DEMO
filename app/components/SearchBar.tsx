'use client';

import { useState, useEffect } from 'react';
import { FilterIcon, SearchIcon } from 'lucide-react';

const SearchBar = () => {
  const [mounted, setMounted] = useState(false);

  // 确保组件只在客户端渲染时才执行
  useEffect(() => {
    setMounted(true); // 组件挂载完成后，将 mounted 设置为 true
  }, []);

  // 在客户端渲染之前，不渲染内容，以避免 Hydration 错误
  if (!mounted) return null;

  return (
    <div className="relative w-half">
      <input
        type="text"
        placeholder="搜索帖子..."
        className="p-2 pl-14 rounded-full border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-shadow duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      />
      <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />

      {/* 将 Sidebar 按钮样式应用到 SearchBar 按钮 */}
      <button
        className="flex items-center p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-800 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200 absolute left-80 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800"
      >
        <FilterIcon className="text-gray-400 dark:text-gray-500" />
      </button>
    </div>
  );
};

export default SearchBar;
