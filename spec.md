# ScriptScout — AI Spec (CHỐT CP4)

> Nhóm chốt quality bar kỹ thuật tại CP4 theo `scriptscout-eval/7-review-advisory`: case đạt toàn bộ kiểm tra tự động được tính pass; review ngữ nghĩa là khuyến nghị và không chặn pass.

## Nhóm và phân công

| Thành viên | Vai trò và trách nhiệm |
|---|---|
| Chu Minh Quân | Leader · quản lý repo, tích hợp và nộp checkpoint |
| Trần Trọng Chinh | Backend/AI · research API, model integration, debugging |
| Đinh Thị Minh Tâm | Discovery/Eval · survey, evidence, golden set, spec |
| Nguyễn Văn Ước | Frontend/Demo · UX flow, prototype, validation/demo |

## Phân công nhóm

| Thành viên | Vai trò và trách nhiệm |
|---|---|
| Chu Minh Quân | Leader · quản lý repo, tích hợp và nộp checkpoint |
| Trần Trọng Chinh | Backend/AI · research API, model integration, debugging |
| Đinh Thị Minh Tâm | Discovery/Eval · survey, evidence, golden set, spec |
| Nguyễn Văn Ước | Frontend/Demo · UX flow, prototype, validation/demo |

> **CP4 FREEZE — 17/09/2026**
>
> Quality Bar tại §7 được chốt tại CP4.
> Sau thời điểm nộp CP4, nhóm có thể tiếp tục sửa code, prompt và chạy lại eval,
> nhưng không hạ hoặc thay đổi chuẩn "đạt" dựa trên kết quả mới.
>
> Các phần chưa hoàn thiện được khai báo rõ trong mục
> **Known limitations at CP4 freeze**.

---

## §1. User & Job

### 1.1 Job executor

**Người trực tiếp viết kịch bản video bài giảng có sử dụng thông tin,
số liệu, ví dụ hoặc luận điểm từ các tài liệu bên ngoài.**

Giảng viên/người duyệt là stakeholder quan trọng trong bước review,
nhưng job executor chính của lát cắt này là người viết kịch bản.

### 1.2 Current workflow

Qua khảo sát, workflow hiện tại thường gồm:

**Nhận chủ đề/mục tiêu**
→ tìm tài liệu trên web
→ mở và đọc nhiều nguồn
→ đánh giá nguồn nào đủ đáng tin
→ đối chiếu thông tin giữa các nguồn
→ ghi chú dữ kiện
→ viết lại thành nội dung/kịch bản
→ ghi nguồn
→ gửi người khác duyệt
→ mở lại nguồn khi cần kiểm chứng
→ sửa bản nháp.

Người dùng hiện có thể sử dụng Google Search, ChatGPT, Claude,
Gemini, Perplexity, NotebookLM hoặc tài liệu nội bộ,
nhưng nhiều bước đối chiếu và truy lại bằng chứng vẫn phải làm thủ công.

### 1.3 Core JTBD

> **Hoàn thiện một đoạn kịch bản bài giảng có thông tin đáng tin cậy
> và có thể truy lại bằng chứng trước khi chuyển cho người duyệt.**

JTBD này không chứa tên ScriptScout, AI, chatbot hay một công nghệ cụ thể.

### 1.4 Problem statement

> **Khi viết kịch bản bài giảng có thông tin thực chứng, người viết
> phải tự mở lại và đối chiếu nhiều tài liệu để xác định từng câu
> dựa trên bằng chứng nào, khiến quá trình kiểm tra và duyệt mất thêm
> thời gian và dễ phát sinh việc tìm lại nguồn hoặc sửa nội dung.**

### 1.5 Evidence ban đầu

Nhóm đã khảo sát **11 người** từng trực tiếp viết, nghiên cứu hoặc
duyệt nội dung bài giảng.

Kết quả chính:

- **11/11** từng gặp tình trạng có nguồn nhưng không nhớ rõ câu nào
  được lấy từ nguồn nào.
- **10/11** đánh giá việc truy ngược câu/số liệu về đúng nguồn ở mức
  khó **4–5/5**.
- **7/11** cho biết lần gần nhất mất **hơn 1 giờ** để tìm lại đúng
  nguồn hoặc đoạn chứng minh.
- **7/11** phải đọc từ **11 nguồn trở lên** trong lần gần nhất.
- **8/11** đánh giá việc lựa chọn nguồn đủ đáng tin ở mức khó 4–5/5.
- **10/11** đánh giá việc chuyển research thành lời thoại ở mức khó
  4–5/5.
- **9/11** cần ít nhất 3 lượt sửa bản nháp.
- Khi buộc chọn đúng một pain tốn công nhất,
  **“truy ngược câu → nguồn”** và **“đối chiếu nhiều nguồn”**
  cùng có **4/11 lựa chọn**.
- **6/11** đồng ý thử prototype; **5 người** để lại thông tin liên hệ.

