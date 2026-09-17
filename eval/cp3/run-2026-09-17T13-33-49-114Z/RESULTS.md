# CP3 — lượt chạy 2026-09-17T13-33-49-114Z

Tiêu chí đo: `scriptscout-eval/6-fixture-diagnostics`; triển khai: `scriptscout-pipeline/2026-09-17-provider-evidence-fixes`. 1/1 (100%) final pass; 0 chưa đạt tự động; 0 cần duyệt nội dung. Needs-review không tính pass. Các pass guard không phải bằng chứng AI viết đúng.

0 kịch bản đủ năm câu; 0 kịch bản đủ kiểm tra máy và chờ người duyệt; 0 case có ít nhất hai nguồn chọn; 1 lần đọc trang thành công (có thể trùng URL). N15 và N17 là fixture chẩn đoán: chấm cảnh báo nguồn cũ/mâu thuẫn rồi dừng trước khi viết để dữ liệu giả không thành nội dung xuất bản. N18 chỉ yêu cầu mô tả mâu thuẫn khi bằng chứng thực sự đối lập; người duyệt kiểm tra điều kiện này.

|Case|Lớp|Tự động|Duyệt|Kết quả cuối|Nguồn chọn|Câu có nguồn|Lý do|Trace|
|---|---|---|---|---|---:|---:|---|---|
|N15|nguon-cu|pass|not-required|pass|1|0|Phát hiện ngày và cảnh báo nguồn cũ; fixture không được coi là thông tin đã xác minh và không sinh kịch bản xuất bản|[JSON](N15.json)|