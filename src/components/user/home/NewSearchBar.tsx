import { useState } from 'react';
import { MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function NewSearchBar() {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      console.log('Searching for:', query);
      // Handle search logic here
    }
  };

  return (
    <form onSubmit={handleSearch} className="max-w-4xl mx-auto mb-16 px-6">
      <div className="relative">
        {/* Sparkles Icon */}
        <SparklesIcon className="w-6 h-6 text-pink-500 absolute left-5 top-1/2 -translate-y-1/2 z-10 drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]" />
        
        {/* Search Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Bạn đang tìm kiếm gì...?"
          className="w-full h-16 pl-16 pr-20 text-base md:text-lg bg-[#2D2D2D]/80 backdrop-blur-md border border-white/10 rounded-full text-white placeholder-gray-500 outline-none shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 focus:border-purple-600 focus:shadow-[0_8px_32px_rgba(147,51,234,0.3),0_0_0_3px_rgba(147,51,234,0.1)]"
        />
        
        {/* Search Button */}
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/40 transition-all duration-300 hover:scale-105 hover:shadow-purple-600/60"
        >
          <MagnifyingGlassIcon className="w-6 h-6 text-white" />
        </button>
      </div>
    </form>
  );
}

