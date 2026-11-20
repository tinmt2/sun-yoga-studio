# Glass Cards Redesign — Sun Yoga Studio

> **Trạng thái:** ✅ Hoàn tất triển khai **Option A (Liquid Porcelain)** trên nhánh `feature/glass-cards-redesign` và đã xác minh trực quan trên Desktop (`1280×800`) & Mobile (`390×844`).

## Overview
Thiết kế lại toàn bộ hệ thống Card trong **Sun Yoga Studio** theo phong cách **Rounded Liquid Glass (Kính mờ bo tròn đồng tâm hiện đại)**, giải quyết triệt để các lớp CSS xung đột (`!important` chồng chéo) và lỗi nền đặc che mất hiệu ứng tán xạ kính, đồng thời giữ vững nhận diện **Warm Pastel Zen** và khả năng đọc chữ chuẩn WCAG AA trên cả nền mặc định lẫn ảnh nền Studio.

## Project Type
**WEB** (Responsive PWA Desktop + Mobile tại `mobile/` deploy trên Vercel + ứng dụng Electron Desktop tại `renderer/`).

## Audit Findings (Kết quả rà soát toàn bộ dự án)
1. **Lỗi che mất chiều sâu kính:** Trong `mobile/styles.css` (dòng 522), `.main-workspace` đang đặt nền đặc `background-color: var(--bg-canvas)` che hoàn toàn `#zen-ambient-canvas` (`z-index: 0`) khi tắt hình nền → card kính không có ánh sáng phía sau để khúc xạ.
2. **Xung đột độ bo góc (`!important` cascade):** Dòng 4709 đặt `.wellness-student-row` bo `28px !important` cho mobile, nhưng dòng 5166 ghi đè lại thành `var(--radius-lg) !important` (`20px`) nên card mobile bị vuông hơn dự kiến.
3. **Khung chi tiết bên trong bị đục:** `.mobile-card-details` dùng nền đặc `#F7F3EB !important` khiến lòng card bị nặng, mất cảm giác kính trong tầng lớp.
4. **Hiệu ứng kính chưa đủ chiều sâu quang học:** Card hiện tại mới có nền trắng mờ đều (`rgba(255,255,255,0.80)`) + 1 viền phẳng, thiếu gradient chéo quang học, thiếu viền sáng specular đỉnh (`1.5px`), ánh hắt ngược đáy và spotlight viền theo con trỏ.
5. **Màu lạc tông sót lại:** Một số thành phần cũ còn dính màu xanh dương `#4778F5` (`.u037-trigger-chip:hover`, `.student-phone-pill:hover`) hoặc tím `#AF52DE` (icon cài đặt hình nền) và `zen-canvas.js` còn 1 orb tím oải hương.
6. **Electron Desktop (`renderer/styles.css`):** Các `.card`, `.stat-card`, `.clock-widget`, `.calendar-widget`, `.modal-content` dùng hệ bo góc & bóng đổ cũ chưa đồng nhất với hệ kính bo tròn mới.

## Success Criteria
- Toàn bộ 7 nhóm card (`KPI Triad`, `Student Cards Mobile & Desktop`, `Calendar & Today Schedule`, `Revenue & Payment History`, `Settings Hub & Panels`, `Bottom Sheet / Modal`, `Electron Renderer Cards`) dùng chung 1 bộ CSS tokens kính bo tròn đồng tâm (`30px–34px` ngoài → `19px–22px` khung trong → `9999px` pill CTA).
- Hiệu ứng kính tán xạ hoạt động thật cả khi **tắt ảnh nền** (xuyên thấu các khối sáng Zen Breathing Orbs) lẫn khi **bật ảnh nền Studio** và **Dark mode**.
- Độ tương phản chữ đạt chuẩn **WCAG AA ≥ 4.5:1**, nút bấm mobile đạt vùng chạm `≥ 40–44px` với khoảng cách `≥ 8px`.
- Hỗ trợ đầy đủ `prefers-reduced-motion` và `prefers-reduced-transparency` (fallback nền mờ đặc an toàn).
- Không phá vỡ bất kỳ tính năng hiện có nào (lọc KPI, tìm kiếm, sắp xếp, thu phí, Google Sheet sync, cài đặt ảnh nền, linh vật May Bichon, Electron IPC).

## Tech Stack & Design Direction
- **Stack hiện có (giữ nguyên, không thêm framework):** Vanilla HTML5, CSS3 Custom Properties, Vanilla JS, HTML5 Canvas (`zen-canvas.js`), Electron 28.
- **Design System & Intelligence:**
  - `DESIGN.md` (cập nhật v4.1.0 đồng bộ token kính bo tròn).
  - `ui-ux-pro-max`: Glassmorphism + Liquid Glass material checklist, WCAG AA contrast, mobile touch targets.
  - `lucian-uxui`: Ứng dụng kỹ thuật quang học & micro-interaction từ `#001` (Liquid Glass refraction + sheen sweep), `#228` (Cursor-lit glowing card borders thích nghi tông ấm Sun Ochre/Terracotta), `#050` (Spotlight glare / optional subtle tilt).

