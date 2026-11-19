# Task Plan: Sun Yoga Mobile PWA (iOS & Android)

**Task Slug:** `sun-yoga-mobile-pwa`  
**Status:** Completed (Ready to Deploy & Test)  
**Agent:** `mobile-developer`  
**Skills:** `mobile-design`, `clean-code`, `design-spec`, `api-patterns`

---

## 1. Mục tiêu & Phạm vi dự án
Xây dựng ứng dụng di động **Sun Yoga Mobile** theo chuẩn **Progressive Web App (PWA)** tối ưu hóa cho màn hình cảm ứng điện thoại (Touch-first, Apple iOS HIG & Android Material), cho phép cài đặt trực tiếp vào màn hình chính (Add to Home Screen) mà không cần qua App Store/Google Play, đồng thời hỗ trợ thông báo đẩy (Push Notifications) nhắc hạn học phí.

---

## 2. Các giai đoạn triển khai (4-Phase Methodology)

### Phase 1: Phân tích & Thống nhất luồng dữ liệu (Socratic Gate)
- Xác định phương thức kết nối dữ liệu giữa máy tính (Electron) và điện thoại (Local WiFi Server vs. Cloud sync vs. Offline LocalStorage + Import/Export).
- Xác định cơ chế thông báo (Local Scheduled Notification vs. Web Push Service).

### Phase 2: Cấu trúc thư mục & Kiến trúc PWA
- Thư mục: `mobile/`
  - `mobile/index.html`: Giao diện di động Apple iOS HIG với khung view Safe Area (tai thỏ / Dynamic Island), Tab Bar, Bottom Sheet.
  - `mobile/app.js`: Xử lý dữ liệu học viên, phân loại hạn học phí, tính toán lịch âm, tìm kiếm, lọc dữ liệu.
  - `mobile/sw.js`: Service Worker quản lý offline cache và nhận Push Notifications.
  - `mobile/manifest.json`: Khai báo PWA (tên app, theme_color, icons, display: standalone).
  - `mobile/icons/`: Icon app độ phân giải cao cho màn hình chính iPhone (180x180) và Android (192x192, 512x512).

### Phase 3: Tích hợp tính năng & Giao diện
- Tab 1: **Học viên** (Danh sách thẻ Inset Grouped, tìm kiếm, lọc nhanh, nút gọi điện & thu phí 1 chạm).
- Tab 2: **Lịch tập** (Lịch tháng, chuyển đổi Âm lịch, ghi chú buổi tập).
- Tab 3: **Thu phí** (Thống kê doanh thu, lịch sử đóng tiền).
- Tab 4: **Cài đặt & Đồng bộ** (Quản lý lớp/gói tập, bật quyền thông báo, sao lưu & đồng bộ dữ liệu).

### Phase 4: Kiểm thử & Hướng dẫn cài đặt
- Kiểm tra tính tương thích trên iOS Safari và Android Chrome.
- Kiểm tra chức năng "Thêm vào Màn hình chính".
- Kiểm tra hiển thị thông báo màn hình khóa.
