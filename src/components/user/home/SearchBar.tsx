import type { FormEvent } from 'react';
import { SparklesIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useThemeColors } from '../../../hooks/useThemeColors';

interface SearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: (e: FormEvent) => void;
}

export default function SearchBar({ searchQuery, onSearchQueryChange, onSearch }: SearchBarProps) {
  const colors = useThemeColors();

  return (
    <form onSubmit={onSearch} className="w-full flex justify-center">
      <div className="relative w-full max-w-3xl">
        {/* Sparkle Icon */}
        <SparklesIcon 
          className="absolute left-5 top-1/2 -translate-y-1/2 z-10 w-5 h-5 text-pink-500" 
          style={{ filter: 'drop-shadow(0 0 8px rgba(236, 72, 153, 0.5))' }} 
        />
        
        {/* Input Field */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder="Bạn đang tìm kiếm gì...?"
          className="
            w-full py-4 pl-14 pr-16 text-lg rounded-full
            outline-none
            shadow-lg
            transition-all duration-300
            focus:ring-4
          "
          style={{
            backgroundColor: colors.inputBg,
            color: colors.primaryText,
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: colors.border,
          }}
        />
        
        {/* Search Button */}
        <button 
          type="submit" 
          className="
            absolute right-2 top-1/2 -translate-y-1/2
            w-10 h-10
            rounded-full
            bg-gradient-to-r from-pink-500 to-purple-600
            text-white
            cursor-pointer
            flex items-center justify-center
            shadow-md shadow-purple-500/40
            transition-all duration-300
            hover:scale-105
            hover:shadow-lg hover:shadow-purple-500/50
          "
        >
          <MagnifyingGlassIcon className="w-4 h-4" />
        </button>
      </div>
      
      {/* Inline CSS for placeholder */}
      <style>{`
        input::placeholder {
          color: ${colors.placeholderText};
        }
      `}</style>
    </form>
  );
}
