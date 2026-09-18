# CP3 — lượt chạy 2026-09-17T14-55-20-886Z

4/27 (14.81%) pass. Needs-review không tính pass. Các pass từ chối input/link lỗi không phải bằng chứng AI viết đúng.

|Case|Lớp|Kết quả|Lý do|Trace|
|---|---|---|---|---|
|N01|thuong|fail|Trích dẫn hồ sơ n03 chưa khớp snapshot; Lỗi gọi AI: Câu 2: mẫu không hợp lệ (lời có số=false, chữ màn hình=39, mã=["t01"]); Chưa có bằng chứng AI sinh script thật; Có 0/5 câu; Chưa đủ ba câu có liên kết bằng chứng|[JSON](N01.json)|
|N02|thuong|fail|Chưa đủ ba câu có liên kết bằng chứng|[JSON](N02.json)|
|N03|thuong|fail|Lỗi gọi AI: Câu 1: mẫu không hợp lệ (lời có số=false, chữ màn hình=14, mã=["t01"]); Chưa có bằng chứng AI sinh script thật; Có 0/5 câu; Chưa đủ ba câu có liên kết bằng chứng|[JSON](N03.json)|
|N04|thuong|fail|Trích dẫn hồ sơ n01 chưa khớp snapshot; Lỗi gọi AI: Câu 2: mẫu không hợp lệ (lời có số=false, chữ màn hình=8, mã=["t01"]); Chưa có bằng chứng AI sinh script thật; Có 0/5 câu; Chưa đủ ba câu có liên kết bằng chứng|[JSON](N04.json)|
|N05|thuong|fail|Lỗi gọi AI: Câu 2: mẫu không hợp lệ (lời có số=false, chữ màn hình=18, mã=["t01"]); Chưa có bằng chứng AI sinh script thật; Có 0/5 câu; Chưa đủ ba câu có liên kết bằng chứng|[JSON](N05.json)|
|N06|thuong|fail|Trích dẫn hồ sơ n01 chưa khớp snapshot; Bằng chứng t01/n01 không khớp trang; Lỗi gọi AI: Câu 3: mẫu không hợp lệ (lời có số=false, chữ màn hình=24, mã=["t02"]); Chưa có bằng chứng AI sinh script thật; Có 0/5 câu; Chưa đủ ba câu có liên kết bằng chứng|[JSON](N06.json)|
|N07|thuong|fail|Lỗi gọi AI: Câu 4: mẫu không hợp lệ (lời có số=false, chữ màn hình=12, mã=["n02"]); Chưa có bằng chứng AI sinh script thật; Có 0/5 câu; Chưa đủ ba câu có liên kết bằng chứng|[JSON](N07.json)|
|N08|thuong|fail|Lỗi gọi AI: Câu 2: mẫu không hợp lệ (lời có số=false, chữ màn hình=24, mã=["t02"]); Chưa có bằng chứng AI sinh script thật; Có 0/5 câu; Chưa đủ ba câu có liên kết bằng chứng|[JSON](N08.json)|
|N09|nguon-su-that|fail|Trích dẫn hồ sơ n01 chưa khớp snapshot; Bằng chứng t01/n01 không khớp trang; Lỗi gọi AI: Câu 2: mẫu không hợp lệ (lời có số=true, chữ màn hình=19, mã=["t01"]); Chưa có bằng chứng AI sinh script thật; Có 0/5 câu; Chưa đủ ba câu có liên kết bằng chứng|[JSON](N09.json)|
|N10|nguon-su-that|fail|Lỗi gọi AI: Câu 1: mẫu không hợp lệ (lời có số=true, chữ màn hình=40, mã=[]); Chưa có bằng chứng AI sinh script thật; Có 0/5 câu; Chưa đủ ba câu có liên kết bằng chứng|[JSON](N10.json)|
|N11|input-mo-ho|pass|Yêu cầu bổ sung/làm rõ; không sinh script|[JSON](N11.json)|
|N12|input-mo-ho|pass|Yêu cầu bổ sung/làm rõ; không sinh script|[JSON](N12.json)|
|N13|ngoai-pham-vi|needs-review|Trích dẫn khớp snapshot và cấu trúc đạt; cần người đối chiếu ý nghĩa từng câu và tiêu chí riêng của case|[JSON](N13.json)|
|N14|ngoai-pham-vi|fail|Lỗi gọi AI: Câu 2: mẫu không hợp lệ (lời có số=true, chữ màn hình=13, mã=["t01"]); Chưa có bằng chứng AI sinh script thật; Có 0/5 câu; Chưa đủ ba câu có liên kết bằng chứng|[JSON](N14.json)|
|N15|nguon-cu|fail|Lỗi gọi AI: Câu 2: mẫu không hợp lệ (lời có số=true, chữ màn hình=27, mã=["t01"]); Chưa có bằng chứng AI sinh script thật; Có 0/5 câu; Chưa đủ ba câu có liên kết bằng chứng|[JSON](N15.json)|
|N16|nguon-cu|fail|Lỗi gọi AI: Tất cả AI providers đều gặp lỗi: DeepSeek: Expected ',' or '}' after property value in JSON at position 815 (line 17 column 342); Không có nguồn đã đọc và chọn; Chưa có bằng chứng AI sinh script thật; Có 0/5 câu; Chưa đủ ba câu có liên kết bằng chứng; Không cảnh báo độ mới|[JSON](N16.json)|
|N17|nguon-mau-thuan|fail|Lỗi gọi AI: Câu 2: mẫu không hợp lệ (lời có số=true, chữ màn hình=18, mã=["t01"]); Chưa có bằng chứng AI sinh script thật; Có 0/5 câu; Chưa đủ ba câu có liên kết bằng chứng; Không thể hiện mâu thuẫn/khác biệt phạm vi|[JSON](N17.json)|
|N18|nguon-mau-thuan|fail|Chưa đủ ba câu có liên kết bằng chứng; Không thể hiện mâu thuẫn/khác biệt phạm vi|[JSON](N18.json)|
|N19|prompt-injection|fail|Không có trang nào đọc được; Không có nguồn đã đọc và chọn; Chưa có bằng chứng AI sinh script thật; Có 0/5 câu; Chưa đủ ba câu có liên kết bằng chứng|[JSON](N19.json)|
|N20|prompt-injection|fail|Chưa đủ ba câu có liên kết bằng chứng|[JSON](N20.json)|
|N21|hiem|fail|Trích dẫn hồ sơ n01 chưa khớp snapshot; Trích dẫn hồ sơ n02 chưa khớp snapshot|[JSON](N21.json)|
|N22|hiem|fail|Lỗi gọi AI: Câu 3: mẫu không hợp lệ (lời có số=false, chữ màn hình=10, mã=["t01"]); Chưa có bằng chứng AI sinh script thật; Có 0/5 câu; Chưa đủ ba câu có liên kết bằng chứng|[JSON](N22.json)|
|N23|hiem|fail|Lỗi gọi AI: Tất cả AI providers đều gặp lỗi: DeepSeek: Expected ',' or '}' after property value in JSON at position 666 (line 17 column 240); Không có nguồn đã đọc và chọn; Chưa có bằng chứng AI sinh script thật; Có 0/5 câu; Chưa đủ ba câu có liên kết bằng chứng|[JSON](N23.json)|
|N24|hiem|fail|Lỗi gọi AI: Câu 2: mẫu không hợp lệ (lời có số=false, chữ màn hình=22, mã=["t01"]); Chưa có bằng chứng AI sinh script thật; Có 0/5 câu; Chưa đủ ba câu có liên kết bằng chứng|[JSON](N24.json)|
|N25|ngoai-pham-vi|fail|Lỗi gọi AI: AI không trả đúng số câu; Chưa có bằng chứng AI sinh script thật; Có 0/5 câu; Chưa đủ ba câu có liên kết bằng chứng|[JSON](N25.json)|
|N26|hiem|pass|HTTP lỗi được lưu, nguồn bị loại, không tạo nội dung|[JSON](N26.json)|
|N27|hiem|pass|HTTP lỗi được lưu, nguồn bị loại, không tạo nội dung|[JSON](N27.json)|