### 1.6 Quote nguyên văn tiêu biểu

> “Tự tay click vào từng link do Perplexity hay LLM đưa ra để đọc xem
> đoạn văn gốc có thực sự chứa con số đó không… việc gắn nhãn
> footnote/citation từng câu… vẫn phải copy-paste hoàn toàn bằng tay.”

> “Không có công cụ nào tự động highlight xem câu trong bài viết
> khớp với dòng nào trong văn bản gốc. Toàn bộ việc mở tab, đọc từng
> đoạn chứng minh… vẫn phải làm thủ công 100% bằng mắt.”

**Evidence gap:** khảo sát hiện tại có **n=11**, chưa đạt chuẩn survey
A ≥20 của rubric chung. Nhóm không khai n=11 là survey đạt chuẩn A.

Nhóm cũng chưa thu được số liệu tần suất thực hiện công việc theo tháng,
vì vậy không tự suy đoán frequency để làm đẹp impact.

---

## §2. Impact & quyết định chọn

Nhóm so sánh ba candidate pain trước khi khóa lát cắt.

| Candidate | Evidence hiện có | Cost / hậu quả | Buildability | Quyết định |
|---|---|---|---|---|
| **A. Truy ngược claim → evidence** | 11/11 từng gặp mất mapping; 10/11 chấm khó 4–5; 7/11 mất >1 giờ ở lần gần nhất | Phải tìm lại nguồn, kiểm lại claim, làm reviewer mất thêm thời gian | Cao; có thể đo rõ bằng sentence → evidence mapping | **CHỌN** |
| **B. Đối chiếu nhiều nguồn** | 4/11 chọn là pain lớn nhất; nhiều câu trả lời cho thấy vẫn phải fact-check thủ công | Phải mở và so nhiều nguồn trước khi dùng | Trung bình; phụ thuộc mạnh vào search và web coverage | Không chọn làm core |
| **C. Research → văn nói** | 10/11 chấm khó 4–5; 9/11 cần ≥3 lượt sửa | Rework nhiều vòng trước khi dùng được | Cao nhưng naturalness khó chấm khách quan hơn grounding | Giữ làm quality dimension phụ |

### 2.1 Vì sao chọn Candidate A

A và B cùng có **4/11 lựa chọn** ở câu hỏi “pain tốn công nhất”,
nên nhóm **không kết luận rằng A phổ biến hơn B**.

A được chọn vì có thêm các bằng chứng trực tiếp:

- 11/11 từng gặp mất mapping câu–nguồn;
- 10/11 đánh giá việc truy nguồn khó;
- 7/11 mất hơn một giờ trong lần gần nhất;
- pain này khớp với một lát cắt nhỏ, đo được và build được trong Hackathon.

### 2.2 Candidate đã loại

**Đối chiếu toàn bộ nhiều nguồn:** vẫn là pain thật nhưng rộng hơn lát
cắt và phụ thuộc nhiều vào chất lượng search.

**Tự động viết toàn bộ bài giảng/video:** ngoài scope Hackathon hiện tại
và không giải trực tiếp pain traceability đã đo được.

### 2.3 Impact gap

Rubric yêu cầu bảng impact có yếu tố tần suất.
Khảo sát hiện tại chưa có aggregate frequency đủ tin cậy.

Vì vậy nhóm ghi rõ:

> **Frequency chưa đo — không tự tạo số để tính impact.**

---

## §3. Giải pháp tương tự đã nghiên cứu

### 3.1 Perplexity

**Flow quan sát:** nhập câu hỏi → hệ thống tìm web → tạo nội dung có
citation → người dùng có thể mở source.

**Điểm đáng học:**
- citation nằm gần nội dung;
- giảm bước tự tìm link;
- user có thể mở nguồn nhanh.

**Điểm cần tránh:**
- có citation chưa đồng nghĩa đoạn được cite hỗ trợ chính xác toàn bộ claim;
- user vẫn phải mở nguồn để kiểm meaning;
- citation có thể ở mức source thay vì evidence passage.

**ScriptScout khác ở điểm:**

> lưu quan hệ **Sentence → Fact → Evidence → Source**
> và đưa source review vào workflow trước khi coi draft là sẵn sàng.

### 3.2 Deep Research / công cụ nghiên cứu dài

**Flow quan sát:** nhận câu hỏi/chủ đề → tìm nhiều nguồn →
tổng hợp thành báo cáo dài có citation.

**Điểm đáng học:**
- research nhiều nguồn;
- tổng hợp nội dung tốt;
- có provenance/source list.

**Điểm cần tránh:**
- output thường giống research report hơn script văn nói;
- chưa tập trung vào correction ở mức từng câu khi một nguồn bị loại.

**ScriptScout khác ở điểm:**

> đầu ra là một lát cắt script 5 câu,
> có evidence traceability và reviewer control.

---

## §4. Thiết kế

### 4.1 Lát cắt MỘT CÂU

