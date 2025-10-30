import type { FormEvent } from 'react';
import { SparklesIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: (e: FormEvent) => void;
}

export default function SearchBar({ searchQuery, onSearchQueryChange, onSearch }: SearchBarProps) {
  return (
    <form onSubmit={onSearch} className="search-form">
      <div className="search-container">
        <SparklesIcon className="search-icon" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder="Bạn đang tìm kiếm gì...?"
          className="search-input"
        />
        <button type="submit" className="search-button">
          <MagnifyingGlassIcon style={{ width: 20, height: 20 }} />
        </button>
      </div>
    </form>
  );
}

