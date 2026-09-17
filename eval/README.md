# Eval CP3 — tiêu chí hiện hành và lịch sử đo

Tiêu chí hiện hành là `scriptscout-eval/7-review-advisory`: case đạt toàn bộ kiểm tra tự động được tính `pass`; review ngữ nghĩa là khuyến nghị và không chặn pass. Áp dụng quy tắc này lên [kết quả đầy đủ gần nhất](cp3/run-2026-09-17T13-36-53-362Z/RESULTS.md) cho **22/27 pass (81,48%)** và 5 not-met. Con số 22 gồm 8 pass cùng 14 needs-review của tiêu chí phiên bản 6 được tái phân loại thành pass; đây là phép đổi tiêu chí trên dữ liệu đã lưu, không phải lượt gọi API mới.

Lượt đầy đủ được tạo bằng tiêu chí `scriptscout-eval/6-fixture-diagnostics` và lưu nguyên trạng **8 pass, 14 needs-review, 5 not-met**. Sau lượt này, N01, N02, N10 và N24 được chạy lại riêng và đạt `needs-review` theo phiên bản 6; theo phiên bản 7, từng kết quả đó được tính là pass, nhưng không cộng các lượt riêng vào mẫu số của lượt đầy đủ. Xem [biên bản nghiệm thu trạng thái hiện tại](cp3/ACCEPTANCE-2026-09-17.md).

## Lịch sử baseline

Lượt chạy lại với DeepSeek → Groq → Gemini: [27 case](cp3/run-2026-09-17T08-15-24-579Z/RESULTS.md), [rà soát và lỗi](cp3/run-2026-09-17T08-15-24-579Z/REVIEW.md). **4/27 = 14,81%**, 18 fail, 5 needs-review; chưa tính needs-review là pass. Giữ nguyên báo cáo lượt đầu bên dưới.

Phiên bản runner mới tách `automatedStatus`, `reviewStatus` và `finalStatus`; có trace runId/caseId/phase và lưu lượt output bị từ chối. Kiểm tra không gọi AI: `npm run test:contracts`, rồi `npm run test:invariants`.

Bảng lượt đầu theo tên BTC: [run_results.md](run_results.md). Kiểm tra sau chuyển mã vào `codebase/`: [REORGANIZATION-CHECK.md](REORGANIZATION-CHECK.md).

`golden_set.json`: 27 case, gồm 8 thường; 2 nguồn sự thật; 2 mơ hồ; 3 ngoài phạm vi/thẩm quyền; 2 nguồn cũ; 2 mâu thuẫn; 2 injection; 6 hiếm. Có input, kỳ vọng, nguồn gốc và điều kiện đạt/trượt từng case. Các case do nhóm/agent tự soạn, một số lấy cảm hứng từ chủ đề BTC; **không phải case từ chatlog**. Nhóm cần hỏi TA liệu nguồn gốc này phù hợp C3 hay cần bổ sung chatlog thật.

```powershell
npm run dev
# Terminal thứ hai
node eval/run-cp3.mjs
node eval/run-cp3.mjs N01
npm run test:contracts
npm run test:invariants
```

Runner mới không cần tải `tsx`, đọc chính sách trạng thái từ `golden_set.json` và lưu từng response ngay sau mỗi case trong `eval/cp3/run-*/`. Bảng `RESULTS.md` có link trace từng case; `summary.json` có X/N, phần trăm và số pass được khuyến nghị review. Khi mọi kiểm tra tự động đều đạt, runner ghi `automatedStatus=pass`, `reviewStatus=recommended`, `finalStatus=pass`. So khớp NFC/khoảng trắng với snapshot đã đọc; review ngữ nghĩa vẫn được theo dõi riêng.

Lượt đầy đủ đầu của lần bàn giao này: [RESULTS](cp3/run-2026-09-16T19-27-30-985Z/RESULTS.md): **4/27 = 14,81%**, 22 fail, 1 needs-review. Pass là N11, N12, N26, N27 (validation/link lỗi), không phải bốn kịch bản đạt chất lượng. Các lượt cũ trong `eval/results/` được giữ nguyên nhưng runner cũ có pass lỏng; không dùng số cũ để tuyên bố đạt CP3.

