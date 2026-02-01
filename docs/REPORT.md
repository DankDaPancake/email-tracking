# 📉 Báo cáo Kỹ thuật: Các hạn chế của Spy Pixel trên Gmail

---

## 1. Tóm tắt vấn đề
Qua quá trình kiểm thử thực tế, chúng tôi xác nhận rằng các tính năng theo dõi dựa trên hình ảnh (Spy Pixel) hoạt động **không chính xác** hoặc **bị vô hiệu hóa hoàn toàn** khi gửi tới người dùng sử dụng **Gmail** (cả Web và Mobile App).

Các tính năng bị ảnh hưởng nghiêm trọng:
1.  **Real Read Time (Thời gian đọc):** Luôn trả về xấp xỉ 0 giây.
2.  **Geo-location (Định vị):** Báo cáo sai vị trí (Luôn là US/Europe).
3.  **Device Detection (Thiết bị):** Không nhận diện được thiết bị thật.

> **Lưu ý:** Tính năng **Click Tracking** (Theo dõi nhấp chuột) **KHÔNG** bị ảnh hưởng và vẫn hoạt động chính xác 100%.

---

## 2. Nguyên nhân kỹ thuật: Google Image Proxy
Gmail sử dụng một cơ chế bảo mật gọi là **Google Image Proxy**.
Thay vì cho phép thiết bị người dùng tải hình ảnh trực tiếp từ Server của chúng ta, Google thực hiện quy trình sau:

1.  **Pre-fetch:** Ngay khi email đến, máy chủ Google tự động tải toàn bộ hình ảnh về.
2.  **Scan & Cache:** Google quét virus và lưu hình ảnh vào bộ nhớ đệm (Cache) của họ.
3.  **Serve:** Khi người dùng mở email, họ xem ảnh được tải từ Server của Google (`googleusercontent.com`), không phải từ Server Node.js của chúng ta.



---

## 3. Phân tích tác động cụ thể

### ❌ A. Tính năng "Real Read Time" (Đo thời gian đọc)
* **Cơ chế dự kiến:** Server giữ kết nối HTTP (Keep-alive) khi người dùng tải ảnh. Khi người dùng đóng email -> Ngắt kết nối -> Tính giờ.
* **Thực tế trên Gmail:** Máy chủ Google Proxy tải ảnh về với tốc độ cực nhanh và **ngắt kết nối ngay lập tức**.
* **Kết quả sai lệch:** Hệ thống luôn ghi nhận thời gian đọc là `< 1 giây` (Glancer), dù người dùng thực tế đọc trong 5 phút.

### ❌ B. Tính năng "Geo-location" (Vị trí người dùng)
* **Cơ chế dự kiến:** Dùng IP của request để định vị (Ví dụ: IP Việt Nam -> Khách ở VN).
* **Thực tế trên Gmail:** Request gửi đến Server của ta xuất phát từ **IP của Google Data Center** (thường ở Mountain View, California hoặc Châu Âu).
* **Kết quả sai lệch:** Báo cáo hiển thị 99% khách hàng đang ở Mỹ, dẫn đến sai lệch dữ liệu thị trường.

### ⚠️ C. Tính năng "Open Tracking" (Đếm lượt mở)
* **Vấn đề:** Do cơ chế Cache (Bộ nhớ đệm) của Google quá mạnh.
* **Kịch bản:**
    * Lần 1 (Mở mail): Google Proxy gọi Server ta -> **Ghi nhận 1 Open**.
    * Lần 2 (Mở lại xem): Gmail lấy ảnh từ Cache -> Server ta không nhận được gì -> **Không đếm được**.
* **Hệ quả:** Chỉ số Open Rate thường thấp hơn thực tế (Under-reported).

---

## 4. Giải pháp & Khuyến nghị

Để đảm bảo dữ liệu Analytics trung thực, team cần thống nhất:

1.  **Chỉ số Tin cậy (Trusted Metrics):** Tập trung tối đa vào **Click-Through Rate (CTR)**. Link Redirect xảy ra trên trình duyệt người dùng nên không bị Proxy can thiệp.
2.  **Chỉ số Tham khảo (Relative Metrics):** Xem Open Rate là chỉ số tương đối để so sánh hiệu quả giữa các tiêu đề email (Subject lines), không dùng để đếm chính xác số lượng người đọc.
3.  **Không dùng IP để chặn/phân luồng:** Không dựa vào IP từ pixel để chặn người dùng (vì sẽ chặn nhầm IP Google).