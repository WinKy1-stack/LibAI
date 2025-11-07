import { BookOpenIcon, ClockIcon, WrenchScrewdriverIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export interface UserSuggestionItem {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  text: string;
}

export const userSuggestions: UserSuggestionItem[] = [
  {
    icon: BookOpenIcon,
    text: 'Tôi đang cần tìm mấy cuốn sách về lập trình Python, nhưng mà ưu tiên sách nước ngoài, bạn giúp tôi được không?'
  },
  {
    icon: ClockIcon,
    text: 'Cuối tuần này tôi định lên thư viện học nhóm, không biết thư viện có mở cửa không, và nếu có thì giờ giấc cụ thể là từ mấy giờ đến mấy giờ vậy?'
  },
  {
    icon: WrenchScrewdriverIcon,
    text: 'Tôi có mượn một cuốn sách tên là "Deep Learning" tuần trước mà quên mất hạn trả rồi, bạn kiểm tra giúp tôi xem khi nào đến hạn và hướng dẫn tôi cách gia hạn online được không?'
  },
  {
    icon: DocumentTextIcon,
    text: 'Tôi đang làm luận văn về chủ đề "Xử lý ngôn ngữ tự nhiên". Bạn có thể gợi ý cho tôi một vài bài báo khoa học hoặc luận văn nổi bật trong 2 năm gần đây không?'
  }
];