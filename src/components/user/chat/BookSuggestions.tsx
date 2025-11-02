import { userChatBooks } from '../../../data';
import { useThemeColors } from '../../../hooks/useThemeColors';

export default function BookSuggestions() {
  const colors = useThemeColors();

  return (
    <div className="mb-8 animate-[slideInFromBottom_0.7s_ease-out_0.3s_both]">
      <h2 className="text-2xl font-bold" style={{ color: colors.primaryText }}>Gợi ý sách</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {userChatBooks.map((book) => (
          <div 
            key={book.id} 
            className="aspect-square p-4 rounded-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1 shadow-lg flex flex-col"
            style={{
              backgroundColor: colors.cardBg,
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: colors.border,
            }}
          >
            {book.bestMatch && (
              <div className="inline-block px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 text-white text-[10px] font-bold mb-2">
                ⭐ PHÙ HỢP
              </div>
            )}

            <div className="flex-1 flex flex-col justify-between">
              <div className="mb-2">
                <h3 
                  className="text-base font-bold mb-1 leading-tight line-clamp-2"
                  style={{ color: colors.primaryText }}
                >
                  {book.title}
                </h3>
                <p 
                  className="text-xs line-clamp-1"
                  style={{ color: colors.secondaryText }}
                >
                  {book.author}
                </p>
              </div>

              <div 
                className="flex items-center gap-1 mb-2 text-xs"
                style={{ color: colors.secondaryText }}
              >
                <span className="text-yellow-400">⭐</span>
                <span>{book.rating}</span>
              </div>

              <div className="flex flex-col gap-1.5">
              <button 
                className="w-full px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
                style={{
                  backgroundColor: 'transparent',
                  color: colors.primaryText,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: colors.border,
                }}
              >
                Chi tiết
              </button>
              <button 
                className={`w-full px-2 py-1.5 rounded-md border-0 text-white text-xs font-semibold transition-all duration-200 ${
                  book.status === 'available' 
                    ? 'bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(236,72,153,0.4)]' 
                    : 'bg-gray-500/30 dark:bg-gray-900/15 dark:text-gray-900'
                }`}
              >
                {book.status === 'available' ? 'Có sẵn' : 'Đã mượn'}
              </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

