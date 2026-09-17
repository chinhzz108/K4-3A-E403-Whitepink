# Đối chiếu yêu cầu CP3 — 17/09/2026

| Yêu cầu | Trạng thái và bằng chứng |
|---|---|
| Module quyết định dùng AI thật | Có: `codebase/lib/ai.ts` gọi NVIDIA, Groq hoặc Gemini; `eval/traces/ai-calls.jsonl` có prompt, phản hồi thô, model và thời gian của các lần gọi trước. Không coi trace cũ là bằng chứng bản Netlify hiện đang gọi được AI. |
| Golden set tối thiểu 20 ca | Có 27 ca trong `eval/golden_set.json`: 8 thường, 2 nguồn sự thật, 2 mơ hồ, 3 ngoài phạm vi, 2 nguồn cũ, 2 nguồn mâu thuẫn, 2 prompt injection, 6 hiếm. Nhóm hiếm vượt khoảng 2–4 ca trong yêu cầu. |
| Ít nhất 10 ca lấy trực tiếp từ dữ liệu thật đã cung cấp | **Chưa đạt: 0/10.** Trường `origin` của cả 27 ca ghi rõ tự soạn hoặc fixture tự dựng. Repo hiện không có thư mục dữ liệu hội thoại nguồn. Không đổi nhãn ca tự soạn thành ca dữ liệu thật khi thiếu đoạn trích và vị trí truy xuất. |
| Chạy và báo cáo lượt đầu | Có: `eval/run-cp3.mjs` và `eval/run_results.md`. Lượt đầu 4/27 = 14,81%; 22 fail, 1 needs-review. Sau rà soát N05 là fail, nhưng điểm số vẫn 4/27. Các ca pass chủ yếu là nhánh từ chối/HTTP lỗi, chưa chứng minh chất lượng kịch bản. |
| Video thao tác khoảng 30 giây | **Chưa có video.** `DEMO-GUIDE.md` mô tả cách quay từ phiên AI thật, không dùng phản hồi mẫu. |
| Website có thể gọi AI hiện tại | **Chưa đạt.** Ngày 17/09/2026, API trên `https://scriptscount.netlify.app/` trả lỗi thiếu API key, 0 câu kịch bản. Cần cấu hình key server-side trong Netlify rồi deploy lại và thử lại trước khi quay. |

## Việc cần làm để hoàn tất

1. Cung cấp bộ hội thoại/dữ liệu thật được phép sử dụng; trích tối thiểu 10 ca độc lập, ghi rõ file nguồn, vị trí và đoạn trích đã ẩn danh. Nhóm cần duyệt kỳ vọng từng ca trước khi thay đổi Golden set.
2. Cấu hình key AI trong Netlify, deploy lại, kiểm tra `/demo` sinh câu mới cùng `modelUsed` và `trace.aiRawResponse` trong response.
3. Chạy lại toàn bộ Golden set trên bản có AI, lưu response và cập nhật bảng kết quả. Giữ nguyên báo cáo lượt đầu để không làm sai lịch sử.
4. Quay màn hình thao tác thật khoảng 30 giây và nộp video cùng số đo qua form CP3. Repo không chứa quyền truy cập form hoặc bản quay.

Không khai báo CP3 đã hoàn tất cho đến khi có bằng chứng cho các mục còn thiếu.
