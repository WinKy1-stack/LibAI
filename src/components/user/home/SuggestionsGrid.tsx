import { userSuggestions } from "../../../data";

interface SuggestionsGridProps {
  onSuggestionClick: (query: string) => void;
}

export default function SuggestionsGrid({ onSuggestionClick }: SuggestionsGridProps) {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {userSuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="group relative rounded-2xl p-5 text-left cursor-pointer
                       bg-card-background backdrop-blur-sm
                       shadow-[0_2px_10px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_14px_rgba(255,255,255,0.04)]
                       transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)]
                       hover:-translate-y-1 hover:scale-[1.02]
                       hover:shadow-[0_8px_22px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_24px_rgba(255,255,255,0.08)]"
          >
            {/* Icon container */}
            <div className="p-2 mb-3 rounded-lg w-min 
                            bg-gradient-to-br from-[#D946EF]/15 to-[#8B5CF6]/20 
                            text-[#8B5CF6] dark:text-[#C084FC] 
                            group-hover:from-[#D946EF]/25 group-hover:to-[#8B5CF6]/30
                            transition-all duration-300">
              <suggestion.icon className="w-5 h-5" />
            </div>

            {/* Text */}
            <p className="text-sm leading-relaxed mb-3 line-clamp-3 text-text-primary">
              {suggestion.text}
            </p>

            {/* Footer */}
            <div className="flex items-center gap-1 text-sm font-semibold 
                            text-[#8B5CF6] group-hover:text-[#D946EF]
                            transition-colors duration-300">
              <span>Hỏi ngay →</span>
            </div>

            {/* Subtle gradient glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#D946EF]/5 to-[#8B5CF6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </button>
        ))}
      </div>
    </div>
  );
}
