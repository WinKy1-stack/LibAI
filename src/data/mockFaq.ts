// Mock data for FAQ Management

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  status: "published" | "draft" | "archived";
  views: number;
  helpful: number;
  notHelpful: number;
  priority: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags: string[];
}

export interface FaqCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
}

export interface FaqCategoryDistribution {
  category: string;
  categoryName: string;
  icon: string;
  count: number;
}

export interface FaqActivity {
  id: string;
  question: string;
  action: string;
  timestamp: string;
  category: string;
}

export interface FaqStats {
  totalQuestions: number;
  publishedQuestions: number;
  draftQuestions: number;
  totalViews: number;
  averageHelpfulness: number;
}

// FAQ Categories
export const faqCategories: FaqCategory[] = [
  {
    id: "borrowing",
    name: "Mượn sách",
    description: "Câu hỏi về quy trình mượn sách",
    icon: "BookOutlined",
    count: 12,
  },
  {
    id: "returning",
    name: "Trả sách",
    description: "Câu hỏi về quy trình trả sách",
    icon: "RollbackOutlined",
    count: 8,
  },
  {
    id: "membership",
    name: "Thẻ thành viên",
    description: "Câu hỏi về thẻ và tài khoản",
    icon: "IdcardOutlined",
    count: 10,
  },
  {
    id: "fines",
    name: "Phí & Phạt",
    description: "Câu hỏi về phí và tiền phạt",
    icon: "DollarOutlined",
    count: 6,
  },
  {
    id: "services",
    name: "Dịch vụ",
    description: "Các dịch vụ khác của thư viện",
    icon: "CustomerServiceOutlined",
    count: 7,
  },
  {
    id: "technical",
    name: "Kỹ thuật",
    description: "Hỗ trợ kỹ thuật và hệ thống",
    icon: "SettingOutlined",
    count: 5,
  },
];

