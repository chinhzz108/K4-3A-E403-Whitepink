# Biên bản nghiệm thu ScriptScout — 2026-09-17

## Phạm vi nghiệm thu

Nghiệm thu trạng thái hiện tại theo yêu cầu dừng chạy thử. Máy chủ đánh giá đã được tắt; không chạy thêm ca API hoặc lượt đầy đủ mới sau thời điểm này.

## Kết quả theo tiêu chí hiện hành

- Phiên bản tiêu chí: `scriptscout-eval/7-review-advisory`
- Phiên bản triển khai: `scriptscout-pipeline/2026-09-17-provider-evidence-fixes`
- Pass: **22/27 (81,48%)**
- Not-met: **5/27**
- Trong 22 pass có **14 case được khuyến nghị review ngữ nghĩa**; review không chặn pass theo tiêu chí hiện hành.
- Kịch bản đủ năm câu: **16**
- Case có ít nhất hai nguồn được chọn: **20**
- Lượt đọc trang thành công: **72**

Con số 22/27 được tính từ cùng một lượt đầy đủ: 8 pass cộng 14 needs-review của tiêu chí phiên bản 6, nay được tái phân loại thành pass theo quyết định của nhóm. Đây là thay đổi tiêu chí và code runner, không phải lượt gọi API mới.

## Dữ liệu lượt đầy đủ được giữ nguyên

- Báo cáo gốc: [run-2026-09-17T13-36-53-362Z](run-2026-09-17T13-36-53-362Z/RESULTS.md)
- Phiên bản tiêu chí khi chạy: `scriptscout-eval/6-fixture-diagnostics`
- Trạng thái đã lưu: **8 pass, 14 needs-review, 5 not-met**

Artifact cũ không bị sửa ngược. `golden_set.json` và `run-cp3.mjs` hiện dùng phiên bản 7, nên các lượt sau sẽ ghi trực tiếp `automatedStatus=pass`, `reviewStatus=recommended`, `finalStatus=pass` cho case đạt toàn bộ kiểm tra tự động.

## Xác nhận mục tiêu sau lượt đầy đủ

Các lượt sau chỉ xác nhận lỗi cụ thể; chúng không thay thế phép đo 27 case:

| Case | Trạng thái xác nhận | Bằng chứng |
|---|---|---|
| N01 | pass theo v7; artifact v6 ghi needs-review | [kết quả](run-2026-09-17T13-48-01-792Z/RESULTS.md) |
| N02 | pass theo v7; artifact v6 ghi needs-review | [kết quả](run-2026-09-17T13-29-39-310Z/RESULTS.md) |
| N10 | pass theo v7; artifact v6 ghi needs-review | [kết quả](run-2026-09-17T13-48-52-017Z/RESULTS.md) |
| N24 | pass theo v7; artifact v6 ghi needs-review | [kết quả](run-2026-09-17T13-32-03-309Z/RESULTS.md) |

N15 và N17 đã pass trong lượt đầy đủ theo tiêu chí fixture chẩn đoán. Hai case này kiểm tra cảnh báo nguồn cũ và biểu diễn mâu thuẫn, rồi dừng trước bước viết để dữ liệu giả không trở thành nội dung xuất bản.

## Thay đổi đã nghiệm thu

- Chuỗi provider là Groq chính, Gemini dự phòng; bỏ NVIDIA/DeepSeek.
- Danh sách model lấy theo model tài khoản thực sự truy cập được; model 404 đã bị loại.
- Khi một model Groq chạm 429, hệ thống chuyển sang model khác thay vì retry sớm và tiếp tục tiêu tốn cùng hạn mức.
- Lỗi chữ màn hình quá 40 ký tự được rút gọn cục bộ; raw output vẫn được giữ trong trace.
- Scraper bỏ ký hiệu footnote dạng superscript và giữ các đoạn liên quan sâu trong trang.
- So khớp bằng chứng chấp nhận khác biệt dấu câu nhưng vẫn yêu cầu cùng chuỗi từ.
- Câu chào, câu hỏi mở, phép tưởng tượng và câu chuyển tiếp được phân biệt với claim; câu giải thích thực tế vẫn cần mã thông tin.
- Fixture nguồn cũ và mâu thuẫn có tiêu chí riêng, không được dùng như bằng chứng thật để sinh nội dung xuất bản.

## Kiểm tra kỹ thuật đã đạt

- TypeScript typecheck
- ESLint
- Contract checks: 7/7
- Technical invariants: 11/11
- Quality pipeline checks
- Provider priority và bounded retry: 3/3, không gọi API thật

## Giới hạn khi bàn giao

Mười bốn case được tính pass theo tiêu chí phiên bản 7 nhưng chưa được người đối chiếu đầy đủ ngữ nghĩa claim với đoạn trích và tiêu chí riêng. Các sửa sau lượt đầy đủ chưa được xác nhận bằng một lượt 27 case mới vì người dùng yêu cầu dừng chạy. Số nghiệm thu theo quality bar hiện hành là **22/27 pass, 5 not-met**; kết quả review ngữ nghĩa được theo dõi riêng.
