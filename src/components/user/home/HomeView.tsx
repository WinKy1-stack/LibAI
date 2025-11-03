import { useThemeColors } from '../../../hooks/useThemeColors';
import HeroSection from './HeroSection';
import SearchBar from './SearchBar';
import SuggestionsGrid from './SuggestionsGrid';

interface HomeViewProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: (e: React.FormEvent) => void;
  onSuggestionClick: (query: string) => void;
}

export default function HomeView({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  onSuggestionClick,
}: HomeViewProps) {
  const colors = useThemeColors();

  return (
    <div className="w-full min-h-full flex flex-col items-center justify-start px-6 pt-16 pb-8 animate-[fadeInScale_0.4s_ease-out] gap-12">
      <HeroSection />
      
      {/* Subtitle */}
      <p 
        className="text-base leading-relaxed max-w-2xl mx-auto text-center"
        style={{ color: colors.primaryText }}
      >
        Hỏi đáp tự do, AI sẽ giúp bạn tìm kiếm tài liệu và giải đáp mọi thắc mắc về thư viện một cách nhanh chóng và chính xác
      </p>
      
      <SearchBar
        searchQuery={searchQuery}
        onSearchQueryChange={onSearchQueryChange}
        onSearch={onSearch}
      />
      
      {/* "Bạn có thể hỏi" heading */}
      <h3 
        className="text-xl font-semibold text-center"
        style={{ color: colors.primaryText }}
      >
        Bạn có thể hỏi
      </h3>
      
      <SuggestionsGrid onSuggestionClick={onSuggestionClick} />
    </div>
  );
}

