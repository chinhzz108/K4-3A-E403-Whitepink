# NVIDIA DeepSeek — kiểm tra kết nối 2026-09-17

**API hoạt động:** một lần inference thành công, HTTP 200.

- Endpoint: `https://integrate.api.nvidia.com/v1/chat/completions`.
- Model trong catalog và response: `deepseek-ai/deepseek-v4-flash-0731`.
- Response ID: `chatcmpl-c349c33d-d0bc-40a6-876b-190b6cdb8a57`.
- Request + discovery: 10.939 ms; usage 86 token.
- Output JSON: `{"ok":true,"message":"Xin chào ScriptScout"}`.
- [Kết quả thật](connection.json). Không có key trong báo cáo.

Một lời gọi không đủ kết luận ổn định, chất lượng kịch bản hoặc khả năng đạt demo 30 giây.

Người dùng xác nhận **chỉ kiểm tra key/API**. Đã bỏ adapter và harness pipeline vừa chuẩn bị, giữ nguyên mã ứng dụng. Không gửi prompt, nội dung repo hoặc fixture tới NVIDIA; không có điểm smoke/golden-set mới. Không lưu key đã cung cấp vào `.env` hoặc repo.

Tài liệu endpoint: https://docs.api.nvidia.com/nim/reference/deepseek-ai-deepseek-v4-pro-0813-infer (dùng catalog runtime để chọn model Flash).
