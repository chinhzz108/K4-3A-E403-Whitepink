# Hướng dẫn quay video demo 30 giây — CP3

> Phần lịch quay ban đầu dưới đây là dự kiến chưa đo; dùng mục “Luồng đã kiểm tra” cuối file. Không có mock output fallback trong bản hiện tại.

## Chuẩn bị

1. Chạy server: `npm run dev`
2. Mở trình duyệt tại `http://localhost:3000`
3. Đảm bảo `codebase/.env.local` có ít nhất một key AI thật (`NVIDIA_API_KEY`, `GROQ_API_KEY` hoặc `GOOGLE_API_KEY`). `SERPER_API_KEY` giúp tìm nguồn web; khi thiếu hoặc dịch vụ lỗi, ứng dụng có thể dùng Wikipedia Search.
4. Mở phần mềm quay màn hình (OBS, Xbox Game Bar, hoặc ShareX)

## Kịch bản quay (30 giây)

### Giây 0–5: Nhập thông tin
- Đã điền sẵn chủ đề: ví dụ "Cửa sổ ngữ cảnh của mô hình ngôn ngữ"
- Bấm **"Bắt đầu nghiên cứu"**

### Giây 5–12: AI đang tìm nguồn
- Màn hình hiện progress: "Đang tìm kiếm nguồn trên web..."
- Agent activity timeline chạy qua các bước
- Đợi đến khi hiện "X nguồn đã đánh giá"

### Giây 12–15: Duyệt nguồn
- Bấm **"Duyệt nguồn"**
- Thấy danh sách nguồn thật với URL, tác giả, điểm tin cậy
- (Nhanh) bấm loại 1 nguồn nếu kịp

### Giây 15–20: Tạo kịch bản
- Bấm **"Tạo kịch bản"**
- AI viết 5 câu — chờ vài giây

### Giây 20–28: Xem kịch bản + citation
- Thấy 5 câu kịch bản hiện ra với mã nguồn [t01], [t02]...
- Bấm vào **[t01]** hoặc bất kỳ mã nào
- Panel citation mở ra: thấy URL nguồn thật + đoạn trích bằng chứng

### Giây 28–30: Kết thúc
- Đóng panel

## Mẹo quay tốt

- **Zoom browser 125–150%** để chữ rõ trên video
- **Thu nhỏ cửa sổ** về ~1280x720 để video không quá to
- **Ghi đè input sẵn** trước khi bấm record
- **Không cần lồng tiếng** — CP3 chỉ cần quay thao tác
- Nếu AI chậm, giữ video nguyên tốc độ; quay lại khi dịch vụ đáp ứng, không ghép kết quả giả

## Chạy không có key

Nếu không có API key, hệ thống báo lỗi và không sinh kịch bản.
Không dùng một lần chạy lỗi làm bằng chứng AI trả kết quả.

Trên Netlify, thêm key vào **Project configuration → Environment variables** rồi deploy lại. Ngày 17/09/2026, `https://scriptscount.netlify.app/api/generate-script` trả về “Chưa cấu hình API Key” khi dùng dữ liệu từ `/api/demo`; trang web hiện chưa đủ điều kiện quay video AI thật. Không đưa key vào Git hoặc quay màn hình phần cấu hình key.

## Fallback

Nếu Serper API hết quota, có thể:
1. Dùng Google Custom Search thay thế
2. Bản hiện tại tìm Wikipedia động khi Serper lỗi; /demo chỉ dùng snapshot đã tìm thật trước đó và ghi rõ.


## Luồng đã kiểm tra trong lần bàn giao này (ưu tiên dùng)

1. Chạy npm run dev và mở http://localhost:3000/demo. Trang nạp hồ sơ ba nguồn Wikipedia thật từ trace đã đọc trước; không nạp câu trả lời mẫu. Duyệt checkbox và mở Hồ sơ trước khi quay. Nguồn thứ cấp cùng tổ chức, không coi là xác nhận độc lập.
2. Bắt đầu quay cửa sổ trình duyệt bằng OBS/ShareX. Không quay file môi trường hoặc terminal chứa key.
3. Giây 0–3: cho thấy hồ sơ đã duyệt và bấm **Chạy**.
4. Giây 3–18: chờ AI trả năm câu; màn hình ghi provider, thời gian và trace ID thật. Lần kiểm tra đã trả kết quả Groq trong **3,9 giây**, trace-script-1789587252965. Thời gian lần tới không được bảo đảm.
5. Giây 18–27: bấm câu 2, thấy URL Context_window và đoạn tiếng Anh nguyên văn hỗ trợ.
6. Giây 27–30: giữ màn hình để người xem đọc. Kết thúc quay.

Nếu 429/timeout hoặc AI chậm: giữ bản quay nguyên tốc độ để chứng minh; quay lại khi hạn mức phục hồi. Không dựng câu trả lời, không thay thời gian chờ bằng ảnh kết quả. Không dùng video mock cho CP3. Có thể nộp thêm bản dài và hỏi TA cách xử lý giới hạn 30 giây.

Luồng đầy đủ ở trang / cho nhập bốn trường → tìm → duyệt → viết. Ở màn hình kịch bản, Loại nguồn sẽ đánh dấu các câu phụ thuộc; bấm Tạo lại câu này. Những câu khác giữ nguyên. Xuất kịch bản và trace sau khi sửa.

**Chưa tạo video trong lần bàn giao:** công cụ trình duyệt hiện tại chỉ có ảnh chụp, không có API ghi video; cần người quay thật. Đã kiểm tra trực tiếp thao tác Chạy → năm câu mới → mở citation. Nội dung vẫn là bản nháp: mẫu demo còn thuật ngữ token chưa giải nghĩa ở lần đầu và câu cuối suy diễn quá đoạn trích; không dùng clip để tuyên bố nội dung đã pass.
