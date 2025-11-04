import type { FormEvent } from 'react';
import { SparklesIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: (e: FormEvent) => void;
}

export default function SearchBar({ searchQuery, onSearchQueryChange, onSearch }: SearchBarProps) {
  return (
    <form onSubmit={onSearch} className="w-full flex justify-center">
      <div className="relative w-full max-w-3xl">
        <SparklesIcon 
          className="absolute left-5 top-1/2 -translate-y-1/2 z-10 w-5 h-5 text-purple-500"
        />
        
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder="Bạn đang tìm kiếm gì...?"
          className="w-full py-4 pl-14 pr-16 text-lg rounded-full outline-none transition-all duration-300
                     bg-input-background text-text-primary
                     border border-border-primary
                     focus:ring-2 focus:ring-purple-500
                     placeholder-text-placeholder"
        />
        
        <button 
          type="submit" 
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
                     bg-button-primary-bg text-button-primary-text
                     flex items-center justify-center
                     transition-all duration-300
                     hover:bg-purple-700"
        >
          <MagnifyingGlassIcon className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}