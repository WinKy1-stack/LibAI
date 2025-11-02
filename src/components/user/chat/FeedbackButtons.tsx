import { HandThumbUpIcon, HandThumbDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useThemeColors } from '../../../hooks/useThemeColors';

export default function FeedbackButtons() {
  const colors = useThemeColors();

  return (
    <div className="text-center pt-4 mb-25 animate-[fadeIn_0.6s_ease-out_0.8s_both]">
      <p className="text-sm mb-4" style={{ color: colors.secondaryText }}>
        Kết quả khá đa dạng! Bạn có thể yêu cầu mình làm thêm bất cứ thứ gì nếu cần nhé! 💬
      </p>
      <div className="flex justify-center gap-2.5">
        <button 
          className="w-9 h-9 rounded-lg transition-all duration-200 flex items-center justify-center hover:scale-110"
          style={{
            backgroundColor: colors.isDark ? '#3B3B40' : 'rgba(255, 255, 255, 0.8)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          }}
        >
          <HandThumbUpIcon className="w-5 h-5" style={{ color: colors.secondaryText }} />
        </button>
        <button 
          className="w-9 h-9 rounded-lg transition-all duration-200 flex items-center justify-center hover:scale-110"
          style={{
            backgroundColor: colors.isDark ? '#3B3B40' : 'rgba(255, 255, 255, 0.8)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          }}
        >
          <HandThumbDownIcon className="w-5 h-5" style={{ color: colors.secondaryText }} />
        </button>
        <button 
          className="w-9 h-9 rounded-lg transition-all duration-200 flex items-center justify-center hover:scale-110"
          style={{
            backgroundColor: colors.isDark ? '#3B3B40' : 'rgba(255, 255, 255, 0.8)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          }}
        >
          <ArrowPathIcon className="w-5 h-5" style={{ color: colors.secondaryText }} />
        </button>
      </div>
    </div>
  );
}
