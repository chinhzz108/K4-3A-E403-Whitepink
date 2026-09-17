# CP3 — lượt chạy 2026-09-17T13-48-01-792Z

Tiêu chí đo: `scriptscout-eval/6-fixture-diagnostics`; triển khai: `scriptscout-pipeline/2026-09-17-provider-evidence-fixes`. 0/1 (0%) final pass; 0 chưa đạt tự động; 1 cần duyệt nội dung. Needs-review không tính pass. Các pass guard không phải bằng chứng AI viết đúng.

1 kịch bản đủ năm câu; 1 kịch bản đủ kiểm tra máy và chờ người duyệt; 1 case có ít nhất hai nguồn chọn; 4 lần đọc trang thành công (có thể trùng URL). N15 và N17 là fixture chẩn đoán: chấm cảnh báo nguồn cũ/mâu thuẫn rồi dừng trước khi viết để dữ liệu giả không thành nội dung xuất bản. N18 chỉ yêu cầu mô tả mâu thuẫn khi bằng chứng thực sự đối lập; người duyệt kiểm tra điều kiện này.

|Case|Lớp|Tự động|Duyệt|Kết quả cuối|Nguồn chọn|Câu có nguồn|Lý do|Trace|
|---|---|---|---|---|---:|---:|---|---|
|N01|thuong|needs-review|not-reviewed|needs-review|2|3|Trích dẫn khớp snapshot và cấu trúc đạt; cần người đối chiếu ý nghĩa từng câu và tiêu chí riêng của case|[JSON](N01.json)|