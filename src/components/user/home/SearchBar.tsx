import type { FormEvent } from "react";
import { SparklesIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface SearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: (e: FormEvent) => void;
}

export default function SearchBar({
  searchQuery,
  onSearchQueryChange,
  onSearch,
}: SearchBarProps) {
  return (
    <form onSubmit={onSearch} className="w-full flex justify-center">
      <div className="relative w-full max-w-3xl transition-all duration-300">
        {/* Left Icon */}
        <SparklesIcon
          className="absolute left-5 top-1/2 -translate-y-1/2 z-10 w-5 h-5 
                     text-[#8B5CF6] dark:text-[#C084FC] transition-colors"
        />

        {/* Input field */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder="Bạn đang tìm kiếm gì...?"
          className="w-full py-4 pl-14 pr-16 text-lg rounded-full outline-none
                     text-text-primary placeholder:text-text-placeholder
                     bg-background-secondary/90 backdrop-blur-xl
                     ring-1 ring-border-primary/20
                     shadow-[0_4px_22px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_28px_rgba(255,255,255,0.07)]
                     hover:ring-[#8B5CF6]/30 hover:shadow-[0_6px_30px_rgba(0,0,0,0.12)]
                     focus:ring-2 focus:ring-[#D946EF]/50
                     transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
        />

        {/* Search Button */}
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full
                     bg-gradient-to-r from-[#D946EF] to-[#8B5CF6] text-white
                     flex items-center justify-center
                     shadow-[0_0_14px_rgba(217,70,239,0.25)]
                     hover:shadow-[0_0_18px_rgba(217,70,239,0.45)] hover:scale-[1.05]
                     active:scale-[0.95] transition-all duration-300"
        >
          <MagnifyingGlassIcon className="w-5 h-5" />
        </button>

        {/* subtle highlight ring (like macOS search glow) */}
        <div className="absolute inset-0 rounded-full pointer-events-none 
                        bg-gradient-to-r from-[#D946EF]/10 via-transparent to-[#8B5CF6]/10 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </form>
  );
}
