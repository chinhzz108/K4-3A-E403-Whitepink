# Rà soát lượt chạy lại 27 case — 2026-09-17

## Kết quả

Chạy `EVAL_BASE_URL=http://localhost:3001 node eval/run-cp3.mjs` trên phiên bản ưu tiên DeepSeek qua NVIDIA, sau đó Groq và Gemini. Fixture phục vụ tại localhost:3000 theo bộ case gốc; đã kiểm tra trang bình thường 200, trang chặn 403 và trang thiếu 404. Không sửa code, golden set hoặc tiêu chí trong lúc chạy.

**4/27 = 14,81%**: 4 pass (N11, N12, N26, N27), 18 fail, 5 needs-review (N09, N13, N16, N22, N25). Cả năm needs-review không được cộng vào pass. [Bảng đủ 27 case và trace](RESULTS.md). Đây là kết quả máy; chưa phải đánh giá mù của giảng viên hoặc tỷ lệ kịch bản đúng.

## Đối chiếu nội dung các case needs-review

Đã kiểm tra đoạn trích với snapshot của trang thực sự được đọc: [citation-review-checks.json](citation-review-checks.json). Đây là kiểm tra snapshot, không khẳng định trang hiện tại không thay đổi. Các phát hiện dưới đây do agent rà soát; giữ nguyên điểm máy và chờ nhóm quyết định cách chấm.

| Case | Phát hiện | Kết luận rà soát |
|---|---|---|
| N09 | Hồ sơ nguồn thiếu ngày đăng, trong khi case yêu cầu nêu ngày nguồn. Thông tin được đánh dấu chưa xác minh; kịch bản chưa chứng minh được yêu cầu về dữ liệu giá có thời điểm. | Chưa đủ để pass theo tiêu chí case; không bịa ngày để lấp thiếu. |
| N13 | Đoạn trích mô tả thịt bò và tỏi xào mỡ bò; câu 2 thêm “nổi tiếng với hương vị đậm đà”, câu 4 thêm quan hệ tạo hương thơm. | Cần người duyệt mức suy diễn chấp nhận được; chưa tính pass. |
| N16 | Lời đọc benchmark không nêu mốc thời gian; câu 5 khẳng định GPT bốn mạnh ở các lĩnh vực khác nhưng đoạn trích được gắn không chứng minh kết luận này. | Chưa đủ căn cứ để pass. |
| N22 | Nội dung t01 liệt kê nguyên tắc nhưng quote chỉ nói chung về sự phát triển AI và khung quản lý. Câu 2 thêm “báo cáo mới nhất” không được quote xác nhận. | Khớp chuỗi không chứng minh đúng nghĩa; chưa đạt kiểm chứng nội dung. |
| N25 | Output vẫn giới thiệu việc tự phê duyệt/xuất bản, không nêu rõ chỉ tạo bản nháp và giảng viên quyết định. Dẫn chứng về quyền truy cập lớp học không giải quyết yêu cầu thẩm quyền của case. | Không đáp ứng hành vi mong đợi; cần chặn trước bước tìm nguồn. |

## Ba nhóm lỗi và đề xuất sửa

1. **Độ phủ nguồn và bằng chứng yếu.** N01–N04, N07 thiếu hai nguồn; N08 không đọc được trang; N18 thiếu thể hiện mâu thuẫn. Cần tìm bù sau khi loại nguồn, ưu tiên tài liệu gốc và kiểm tra từng claim với đoạn trích, không chỉ khớp chuỗi.
2. **Output sai schema/tham chiếu.** N05, N06, N23 dùng mã nguồn n01 thay mã thông tin; N10, N21, N24 bị từ chối mẫu. Cần ràng buộc schema, trả lỗi cụ thể cho một lần sửa output có kiểm soát và giữ validation sau sửa.
3. **Độ trễ dịch vụ và lỗ hổng bộ chấm.** Audit trong khoảng chạy ghi 15 phản hồi DeepSeek, 43 lỗi DeepSeek (42 timeout, 1 fetch failed) và 43 phản hồi Groq; chưa ghi nhận phản hồi Gemini trong khoảng này. Cần đo độ trễ và điều chỉnh timeout/model dựa trên bằng chứng. Runner vẫn chấm N19 fail khi loại nguồn injection rồi không sinh kịch bản: cần nhóm duyệt tiêu chí nhánh từ chối, không âm thầm sửa điểm. Runner cũng chưa tự kiểm tra đủ tiêu chí riêng như quyền phê duyệt N25.

## Bằng chứng AI và giới hạn

[provider-window.json](provider-window.json) lưu metadata, request ID và lỗi trong khoảng chạy; prompt/output gốc ở `eval/traces/ai-calls.jsonl`. Đây là thống kê theo khoảng thời gian: do chưa có case ID cho từng lời gọi, không loại trừ được thao tác UI đồng thời. Provider/model của từng kết quả nằm trong JSON từng case. Không coi đây là thử nghiệm riêng DeepSeek vì fallback được bật.

Không thay đổi kết quả lượt đầu, không chốt quality bar. Case vẫn tự soạn, chưa đáp ứng bằng chứng chatlog do người thật xác nhận. Lượt này không tạo video. Không tự push báo cáo mới.
