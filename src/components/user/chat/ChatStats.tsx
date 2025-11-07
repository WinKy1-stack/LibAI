import { useEffect } from 'react';
import { useChatContext } from '../../../hooks/useChatContext';
import {
  ChatBubbleLeftRightIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  BoltIcon,
  ArrowPathIcon,
  ServerIcon,
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
      <div className="flex flex-col items-center justify-center p-10 text-text-secondary">
        <ArrowPathIcon className="w-6 h-6 animate-spin" />
        <p className="mt-3 text-sm">Đang tải thống kê...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg text-red-600 dark:text-red-400 text-center">
        <ServerIcon className="w-10 h-10 mx-auto mb-3" />
        <p className="mb-3 font-semibold">Không thể tải thống kê</p>
        <button
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          onClick={handleRefresh}
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statItems = [
    { icon: ChatBubbleLeftRightIcon, label: 'Tổng cuộc trò chuyện', value: stats.total_conversations },
    { icon: ChatBubbleBottomCenterTextIcon, label: 'Tổng tin nhắn', value: stats.total_messages },
    { icon: ClockIcon, label: 'Đang hoạt động', value: stats.active_conversations },
    { icon: CheckCircleIcon, label: 'Đã kết thúc', value: stats.completed_conversations },
    { icon: ChartBarIcon, label: 'Tin nhắn/Trò chuyện', value: stats.avg_messages_per_conversation.toFixed(1) },
    { icon: BoltIcon, label: 'Độ trễ trung bình', value: `${stats.average_latency_ms.toFixed(0)}ms` },
  ];

  return (
    <div className="bg-background-primary rounded-xl shadow-lg overflow-hidden border border-border-primary">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-background-secondary border-b border-border-primary">
        <h3 className="flex items-center text-base font-semibold text-text-primary gap-2">
          <ChartBarIcon className="w-5 h-5" />
          Thống kê
        </h3>
        <button
          className="p-2 rounded-lg text-text-secondary hover:bg-background-hover transition-colors disabled:opacity-50"
          onClick={handleRefresh}
          disabled={loading}
          title="Tải lại"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {statItems.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 bg-background-secondary border border-border-primary rounded-lg"
          >
            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-lg">
              <item.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-secondary mb-1">{item.label}</p>
              <p className="text-2xl font-bold text-text-primary">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}