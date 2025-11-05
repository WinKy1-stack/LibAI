import { userChatBooks } from '../../../data';
import { StarIcon } from '@heroicons/react/24/solid';

export default function BookSuggestions() {
  return (
    <div className="mb-8 animate-[slideInFromBottom_0.7s_ease-out_0.3s_both]">
      <h2 className="text-2xl font-bold text-text-primary mb-4">Gợi ý sách</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {userChatBooks.map((book) => (
          <div 
            key={book.id} 
            className="group p-4 rounded-xl transition-all duration-300 cursor-pointer
                       bg-card-background border border-border-primary
                       hover:-translate-y-1 hover:shadow-lg"
          >
            {book.bestMatch && (
              <div className="inline-block px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 text-white text-[10px] font-bold mb-2">
                ⭐ PHÙ HỢP
              </div>
            )}

            <div className="flex flex-col h-full">
              <div className="flex-1 mb-2">
                <h3 className="text-base font-bold mb-1 leading-tight line-clamp-2 text-text-primary">
                  {book.title}
                </h3>
                <p className="text-xs line-clamp-1 text-text-secondary">
                  {book.author}
                </p>
              </div>

              <div className="flex items-center gap-1 mb-3 text-xs text-text-secondary">
                <StarIcon className="w-4 h-4 text-yellow-400" />
                <span>{book.rating}</span>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  className="w-full px-2 py-1.5 rounded-md text-xs font-medium transition-colors duration-200
                             bg-background-secondary border border-border-primary text-text-primary
                             hover:bg-background-hover"
                >
                  Chi tiết
                </button>
                <button
                  className={`w-full px-2 py-1.5 rounded-md text-xs font-semibold transition-all duration-200
                    ${book.status === 'available'
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`
                  }
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