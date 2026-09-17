# Kiểm tra DeepSeek qua Command Code — 2026-09-17

**Trạng thái: blocked bởi quyền truy cập dịch vụ; chưa có output DeepSeek.**

- Endpoint chính thức: `https://api.commandcode.ai/provider/v1/chat/completions`.
- Model thử: `deepseek/deepseek-v4-flash`.
- GET models công khai: HTTP 200, có model được chọn; điều này không chứng minh tài khoản có quyền inference.
- POST inference có xác thực: **HTTP 403**, `permission_error`, `upgrade_required`.
- Thông báo dịch vụ: tài khoản Go không có API access, cần gói có quyền Provider API.
- Một lần thử inference, không thành công; không chạy 27 case vì cùng điều kiện chặn sẽ lặp lại. Không fallback sang model khác, không thay đổi điểm CP3.
- Không thể kết luận về chất lượng, độ ổn định hoặc tốc độ sinh câu DeepSeek từ lần thử này.

[Kết quả HTTP đã loại thông tin bí mật](connection.json). Key chỉ nằm trong bộ nhớ khi thử, không được ghi vào source, `.env`, trace hoặc báo cáo. Script `../commandcode-probe.cjs` dùng cổng loopback một lần để nhận key trong RAM; không mở ra mạng ngoài và tự đóng sau lần thử.

Để thử tiếp: người dùng cần cung cấp quyền/API key được phép gọi inference. Không tự đổi gói, mua credit hoặc dùng endpoint khác để vượt hạn chế. Sau khi hết chặn, mới tích hợp provider riêng và chạy cùng golden set, ghi đúng model của từng response.

Tài liệu chính thức: https://commandcode.ai/docs/provider (endpoint, model catalog, mã 403 `upgrade_required`).
