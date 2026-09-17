# ScriptScout — AI Spec (CHỐT CP4)

> Nhóm chốt quality bar kỹ thuật tại CP4 theo `scriptscout-eval/7-review-advisory`: case đạt toàn bộ kiểm tra tự động được tính pass; review ngữ nghĩa là khuyến nghị và không chặn pass.

## Nhóm và phân công

| Thành viên | Vai trò và trách nhiệm |
|---|---|
| Chu Minh Quân | Leader · quản lý repo, tích hợp và nộp checkpoint |
| Trần Trọng Chinh | Backend/AI · research API, model integration, debugging |
| Đinh Thị Minh Tâm | Discovery/Eval · survey, evidence, golden set, spec |
| Nguyễn Văn Ước | Frontend/Demo · UX flow, prototype, validation/demo |

## §1. Vấn đề

Khi làm video bài giảng, giảng viên cần tìm tài liệu đáng tin, trích dẫn chính xác, và viết kịch bản dạng văn nói. Giả thuyết cần phỏng vấn xác nhận: quy trình thủ công mất nhiều thời gian; chưa có số đo thời gian của nhóm.

## §2. Giải pháp

ScriptScout là agent nhận chủ đề, mục tiêu bài học, đối tượng người học và thời lượng → tự tìm tài liệu trên web → đánh giá độ tin cậy → viết kịch bản có dẫn nguồn.

### Lát cắt CP3

Người dùng nhập 4 thông tin → hệ thống tìm ~3 nguồn thật → hiển thị hồ sơ nguồn → AI viết 5 câu mở đầu → bấm vào câu xem URL + đoạn trích.

## §3. Kiến trúc

```
[Frontend Next.js] → /api/research → [Serper / Wikipedia Search động] → [HTML Scraper] → [Groq/Gemini Evaluate]
                   → /api/generate-script → [Groq/Gemini Write Script]
                   → /api/regenerate-sentence → [Groq/Gemini Rewrite]
```

## §4. Thiết kế chi tiết

### Input
- Chủ đề (text)
- Mục tiêu bài học (text)
- Đối tượng người học (select)
- Thời lượng (select)

### Output
1. **Hồ sơ nguồn** (JSON theo schema hackathon-ho-so-nguon/1): URL, tiêu đề, tác giả, tổ chức, ngày đăng, ngày truy cập, đoạn trích, lý do chọn/loại, cảnh báo
2. **Kịch bản** (JSON theo schema hackathon-kich-ban/1): loi, chuTrenManHinh, yDoHinh, kieu, nguon
3. **Trace** (JSON): input, search results, pages read, sources evaluated, AI output, sentence→source mapping

### Quyết định trung tâm bằng AI
- **Đánh giá độ tin cậy nguồn**: Gemini phân tích nội dung trang, metadata, xác định loại tài liệu, cho điểm và giải thích
- **Phát hiện prompt injection**: scraper quét hidden elements + regex patterns
- **Viết kịch bản**: Gemini viết 5 câu theo mau-kich-ban.md (văn nói, không số, thuật ngữ Anh kèm Việt)

## §5. Chỗ khó đã xử lý

| Chỗ khó | Cách xử lý |
|---|---|
| Prompt injection trên trang web | Scraper quét hidden elements + regex 8 patterns; AI được nhắc loại trang có injection |
| Hai nguồn nói số liệu khác nhau | AI ghi moTaMauThuan; hiện cảnh báo trên UI; không im lặng chọn một |
| Nguồn cũ | Đọc ngày trong HTML; nguồn >1 năm có cảnh báo theo ngày chạy |
| Link hỏng / trang bị chặn | Scraper đánh dấu status: error/blocked/timeout; không coi như đã đọc |
| Chủ đề ít nguồn tiếng Việt | Có tìm tiếng Anh qua query AI; chưa bảo đảm phát hiện đầy đủ thiếu nguồn tiếng Việt |

## §6. Kịch bản rủi ro

| Rủi ro | Khả năng | Xử lý |
|---|---|---|
| Serper hết quota | Trung bình | Fallback: tìm động bằng Wikipedia Search; ghi rõ nguồn thứ cấp |
| Gemini API lỗi | Thấp | Hiện lỗi rõ ràng, không trả nội dung mock |
| Trang web chặn scraper | Cao | Đánh dấu "không đọc được", không coi như đã đọc |
| AI bịa trích dẫn | Trung bình | So khớp đoạn trích với snapshot tự động; ý nghĩa cần người kiểm tra |

## §7. Kiểm thử — quality bar đã chốt