// FAQ Items
export const mockFaqItems: FaqItem[] = [
  {
    id: "faq-001",
    question: "Làm thế nào để đăng ký thẻ thành viên thư viện?",
    answer: "Để đăng ký thẻ thành viên, bạn cần mang theo CMND/CCCD, ảnh 3x4 và điền form đăng ký tại quầy thông tin. Thẻ sẽ được làm trong vòng 15 phút. Phí làm thẻ là 50,000 VNĐ cho sinh viên và 100,000 VNĐ cho người lớn.",
    category: "membership",
    status: "published",
    views: 1524,
    helpful: 142,
    notHelpful: 8,
    priority: 1,
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-10-20T10:30:00Z",
    createdBy: "La Thanh Toàn",
    tags: ["đăng ký", "thẻ thành viên", "thủ tục"],
  },
  {
    id: "faq-002",
    question: "Tôi có thể mượn tối đa bao nhiêu cuốn sách?",
    answer: "Số lượng sách bạn có thể mượn phụ thuộc vào loại thẻ:\n- Thẻ sinh viên: tối đa 5 cuốn\n- Thẻ người lớn: tối đa 10 cuốn\n- Thẻ VIP: tối đa 20 cuốn\nThời gian mượn là 14 ngày và có thể gia hạn thêm 1 lần nếu không có người đặt trước.",
    category: "borrowing",
    status: "published",
    views: 2341,
    helpful: 198,
    notHelpful: 5,
    priority: 1,
    createdAt: "2024-01-20T09:15:00Z",
    updatedAt: "2024-10-18T14:20:00Z",
    createdBy: "La Thanh Toàn",
    tags: ["mượn sách", "số lượng", "thời hạn"],
  },
  {
    id: "faq-003",
    question: "Phí phạt trả sách trễ là bao nhiêu?",
    answer: "Phí phạt trả sách trễ được tính như sau:\n- Ngày 1-7: 2,000 VNĐ/ngày/cuốn\n- Ngày 8-14: 5,000 VNĐ/ngày/cuốn\n- Ngày 15+: 10,000 VNĐ/ngày/cuốn\nTối đa không quá 200,000 VNĐ/cuốn. Nếu trả trễ quá 30 ngày, thẻ sẽ bị khóa.",
    category: "fines",
    status: "published",
    views: 1876,
    helpful: 134,
    notHelpful: 23,
    priority: 2,
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-10-15T09:00:00Z",
    createdBy: "La Thanh Toàn",
    tags: ["phí phạt", "trả trễ", "tiền phạt"],
  },
  {
    id: "faq-004",
    question: "Làm thế nào để gia hạn sách đã mượn?",
    answer: "Bạn có thể gia hạn sách bằng 3 cách:\n1. Trực tiếp tại quầy thư viện\n2. Gọi điện: 024-3456-7890\n3. Trực tuyến qua website hoặc app di động\n\nLưu ý: Chỉ có thể gia hạn 1 lần và không gia hạn được nếu có người đặt trước hoặc đã quá hạn trả.",
    category: "borrowing",
    status: "published",
    views: 1653,
    helpful: 156,
    notHelpful: 4,
    priority: 1,
    createdAt: "2024-02-10T11:30:00Z",
    updatedAt: "2024-10-12T16:45:00Z",
    createdBy: "La Thanh Toàn",
    tags: ["gia hạn", "mượn sách", "thời hạn"],
  },
  {
    id: "faq-005",
    question: "Tôi có thể trả sách ngoài giờ làm việc không?",
    answer: "Có! Thư viện có hộp trả sách tự động hoạt động 24/7 tại cổng chính. Bạn chỉ cần bỏ sách vào hộp và hệ thống sẽ tự động xác nhận trả sách. Tuy nhiên, hãy đảm bảo sách không bị hư hỏng trước khi trả qua hộp tự động.",
    category: "returning",
    status: "published",
    views: 987,
    helpful: 89,
    notHelpful: 2,
    priority: 2,
    createdAt: "2024-02-15T08:45:00Z",
    updatedAt: "2024-10-10T11:20:00Z",
    createdBy: "La Thanh Toàn",
    tags: ["trả sách", "ngoài giờ", "tự động"],
  },
  {
    id: "faq-006",
    question: "Thư viện có WiFi miễn phí không?",
    answer: "Có! Thư viện cung cấp WiFi miễn phí cho tất cả độc giả. Thông tin đăng nhập:\n- Tên mạng: LibAI_Public\n- Mật khẩu: Hỏi tại quầy thông tin\n\nTốc độ: 100Mbps. Thành viên có thể sử dụng không giới hạn trong giờ mở cửa.",
    category: "services",
    status: "published",
    views: 2145,
    helpful: 187,
    notHelpful: 6,
    priority: 3,
    createdAt: "2024-03-01T09:00:00Z",
    updatedAt: "2024-10-08T10:15:00Z",
    createdBy: "La Thanh Toàn",
    tags: ["wifi", "internet", "dịch vụ"],
  },
  {
    id: "faq-007",
    question: "Làm thế nào để đặt trước một cuốn sách đang được mượn?",
    answer: "Bạn có thể đặt trước sách qua:\n1. Website: Tìm sách → Nhấn 'Đặt trước'\n2. App di động: Scan mã sách → Đặt trước\n3. Tại quầy: Nhờ thủ thư đặt giúp\n\nKhi sách có sẵn, bạn sẽ nhận thông báo qua email/SMS. Sách sẽ được giữ trong 3 ngày.",
    category: "borrowing",
    status: "published",
    views: 1432,
    helpful: 128,
    notHelpful: 7,
    priority: 2,
    createdAt: "2024-03-10T10:30:00Z",
    updatedAt: "2024-10-05T14:00:00Z",
    createdBy: "La Thanh Toàn",
    tags: ["đặt trước", "mượn sách", "chờ sách"],
  },
  {
    id: "faq-008",
    question: "Nếu làm mất sách thì phải làm sao?",
    answer: "Nếu làm mất sách, bạn cần:\n1. Báo ngay cho thư viện trong vòng 3 ngày\n2. Đền bù bằng cách:\n   - Mua lại sách cùng phiên bản (ưu tiên), hoặc\n   - Đền tiền gấp 3 lần giá sách\n3. Đóng phí xử lý hồ sơ: 50,000 VNĐ\n\nNếu tìm lại được sách trong vòng 30 ngày, sẽ được hoàn lại tiền (trừ phí xử lý).",
    category: "fines",
    status: "published",
    views: 876,
    helpful: 67,
    notHelpful: 12,
    priority: 3,
    createdAt: "2024-03-20T11:00:00Z",
    updatedAt: "2024-10-03T09:30:00Z",
    createdBy: "La Thanh Toàn",
    tags: ["làm mất", "đền bù", "phạt"],
  },
  {
    id: "faq-009",
    question: "Tôi quên mật khẩu tài khoản, làm sao để reset?",
    answer: "Để reset mật khẩu:\n1. Vào trang đăng nhập\n2. Nhấn 'Quên mật khẩu'\n3. Nhập email đã đăng ký\n4. Kiểm tra email và làm theo hướng dẫn\n\nNếu không nhận được email, liên hệ: support@libai.vn hoặc gọi 024-3456-7890 trong giờ hành chính.",
    category: "technical",
    status: "published",
    views: 1234,
    helpful: 95,
    notHelpful: 3,
    priority: 2,
    createdAt: "2024-04-01T08:30:00Z",
    updatedAt: "2024-10-01T15:20:00Z",
    createdBy: "La Thanh Toàn",
    tags: ["mật khẩu", "reset", "đăng nhập"],
  },
  {
    id: "faq-010",
    question: "Thư viện có phòng học nhóm không?",
    answer: "Có! Thư viện có 10 phòng học nhóm (вместимость 4-8 người). Để đặt phòng:\n- Đặt trước qua website/app (miễn phí cho thành viên)\n- Hoặc đăng ký trực tiếp tại quầy\n- Thời gian: tối đa 3 tiếng/lần\n- Cần đặt trước ít nhất 2 giờ\n\nPhòng được trang bị bảng trắng, màn hình và WiFi tốc độ cao.",
    category: "services",
    status: "published",
    views: 1567,
    helpful: 143,
    notHelpful: 5,
    priority: 3,
    createdAt: "2024-04-15T09:45:00Z",
    updatedAt: "2024-09-28T10:00:00Z",
    createdBy: "La Thanh Toàn",
    tags: ["phòng học", "học nhóm", "đặt phòng"],
  },
  {
    id: "faq-011",
    question: "Làm thế nào để đề xuất mua sách mới?",
    answer: "Bạn có thể đề xuất thư viện mua sách mới qua:\n1. Form trực tuyến trên website\n2. Email: suggestions@libai.vn\n3. Hòm thư góp ý tại thư viện\n\nThông tin cần có: Tên sách, tác giả, NXB, lý do đề xuất. Thư viện sẽ xem xét và phản hồi trong vòng 7 ngày làm việc.",
    category: "services",
    status: "published",
    views: 654,
    helpful: 52,
    notHelpful: 4,
    priority: 4,
    createdAt: "2024-05-01T10:15:00Z",
    updatedAt: "2024-09-25T11:30:00Z",
    createdBy: "La Thanh Toàn",
    tags: ["đề xuất", "mua sách", "góp ý"],
  },
  {
    id: "faq-012",
    question: "Thẻ thư viện có thời hạn sử dụng không?",
    answer: "Có. Thẻ thư viện có thời hạn:\n- Thẻ sinh viên: 1 năm (gia hạn theo năm học)\n- Thẻ người lớn: 1 năm\n- Thẻ VIP: 2 năm\n\nPhí gia hạn: 30,000 VNĐ (sinh viên), 70,000 VNĐ (người lớn). Bạn sẽ nhận thông báo qua email/SMS trước 1 tháng khi thẻ hết hạn.",
    category: "membership",
    status: "published",
    views: 1098,
    helpful: 87,
    notHelpful: 6,
    priority: 2,
    createdAt: "2024-05-15T08:00:00Z",
    updatedAt: "2024-09-20T09:45:00Z",
    createdBy: "La Thanh Toàn",
    tags: ["thẻ thành viên", "thời hạn", "gia hạn"],
  },
  {
    id: "faq-013",
    question: "Tôi có thể in ấn/photocopy tại thư viện không?",
    answer: "Có! Dịch vụ in ấn và photocopy:\n- In đen trắng: 500 VNĐ/trang A4\n- In màu: 3,000 VNĐ/trang A4\n- Photocopy: 300 VNĐ/trang A4\n\nMáy tự phục vụ ở tầng 1. Thanh toán bằng thẻ thư viện (nạp tiền tại quầy) hoặc tiền mặt.",
    category: "services",
    status: "draft",
    views: 423,
    helpful: 34,
    notHelpful: 2,
    priority: 4,
    createdAt: "2024-06-01T09:30:00Z",
    updatedAt: "2024-09-15T14:20:00Z",
    createdBy: "La Thanh Toàn",
    tags: ["in ấn", "photocopy", "dịch vụ"],
  },
];

