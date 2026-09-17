# Kiểm tra sau tổ chức thư mục — 2026-09-17

- Chuyển 88 file được Git theo dõi vào `codebase/`. So với HEAD, chỉ `app/api/demo/route.ts` và `lib/audit.ts` thay đổi đường dẫn đọc/ghi về `../eval/`; các file được chuyển khác giữ nguyên nội dung.
- `golden_set.json` giữ nguyên dữ liệu 27 case của `golden-set.json` trước khi đổi tên.
- `npm run typecheck`: đạt.
- `npm run lint`: đạt, không cảnh báo ESLint.
- `npm run build`: đạt sau khi cho phép tải Google Font; lần trong sandbox thất bại vì kết nối bị chặn. Có cảnh báo cơ sở dữ liệu Browserslist cũ.
- `npm run start`: khởi động production tại localhost:3000.
- GET `/`, `/demo`, `/api/demo`, `/fixtures/contradicting-a.html`: HTTP 200. API demo có ba hồ sơ nguồn.
- `npm run test:invariants`: 11/11; lưu riêng tại [reorganization-invariants.json](cp3/reorganization-invariants.json), không ghi đè bằng chứng cũ.
- `git diff --check`: không lỗi whitespace; có thông báo chuyển LF/CRLF của Git.
- File môi trường cục bộ chuyển vào `codebase/` vẫn được Git bỏ qua; không đưa nội dung key vào báo cáo.

Không gọi AI hoặc chạy lại golden set trong lần sắp xếp này. Không thay đổi kết quả 4/27, không chốt quality bar, không tạo video giả, không commit/push/nộp bài. Cấu hình Netlify đã cập nhật lệnh build và thư mục output; chưa triển khai lên Netlify để kiểm thử môi trường hosting.
