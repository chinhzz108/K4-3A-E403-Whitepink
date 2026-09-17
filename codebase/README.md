# Mã nguồn ScriptScout — CP2/CP3

AI ưu tiên **DeepSeek qua NVIDIA → Groq → Gemini** cho đánh giá nguồn, viết và viết lại câu. Cấu hình server: `NVIDIA_API_KEY`, tùy chọn `DEEPSEEK_MODEL`; mặc định `deepseek-ai/deepseek-v4-flash-0731`. DeepSeek lỗi HTTP, timeout, output rỗng hoặc JSON không hợp lệ sẽ chuyển sang Groq; lỗi được ghi trace. Kiểm tra schema/trích dẫn phía sau vẫn có thể từ chối output. Kiểm tra thứ tự offline: `node eval/test-provider-priority.cjs` từ gốc repo. Test này không phải bằng chứng AI thật hoặc kết quả golden set.

- `app/`: giao diện Next.js, API và trang `/demo`.
- `lib/`: gọi AI thật, tìm/đọc nguồn, đối chiếu bằng chứng và ghi trace.
- `components/`, `hooks/`: thành phần giao diện.
- `public/fixtures/`: trang thử tổng hợp; không phải nguồn thật.
- Các cấu hình Next.js, TypeScript, Tailwind nằm cùng mã nguồn.

Chạy từ **gốc repository**: `npm ci`, sau đó `npm run dev`. `package.json` và lockfile ở gốc dùng chung cho ứng dụng và công cụ eval. Các script ứng dụng tự chuyển vào `codebase/`; không chạy `npx next dev` tại gốc.

Biến môi trường cục bộ nằm trong `codebase/.env.local` (gitignored). Chỉ sao chép `.env.local.example` nếu chưa có file cấu hình; không ghi đè key của thành viên. Trace ghi về `../eval/traces/`; dữ liệu demo đọc từ `../eval/cp3/`.

Xem [spec](../spec.md), [eval](../eval/README.md) và [hướng dẫn quay](../DEMO-GUIDE.md). Chưa có video quay thật trong repository.