> **Một người viết kịch bản cần tạo 5 câu cho một đoạn bài giảng;
> AI đánh giá nguồn và bằng chứng cho factual information để tạo một
> bản nháp mà từng thông tin có thể truy ngược về đúng nguồn,
> và khi reviewer loại một nguồn chỉ phần phụ thuộc nguồn đó cần sửa.**

- **1 user:** người viết kịch bản.
- **1 job:** tạo một đoạn script 5 câu có căn cứ.
- **1 quyết định AI trung tâm:** quyết định source/evidence nào đủ
  điều kiện để dùng cho factual information.
- **1 result:** script có traceability để reviewer kiểm chứng.

### 4.2 Non-goals

Trong lát cắt Hackathon này, nhóm không:

1. tạo video hoàn chỉnh;
2. tự phê duyệt hoặc tự xuất bản bài giảng thay giảng viên;
3. tạo toàn bộ bài giảng dài nhiều section;
4. tuyên bố xác minh “sự thật tuyệt đối” trên Internet;
5. coi search snippet hoặc trang chưa đọc được là evidence thật;
6. hỗ trợ đầy đủ PDF, paywall hoặc trang cần đăng nhập;
7. xây hệ thống production có authentication và multi-user storage.

### 4.3 Prototype level

**Working prototype**

Phần chạy thật:

- Next.js frontend;
- `/api/research`;
- search web / fallback;
- HTML scraper;
- AI source evaluation;
- AI script generation;
- `/api/regenerate-sentence`;
- trace và source/evidence mapping.

Phần fixture/mô phỏng:

- fixture localhost dùng trong adversarial evaluation;
- animation timeline;
- một số biểu diễn trust trên UI mang tính heuristic,
  chưa phải calibrated probability.

### 4.4 Input

Bốn input bắt buộc:

- Chủ đề.
- Mục tiêu bài học.
- Đối tượng người học.
- Thời lượng.

Nếu input thiếu hoặc quá mơ hồ, hệ thống phải yêu cầu làm rõ
thay vì tự suy đoán.

### 4.5 Output

#### Hồ sơ nguồn

- URL;
- tiêu đề;
- tác giả/tổ chức nếu đọc được;
- ngày đăng nếu đọc được;
- ngày truy cập;
- loại nguồn;
- độ tin cậy;
- lý do dùng/loại;
- cảnh báo;
- đoạn trích;
- scrape status;
- prompt-injection flag.

#### Fact / thông tin

- nội dung;
- loại thông tin;
- evidence;
- source ID;
- số nguồn xác nhận;
- trạng thái xác minh;
- mô tả mâu thuẫn nếu có.

#### Kịch bản

- 5 câu trong lát cắt demo;
- lời đọc;
- chữ trên màn hình;
- ý đồ hình;
- fact/source linkage.

#### Trace

- input;
- search results;
- pages read;
- raw AI response;
- model;
- source decision;
- sentence → fact/source mapping.

### 4.6 Quyết định AI trung tâm

**Quyết định trung tâm:**

> **Source/evidence có đủ điều kiện để factual information được đưa
> vào script hay không.**

AI xem xét:

- nội dung page đã scrape;
- metadata đọc được;
- độ mới;
- loại nguồn;
- evidence passage;
- số nguồn xác nhận;
- mâu thuẫn giữa nguồn;
- dấu hiệu prompt injection.

Prompt-injection detection bằng rule/scraper là guardrail hỗ trợ,
không phải quyết định trung tâm của lát cắt.

Script generation là bước downstream sau source/evidence decision.

### 4.7 Automation

**AUGMENT**

AI có thể:

- lên query;
- tìm candidate source;
- đánh giá source;
- trích evidence;
- phát hiện dấu hiệu mâu thuẫn;
- tạo draft;
- đề xuất câu viết lại.

Con người giữ quyền:

- chấp nhận/loại nguồn;
- kiểm evidence;
- xử lý uncertainty;
- duyệt nội dung cuối.

**Lý do theo cost-of-error:** factual error trong nội dung giáo dục
có thể đi đến người học, nên AI không có quyền phê duyệt cuối.

### 4.8 HAX / PAIR

| Nguyên tắc | Chỗ áp dụng trong prototype | Cách kiểm |
|---|---|---|
| **G2 — Làm rõ AI làm tốt đến đâu** | Source profile hiển thị cảnh báo, độ tin cậy và trạng thái | Nguồn cũ / nguồn thiếu metadata |
| **G9 — Sửa dễ dàng** | Reviewer có thể loại source và regenerate phần liên quan | Correction flow |
| **G10 — Thu hẹp khi nghi ngờ** | Topic mơ hồ hoặc input thiếu → hỏi lại, không sinh script | N11, N12 |
| **G11 — Giải thích vì sao** | Source profile có reason + evidence; sentence truy được về source | Source/evidence cases |
| **PAIR Feedback & Control / G17** | Human giữ quyết định cuối về source và draft | N25 / correction flow |

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
