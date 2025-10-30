import { useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useChatContext } from '../../contexts/ChatContext';
import '../../components/user/color.css';
import ChatMessages, { type ChatMessage } from '../../components/user/chat/ChatMessages';
import FeedbackButtons from '../../components/user/chat/FeedbackButtons';
import BookSuggestions from '../../components/user/chat/BookSuggestions';
import { HeroSection, SearchBar, SuggestionsGrid } from '../../components/user/home';

export default function UserHomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [fixedChatInput, setFixedChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { isChatting, setIsChatting } = useChatContext();

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


  // Suggestions and books are now provided by components via data module

  // Nếu đang chat thì hiển thị chat interface
  if (isChatting) {
    return (
      <>
        <div className="chat-container">
          {/* Chat Messages */}
          <ChatMessages messages={chatMessages} isTyping={isTyping} />

        {/* Books Section */}
        <div className="chat-books-section">
          <BookSuggestions />

          {/* Feedback */}
          <FeedbackButtons />
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
      <HeroSection />
      <SearchBar
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearch={handleSearch}
      />
      <SuggestionsGrid onSuggestionClick={handleSuggestionClick} />
    </div>
  );
}

