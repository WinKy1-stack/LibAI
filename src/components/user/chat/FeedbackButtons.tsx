import { HandThumbUpIcon, HandThumbDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function FeedbackButtons() {
  const buttons = [
    { icon: <HandThumbUpIcon className="w-5 h-5" />, label: 'Thích' },
    { icon: <HandThumbDownIcon className="w-5 h-5" />, label: 'Không thích' },
    { icon: <ArrowPathIcon className="w-5 h-5" />, label: 'Làm lại' },
  ];

  return (
    <div className="text-center pt-4 mb-6 pb-[80px] animate-[fadeIn_0.6s_ease-out_0.8s_both]">
      <p className="text-sm mb-4 text-text-secondary">
        Chatbot có thể mắc lỗi, vui lòng kiểm tra lại kết quả và gửi feedback nếu cần.
      </p>
      <div className="flex justify-center gap-3">
        {buttons.map((b, i) => (
          <button
            key={i}
            title={b.label}
            aria-label={b.label}
            className="w-9 h-9 rounded-xl flex items-center justify-center
                       bg-background-secondary border border-border-primary text-text-secondary
                       hover:bg-background-hover hover:text-text-primary
                       transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            {b.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
