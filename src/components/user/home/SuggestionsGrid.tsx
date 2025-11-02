import { userSuggestions } from '../../../data';

interface SuggestionsGridProps {
  onSuggestionClick: (query: string) => void;
}

export default function SuggestionsGrid({ onSuggestionClick }: SuggestionsGridProps) {
  return (
    <div className="suggestions-container">
      <h3 className="suggestions-title">
        Bạn có thể hỏi
      </h3>

      <div className="suggestions-grid">
        {userSuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="suggestion-card"
          >
            <span className="suggestion-icon">{suggestion.icon}</span>
            <p className="suggestion-text">{suggestion.text}</p>
            <div className="suggestion-action">
              <span>Hỏi cái này</span>
              <span>→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

