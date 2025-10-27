# Hướng dẫn đóng góp

Cảm ơn bạn đã quan tâm đến việc đóng góp cho dự án này. Hướng dẫn này cung cấp hướng dẫn về cách đóng góp.

## Quy trình làm việc

1. **Tạo một nhánh mới** cho tính năng hoặc bản sửa lỗi của bạn:
    ```bash
    git checkout -b feature/your-feature-name
    ```
2. **Thực hiện các thay đổi của bạn** và cam kết chúng với một thông điệp mô tả.
3. **Đẩy nhánh của bạn** lên kho lưu trữ từ xa:
    ```bash
    git push origin feature/your-feature-name
    ```
4. **Tạo một yêu cầu kéo** và cung cấp một mô tả rõ ràng về các thay đổi của bạn.

## Quy ước thông điệp cam kết

Chúng tôi tuân theo một định dạng thông điệp cam kết thông thường:

`<loại>(<phạm vi>): <mô tả>`

- **Loại**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`
- **Phạm vi** (tùy chọn): Phần của cơ sở mã bạn đang làm việc (ví dụ: `admin`, `user`, `api`).

**Ví dụ:**
`feat(admin): thêm biểu đồ mới vào bảng điều khiển`

## Phong cách mã

- **Frontend**: Tuân theo phong cách mã hiện có và chạy `npm run lint` để kiểm tra các vấn đề.
- **Backend**: Tuân thủ PEP 8 và phong cách mã hiện có.
