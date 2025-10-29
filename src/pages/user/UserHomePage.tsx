import { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, SparklesIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useChatContext } from '../../contexts/ChatContext';
import { authService } from '../../services/authService';
import { userSuggestions, userChatBooks } from '../../data';
import { formatTime } from '../../components/user/utils';
import '../../components/user/color.css';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export default function UserHomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [fixedChatInput, setFixedChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const { isChatting, setIsChatting } = useChatContext();
  
  // Check authentication (reserved for future API usage)
  authService.isAuthenticated();

  // Auto scroll to bottom khi có message mới
  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  // Simulate bot response
  const simulateBotResponse = (userQuery: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: Date.now().toString() + '-bot',
        type: 'bot',
        content: `Chào bạn! Về "${userQuery}", thư viện có một vài đầu sách rất hay mà tôi muốn giới thiệu. Bạn có thể tham khảo "Python Crash Course" của Eric Matthes - cuốn này rất phù hợp cho người mới với cách tiếp cận từ cơ bản đến nâng cao, hoặc "Automate the Boring Stuff with Python" của Al Sweigart - tập trung vào ứng dụng thực tế.`,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      // Cho phép vào màn hình chat mà không ép đăng nhập
      setIsChatting(true);

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: searchQuery,
        timestamp: new Date(),
      };
      setChatMessages([userMessage]);

      simulateBotResponse(searchQuery);
    }
  };

  const handleSuggestionClick = (query: string) => {
    // Cho phép vào chat khi chọn gợi ý mà không ép đăng nhập
    setSearchQuery(query);
    setIsChatting(true);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date(),
    };
    setChatMessages([userMessage]);

    simulateBotResponse(query);
  };


  const handleFixedChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fixedChatInput.trim()) {
      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: fixedChatInput,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, userMessage]);
      setFixedChatInput('');
      
      // Simulate bot response
      simulateBotResponse(fixedChatInput);
    }
  };

  // constants and utils moved to components/user

  // Nếu đang chat thì hiển thị chat interface
  if (isChatting) {
    return (
      <>
        <div className="chat-container">
          {/* Chat Messages */}
          <div className="chat-messages-container">
            {chatMessages.map((message) => (
              <div key={message.id} className={`chat-message ${message.type}`}>
                <div className="chat-message-avatar">
                  {message.type === 'bot' ? (
                    <SparklesIcon style={{ width: 16, height: 16, color: '#fff' }} />
                  ) : (
                    <svg style={{ width: 16, height: 16 }} fill="white" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  )}
                </div>
                <div className="chat-message-content">
                  <div className="chat-message-bubble">
                    {message.content}
                  </div>
                  <span className="chat-message-time">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="chat-message bot">
                <div className="chat-message-avatar">
                  <SparklesIcon style={{ width: 16, height: 16, color: '#fff' }} />
                </div>
                <div className="chat-message-content">
                  <div className="chat-typing-indicator">
                    <div className="chat-typing-dot"></div>
                    <div className="chat-typing-dot"></div>
                    <div className="chat-typing-dot"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatMessagesEndRef} />
          </div>

        {/* Books Section */}
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

          {/* Feedback */}
          <div className="feedback-section">
            <p className="feedback-text">
              Kết quả khá đa dạng! Bạn có thể yêu cầu mình làm thêm bất cứ thứ gì nếu cần nhé! 💬
            </p>
            <div className="feedback-buttons">
              <button className="feedback-btn">👍</button>
              <button className="feedback-btn">👎</button>
              <button className="feedback-btn">🔄</button>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Chat Input at Bottom */}
      <div className="fixed-chat-input-wrapper">
        <div className="fixed-chat-input-container">
          <form onSubmit={handleFixedChatSubmit}>
            <span className="fixed-chat-icon">💬</span>
            <input
              type="text"
              value={fixedChatInput}
              onChange={(e) => setFixedChatInput(e.target.value)}
              placeholder="Tiếp tục hỏi thêm câu hỏi..."
              className="fixed-chat-input"
            />
            <div className="fixed-chat-actions">
              <button 
                type="submit"
                className="fixed-chat-btn"
                disabled={!fixedChatInput.trim()}
              >
                <span>Gửi</span>
                <PaperAirplaneIcon style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </form>
        </div>
      </div>
      </>
    );
  }

  // Home view (hero + suggestions)
  return (
    <div className="home-view" style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
      {/* Hero Section */}
      <div className="hero-container">
        {/* First Line: Title + Avatar + Text */}
        <div className="hero-title-wrapper">
          <h1 className="hero-title">
            TRỢ LÝ ẢO THƯ VIỆN
          </h1>
          
          <div className="hero-avatar">
            <div className="hero-avatar-inner">
              <svg style={{ width: "60%", height: "60%" }} fill="white" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          </div>
          
          <h2 className="hero-title-secondary">
            TƯƠNG TÁC
          </h2>
        </div>

        {/* Second Line */}
        <h2 className="hero-title-tertiary">
          THÔNG MINH, TIẾP CẬN TRI THỨC
        </h2>

        {/* Subtitle */}
        <p className="hero-subtitle">
          Hỏi đáp tự do, AI sẽ giúp bạn tìm kiếm tài liệu và giải đáp mọi thắc mắc về thư viện một cách nhanh chóng và chính xác
        </p>
      </div>
      
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-container">
          <SparklesIcon className="search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Bạn đang tìm kiếm gì...?"
            className="search-input"
          />
          <button type="submit" className="search-button">
            <MagnifyingGlassIcon style={{ width: 20, height: 20 }} />
          </button>
        </div>
      </form>

      {/* Suggestions */}
      <div className="suggestions-container">
        <h3 className="suggestions-title">
          Bạn có thể hỏi
        </h3>

        <div className="suggestions-grid">
          {userSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion.text)}
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
    </div>
  );
}

