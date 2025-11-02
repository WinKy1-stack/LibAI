import { useState, useEffect } from 'react';
import { PaperAirplaneIcon, Bars3Icon } from '@heroicons/react/24/outline';
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
  const [sidebarWidth, setSidebarWidth] = useState(320); // Default 320px (w-80)
  const [isResizing, setIsResizing] = useState(false);
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

  // CRITICAL: Set data-theme attribute on document root để CSS apply đúng
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    // Cleanup khi unmount
    return () => {
      document.documentElement.removeAttribute('data-theme');
    };
  }, [themeMode]);

  // Handle resize sidebar
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      if (newWidth >= 250 && newWidth <= 500) { // Min 250px, Max 500px
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

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
      className="relative"
      style={{ 
        minHeight: '100vh',
        paddingTop: '64px', // TopBar height
      }}
    >
      {/* Sidebar - CHỈ hiện khi đã đăng nhập - Fixed position ngay dưới TopBar - Resizable */}
      {isAuthenticated && (
        <div 
          className="fixed left-0 ease-in-out"
          style={{
            top: '64px', // Ngay dưới TopBar
            height: 'calc(100vh - 64px)',
            width: isSidebarOpen ? `${sidebarWidth}px` : '0',
            transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            opacity: isSidebarOpen ? 1 : 0,
            zIndex: 40,
            transition: isResizing ? 'none' : 'all 0.3s ease-in-out',
          }}
        >
          <ConversationSidebar
            currentConversationId={conversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            themeMode={themeMode}
          />
          
          {/* Resize Handle */}
          {isSidebarOpen && (
            <div
              className="absolute top-0 right-0 w-1 h-full cursor-ew-resize hover:bg-purple-500 transition-colors group"
              onMouseDown={() => setIsResizing(true)}
              style={{
                background: isResizing ? 'rgba(147, 51, 234, 0.5)' : 'transparent',
              }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-purple-500/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div 
        className="flex flex-col relative"
        style={{
          marginLeft: isAuthenticated && isSidebarOpen ? `${sidebarWidth}px` : '0',
          minHeight: 'calc(100vh - 64px)',
          transition: isResizing ? 'none' : 'margin-left 0.3s ease-in-out',
        }}
      >
        {/* Toggle Sidebar Button - Hiện khi authenticated - Fixed position */}
        {isAuthenticated && (
          <div 
            className="fixed z-50"
            style={{
              top: 'calc(64px + 16px)', // TopBar height + margin
              left: isSidebarOpen ? `${sidebarWidth + 16}px` : '16px', // Sidebar width + margin hoặc just margin
              transition: isResizing ? 'none' : 'left 0.3s ease-in-out',
            }}
          >
            <div 
              className="flex items-center gap-2 rounded-2xl px-3 py-2 shadow-lg backdrop-blur-xl border transition-all"
              style={{
                background: themeMode === 'dark' ? 'rgba(30, 35, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                borderColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
              }}
            >
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                style={{
                  color: themeMode === 'dark' ? '#e5e7eb' : '#111827',
                }}
                title={isSidebarOpen ? 'Ẩn lịch sử' : 'Hiện lịch sử'}
              >
                <Bars3Icon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Content: Hero/Search HOẶC Chat Messages */}
        <div 
          className="flex-1 overflow-y-auto transition-colors duration-200"
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

        {/* Fixed Chat Input at Bottom - Chỉ hiện khi đang chat - Thu gọn vào giữa */}
        {isChatting && (
          <div 
            className="fixed bottom-4"
            style={{
              left: isAuthenticated && isSidebarOpen ? `calc(${sidebarWidth / 2}px + 50%)` : '50%',
              transform: 'translateX(-50%)',
              width: 'calc(100% - 32px)',
              maxWidth: '800px',
              zIndex: 50,
              transition: isResizing ? 'none' : 'left 0.3s ease-in-out',
            }}
          >
            <div 
              className="rounded-2xl shadow-2xl backdrop-blur-xl border transition-all"
              style={{
                background: themeMode === 'dark' ? 'rgba(30, 35, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                borderColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                padding: '12px 16px',
              }}
            >
              <form onSubmit={handleFixedChatSubmit} className="flex items-center gap-3">
                <span className="text-xl">💬</span>
                <input
                  type="text"
                  value={fixedChatInput}
                  onChange={(e) => setFixedChatInput(e.target.value)}
                  placeholder="Tiếp tục hỏi thêm câu hỏi..."
                  className="flex-1 bg-transparent outline-none text-base placeholder:text-gray-500"
                  style={{
                    color: themeMode === 'dark' ? '#f3f4f6' : '#111827',
                  }}
                  disabled={loading}
                />
                <button 
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                    color: 'white',
                    opacity: !fixedChatInput.trim() || loading ? 0.5 : 1,
                    cursor: !fixedChatInput.trim() || loading ? 'not-allowed' : 'pointer',
                  }}
                  disabled={!fixedChatInput.trim() || loading}
                >
                  <span className="text-sm">{loading ? 'Đang gửi...' : 'Gửi'}</span>
                  <PaperAirplaneIcon style={{ width: 16, height: 16 }} />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}