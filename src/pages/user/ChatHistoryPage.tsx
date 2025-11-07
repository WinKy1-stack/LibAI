import { useState } from 'react';
import { ChatBox, ConversationHistory, ChatStats } from '../../components/user/chat';
import { ChatBubbleLeftRightIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline';

type View = 'chat' | 'history' | 'stats';

export default function ChatHistoryPage() {
  const [view, setView] = useState<View>('chat');

  const navItems = [
    { id: 'chat', label: 'Trò chuyện', icon: ChatBubbleLeftRightIcon },
    { id: 'history', label: 'Lịch sử', icon: ClockIcon },
    { id: 'stats', label: 'Thống kê', icon: ChartBarIcon },
  ];

  const renderContent = () => {
    switch (view) {
      case 'chat':
        return <div className="h-[calc(100vh-200px)]"><ChatBox /></div>;
      case 'history':
        return <div className="h-[calc(100vh-200px)]"><ConversationHistory /></div>;
      case 'stats':
        return <ChatStats />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background-secondary text-text-primary p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Lịch sử trò chuyện</h1>
          <p className="text-text-secondary mt-1">
            Xem lại, quản lý và phân tích các cuộc trò chuyện của bạn với trợ lý AI.
          </p>
        </header>

        {/* Navigation Tabs */}
        <nav className="flex items-center border-b border-border-primary mb-6">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id as View)}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm sm:text-base transition-colors duration-200
                ${view === item.id
                  ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400'
                  : 'text-text-secondary hover:text-text-primary'
                }`
              }
            >
              <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}