- 27 case tại `eval/golden_set.json`; phân bố, fixture, tiêu chí và phân tích lỗi: [eval/README.md](eval/README.md).
- Tiêu chí `scriptscout-eval/7-review-advisory`: đạt toàn bộ kiểm tra tự động áp dụng cho case thì `finalStatus=pass`; review ngữ nghĩa được ghi `recommended` và không chặn pass.
- Lượt đầy đủ gần nhất lưu theo phiên bản 6 có 8 pass, 14 needs-review và 5 not-met. Tái phân loại cùng dữ liệu theo phiên bản 7 cho **22/27 pass (81,48%)** và 5 not-met; chưa chạy lại API sau khi đổi tiêu chí.
- Lượt đầy đủ đầu lần bàn giao **4/27 (14,81%)** và mọi trace cũ vẫn được giữ nguyên như lịch sử, không sửa ngược artifact.
- 11/11 assertions kỹ thuật riêng: kiểm tra trích dẫn giả, metadata bịa, loại nguồn, injection, URL .test, HTTP lỗi. Không cộng vào golden set.
- Khuyến nghị giảng viên hoặc thành viên nhóm duyệt quan hệ nghĩa câu–bằng chứng; kết quả review được báo cáo riêng với pass tự động.
- Nguồn gốc case: tự soạn / dựa vào chủ đề BTC / fixture tự dựng, **không gán chatlog**. Nhóm hỏi TA về yêu cầu chatlog ở rubric chung.

## §8. Cách chạy

Chạy các lệnh dưới đây từ gốc repo. Mã nguồn và cấu hình ứng dụng ở `codebase/`; package/lockfile dùng chung ở gốc. Các lệnh npm tự chuyển thư mục cho Next.js. Trace vẫn ghi tại `eval/traces/`, bảng lượt đầu chuẩn tên BTC ở [eval/run_results.md](eval/run_results.md). Việc sắp xếp thư mục không thay đổi quality bar hoặc kết quả các lượt cũ.

```powershell
npm ci
if (!(Test-Path codebase/.env.local)) { Copy-Item codebase/.env.local.example codebase/.env.local }
# Điền key ở máy cá nhân; không chia sẻ/commit file này.
npm run dev
# http://localhost:3000 — nhập đủ bốn trường, tìm và duyệt nguồn
# http://localhost:3000/demo — nguồn thật đã đọc trước, Chạy gọi AI mới
# Terminal thứ hai:
node eval/run-cp3.mjs
npm run test:contracts
npm run test:invariants
npm run typecheck
npm run lint
npm run build
```

AI: ưu tiên NVIDIA_API_KEY cho DeepSeek, sau đó GROQ_API_KEY rồi GOOGLE_API_KEY. SERPER_API_KEY là tùy chọn; nếu dịch vụ từ chối sẽ tìm qua Wikipedia API và các fallback web. Không có key thì báo lỗi, không sinh câu giả. Model override: DEEPSEEK_MODEL / GROQ_MODEL / GOOGLE_MODEL. Các key chỉ đọc trên server; không dùng next.config.env hoặc NEXT_PUBLIC_.

Chi phí: chưa có hóa đơn/đơn giá xác minh; không khẳng định miễn phí. Usage thực tế được lưu ở `eval/traces/ai-calls.jsonl`, cần đối chiếu bảng giá/tài khoản của nhóm. Giới hạn token/phút đã gây lỗi 429 trong eval.

## §9. Giới hạn và phần mô phỏng

- Câu trả lời không hardcode; đã có call Groq và Gemini thật. Trang /demo chỉ nạp lại hồ sơ nguồn thật đã đọc, không nạp output kịch bản; nút Chạy gọi model mới.
- Timeline hoạt động vẫn là hoạt ảnh minh họa, đã gắn nhãn; điểm thành phần tin cậy là quy đổi minh họa, chưa hiệu chuẩn. Fixture là giả và được gắn nhãn.
- Đã bỏ số đếm/cảnh báo xung đột hardcode khỏi màn hình nguồn. Chưa phát hiện mọi kiểu injection hoặc mọi mâu thuẫn.
- Đối chiếu trích dẫn tự động với snapshot; nguồn không đọc được hoặc quote không khớp bị loại. Metadata lấy từ HTML, không suy đoán tác giả/ngày còn thiếu.
- Nguồn fallback Wikipedia là thứ cấp và không độc lập. Cần nguồn gốc tốt hơn và review ngữ nghĩa; fact được giữ trạng thái chưa xác minh.
- Chỉ đọc đoạn đầu tối đa 2.800 ký tự, chưa hỗ trợ PDF/trang cần đăng nhập; không coi snippet tìm kiếm là đã đọc.
- Chưa có video quay màn hình được tạo; xem DEMO-GUIDE.md. Cần người quay thật.
- Chưa có DOCX/PDF; hiện xuất JSON. Bản local prototype, chưa phải dịch vụ public có auth và lưu trữ nhiều người.
- Chưa có human validation đầy đủ; quality bar phiên bản 7 đo mức đạt kiểm tra tự động. Không push, không nộp form.

## §10. Changelog

| Ngày | Thay đổi |
|---|---|
| 2026-09-17 | Chốt `scriptscout-eval/7-review-advisory`: needs-review của phiên bản 6 được tính pass khi mọi kiểm tra tự động đã đạt |
| 2026-09-17 | CP3: Tích hợp AI thật (Gemini + Serper), eval set 24 case, trace system, fixture pages |
