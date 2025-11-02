import { HandThumbUpIcon, HandThumbDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function FeedbackButtons() {
  return (
    <div className="feedback-section">
      <p className="feedback-text">
        Kết quả khá đa dạng! Bạn có thể yêu cầu mình làm thêm bất cứ thứ gì nếu cần nhé! 💬
      </p>
      <div className="feedback-buttons">
        <button className="feedback-btn">
          <HandThumbUpIcon style={{ width: 20, height: 20 }} />
        </button>
        <button className="feedback-btn">
          <HandThumbDownIcon style={{ width: 20, height: 20 }} />
        </button>
        <button className="feedback-btn">
          <ArrowPathIcon style={{ width: 20, height: 20 }} />
        </button>
      </div>
    </div>
  );
}

