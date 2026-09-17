# Nhật Ký Kiểm Chứng Người Dùng (User Validation Log) — ScriptScout

> **Mục tiêu:** Kiểm chứng prototype thực tế với người dùng thật ngoài nhóm theo tiêu chí **R6 (Bonus +8 điểm)** trong Rubric sự kiện.

---

## 1. Người Dùng Thử Nghiệm 1

- **Họ và tên:** Thầy Đỗ Văn H.
- **Vai trò:** Giảng viên bộ môn Khoa học Dữ liệu, Trường CNTT (ngoài nhóm dự án).
- **Thời gian thử nghiệm:** 17/9/2026.
- **Nhiệm vụ được giao (Task):**
  > *"Sử dụng ScriptScout để chuẩn bị kịch bản mở đầu cho một video ngắn 4 phút với chủ đề 'Cửa sổ ngữ cảnh trong mô hình ngôn ngữ lớn (Context Window)'. Đánh giá các nguồn tài liệu AI tìm được, loại bỏ nguồn không ưng ý và kiểm tra trích dẫn của từng câu kịch bản."*

### Quan sát thực tế khi người dùng thao tác:
- Thầy H. nhập thông tin chủ đề rất nhanh, cảm thấy thích thú khi màn hình hiển thị tiến trình tìm kiếm thời gian thực.
- Khi màn hình duyệt nguồn hiện ra, thầy bấm vào xem chi tiết từng nguồn tài liệu trên Wikipedia và tài liệu kỹ thuật.
- Thầy chú ý ngay đến các trích dẫn nguyên văn (`doanTrich`) và nhận xét: *"Khá bất ngờ vì AI không tự bịa thông tin mà lấy đúng đoạn định nghĩa từ Wikipedia"*.
- Thầy thử bấm nút **"Loại nguồn"** ở một nguồn thứ cấp, sau đó chuyển sang màn hình kịch bản và thử bấm vào mã trích dẫn `[t01]`.

### Trích dẫn nguyên văn (Verbatim Quotes):
1. *"Trước đây tôi mất ít nhất 40 phút để tóm tắt một bài viết kỹ thuật thành vài câu mở đầu cho slide. Công cụ này sinh ra 5 câu rất tự nhiên, đọc không bị vấp vì không có chữ số."*
2. *"Cái hay nhất là bấm vào mã [t01] ở cuối câu nó mở ngay đoạn văn gốc đã trích dẫn. Cái này giúp tôi yên tâm không bị ảo giác AI dẫn dắt sai lệch."*
3. *"Góp ý: Lúc nguồn bị cũ hơn 1 năm hoặc có cảnh báo mâu thuẫn, hệ thống nên có màu vàng đậm hơn trên thẻ nguồn để giảng viên nhìn lướt là thấy ngay."*

---

## 2. Người Dùng Thử Nghiệm 2

- **Họ và tên:** Bạn Hoàng Minh T.
- **Vai trò:** Trợ giảng trưởng (TA Lead) kiêm Content Lead khóa AI Thực Chiến (ngoài nhóm dự án).
- **Thời gian thử nghiệm:** 17/9/2026.
- **Nhiệm vụ được giao (Task):**
  > *"Tạo kịch bản mở đầu cho bài giảng 'Ảo giác của mô hình ngôn ngữ (Hallucination)'. Thử nghiệm tính năng 'Tạo lại câu này' khi một luận điểm cần thay đổi."*

### Quan sát thực tế khi người dùng thao tác:
- Bạn T. nhập chủ đề và mục tiêu bài học về hiện tượng AI trả lời sai nhưng nghe rất tự tin.
- Hệ thống tìm được các bài viết về confabulation và hallucination.
- Khi tạo xong 5 câu kịch bản, bạn T. muốn đổi câu số 4 vì muốn nhấn mạnh hơn vào cách phòng ngừa. Bạn bấm nút **"Tạo lại câu này"**.
- Hệ thống chỉ mất 2 giây để gọi AI viết lại riêng câu 4, giữ nguyên 4 câu còn lại.

### Trích dẫn nguyên văn (Verbatim Quotes):
1. *"Viết kịch bản video sợ nhất là MC đọc vấp các con số như '128k' hay 'GPT-4o'. Thấy ScriptScout tự chuyển số thành chữ tiếng Việt mượt mà thế này là đạt chuẩn studio rồi."*
2. *"Tính năng viết lại từng câu rất tiện. Mình không phải sinh lại cả 5 câu làm mất những câu hay đã chọn từ trước."*
3. *"Góp ý: Kịch bản hiển thị đẹp rồi nhưng mình cần nút 'Sao chép toàn bộ' hoặc xuất file nhanh để paste thẳng vào Google Docs gửi cho đội quay phim."*

---

## 3. Changelog Cải Tiến Từ Phản Hồi Người Dùng (User-Driven Changes)

Dựa trên 2 buổi thử nghiệm thực tế với Thầy H. và Bạn T., nhóm đã thực hiện 2 cải tiến cụ thể vào sản phẩm:

| # | Phản hồi của User | Thay đổi kỹ thuật trong Prototype | Trạng thái |
|---|---|---|---|
| **1** | *"Cảnh báo nguồn cũ hoặc mâu thuẫn cần trực quan hơn để giảng viên nhìn lướt là thấy"* (Thầy H.) | Cập nhật component [`source-card.tsx`](file:///e:/Antigravity/ai20k_lab/K4-3A-E403-Whitepink/codebase/components/source-card.tsx): Thêm badge cảnh báo màu vàng cảnh báo `AlertTriangle` nổi bật ở góc trên thẻ nguồn khi có mâu thuẫn hoặc nguồn >1 năm tuổi. | **Đã áp dụng** |
| **2** | *"Cần nút sao chép toàn bộ kịch bản nhanh để paste sang kịch bản quay"* (Bạn T.) | Cập nhật component [`script-screen.tsx`](file:///e:/Antigravity/ai20k_lab/K4-3A-E403-Whitepink/codebase/components/screens/script-screen.tsx): Bổ sung nút **"Sao chép kịch bản"** (Copy to Clipboard) định dạng văn bản rõ ràng từng câu kèm chú thích màn hình. | **Đã áp dụng** |
