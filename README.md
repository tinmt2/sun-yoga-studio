# Sun Yoga - Quản lý học viên

Ứng dụng desktop được xây dựng bằng Electron để theo dõi thời hạn học phí của học viên với giao diện đẹp và hiện đại.

## Tính năng

- ✅ Quản lý học viên (thêm, sửa, xóa)
- ✅ Theo dõi ngày hết hạn học phí
- ✅ Thông báo tự động khi học phí sắp hết hạn (trong vòng 7 ngày)
- ✅ Giao diện đẹp với gradient và glassmorphism
- ✅ Hiển thị trạng thái rõ ràng (đã hết hạn, sắp hết hạn, còn nhiều ngày)

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Chạy ứng dụng ở chế độ development:
```bash
npm run electron:dev
```

3. Build ứng dụng để cài đặt:
```bash
npm run build:electron
```

## Cấu trúc dự án

- `electron/main.js` - Main process của Electron
- `electron/preload.js` - Preload script để bridge giữa main và renderer
- `src/App.jsx` - Component chính
- `src/components/` - Các component UI
- Dữ liệu được lưu trong `%APPDATA%/sun-yoga-student-tracker/students.json`

## Sử dụng

1. Click nút "Thêm học viên" để thêm học viên mới
2. Nhập thông tin học viên và ngày hết hạn học phí
3. Ứng dụng sẽ tự động kiểm tra và hiển thị thông báo khi học phí sắp hết hạn
4. Click icon chuông để xem danh sách học viên sắp hết hạn

## Công nghệ sử dụng

- Electron - Desktop app framework
- React - UI library
- Vite - Build tool
- Tailwind CSS - Styling
- date-fns - Date utilities
- lucide-react - Icons

