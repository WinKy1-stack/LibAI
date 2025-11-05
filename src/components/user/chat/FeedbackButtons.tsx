import { HandThumbUpIcon, HandThumbDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function FeedbackButtons() {
  return (
    <div className="text-center pt-4 mb-25 animate-[fadeIn_0.6s_ease-out_0.8s_both]">
      <p className="text-sm mb-4 text-text-secondary">
        Kết quả khá đa dạng! Bạn có thể yêu cầu mình làm thêm bất cứ thứ gì nếu cần nhé!
      </p>
      <div className="flex justify-center gap-2.5">
        <button 
          className="w-9 h-9 rounded-lg transition-all duration-200 flex items-center justify-center
                     bg-background-secondary border border-border-primary text-text-secondary
                     hover:scale-110 hover:bg-background-hover"
        >
          <HandThumbUpIcon className="w-5 h-5" />
        </button>
        <button 
          className="w-9 h-9 rounded-lg transition-all duration-200 flex items-center justify-center
                     bg-background-secondary border border-border-primary text-text-secondary
                     hover:scale-110 hover:bg-background-hover"
        >
          <HandThumbDownIcon className="w-5 h-5" />
        </button>
        <button 
          className="w-9 h-9 rounded-lg transition-all duration-200 flex items-center justify-center
                     bg-background-secondary border border-border-primary text-text-secondary
                     hover:scale-110 hover:bg-background-hover"
        >
          <ArrowPathIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}