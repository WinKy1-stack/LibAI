import { useState, useEffect } from 'react';
import { PaperAirplaneIcon, Bars3Icon, HomeIcon } from '@heroicons/react/24/outline';
import { useChatContext } from '../../hooks/useChatContext';
import { useChatHistory } from '../../hooks/useChatHistory';
import '../../components/user/color.css';
import ChatMessages, { type ChatMessage } from '../../components/user/chat/ChatMessages';
import FeedbackButtons from '../../components/user/chat/FeedbackButtons';
import BookSuggestions from '../../components/user/chat/BookSuggestions';
import { HeroSection, SearchBar, SuggestionsGrid } from '../../components/user/home';
import ConversationSidebar from '../../components/user/chat/ConversationSidebar';
import { authService } from '../../services/authService';
import { useUserTheme } from '../../hooks/useUserTheme';

export default function UserHomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [fixedChatInput, setFixedChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isChatting, setIsChatting } = useChatContext();
  
  // Use real chat API
  const { 
    sendMessage, 
    loading, 
    error,
    conversationId,
    messages,
    loadHistory,
    startNewConversation,
    clearMessages
  } = useChatHistory();

  const isAuthenticated = authService.isAuthenticated();
  const { mode: themeMode } = useUserTheme();

  // Sync messages từ hook vào local state để hiển thị
  useEffect(() => {
    if (messages.length > 0) {
      const formattedMessages: ChatMessage[] = messages.map((msg, idx) => ({
        id: `${idx}-${msg.role}`,
        type: msg.role === 'user' ? 'user' : 'bot',
        content: msg.content,
        timestamp: new Date(msg.timestamp || Date.now()),
      }));
      setChatMessages(formattedMessages);
    }
  }, [messages]);

  // Load conversation history khi chọn conversation
  const handleSelectConversation = async (convId: string) => {
    try {
      setIsChatting(true);
      await loadHistory(convId);
      // Messages sẽ được sync qua useEffect
    } catch (err) {
      console.error('Error loading conversation:', err);
    }
  };

  // Tạo conversation mới
  const handleNewConversation = () => {
    startNewConversation();
    clearMessages();
    setChatMessages([]);
    setIsChatting(false);
  };

  // Send message to real API
  const sendMessageToAPI = async (userQuery: string) => {
    setIsTyping(true);
    
    try {
      // Call real API
      const aiResponse = await sendMessage(userQuery);
      
      // Add bot response
      const botMessage: ChatMessage = {
        id: Date.now().toString() + '-bot',
        type: 'bot',
        content: aiResponse,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, botMessage]);
    } catch (err) {
      // Show error message
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '-error',
        type: 'bot',
        content: `Xin lỗi, đã có lỗi xảy ra: ${error || 'Không thể kết nối với server'}`,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
      console.error('Error sending message:', err);
    } finally {
      setIsTyping(false);
    }
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

      sendMessageToAPI(searchQuery);
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

    sendMessageToAPI(query);
  };


  const handleFixedChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fixedChatInput.trim() && !loading) {
      // Nếu chưa chat, set isChatting = true để chuyển sang chat view
      if (!isChatting) {
        setIsChatting(true);
      }

      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: fixedChatInput,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, userMessage]);
      const messageToSend = fixedChatInput;
      setFixedChatInput('');
      
      // Send to real API
      sendMessageToAPI(messageToSend);
    }
  };


  // Suggestions and books are now provided by components via data module

  // Main layout - Always show sidebar + content area (Gemini style)
  return (
    <div 
      className="flex h-screen overflow-hidden transition-colors duration-200"
      style={{
        backgroundColor: themeMode === 'dark' ? '#0f1419' : '#f9fafb',
      }}
    >
      {/* Sidebar - CHỈ hiện khi đã đăng nhập với animation */}
      {isAuthenticated && (
        <div 
          className={`flex-shrink-0 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'w-80' : 'w-0'
          }`}
          style={{
            transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            opacity: isSidebarOpen ? 1 : 0,
          }}
        >
          <ConversationSidebar
            currentConversationId={conversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            themeMode={themeMode}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Top Action Buttons */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          {/* Toggle Sidebar Button - Chỉ hiện khi authenticated */}
          {isAuthenticated && (
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border"
              style={{
                background: themeMode === 'dark' ? 'rgba(30, 41, 54, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                borderColor: themeMode === 'dark' ? '#334155' : '#e5e7eb',
                color: themeMode === 'dark' ? '#e5e7eb' : '#374151',
                backdropFilter: 'blur(10px)',
              }}
              title={isSidebarOpen ? 'Ẩn lịch sử' : 'Hiện lịch sử'}
            >
              <Bars3Icon className="w-5 h-5" />
            </button>
          )}

          {/* Back to Home Button - Chỉ hiện khi đang chat */}
          {isChatting && (
            <button
              onClick={handleNewConversation}
              className="p-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border"
              style={{
                background: themeMode === 'dark' ? 'rgba(30, 41, 54, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                borderColor: themeMode === 'dark' ? '#334155' : '#e5e7eb',
                color: themeMode === 'dark' ? '#e5e7eb' : '#374151',
                backdropFilter: 'blur(10px)',
              }}
              title="Về trang chủ"
            >
              <HomeIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content: Hero/Search HOẶC Chat Messages */}
        <div 
          className="flex-1 overflow-y-auto transition-colors duration-200"
          style={{
            backgroundColor: themeMode === 'dark' ? '#0f1419' : '#f9fafb',
          }}
        >
          {!isChatting ? (
            // Home view (hero + suggestions) - Hiện khi chưa chat
            <div className="home-view" style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
              <HeroSection />
              <SearchBar
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                onSearch={handleSearch}
              />
              <SuggestionsGrid onSuggestionClick={handleSuggestionClick} />
            </div>
          ) : (
            // Chat interface - Hiện khi đang chat
            <div className="chat-container">
              <ChatMessages messages={chatMessages} isTyping={isTyping} />

              {/* Books Section */}
              <div className="chat-books-section">
                <BookSuggestions />
                <FeedbackButtons />
              </div>
            </div>
          )}
        </div>

        {/* Fixed Chat Input at Bottom - Luôn hiện */}
        <div 
          className="fixed-chat-input-wrapper transition-colors duration-200"
          style={{
            borderTop: `1px solid ${themeMode === 'dark' ? '#1e293b' : '#e5e7eb'}`,
            background: themeMode === 'dark' ? 'rgba(15, 20, 25, 0.95)' : 'rgba(249, 250, 251, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div className="fixed-chat-input-container">
            <form onSubmit={handleFixedChatSubmit}>
              <span className="fixed-chat-icon">💬</span>
              <input
                type="text"
                value={fixedChatInput}
                onChange={(e) => setFixedChatInput(e.target.value)}
                placeholder={isChatting ? "Tiếp tục hỏi thêm câu hỏi..." : "Bắt đầu trò chuyện với LibAI..."}
                className="fixed-chat-input"
                style={{
                  background: themeMode === 'dark' ? 'rgba(30, 41, 54, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                  borderColor: themeMode === 'dark' ? '#334155' : '#e5e7eb',
                  color: themeMode === 'dark' ? '#e5e7eb' : '#111827',
                }}
                disabled={loading}
              />
              <div className="fixed-chat-actions">
                <button 
                  type="submit"
                  className="fixed-chat-btn"
                  disabled={!fixedChatInput.trim() || loading}
                >
                  <span>{loading ? 'Đang gửi...' : 'Gửi'}</span>
                  <PaperAirplaneIcon style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