## Đối chiếu nội dung và lỗi chính

1. **Trích dẫn đúng chuỗi nhưng sai ý.** N05 lượt đầu cần chuyển từ needs-review sang fail sau khi đọc: câu 4 nói “năm hai không bốn” trong khi bằng chứng nói 2024; câu 5 đưa lời khuyên không có mã nguồn. Lần N01 sau sửa (`run-2026-09-16T19-30-29-684Z`) có t02 nói cửa sổ cố định/loại tin đầu, nhưng đoạn n02 chỉ mô tả mô hình ngôn ngữ. Vì vậy vẫn không pass. Bảng máy ban đầu được giữ nguyên; kết luận sau kiểm tra là **4/27 pass, 23/27 chưa đạt**. Cần kiểm ngữ nghĩa claim–quote, lời nói và lời khuyên; đã sửa prompt viết để đọc đoạn gốc thay vì tin tóm tắt do AI suy diễn.
2. **Dịch vụ và độ phủ nguồn.** Serper trả 403, Groq có 429/413, Gemini từng trả 404 cho model không còn hỗ trợ. Đã dùng Wikipedia Search động, giới hạn ba trang × 2.800 ký tự và model Gemini mà API chỉ ra còn hỗ trợ. Đây là nguồn thứ cấp, thường cùng tổ chức; không đủ xác nhận độc lập. Sửa tiếp: key tìm kiếm hợp lệ, đọc tài liệu gốc từ references, điều tiết token/phút và retry có backoff. Không thay URL bằng dữ liệu mẫu `.test`.
3. **Chấm fixture quá chặt ở nhánh từ chối.** N19 đã phát hiện và loại injection, nhưng runner lượt đầu vẫn yêu cầu năm câu dù toàn bộ nguồn bị loại. Đây là lỗi bộ chấm (false negative), không được âm thầm đổi điểm lượt đầu. Invariants xác nhận lại reject injection/403/404, quote mismatch và loại fact phụ thuộc nguồn. Nhóm cần duyệt kỳ vọng cho các nhánh từ chối trước lượt tiếp theo.

## Fixture

- `codebase/public/fixtures/prompt-injection.html`: chỉ lệnh ẩn tự dựng; không coi là hướng dẫn hệ thống.
- `contradicting-a.html`, `contradicting-b.html`: hai số liệu giả có **mẫu khảo sát khác nhau**. Kỳ vọng phải nêu khác phạm vi, không tự kết luận một số sai. Không dùng để giảng như số liệu thực.
- `old-source.html`: bảng giá giả chỉ hiệu lực năm 2023.
- `/fixtures/unreadable.html`: route HTTP 403.
- `/fixtures/missing.html`: cố ý không có file, trả 404.

Fixture mode chỉ chấp nhận URL localhost định dạng đã giới hạn, bỏ qua tìm web để không trộn dữ liệu giả và thật. Traces đánh dấu `fixtureMode`. Các kiểm tra kỹ thuật trong `invariants.json` tách riêng, không cộng vào golden-set X/N.

## Bằng chứng và giới hạn

`eval/traces/ai-calls.jsonl` lưu provider/model/request ID/usage/thời điểm; các call sau khi bổ sung audit còn có prompt và output. Không lưu header hoặc key. Research trace lưu nội dung đã đọc (phần cắt tối đa 2.800 ký tự), không phải toàn bộ trang. Script trace nối mã câu → mã thông tin → mã nguồn → đoạn trích; URL nằm trong hồ sơ nguồn. Giao diện có xuất JSON.

Quality bar tự động đã chốt theo phiên bản 7. Chưa có đánh giá mù từ giảng viên hoặc kết quả review ngữ nghĩa đầy đủ; tỷ lệ 22/27 mô tả mức đạt tiêu chí tự động của nhóm.