// FAQ Statistics
export const faqStats: FaqStats = {
  totalQuestions: mockFaqItems.length,
  publishedQuestions: mockFaqItems.filter((item) => item.status === "published").length,
  draftQuestions: mockFaqItems.filter((item) => item.status === "draft").length,
  totalViews: mockFaqItems.reduce((sum, item) => sum + item.views, 0),
  averageHelpfulness:
    mockFaqItems.reduce((sum, item) => {
      const total = item.helpful + item.notHelpful;
      return sum + (total > 0 ? (item.helpful / total) * 100 : 0);
    }, 0) / mockFaqItems.length,
};

// FAQ Category Distribution
export const faqCategoryDistribution: FaqCategoryDistribution[] = faqCategories.map((cat) => ({
  category: cat.id,
  categoryName: cat.name,
  icon: cat.icon,
  count: mockFaqItems.filter((item) => item.category === cat.id).length,
}));

// Latest FAQ Activities
export const latestFaqActivities: FaqActivity[] = [
  {
    id: "faq-001",
    question: "Làm thế nào để đăng ký thẻ thành viên thư viện?",
    action: "Cập nhật câu trả lời",
    timestamp: "2 giờ trước",
    category: "Thẻ TV",
  },
  {
    id: "faq-002",
    question: "Tôi có thể mượn tối đa bao nhiêu cuốn sách?",
    action: "Xuất bản câu hỏi mới",
    timestamp: "4 giờ trước",
    category: "Mượn sách",
  },
  {
    id: "faq-003",
    question: "Phí phạt trả sách trễ là bao nhiêu?",
    action: "Chỉnh sửa nội dung",
    timestamp: "1 ngày trước",
    category: "Phí & Phạt",
  },
  {
    id: "faq-007",
    question: "Làm thế nào để đặt trước một cuốn sách đang được mượn?",
    action: "Thêm tag mới",
    timestamp: "2 ngày trước",
    category: "Mượn sách",
  },
  {
    id: "faq-010",
    question: "Thư viện có phòng học nhóm không?",
    action: "Cập nhật thông tin",
    timestamp: "3 ngày trước",
    category: "Dịch vụ",
  },
];

