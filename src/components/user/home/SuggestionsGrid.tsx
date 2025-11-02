import { userSuggestions } from '../../../data';
import { useThemeColors } from '../../../hooks/useThemeColors';

interface SuggestionsGridProps {
  onSuggestionClick: (query: string) => void;
}

export default function SuggestionsGrid({ onSuggestionClick }: SuggestionsGridProps) {
  const colors = useThemeColors();

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {userSuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="
              group relative
              rounded-xl p-4
              cursor-pointer
              transition-all duration-300
              shadow-md
              hover:shadow-lg hover:shadow-purple-500/20
              hover:-translate-y-0.5
              text-left
            "
            style={{
              backgroundColor: colors.cardBg,
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: colors.border,
            }}
          >
            {/* Icon */}
            <span className="text-2xl mb-3 block">{suggestion.icon}</span>
            
            {/* Text gợi ý */}
            <p 
              className="text-sm leading-relaxed mb-3 line-clamp-3"
              style={{ color: colors.primaryText }}
            >
              {suggestion.text}
            </p>
            
            {/* Link "Hỏi cái này" */}
            <div className="flex items-center gap-1 text-sm font-semibold">
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Hỏi cái này →
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
