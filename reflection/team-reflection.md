# Báo Cáo Phản Tư (Reflection) — Nhóm E403-Whitepink

> **Quy tắc Vibe-Coding của khóa học:** Mỗi thành viên phải nắm vững và giải thích được chi tiết phần việc mang tên mình trước hội đồng giám khảo tại buổi thuyết trình CP6.

---

## 1. Chu Minh Quân (2A202602709) — Leader

- **Vai trò:** Trưởng nhóm kiêm Product & Architecture Owner.
- **Phần việc đảm nhiệm trong dự án:**
  - Định hình bài toán, xác định lát cắt cốt lõi 1 câu (1 user · 1 việc · 1 quyết định AI · 1 kết quả) theo Track C.
  - Viết và chốt tài liệu [spec.md](../spec.md) qua các mốc CP1 đến CP4.
  - Thiết kế kiến trúc luồng dữ liệu 4 bước (Search -> Scrape -> Evaluate -> Script).
  - Điều phối phân công nhiệm vụ và rà soát các tiêu chí theo Rubric 100 điểm.
- **AI đã hỗ trợ thế nào (Vibe-Coding):**
  - Sử dụng AI để phản biện (adversarial prompt) các kịch bản rủi ro trong HAX Playbook.
  - Nhờ AI gợi ý cấu trúc dữ liệu schema JSON chuẩn cho hồ sơ nguồn và kịch bản.
- **Bài học từ case fail của chính nhóm:**
  - *Case fail:* Ở mốc CP3, nhóm chủ quan cho rằng chỉ cần prompt AI "hãy trích dẫn trung thực" là model sẽ làm đúng. Thực tế khi chạy eval, model vẫn tự bịa ra những câu trích dẫn nghe rất hay nhưng không hề có trong văn bản gốc.
  - *Bài học:* AI sinh ngôn ngữ tự nhiên không có ý thức về "nguồn sự thật". Muốn ngăn chặn hallucination trong sản phẩm EdTech, bắt buộc phải có cơ chế kiểm duyệt cơ học độc lập (như hàm `quoteMatches` so khớp chuỗi nguyên văn với snapshot HTML) trước khi cho phép dữ liệu đi vào bước tiếp theo.

---

## 2. Trần Trọng Chinh (2A202602720) — Member

- **Vai trò:** Data & Research Lead.
- **Phần việc đảm nhiệm trong dự án:**
  - Thiết kế và thực hiện khảo sát Mom Test với 24 người dùng ngoài nhóm (Evidence Đường A).
  - Mining dữ liệu từ 30 kịch bản bài giảng mẫu để đo đếm tần suất lỗi không dẫn nguồn (Evidence Đường B).
  - Xây dựng 27 test case cho bộ [eval/golden_set.json](../eval/golden_set.json) bao phủ đủ 4 lớp taxonomy chỗ khó.
- **AI đã hỗ trợ thế nào:**
  - Sử dụng AI hỗ trợ phân tích mẫu ngôn ngữ và bóc tách các câu trích dẫn thô từ tài liệu Wikipedia.
  - Tạo các prompt đối kháng giả lập (adversarial testing) cho các case prompt injection.
- **Bài học từ case fail của chính nhóm:**
  - *Case fail:* Ban đầu nhóm viết các tiêu chí pass/fail của test case quá chung chung (ví dụ "kịch bản nghe mượt mà"). Kết quả là mỗi thành viên chấm ra một điểm số khác nhau.
  - *Bài học:* Đã là eval thì mọi tiêu chí phải đo đếm được bằng con số hoặc quy tắc regex máy kiểm tra được (ví dụ `/\d/` để kiểm tra không có chữ số, số câu chính xác bằng 5). Định nghĩa kiểm chứng được là điều kiện tiên quyết để tin cậy kết quả đo đạc.

---

## 3. Nguyễn Văn Ước (2A202602445) — Member

- **Vai trò:** AI Core & Backend Engineer.
- **Phần việc đảm nhiệm trong dự án:**
  - Phát triển module AI trung tâm [`codebase/lib/ai.ts`](../codebase/lib/ai.ts) và scraper [`codebase/lib/scraper.ts`](../codebase/lib/scraper.ts).
  - Xây dựng kiến trúc dự phòng đa tầng (Multi-provider Fallback: NVIDIA DeepSeek -> Groq -> Google Gemini).
  - Viết hệ thống lưu vết audit và tính toán số liệu đo đạc cho các đợt chạy eval.
- **AI đã hỗ trợ thế nào:**
  - Sử dụng AI để sinh nhanh các hàm bóc tách HTML DOM (`node-html-parser`) và chuẩn hóa chuỗi Unicode tiếng Việt (NFC normalization).
- **Bài học từ case fail của chính nhóm:**
  - *Case fail:* Lần chạy CP3 lượt đầu tiên bị fail tới 22/27 case chủ yếu vì lỗi kỹ thuật: Gemini báo model cũ 404, Groq bị chạm hạn mức 429, và model Nemotron bị treo timeout 35 giây.
  - *Bài học:* Khi xây dựng sản phẩm AI thực chiến, hệ thống không bao giờ được phép phụ thuộc vào một provider duy nhất hay một model cứng nhắc. Cần cấu hình timeout hợp lý, cơ chế retry với exponential backoff, và log rõ lỗi của từng tầng để không bị "mù" khi gặp sự cố trên môi trường thực tế.

---

## 4. Đinh Thị Minh Tâm (2A202602433) — Member

- **Vai trò:** Frontend & User Experience (UX/UI) Lead.
- **Phần việc đảm nhiệm trong dự án:**
  - Thiết kế và lập trình giao diện 4 màn hình Next.js (Brief -> Research -> Sources -> Script).
  - Hiện thực hóa 6 nguyên tắc HAX/PAIR trên UI: Citation Drawer, Reliability Badges, Nút Loại Nguồn và Tái Tạo Câu độc lập.
  - Phụ trách tổ chức các buổi User Testing với người dùng thật và ghi nhận nhật ký [validation/user-testing-log.md](../validation/user-testing-log.md).
- **AI đã hỗ trợ thế nào:**
  - Dùng AI sinh nhanh các Tailwind CSS styles và component giao diện Shadcn UI mượt mà.
- **Bài học từ case fail của chính nhóm:**
  - *Case fail:* Trong phiên bản đầu, khi AI đang tìm kiếm hoặc viết kịch bản, màn hình chỉ hiển thị spinner quay tròn đơn điệu không có phản hồi, khiến người dùng nghĩ hệ thống bị đơ và bấm F5 liên tục.
  - *Bài học:* Theo nguyên tắc PAIR (Explainability & Mental Models), đối với các tác vụ AI mất từ 5–15 giây, phải luôn có thanh trạng thái tiến trình (progress timeline) mô tả rõ AI đang làm gì (đang tìm kiếm -> đang cào web -> đang đánh giá độ tin cậy) để người dùng an tâm chờ đợi.
