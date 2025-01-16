import { SearchIcon } from 'lucide-react'

const SearchBar = () => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="搜索帖子..."
        className="w-full p-2 pl-10 rounded-full border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-shadow duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      />
      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
    </div>
  )
}

export default SearchBar

