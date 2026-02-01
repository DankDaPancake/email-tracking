# 📧 Hệ thống Phân tích & Theo dõi Email (Proof of Concept)

Một hệ thống tracking backend sử dụng Node.js, được thiết kế để đo lường mức độ tương tác của người dùng với email chi tiết hơn các công cụ thông thường. Dự án minh họa cách sử dụng HTTP Requests, Redirects và Chunked Transfer Encoding để thu thập dữ liệu hành vi người dùng.

> [!WARNING]
> **MỤC ĐÍCH GIÁO DỤC & NGHIÊN CỨU**
>
> Repository này được tạo ra với mục đích nghiên cứu kỹ thuật. Việc theo dõi người dùng mà không có sự đồng ý (Consent) có thể vi phạm các luật về quyền riêng tư như **GDPR** (Châu Âu) hoặc **CCPA**.
> * Vui lòng luôn tôn trọng quyền riêng tư của người dùng.
> * Luôn xin phép (Opt-in) trước khi thực hiện tracking.

## 📂 Tài liệu Thuyết trình & Nghiên cứu

Dự án này đi kèm với tài liệu nghiên cứu chi tiết nằm trong thư mục `docs/`:

* **`docs/digital-marketing.html`**: File trình bày tổng quan về **Xu hướng Digital Marketing** và **Email Marketing** hiện đại.
    * Tài liệu này giải thích bối cảnh thị trường và lý do tại sao các kỹ thuật tracking nâng cao (như trong dự án này) lại cần thiết.
    * *Cách xem:* Mở trực tiếp file `.html` này bằng trình duyệt web của bạn.
* **`docs/REPORT.md`**: báo cáo kỹ thuật chi tiết.

## 🚀 Tính năng nổi bật

* **Real Read Time (Thời gian đọc thực):** Phân loại người dùng thành "Lướt qua" (Glancers <2s) hoặc "Đọc kỹ" (Readers >8s) bằng cách duy trì kết nối (Keep-alive).
* **Heatmap Tracking (Bản đồ nhiệt):** Phân biệt vị trí click (Ví dụ: Click vào Logo đầu trang hay Nút mua hàng cuối trang).
* **Dark Mode Detection:** Phát hiện người dùng đang bật chế độ tối (Dark Mode) qua CSS Media Queries.
* **Bot Protection (Honeypot):** Sử dụng link ẩn để bẫy và nhận diện Bot/Scanners.
* **Database tích hợp:** Sử dụng SQLite (`tracking_data.db`) lưu trữ dữ liệu tại chỗ, không cần cài đặt server database phức tạp.
* **Live Dashboard:** Xem báo cáo thống kê trực quan ngay trên trình duyệt.

## 🛠️ Công nghệ sử dụng

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** SQLite3 (`better-sqlite3`)
* **Email Service:** Nodemailer (SMTP Gmail)
* **Tunneling:** Ngrok (Để public server localhost ra Internet)

## 📦 Cài đặt & Thiết lập

1.  **Cài đặt thư viện:**
    ```bash
    npm install express nodemailer better-sqlite3
    ```

2.  **Khởi động Server:**
    ```bash
    node server.js
    ```
    *File database `tracking_data.db` sẽ tự động được tạo tại thư mục gốc.*

3.  **Public Server (Bắt buộc để gửi vào Gmail):**
    Mở một terminal mới và chạy Ngrok (Port 3000):
    ```bash
    npx ngrok http 3000
    ```
    *Copy địa chỉ HTTPS Forwarding (Ví dụ: `https://xyz.ngrok-free.app`).*

## 🧪 Hướng dẫn chạy Test

Để kiểm tra toàn bộ tính năng với email thật:

1.  Mở file `send-real-email.js`.
2.  Cập nhật phần **Cấu hình (Config)**:
    * `PUBLIC_URL`: Dán link Ngrok vừa copy ở trên.
    * `SENDER_EMAIL` & `SENDER_PASSWORD`: Tài khoản Gmail gửi đi (Dùng App Password).
    * `RECIPIENT_EMAIL`: Email nhận test.
3.  Chạy lệnh gửi:
    ```bash
    node send-real-email.js
    ```
4.  Kiểm tra kết quả tại Dashboard:
    👉 **Truy cập: `http://localhost:3000/dashboard`**

## 📡 API Endpoints (Dành cho Frontend/Email Template)

Khi xây dựng nội dung HTML cho email, sử dụng các đường dẫn sau:

### 1. Open Tracking (Spy Pixel)
Theo dõi lượt mở thư.
```html
<img src="{NGROK_URL}/track/open?user={EMAIL}&campaign={ID}&ts={TIMESTAMP}" width="1" height="1" />

```

### 2. Click Tracking (Redirects)

Theo dõi lượt click và vị trí click.

```html
<a href="{NGROK_URL}/track/click?user={EMAIL}&target_url={DESTINATION}&loc={POSITION}">Click Here</a>

```

* Tham số `loc`: Định danh vị trí (ví dụ: `header_logo`, `footer_cta`).
* Tham số `is_trap=true`: Dùng cho link ẩn (Honeypot) để bắt Bot.

### 3. Real Read Time (Duration)

Đo thời gian người dùng mở email.

```html
<img src="{NGROK_URL}/track/duration?user={EMAIL}&ts={TIMESTAMP}" width="1" height="1" />

```

### 4. Dark Mode Detection

Đặt trong thẻ `<style>` để chỉ kích hoạt khi giao diện tối.

```css
@media (prefers-color-scheme: dark) {
  .dm-pixel { background-image: url('{NGROK_URL}/track/dark-mode-pixel?user={EMAIL}'); }
}

```

> **Lưu ý:** Luôn thêm tham số `&ts={TIMESTAMP}` vào các đường dẫn ảnh để tránh việc Gmail cache ảnh cũ.

## 🗄️ Cấu trúc Database

Dữ liệu được lưu trong bảng `events` của file SQLite:

| Cột | Kiểu | Mô tả |
| --- | --- | --- |
| `event_type` | TEXT | Loại sự kiện: `OPEN`, `CLICK`, `READ_SESSION`, `DARK_MODE`, `BOT_TRAP` |
| `user_email` | TEXT | Email người dùng |
| `target_url` | TEXT | Link đích (chỉ có ở sự kiện CLICK) |
| `metadata` | JSON | Chứa thông tin mở rộng: IP, User Agent, Thời gian đọc, Vị trí click... |
| `created_at` | DATETIME | Thời gian ghi nhận |

## ⚠️ Vấn đề đã biết (Known Issues)

Do cơ chế bảo mật **Google Image Proxy** của Gmail, một số tính năng tracking hình ảnh sẽ hoạt động không chính xác trên nền tảng này (Ví dụ: Sai vị trí địa lý, sai thời gian đọc).

👉 **Xem báo cáo kỹ thuật chi tiết tại:** [📄 REPORT.md](https://www.google.com/search?q=./REPORT.md)

---

*Happy Coding!*
