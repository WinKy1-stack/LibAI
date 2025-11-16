import { StarIcon, BookOpenIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { ClockIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import type { Book } from "../../../services/chatService";

interface BookSuggestionsProps {
  books: Book[];
}

export default function BookSuggestions({ books }: BookSuggestionsProps) {
  if (!books || !Array.isArray(books) || books.length === 0) {
    return null;
  }

  const sortedBooks = [...books].sort((a, b) => {
    const accuracyA = parseFloat(a.accuracy.replace('%', '')) || 0;
    const accuracyB = parseFloat(b.accuracy.replace('%', '')) || 0;
    return accuracyB - accuracyA;
  });
  
  const displayBooks = sortedBooks.slice(0, 4);

  return (
    <div className="mb-10 animate-[slideInFromBottom_0.7s_ease-out_0.3s_both]">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <BookOpenIcon className="w-7 h-7 text-[#8B5CF6]" />
          Gợi ý sách
        </h2>
        <span className="text-sm text-text-secondary">
          {displayBooks.length} quyển
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
        {displayBooks.map((book, index) => {
          const accuracy = parseFloat(book.accuracy.replace('%', '')) || 0;
          const rating = accuracy / 20;
          const isAvailable = true;
          const isBestMatch = accuracy >= 90;
          const ratingColor =
            rating >= 4
              ? "text-yellow-400"
              : rating >= 3
              ? "text-orange-400"
              : "text-gray-400";

          return (
            <div
              key={book.id}
              className={clsx(
                "group relative p-5 rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer backdrop-blur-sm",
                "bg-card-background",
                "shadow-[0_2px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_18px_rgba(255,255,255,0.06)]",
                "hover:-translate-y-1.5 hover:shadow-[0_8px_26px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_26px_rgba(255,255,255,0.1)]",
                "hover:scale-[1.015]"
              )}
              style={{
                animationDelay: `${index * 0.05}s`,
                animation: "fadeInUp 0.5s ease-out both",
              }}
            >
              {isBestMatch && (
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-primary rounded-full blur-md opacity-60 animate-pulse" />
                    <span className="relative flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-primary text-white text-[11px] font-bold shadow-lg border border-white/10">
                      <SparklesIcon className="w-3 h-3" />
                      Phù hợp
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-col h-full">
                <div className="flex-1 mb-4">
                  <h3 className="text-base font-semibold mb-2 leading-snug text-text-primary line-clamp-2 group-hover:text-[#8B5CF6] transition-colors duration-200">
                    {book.title}
                  </h3>
                  <p className="text-xs text-text-secondary italic line-clamp-1 mb-3">
                    {book.author}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className={clsx("flex items-center gap-1.5", ratingColor)}>
                      <StarIcon className="w-4 h-4 drop-shadow-sm" />
                      <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-text-secondary">/ 5.0</span>
                    <span className="text-xs text-text-secondary">•</span>
                    <span className="text-xs text-text-secondary">{book.accuracy}</span>
                  </div>
                  {(() => {
                    const rel = Array.isArray(book.related) ? book.related : [];
                    const genreItem =
                      rel.find(r => (r.type || '').toLowerCase().includes('thể loại')) ||
                      rel.find(r => (r.type || '').toLowerCase().includes('chủ đề'));
                    const genre = genreItem?.value?.trim();
                    return genre ? (
                      <p className="text-xs text-text-secondary mt-1">
                        {genre}
                      </p>
                    ) : null;
                  })()}
                </div>

                <div className="flex flex-col gap-2.5 mt-auto pt-3">
                  <button
                    className="w-full px-4 py-2 rounded-xl text-sm font-medium
                               bg-background-secondary/80 hover:bg-background-hover
                               text-text-primary border border-border-primary/10
                               transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]
                               hover:shadow-md hover:scale-[1.03] active:scale-[0.97]
                               flex items-center justify-center gap-2 group/btn"
                  >
                    <BookOpenIcon className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    Hỏi chi tiết
                  </button>

                  <button
                    disabled={!isAvailable}
                    className={clsx(
                      "w-full px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] flex items-center justify-center gap-2",
                      isAvailable
                        ? "borrow-button text-white shadow-md hover:shadow-[0_0_12px_rgba(139,92,246,0.4)] hover:scale-[1.04] active:scale-[0.97]"
                        : "bg-background-tertiary/40 text-text-secondary/60 cursor-not-allowed"
                    )}
                  >
                    {isAvailable ? (
                      <>
                        <SparklesIcon className="w-4 h-4" />
                        Có sẵn
                      </>
                    ) : (
                      <>
                        <ClockIcon className="w-4 h-4" />
                        Đã mượn
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-0 group-hover:opacity-[0.07] dark:group-hover:opacity-[0.12] transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