## File Structure (Các tệp sẽ chỉnh sửa sau khi duyệt)
```text
e:\SunYoga3\
├── DESIGN.md                # Cập nhật token Glass Card v4.1 (radii, blur, specular shadows)
├── mobile/
│   ├── styles.css           # Chuẩn hóa hệ Glass Card tokens, dọn xung đột !important, làm trong suốt .main-workspace
│   ├── app.js               # Bỏ inline color cứng ở mobile card, thêm bộ lắng nghe cursor-lit glass nhẹ (tôn trọng reduced-motion)
│   ├── zen-canvas.js        # Tinh chỉnh 4 orb tông ấm Zen (bỏ orb tím lạc tông), tăng nhẹ độ mượt phía sau kính
│   └── sw.js                # Nâng CACHE_NAME để PWA nhận CSS/JS mới ngay
└── renderer/                # (Tùy chọn theo xác nhận phạm vi)
    ├── styles.css           # Đồng bộ Glass Card bo tròn cho bản Electron Desktop
    └── zen-canvas.js        # Đồng bộ bảng màu orb Zen với bản web
```

## Task Breakdown

> **Git Workflow:** Tạo nhánh riêng `feature/glass-cards-redesign` từ `main` trước Task 1.

- [x] **T1 — Git Branch & Design Tokens (`DESIGN.md`)** · *Agent: `@frontend-specialist` · Skills: `@design-spec`, `@ui-ux-pro-max`*
  - **INPUT:** Phương án kính (A / B / C) + thông số radius/blur/opacity đã duyệt từ mockup.
  - **OUTPUT:** Nhánh `feature/glass-cards-redesign` + cập nhật token `glass-card`, `concentric-radii`, `specular-rim`, `reduced-transparency` trong `DESIGN.md`.
  - **VERIFY:** `git branch --show-current` là `feature/glass-cards-redesign` và token trong `DESIGN.md` khớp thiết kế duyệt.

- [x] **T2 — Atmospheric Canvas & Workspace Transparency (`mobile/styles.css`, `mobile/zen-canvas.js`)** · *Agent: `@frontend-specialist` · Skills: `@frontend-design`, `@clean-code`*
  - **INPUT:** Lỗi `.main-workspace` nền đặc che `#zen-ambient-canvas` và orb tím lạc tông.
  - **OUTPUT:** Mở trong suốt `.main-workspace` trên nền canvas ấm `#FAF6F0`, tinh chỉnh 4 orb Zen tông ấm (Ochre, Sage, Peach, Sand) giúp mặt kính có chiều sâu tán xạ tự nhiên.
  - **VERIFY:** Mở trình duyệt tắt hình nền Studio, quan sát ánh sáng Zen thở nhẹ xuyên qua các card.

- [x] **T3 — Core Rounded Glass Card System & KPI / Student Cards (`mobile/styles.css`, `mobile/app.js`)** · *Agent: `@frontend-specialist` · Skills: `@lucian-uxui`, `@frontend-design`*
  - **INPUT:** Toàn bộ `.kpi-wellness-card`, `.wellness-student-directory`, `.wellness-student-row`, `.mobile-card-details`, nút `.btn-mobile-collect` / `.btn-mobile-call`.
  - **OUTPUT:** Hệ kính bo tròn đồng tâm (`outer → inner glass well → pill`), gradient chéo đa tầng + viền sáng specular + bóng đổ tinted, bỏ hoàn toàn xung đột `!important` cũ và inline styles cứng trong `app.js`, sửa lưới 7 cột Desktop `1280px` không bị cắt cột phải.
  - **VERIFY:** Kiểm tra cả Desktop (`1280×800`) và Mobile (`390×844`), lọc KPI và bấm Thu phí mượt mà, toàn bộ 7 cột hiển thị trọn vẹn.

- [x] **T4 — Calendar, Revenue, Settings & Sheet Glass Cards (`mobile/styles.css`)** · *Agent: `@frontend-specialist` · Skills: `@frontend-design`, `@ui-ux-pro-max`*
  - **INPUT:** `.calendar-widget-card`, `.today-schedule-card`, `.schedule-item`, `.revenue-hero-card`, `.payment-history-card`, `.u037-trigger-chip`, `.settings-card`, `.config-item-row`, `.cupertino-sheet-card`.
  - **OUTPUT:** Đồng nhất 100% vật liệu kính, bo góc đồng tâm và bảng màu Warm Pastel Zen (dọn sạch màu xanh `#4778F5` và tím `#AF52DE` còn sót, khôi phục đủ biến semantic `--apple-green/orange/red`).
  - **VERIFY:** Chuyển qua đủ 4 tab (Học viên, Lịch tập, Thu phí, Cài đặt) + mở modal Thêm/Sửa học viên, không có card nào bị lệch phong cách.

