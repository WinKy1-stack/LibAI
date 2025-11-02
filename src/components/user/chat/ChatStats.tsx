import { useEffect } from 'react';
import { useChatContext } from '../../../hooks/useChatContext';
import {
  ChatBubbleLeftRightIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckCircleIcon,
  ClockIcon,
  BoltIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

export default function ChatStats() {
  const { stats, loading, error, loadStats } = useChatContext();

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleRefresh = () => {
    loadStats();
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-gray-400">
        <ArrowPathIcon className="w-6 h-6 animate-spin" />
        <p className="mt-3 text-sm">Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">
        <p className="mb-3">{error}</p>
        <button
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          onClick={handleRefresh}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statItems = [
    {
      icon: ChatBubbleLeftRightIcon,
      label: 'Total Conversations',
      value: stats.total_conversations,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      icon: ChatBubbleBottomCenterTextIcon,
      label: 'Total Messages',
      value: stats.total_messages,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
    },
    {
      icon: ClockIcon,
      label: 'Active Conversations',
      value: stats.active_conversations,
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-600',
    },
    {
      icon: CheckCircleIcon,
      label: 'Completed',
      value: stats.completed_conversations,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      icon: ChatBubbleBottomCenterTextIcon,
      label: 'Avg Messages/Conv',
      value: stats.avg_messages_per_conversation.toFixed(1),
      bgColor: 'bg-cyan-100',
      textColor: 'text-cyan-600',
    },
    {
      icon: BoltIcon,
      label: 'Avg Latency',
      value: `${stats.average_latency_ms.toFixed(0)}ms`,
      bgColor: 'bg-pink-100',
      textColor: 'text-pink-600',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-800">Chat Statistics</h3>
        <button
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleRefresh}
          disabled={loading}
          title="Refresh"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
        {statItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl transition-all hover:border-purple-600 hover:shadow-lg"
          >
            <div className={`w-12 h-12 rounded-xl ${item.bgColor} ${item.textColor} flex items-center justify-center flex-shrink-0`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{item.label}</p>
              <p className="text-2xl font-bold text-gray-800">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
