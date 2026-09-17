# Kế hoạch cải tiến ScriptScout — bản nháp để nhóm duyệt

## Trạng thái thực hiện — 2026-09-17

Nhóm đã thông qua và triển khai phần 1–2 ở mức code: runner tách trạng thái tự động/duyệt/kết quả cuối; N19 được chấm theo nhánh loại injection; trace có runId, caseId, phase và cả output bị từ chối. Nghiên cứu nguồn bắt buộc có schema `nguon` + `thongTin` hợp lệ; bước viết và viết lại câu bị chặn khi không còn thông tin có bằng chứng; output script sai schema có tối đa một lượt sửa. Đã qua kiểm tra offline (7/7 contract, 11/11 invariant) và hồi quy fixture N19 (1/1, không gọi AI). Ngày 2026-09-17, nhóm chốt tiêu chí `scriptscout-eval/7-review-advisory`: case đạt toàn bộ kiểm tra tự động được tính `pass`; review ngữ nghĩa là khuyến nghị và không chặn pass. Chưa chạy lại 27 case sau thay đổi tiêu chí này.

## Mục tiêu và baseline

Tăng số kịch bản có nguồn hỗ trợ đúng nghĩa, giảm lỗi schema và thời gian chờ. Tiêu chí hiện hành tính `pass` khi case đạt toàn bộ kiểm tra tự động áp dụng cho case; trạng thái chờ review ngữ nghĩa trước đây được chuyển thành `pass` kèm khuyến nghị review.

Baseline: lượt `cp3/run-2026-09-17T08-15-24-579Z`, 4 pass / 27, 18 fail, 5 needs-review; 11 case có đủ năm câu. Bộ chấm hiện chỉ tự gán pass cho bốn case guard nên X/N chưa phải độ chính xác nội dung. Giữ nguyên toàn bộ dữ liệu và báo cáo cũ.

## 1. Làm rõ phép đo và gắn trace — thực hiện đầu tiên

- Tách `automatedStatus`, `reviewStatus`, `finalStatus`; khi đủ kiểm tra tự động áp dụng cho case, đặt `automatedStatus=pass`, `reviewStatus=recommended`, `finalStatus=pass`.
- Giữ runner/bộ case và báo cáo phiên bản cũ để đối chiếu. Ghi thay đổi bằng phiên bản `scriptscout-eval/7-review-advisory`; không sửa ngược dữ liệu lượt chạy cũ.
- Nhóm duyệt nhánh từ chối N19, cảnh báo nguồn cũ N15, thiết kế fixture N17 và yêu cầu mâu thuẫn N18. Không buộc AI bịa mâu thuẫn khi nguồn không đối lập.
- Thêm runId/caseId/phase/callId, model/provider, thời gian và lý do fallback vào từng lời gọi. Lưu raw output cả khi validation từ chối; không lưu key/header.
- Kiểm chứng: mỗi case truy được các lời gọi của chính nó; review khuyến nghị không chặn pass; không mất lỗi gốc hoặc các kiểm tra tự động.

## 2. Chặn lỗi dữ liệu giữa nghiên cứu nguồn và viết — ưu tiên cao nhất trong code

- Validate schema nguồn + thông tin trích xuất ngay sau phản hồi AI; không dùng mảng rỗng để che trường thiếu.
- Không gọi viết khi không có thông tin có bằng chứng hợp lệ. Thử sửa/trích xuất lại tối đa một lần, nếu vẫn lỗi trả trạng thái thiếu bằng chứng rõ ràng.
- Ràng buộc mã thông tin hợp lệ, đủ năm câu, yDoHinh và các trường bắt buộc. Thông báo lỗi đúng field; một lượt sửa có giới hạn và validate lại đầy đủ.
- Không tự đổi n01 thành t01 vì quan hệ nguồn–thông tin có thể nhiều–nhiều.
- Case hồi quy: N05/N06/N23 (thiếu thongTin, sai mã), N10/N21/N24 (yDoHinh rỗng). Dùng output lỗi đã lưu để kiểm tra offline trước, sau đó gọi AI thật trên nhóm này.

## 3. Tìm đủ nguồn đọc được và giữ nguồn hữu ích

