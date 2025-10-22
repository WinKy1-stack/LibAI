# Hướng dẫn làm việc nhóm — lib-ai

Tài liệu này tóm tắt các bước cần thiết để mọi người có thể cùng làm việc trên repo này một cách nhất quán và hiệu quả. Nội dung gồm: thiết lập môi trường, chạy dự án, quy ước commit/branch, checklist PR, kiểm tra chất lượng (lint/test) và kênh liên lạc.

## Mục tiêu

- Giúp thành viên mới thiết lập nhanh môi trường phát triển.
- Đảm bảo quy ước mã nguồn và luồng làm việc (git) nhất quán.
- Cung cấp checklist PR để giảm lỗi khi merge.

## Thiết lập nhanh (Windows)

1. Cài Node.js (phiên bản LTS khuyến nghị). Kiểm tra:

   node -v

2. Ở thư mục dự án, cài dependencies:

   npm install

3. Chạy dự án ở chế độ phát triển:

   npm run dev

4. Build để kiểm tra production:

   npm run build

5. Chạy linter và test (nếu có):

   npm run lint
   npm test

Ghi chú: Các script trên dựa vào `package.json`. Nếu script khác, xem file `package.json` để biết lệnh chính xác.

## Quy ước mã nguồn

- Ngôn ngữ/Framework: React + TypeScript + Vite.
- Thư mục chính: `src/`.
- Styling: CSS Modules hoặc global `index.css` (tuân theo cách hiện có trong repo).

### Thư viện chính

Dự án sử dụng các thư viện sau:

- **UI User**: [@heroicons/react](https://heroicons.com/) — Icon library cho giao diện user-facing
- **UI Admin**: [Material-UI (MUI)](https://mui.com/) — Component library cho dashboard admin
  - `@mui/material` — Core components
  - `@mui/icons-material` — Material icons
  - `@emotion/react` & `@emotion/styled` — CSS-in-JS (required by MUI)
- **Database**: [mongodb](https://www.npmjs.com/package/mongodb) — MongoDB driver cho Node.js

Ví dụ import:

```tsx
// User UI - Heroicons
import { UserIcon, HomeIcon } from '@heroicons/react/24/outline'

// Admin UI - MUI
import { Button, TextField, AppBar } from '@mui/material'
import { Dashboard, Settings } from '@mui/icons-material'

// MongoDB
import { MongoClient } from 'mongodb'
```

### Quy ước commit

- Dùng commit message dạng: <type>(scope): short description

  Ví dụ: feat(ui): thêm component Button

- Một số type phổ biến: feat, fix, docs, style, refactor, test, chore

### Branching

- `main` (hoặc `master`): code production đã được review và build thành công.
- Làm feature trên branch `feature/<mô-tả-ngắn>`.
- Fix lỗi trên branch `fix/<mô-tả-ngắn>`.
- Trước khi push branch: rebase hoặc merge mới nhất từ `main` để tránh xung đột lâu.

## Pull Request (PR) checklist

Trước khi request review, đảm bảo checklist sau:

1. Code chạy local và không phá vỡ build: `npm run build` thành công.
2. Lint sạch: `npm run lint` — fix hoặc giải thích các cảnh báo nghiêm trọng.
3. Có unit/integration tests cho phần logic quan trọng; `npm test` pass.
4. Không commit secrets (API keys, .env) — sử dụng biến môi trường.
5. Mô tả PR rõ: mục tiêu, thay đổi chính, cách test.
6. Tag reviewer liên quan và link issue (nếu có).

## Lint, test và CI

- Repo nên có cấu hình lint (ESLint + TypeScript). Chạy linter bằng `npm run lint`.
- Viết tests đơn vị và chạy `npm test`.
- Nếu có CI (GitHub Actions, Azure Pipelines,...), PR phải vượt CI trước khi merge.

## Quy ước code và chất lượng

- Giữ TypeScript strict khi có thể.
- Viết mã rõ ràng, nhỏ, và có responsibility rõ ràng.
- Thêm comment cho logic phức tạp.

## Cấu hình dev hữu ích

- VS Code: cài extensions như ESLint, Prettier, TypeScript, và React.
- Thêm settings workspace nếu muốn lock các rule formatter/linter.

## Cách báo lỗi/trao đổi

- Sử dụng issue tracker của GitHub cho bug/feature.
- Trao đổi nhanh: Slack/Teams (tùy team) hoặc comments PR.

## Bảo mật

- Không commit thông tin nhạy cảm: .env, file key, token.
- Dùng `git-secrets` hoặc pre-commit hook để ngăn commit accidental.

## Mẹo khi làm việc nhóm

- Pull từ `main` thường xuyên.
- Tách PR nhỏ, có mục tiêu rõ ràng.
- Viết tests cho các thay đổi quan trọng.