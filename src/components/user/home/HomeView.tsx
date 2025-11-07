import HeroSection from "./HeroSection";
import SearchBar from "./SearchBar";
import SuggestionsGrid from "./SuggestionsGrid";

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
  return (
    <div
      className="w-full min-h-screen flex flex-col items-center justify-start 
                 px-6 sm:px-8 pt-20 pb-12 gap-12
                 bg-background-primary relative overflow-hidden transition-colors duration-500
                 animate-[fadeInScale_0.4s_ease-out]"
    >
      {/* Soft gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#D946EF]/5 via-transparent to-[#8B5CF6]/5 pointer-events-none" />

      {/* Hero section */}
      <HeroSection />

      {/* Description */}
      <p className="text-base sm:text-lg leading-relaxed max-w-2xl mx-auto text-center text-text-secondary/90">
        Hỏi đáp tự do cùng AI — hệ thống sẽ giúp bạn tìm tài liệu, tra cứu thông tin 
        và giải đáp mọi thắc mắc về thư viện một cách nhanh chóng và chính xác.
      </p>

      {/* Search bar */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchQueryChange={onSearchQueryChange}
        onSearch={onSearch}
      />

      {/* Suggestions title */}
      <h3 className="text-xl sm:text-2xl font-semibold text-center text-text-primary">
        Gợi ý cho bạn
      </h3>

      {/* Suggestion cards */}
      <SuggestionsGrid onSuggestionClick={onSuggestionClick} />

      {/* Soft gradient glow bottom */}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-background-primary via-background-primary/80 to-transparent pointer-events-none" />
    </div>
  );
}
