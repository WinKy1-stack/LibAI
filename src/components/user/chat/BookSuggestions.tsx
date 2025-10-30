import { userChatBooks } from '../../../data';

export default function BookSuggestions() {
  return (
    <div className="chat-books-section">
      <h2 className="chat-books-title">Gợi ý sách</h2>

      <div className="chat-books-grid">
        {userChatBooks.map((book) => (
          <div key={book.id} className="book-card">
            {book.bestMatch && (
              <div className="book-badge">
                ⭐ PHÙ HỢP NHẤT
              </div>
            )}

            <div className="book-info">
              <h3 className="book-title">{book.title}</h3>
              <p className="book-author">{book.author}</p>
            </div>

            <div className="book-rating">
              <span className="book-rating-star">⭐</span>
              <span>{book.rating} ({book.reviews} reviews)</span>
            </div>

            <div className="book-actions">
              <button className="book-btn-detail">
                Hỏi chi tiết
              </button>
              <button className={`book-btn-status ${book.status === 'available' ? 'book-btn-available' : 'book-btn-borrowed'}`}>
                {book.status === 'available' ? 'Có sẵn' : 'Đã mượn'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

