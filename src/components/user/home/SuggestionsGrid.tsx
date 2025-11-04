import { userSuggestions } from '../../../data';

interface SuggestionsGridProps {
  onSuggestionClick: (query: string) => void;
}

export default function SuggestionsGrid({ onSuggestionClick }: SuggestionsGridProps) {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {userSuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="group relative rounded-xl p-4 cursor-pointer transition-all duration-300
                       bg-card-background
                       border border-border-primary
                       hover:shadow-md hover:-translate-y-0.5
                       text-left"
          >
            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-lg w-min mb-3">
              <suggestion.icon className="w-5 h-5" />
            </div>
            
            <p className="text-sm leading-relaxed mb-3 line-clamp-3 text-text-primary">
              {suggestion.text}
            </p>
            
            <div className="flex items-center gap-1 text-sm font-semibold text-text-link">
              <span>Hỏi cái này →</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}