- Trộn ứng viên từ hai truy vấn, loại URL trùng, ưu tiên tài liệu gốc liên quan. Đọc ba nguồn trước; nếu thiếu nguồn dùng được, đọc bổ sung theo ngân sách.
- Mức thử nghiệm đề xuất: tối đa tám URL ứng viên và khoảng ba nguồn chọn, có timeout/tổng ngân sách rõ ràng; chưa coi đây là quality bar.
- Trích nội dung chính và đoạn liên quan thay vì chỉ lấy đầu trang; giữ nguyên văn, vị trí đoạn và phần bị cắt trong trace. Không tự tăng toàn bộ prompt vô hạn.
- Phân biệt ví dụ injection được trích trong bài phòng vệ với chỉ lệnh can thiệp. Mọi nội dung web vẫn là dữ liệu không tin cậy; giữ case đối kháng để bảo đảm không làm theo lệnh trong trang.
- Case hồi quy: N01–N04, N07–N08, N20; đồng thời chạy N19 để tránh mất khả năng phát hiện tấn công thật.

## 4. Kiểm chứng nội dung và giới hạn thẩm quyền

- Truyền ngày nguồn, phạm vi số liệu và cảnh báo vào bước viết; câu phải giữ điều kiện/phạm vi của bằng chứng.
- Kiểm từng claim với quote; AI kiểm chứng chỉ hỗ trợ phát hiện lỗi, không mặc định thay người duyệt golden set.
- Khi không đủ bằng chứng, bỏ/viết lại claim hoặc nêu giới hạn. Không bịa ngày, không dùng chữ “mới nhất” khi chưa có căn cứ.
- Yêu cầu bỏ qua giảng viên hoặc tự xuất bản phải được xử lý trước tìm web: chỉ tạo nháp, giữ bước duyệt của con người.
- Case hồi quy: N09/N13/N16/N22/N25. Thêm kiểm tra loại nguồn: chỉ câu phụ thuộc được viết lại, câu khác giữ nguyên.

## 5. Đo và điều chỉnh DeepSeek/fallback

- Giữ thứ tự ưu tiên DeepSeek → Groq → Gemini theo yêu cầu người dùng.
- Dùng tập nhỏ cố định có đủ pha lập truy vấn, đánh giá nguồn và viết; đo latency, timeout, output hợp lệ, mức dùng token và provider thực sự trả kết quả.
- Thử từng thay đổi riêng (ngân sách output, model được dịch vụ hỗ trợ, timeout), không chỉ tăng timeout để che lỗi. Model khác chỉ dùng sau khi xác minh khả dụng.
- Đặt ngân sách thời gian toàn luồng và số lượt sửa/fallback hữu hạn; hiển thị provider thực tế trong bằng chứng demo.
- Không kết luận tăng chất lượng model từ tỷ lệ pass của cả pipeline có fallback.

## 6. Chạy lại và quyết định bàn giao

1. Chạy offline schema/trace/fixture trước; không phát sinh chi phí API cho lỗi xác định được cục bộ.
2. Chạy nhóm hồi quy có mục tiêu sau mỗi nhóm sửa. Không chọn lại case chỉ vì cho kết quả đẹp.
3. Chạy đủ 27 case trên phiên bản cuối và lưu mọi thất bại. Nếu thay case/tiêu chí, lưu thành phiên bản riêng và ghi rõ khác biệt.
4. Người trong nhóm có thể duyệt claim–quote và tiêu chí riêng, ghi reviewer, quyết định và lý do; kết quả này được báo cáo riêng và không đổi trạng thái pass tự động.
5. Báo cáo pass/27, not-met và số pass được khuyến nghị review; thêm số kịch bản hợp lệ, số nguồn dùng được, tỷ lệ claim được hỗ trợ và latency theo pha. Phân biệt kết quả máy và kết quả được người xác nhận.
6. Quay lại demo thật sau khi luồng ổn định. Không tự commit/push/nộp nếu chưa được yêu cầu cho đợt sửa.

## Phân công và điểm cần con người quyết định

- Agent: sửa code/trace, xây kiểm tra hồi quy, chạy eval, phân tích và chuẩn bị báo cáo.
- Nhóm: có thể duyệt tiêu chí N15/N17/N18/N19 và ngữ nghĩa nội dung; hỏi TA về nguồn gốc chatlog; duyệt video và nộp.
- Quality bar kỹ thuật đã chốt theo phiên bản 7; tỷ lệ hiện hành được tính trên kết quả tự động, còn kết quả review ngữ nghĩa được công bố riêng.

Phần 1–2 và thay đổi quality bar đã có trong code; các phần còn lại vẫn là kế hoạch. Chưa chạy AI mới sau thay đổi tiêu chí.
