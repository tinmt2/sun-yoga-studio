# Sun Yoga Studio — Quản Lý Học Viên & Học Phí

Ứng dụng quản lý học viên, lịch tập Âm/Dương lịch và theo dõi doanh thu cho Sun Yoga Studio, thiết kế theo phong cách **Warm Quiet Luxury & Liquid Porcelain Glass**, hỗ trợ đầy đủ cả **Web / PWA (Mobile & Desktop trên Vercel)** lẫn **Electron Desktop**.

## Tính năng chính

- **Quản lý học viên**: Thêm, sửa, xóa, tìm kiếm, lọc theo trạng thái thẻ (Tất cả / Sắp hết hạn / Quá hạn) và gia hạn nhanh.
- **Lịch tập & Âm lịch**: Xem lịch lớp học theo tháng, tích hợp ngày Âm lịch và lịch tập hôm nay.
- **Thu phí & Doanh thu**: Thống kê doanh thu tự động, lịch sử giao dịch và sao lưu dữ liệu.
- **Đồng bộ Google Sheets 2 chiều**: Tích hợp Google Apps Script ([docs/google-apps-script.js](docs/google-apps-script.js)).
- **Cá nhân hóa giao diện & Mascot Bơ**: Hình nền Studio kính mờ tùy chỉnh độ trong suốt, hiệu ứng nền Zen Ambient Canvas và thú cưng đồng hành tương tác.

## Chạy cục bộ

```bash
# Chạy phiên bản Web / PWA (Desktop & Mobile) tại http://localhost:3000
npm run start:mobile

# Chạy phiên bản Electron Desktop
npm start
```

## Cấu trúc thư mục

- `mobile/` — Ứng dụng Web / PWA chính (được Vercel tự động triển khai qua `vercel.json`)
  - `index.html`, `styles.css`, `app.js`, `zen-canvas.js`, `sw.js`, `manifest.json`
  - `icons/` — Bộ biểu tượng PWA (Apple Touch Icon, Favicon, 192px, 512px)
- `docs/google-apps-script.js` — Mẫu mã nguồn Google Apps Script để đồng bộ Google Sheets
- `electron/` & `renderer/` — Phiên bản ứng dụng desktop Electron cục bộ
- `DESIGN.md` — Tài liệu hệ thống thiết kế và mã màu
