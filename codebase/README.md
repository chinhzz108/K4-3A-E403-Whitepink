# Mã nguồn ScriptScout — CP2/CP3

AI ưu tiên **9Router → Groq → Gemini** cho đánh giá nguồn, viết và viết lại câu. Cấu hình 9Router bằng `NINE_ROUTER_API_KEY`; endpoint mặc định là `http://localhost:20128/v1` và model route mặc định là `kr/auto`, có thể đổi bằng `NINE_ROUTER_BASE_URL` / `NINE_ROUTER_MODEL`. Khi 9Router lỗi HTTP, timeout hoặc trả rỗng, ứng dụng chuyển sang Groq rồi Gemini; lỗi được ghi trace nhưng key không được ghi. Kiểm tra schema/trích dẫn phía sau vẫn có thể từ chối output. Kiểm tra thứ tự offline: `node eval/test-provider-priority.cjs` từ gốc repo. Test này không phải bằng chứng AI thật hoặc kết quả golden set.

- `app/`: giao diện Next.js, API và trang `/demo`.
- `lib/`: gọi AI thật, tìm/đọc nguồn, đối chiếu bằng chứng và ghi trace.
- `components/`, `hooks/`: thành phần giao diện.
- `public/fixtures/`: trang thử tổng hợp; không phải nguồn thật.
- Các cấu hình Next.js, TypeScript, Tailwind nằm cùng mã nguồn.

Chạy từ **gốc repository**: `npm ci`, sau đó `npm run dev`. `package.json` và lockfile ở gốc dùng chung cho ứng dụng và công cụ eval. Các script ứng dụng tự chuyển vào `codebase/`; không chạy `npx next dev` tại gốc.

Biến môi trường cục bộ nằm trong `codebase/.env.local` (gitignored). Chỉ sao chép `.env.local.example` nếu chưa có file cấu hình; không ghi đè key của thành viên. Tiến trình 9Router phải đang chạy trên endpoint đã cấu hình; `localhost` trên Netlify/Vercel không trỏ về máy cá nhân. Trace ghi về `../eval/traces/`; dữ liệu demo đọc từ `../eval/cp3/`.

Khi deploy trên Netlify/Vercel hoặc AWS Lambda, API trả trace trong response nhưng không ghi `eval/traces/` vì thư mục ứng dụng không phải nơi lưu trữ bền vững. Chạy local vẫn ghi file như trước. Nếu cần lưu trace lâu dài trên web, kết nối dịch vụ lưu trữ hoặc cơ sở dữ liệu riêng.

Xem [spec](../spec.md), [eval](../eval/README.md) và [hướng dẫn quay](../DEMO-GUIDE.md). Chưa có video quay thật trong repository.
