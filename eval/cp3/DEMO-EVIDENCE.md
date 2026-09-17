# Bằng chứng thao tác thật

- Ngày giờ trace: 2026-09-16T19:34:12.965Z.
- Trình duyệt đã bấm Chạy tại /demo, nhận 5 câu, bấm câu 2 và thấy URL cùng trích dẫn.
- Model: groq:openai/gpt-oss-120b. Provider response ID: chatcmpl-f32b1e6c-48de-4097-8eed-321a0509ea0c.
- Server duration: 3707 ms; giao diện đo 3,9 giây.
- [Script trace](../traces/trace-script-1789587252965.json) chứa đủ 5 câu và map câu → thông tin → đoạn trích.
- [Research và snapshot](run-2026-09-16T19-30-29-684Z/N01.json).
- Citation câu 2: https://en.wikipedia.org/wiki/Context_window — đoạn định nghĩa cửa sổ ngữ cảnh khớp trang đã đọc.
- [Kiểm tra viết lại](regeneration-check.json): loại n02; chỉ câu 4 được thay; câu 1, 2, 3, 5 giữ nguyên; kết quả kỹ thuật pass. [Lần lỗi đầu](regeneration-first-failed.json) giữ nguyên.
- Call audit: eval/traces/ai-calls.jsonl (provider, request ID, usage, input/output; không chứa key).

Đây là bằng chứng AI thật và luồng thao tác, không phải chứng nhận chất lượng nội dung. Demo còn câu cuối diễn giải vượt quá đoạn trích và thuật ngữ token chưa giải nghĩa; cần người duyệt. Chưa có video quay màn hình.
