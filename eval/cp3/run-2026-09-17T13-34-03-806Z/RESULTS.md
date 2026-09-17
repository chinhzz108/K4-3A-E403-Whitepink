# CP3 — lượt chạy 2026-09-17T13-34-03-806Z

Tiêu chí đo: `scriptscout-eval/6-fixture-diagnostics`; triển khai: `scriptscout-pipeline/2026-09-17-provider-evidence-fixes`. 0/1 (0%) final pass; 1 chưa đạt tự động; 0 cần duyệt nội dung. Needs-review không tính pass. Các pass guard không phải bằng chứng AI viết đúng.

0 kịch bản đủ năm câu; 0 kịch bản đủ kiểm tra máy và chờ người duyệt; 1 case có ít nhất hai nguồn chọn; 2 lần đọc trang thành công (có thể trùng URL). N15 và N17 là fixture chẩn đoán: chấm cảnh báo nguồn cũ/mâu thuẫn rồi dừng trước khi viết để dữ liệu giả không thành nội dung xuất bản. N18 chỉ yêu cầu mô tả mâu thuẫn khi bằng chứng thực sự đối lập; người duyệt kiểm tra điều kiện này.

|Case|Lớp|Tự động|Duyệt|Kết quả cuối|Nguồn chọn|Câu có nguồn|Lý do|Trace|
|---|---|---|---|---|---:|---:|---|---|
|N17|nguon-mau-thuan|not-met|not-required|not-met|2|0|Không giữ đủ hai phía, thiếu mô tả mâu thuẫn hoặc tự chọn một số liệu là đúng|[JSON](N17.json)|