import { ArrowRightIcon } from '@heroicons/react/24/outline';
import type { ReactElement } from 'react';

interface Suggestion {
  id: number;
  icon: ReactElement;
  text: string;
  action: string;
}

const suggestions: Suggestion[] = [
  {
    id: 1,
    icon: (
      <div className="flex gap-1">
        <div className="w-4 h-4 rounded bg-blue-500"></div>
        <div className="w-4 h-4 rounded bg-green-500"></div>
        <div className="w-4 h-4 rounded bg-red-500"></div>
      </div>
    ),
    text: 'Tôi đang cần tìm mấy cuốn sách về lập trình Python, nhưng mà ưu tiên sách nước ngoài, bạn giúp tôi được không?',
    action: 'Hỏi cái này',
  },
  {
    id: 2,
    icon: (
      <svg className="w-7 h-7 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 1a9 9 0 00-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7a9 9 0 00-9-9z" />
      </svg>
    ),
    text: 'Cuối tuần này tôi định lên thư viện học nhóm, không biết thư viện có mở cửa không, và nếu có thì giờ giấc cụ thể là từ mấy giờ đến mấy giờ vậy?',
    action: 'Hỏi cái này',
  },
  {
    id: 3,
    icon: (
      <svg className="w-7 h-7 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
    text: 'Tôi có mượn một cuốn sách tên là "Deep Learning" tuần trước mà quên mất hạn trả rồi, bạn kiểm tra giúp tôi xem khi nào đến hạn và hướng dẫn tôi cách gia hạn online được không?',
    action: 'Hỏi cái này',
  },
  {
    id: 4,
    icon: (
      <svg className="w-7 h-7 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
      </svg>
    ),
    text: 'Tôi đang làm luận văn về chủ đề "Xử lý ngôn ngữ tự nhiên". Bạn có thể gợi ý cho tôi một vài bài báo khoa học hoặc luận văn nổi bật trong 2 năm gần đây không?',
    action: 'Hỏi cái này',
  },
];

export default function NewSuggestionCards() {
  const handleCardClick = (suggestion: Suggestion) => {
    console.log('Selected suggestion:', suggestion.text);
    // Handle suggestion click - could trigger search or chat
  };

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* Section Title */}
      <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
        Bạn có thể hỏi
      </h3>

      {/* Suggestion Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            onClick={() => handleCardClick(suggestion)}
            className="group bg-[#2D2D2D]/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:bg-[#2D2D2D]/80 hover:border-purple-600/50 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(147,51,234,0.2)]"
          >
            {/* Icon */}
            <div className="mb-4">
              {suggestion.icon}
            </div>

            {/* Text Content */}
            <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-4">
              {suggestion.text}
            </p>

            {/* Action Link */}
            <div className="flex items-center gap-2 text-sm font-semibold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent group-hover:gap-3 transition-all">
              <span>{suggestion.action}</span>
              <ArrowRightIcon className="w-4 h-4 text-pink-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