- [x] **T5 — Lucian UX/UI Optical Micro-Interactions (`mobile/app.js`, `mobile/styles.css`)** · *Agent: `@frontend-specialist` · Skills: `@lucian-uxui`*
  - **INPUT:** Pattern Lucian `#228` (cursor-lit glass edge), `#001` (sheen sweep nút CTA).
  - **OUTPUT:** Ánh sáng viền kính di chuyển mềm theo con trỏ trên Desktop (`initGlassSpotlight()` dùng `requestAnimationFrame` + CSS custom properties, tự tắt trên touch và `prefers-reduced-motion`).
  - **VERIFY:** Không lỗi JS console, không giật layout.

- [x] **T6 — Studio Wallpaper & Dark Mode Calibration + Service Worker Bump (`mobile/styles.css`, `mobile/sw.js`)** · *Agent: `@frontend-specialist` · Skills: `@ui-ux-pro-max`*
  - **INPUT:** Trạng thái `body.has-custom-bg`, `body.theme-midnight-pro`, `prefers-reduced-transparency`.
  - **OUTPUT:** Hiệu chỉnh độ mờ/đục kính riêng khi bật ảnh nền Studio (`blur 28px`, saturate `195%`) + thanh meta dạng glass pill; tăng `CACHE_NAME` lên `sun-yoga-liquid-porcelain-v33` và `?v=10.0` trong `mobile/index.html`.
  - **VERIFY:** Bật/tắt hình nền Studio trên trình duyệt, chữ sắc nét và kính tán xạ mượt.

- [x] **T7 — Electron Desktop Renderer Sync (`renderer/styles.css`, `renderer/zen-canvas.js`)** · *Agent: `@frontend-specialist` · Skills: `@frontend-design`*
  - **INPUT:** `.app-header`, `.card.list-card`, `.stat-card`, `.clock-widget`, `.calendar-widget`, `.modal-content`.
  - **OUTPUT:** Đồng bộ ngôn ngữ Rounded Liquid Porcelain Glass (`30px` outer / `19px` inner wells + warm Zen orbs + `prefers-reduced-transparency` fallback) cho ứng dụng Electron Desktop.
  - **VERIFY:** Kiểm tra cú pháp `renderer/zen-canvas.js` và bộ token đồng nhất với `DESIGN.md`.

- [x] **T8 — Phase X: Final Verification & Visual Audit** · *Agent: `@qa-automation-engineer` + `@frontend-specialist` · Skills: `@verify-changes`, `@webapp-testing`*
  - **INPUT:** Bản triển khai hoàn chỉnh chạy local tại `http://localhost:3456`.
  - **OUTPUT:** Pass `accessibility_checker.py` (0 lỗi), pass kiểm tra cú pháp JS, pass kiểm chứng trực quan Desktop `1280×800` & Mobile `390×844` (0 lỗi console, 0 tràn ngang, lọc KPI & bottom sheet hoạt động trơn tru).
  - **VERIFY:** Đã kiểm chứng trực tiếp bằng ảnh chụp host-verified `final_step_59.png` và kiểm thử tương tác 4 tab.

## Phase X: Verification Checklist
- [x] `node --check mobile/app.js mobile/zen-canvas.js mobile/sw.js renderer/zen-canvas.js` → Pass
- [x] `python .agents/skills/frontend-design/scripts/accessibility_checker.py mobile` → Pass (`0 issues`)
- [x] `python .agents/skills/frontend-design/scripts/ux_audit.py mobile` → Đã xử lý sạch cảnh báo màu tím & `will-change: left` (chỉ còn cảnh báo heuristic đếm fallback font trong CSS var)
- [x] Kiểm tra trực quan trên **Mobile 390×844** & **Desktop 1280×800** (cả 4 tab + modal + bật/tắt Ảnh nền Studio + sửa tràn cột bảng Desktop)
- [x] Đã tích hợp đầy đủ fallback `@media (prefers-reduced-motion: reduce)` và `@media (prefers-reduced-transparency: reduce)`

## ✅ PHASE X COMPLETE
- Branch: `feature/glass-cards-redesign`
- JS Syntax: ✅ Pass
- Accessibility Audit (`accessibility_checker.py`): ✅ Pass (0 issues)
- Visual & Responsive Audit (Desktop 1280×800 & Mobile 390×844): ✅ Pass (0 console errors, 0 horizontal overflow)
- Date: 2026-11-20
