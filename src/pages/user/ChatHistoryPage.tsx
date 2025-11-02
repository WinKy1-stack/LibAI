import { useState } from 'react';
import { ChatBox, ConversationHistory, ChatStats } from '../../components/user/chat';

export default function ChatHistoryPage() {
  const [view, setView] = useState<'chat' | 'history' | 'stats'>('chat');

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Chat with History
        </h1>
        <p className="text-gray-600">
          Chat with AI and view your conversation history
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
        <button
          onClick={() => setView('chat')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            view === 'chat'
              ? 'bg-purple-600 text-white'
              : 'bg-transparent text-gray-600 hover:bg-gray-100'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setView('history')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            view === 'history'
              ? 'bg-purple-600 text-white'
              : 'bg-transparent text-gray-600 hover:bg-gray-100'
          }`}
        >
          History
        </button>
        <button
          onClick={() => setView('stats')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            view === 'stats'
              ? 'bg-purple-600 text-white'
              : 'bg-transparent text-gray-600 hover:bg-gray-100'
          }`}
        >
          Statistics
        </button>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {view === 'chat' && (
          <div className="max-w-3xl mx-auto h-[600px]">
            <ChatBox />
          </div>
        )}

        {view === 'history' && (
          <div className="max-w-3xl mx-auto h-[600px]">
            <ConversationHistory />
          </div>
        )}

        {view === 'stats' && (
          <div className="max-w-5xl mx-auto">
            <ChatStats />
          </div>
        )}
      </div>
    </div>
  );
}
