# Cấu trúc cơ sở dữ liệu

Tài liệu này phác thảo cấu trúc của cơ sở dữ liệu MongoDB được sử dụng trong dự án này.

### Bộ sưu tập MongoDB

#### Bộ sưu tập cốt lõi
- **users**: Lưu trữ tài khoản người dùng.
    - `email`: Email của người dùng (duy nhất).
    - `password_hash`: Mật khẩu đã được băm.
    - `role`: Vai trò của người dùng (`reader`, `librarian`, `admin`).
    - `full_name`: Tên đầy đủ của người dùng.
- **marc_records**: Lưu trữ danh mục sách ở định dạng MARC21.
- **items**: Lưu trữ các bản sao sách vật lý.
    - `barcode`: Mã vạch của sách.
    - `location`: Vị trí của sách trong thư viện.
    - `status`: Trạng thái của sách (`available`, `loaned`).
    - `marc_record_id`: Tham chiếu đến `marc_records`.
- **loans**: Lưu trữ hồ sơ mượn sách.
    - `user_id`: Tham chiếu đến người dùng mượn sách.
    - `item_id`: Tham chiếu đến sách được mượn.
    - `checkout_date`: Ngày mượn.
    - `return_date`: Ngày trả.
    - `status`: Trạng thái mượn (`active`, `returned`).

#### Bộ sưu tập Chatbot
- **conversations**: Lưu trữ các phiên trò chuyện.
    - `conversation_id`: ID duy nhất cho mỗi cuộc trò chuyện.
    - `user_id`: Tham chiếu đến người dùng.
    - `started_at`: Thời gian bắt đầu cuộc trò chuyện.
    - `ended_at`: Thời gian kết thúc cuộc trò chuyện.
    - `metadata`: Dữ liệu meta về cuộc trò chuyện (ví dụ: kênh, mô hình, ngôn ngữ).
- **messages**: Lưu trữ các tin nhắn trong mỗi cuộc trò chuyện.
    - `message_id`: ID duy nhất cho mỗi tin nhắn.
    - `conversation_id`: Tham chiếu đến cuộc trò chuyện.
    - `role`: Vai trò của người gửi (`USER`, `ASSISTANT`, `SYSTEM`).
    - `content`: Nội dung tin nhắn.
    - `timestamp`: Thời gian gửi tin nhắn.
    - `latency_ms`: Độ trễ của phản hồi từ AI.

#### Bộ sưu tập hệ thống
- **admin_configs**: Lưu trữ các cài đặt hệ thống.
