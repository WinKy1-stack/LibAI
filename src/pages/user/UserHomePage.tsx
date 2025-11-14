import { useState, useEffect } from 'react';
import { useChatContext } from '../../hooks/useChatContext';
import { useChatHistory } from '../../hooks/useChatHistory';
import { type ChatMessage } from '../../components/user/chat/ChatMessages';
import HomeView from '../../components/user/home/HomeView';
import ChatView from '../../components/user/chat/ChatView';
import ConversationSidebar from '../../components/user/chat/ConversationSidebar';
import ToggleSidebarButton from '../../components/user/layout/ToggleSidebarButton';
import FixedChatInput from '../../components/user/chat/FixedChatInput';
import { authService } from '../../services/authService';

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
        books: msg.books,  // Thêm books từ API response
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
        {/* Toggle Sidebar Button */}
        {isAuthenticated && (
          <ToggleSidebarButton
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            sidebarWidth={sidebarWidth}
            isResizing={isResizing}
          />
        )}

        {/* Content: Hero/Search HOẶC Chat Messages */}
        <div 
          className="flex-1 transition-colors duration-200 overflow-y-auto"
        >
          {!isChatting ? (
            <HomeView
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              onSearch={handleSearch}
              onSuggestionClick={handleSuggestionClick}
            />
          ) : (
            <ChatView
              messages={chatMessages}
              isTyping={isTyping}
            />
          )}
        </div>

        {/* Fixed Chat Input */}
        {isChatting && (
          <FixedChatInput
            value={fixedChatInput}
            onChange={setFixedChatInput}
            onSubmit={handleFixedChatSubmit}
            loading={loading}
            sidebarWidth={sidebarWidth}
            isSidebarOpen={isSidebarOpen}
            isAuthenticated={isAuthenticated}
            isResizing={isResizing}
          />
        )}
      </div>

    </div>
  );
}