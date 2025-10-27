# Cấu trúc cơ sở dữ liệu

Tài liệu này phác thảo cấu trúc của cơ sở dữ liệu MongoDB được sử dụng trong dự án này.

### Bộ sưu tập MongoDB

#### Bộ sưu tập cốt lõi
- **users**: Tài khoản người dùng (email, password_hash, role, full_name)
- **marc_records**: Danh mục sách (định dạng MARC21)
- **items**: Bản sao sách vật lý (mã vạch, vị trí, trạng thái, marc_record_id)
- **loans**: Hồ sơ mượn (user_id, item_id, checkout_date, return_date, status)

#### Bộ sưu tập Chatbot (Tương lai)
- **conversations**: Phiên trò chuyện
- **messages**: Tin nhắn trò chuyện có trích dẫn
- **faq**: Câu hỏi thường gặp

#### Bộ sưu tập hệ thống
- **admin_configs**: Cài đặt hệ thống
