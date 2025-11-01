# Cấu trúc dự án

Tài liệu này cung cấp một cái nhìn tổng quan về cấu trúc thư mục của dự án LibAI.

```
LibAI/
├── backend/                  # Backend Flask
│   ├── app/                  # Mã nguồn ứng dụng
│   │   ├── __init__.py       # Factory của ứng dụng
│   │   ├── config.py         # Cấu hình
│   │   ├── models/           # Các mô hình dữ liệu
│   │   ├── routes/           # Các tuyến API
│   │   ├── services/         # Logic nghiệp vụ
│   │   └── utils/            # Các hàm tiện ích
│   ├── scripts/              # Các kịch bản (ví dụ: tạo dữ liệu mẫu)
│   ├── venv311/              # Môi trường ảo Python (bị bỏ qua bởi git)
│   ├── .env                  # Các biến môi trường (bị bỏ qua bởi git)
│   ├── .env.example          # Mẫu môi trường
│   ├── requirements.txt      # Các gói phụ thuộc Python
│   └── run.py                # Điểm vào của ứng dụng
│
├── docs/                     # Tài liệu dự án
│   ├── installation.md       # Hướng dẫn cài đặt
│   ├── usage.md              # Hướng dẫn sử dụng
│   ├── frontend-guide.md     # Hướng dẫn Frontend
│   ├── backend-guide.md      # Hướng dẫn Backend
│   └── ...                   # Các tệp tài liệu khác
│
├── public/                   # Các tài sản tĩnh (ví dụ: hình ảnh)
│
├── src/                      # Frontend React
│   ├── components/           # Các thành phần React có thể tái sử dụng
│   ├── pages/                # Các thành phần trang
│   ├── services/             # Các dịch vụ API
│   ├── types/                # Các định nghĩa TypeScript
│   ├── utils/                # Các hàm tiện ích
│   ├── config/               # Cấu hình giao diện
│   ├── App.tsx               # Định tuyến chính
│   ├── main.tsx              # Điểm vào của frontend
│   └── index.css             # Các kiểu toàn cục
│
├── .gitignore                # Các tệp và thư mục bị Git bỏ qua
├── package.json              # Các gói phụ thuộc và kịch bản của Node
├── README.md                 # Tổng quan dự án
└── vite.config.ts            # Cấu hình Vite
```
