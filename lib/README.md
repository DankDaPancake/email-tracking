# 🗄️ Thiết kế Database cho hệ thống Email Tracking

Tài liệu này mô tả cấu trúc lưu trữ dữ liệu cho tính năng theo dõi Email Marketing (Open, Click, Heatmap...).
Chúng ta sử dụng **SQLite** vì tính đơn giản, không cần cài đặt server, dữ liệu được lưu trong file `tracking_data.db`.

## 1. Cấu trúc bảng (Schema)

Hiện tại hệ thống chỉ sử dụng một bảng duy nhất là `events` để tối ưu tốc độ ghi (Write-heavy).

### Bảng: `events`

| Tên cột | Kiểu dữ liệu | Mô tả | Ví dụ |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER (PK) | ID tự tăng | `1`, `2` |
| `event_type` | TEXT | Loại hành động | `'OPEN'`, `'CLICK'`, `'READ_SESSION'` |
| `user_email` | TEXT | Email người dùng | `'user@example.com'` |
| `campaign_id` | TEXT | Mã chiến dịch | `'summer_sale_2026'` |
| `target_url` | TEXT | Link đích (nếu click) | `'https://google.com'` |
| `metadata` | TEXT (JSON) | Dữ liệu mở rộng | `{"duration": 12.5, "device": "iPhone"}` |
| `created_at` | DATETIME | Thời gian ghi nhận | `2026-02-01 10:00:00` |

---

## 2. Cách sử dụng trong Code (Dành cho Dev)

Chúng ta không query SQL trực tiếp trong Controller mà dùng qua Wrapper trong `lib/database.js`.

### A. Ghi nhận sự kiện Mở (Open Tracking)
```javascript
const DB = require('./lib/database');

DB.logEvent({
    type: 'OPEN',
    email: 'khachhang@gmail.com',
    campaign: 'newsletter_01',
    metadata: {
        ip: '192.168.1.1',
        user_agent: 'Mozilla/5.0...'
    }
});

```

### B. Ghi nhận Click & Heatmap

```javascript
DB.logEvent({
    type: 'CLICK',
    email: 'khachhang@gmail.com',
    target_url: '[https://myshop.com/product/1](https://myshop.com/product/1)',
    metadata: {
        position: 'header_logo', // User click vào Logo
        is_dark_mode: true       // User đang dùng Dark Mode
    }
});

```

### C. Ghi nhận thời gian đọc (Real Read Time)

```javascript
DB.logEvent({
    type: 'READ_SESSION',
    email: 'khachhang@gmail.com',
    metadata: {
        duration_seconds: 15.4,  // Đọc trong 15 giây
        read_type: 'Reader'      // Phân loại: Reader (>8s)
    }
});

```

---

## 3. Cách xem dữ liệu (Tooling)

Vì SQLite là một file, bạn có thể xem dữ liệu bằng nhiều cách:

### Cách 1: Dùng VS Code Extension (Khuyên dùng)

1. Cài Extension **"SQLite Viewer"** trong VS Code.
2. Click vào file `tracking_data.db` trong thư mục dự án.
3. Dữ liệu sẽ hiện ra dưới dạng bảng Excel.

### Cách 2: Dùng phần mềm chuyên dụng

* **DBeaver** (Miễn phí, mạnh mẽ).
* **DB Browser for SQLite** (Nhẹ, đơn giản).

---

## 4. Quy ước dữ liệu (Convention)

Để đảm bảo tính nhất quán cho team Data/Analytics sau này:

1. **`metadata`**: Luôn lưu dưới dạng JSON String.
2. **`event_type`**: Viết hoa toàn bộ (UPPERCASE).
* `OPEN`: Khi tải pixel 1x1.
* `CLICK`: Khi redirect link.
* `BOT_TRAP`: Khi honeypot bị kích hoạt.

***

### PHẦN 3: Tích hợp vào `server.js` của bạn

Bây giờ bạn chỉ cần sửa file `server.js` để thay thế các đoạn `console.log` bằng `DB.logEvent`.

Ví dụ:

```javascript
const DB = require('./lib/database'); // Import module vừa tạo

// ...

app.get('/track/click', (req, res) => {
    const { user, target_url, loc } = req.query;

    // Thay thế đoạn lưu vào mảng tạm bằng DB
    DB.logEvent({
        type: 'CLICK',
        email: user,
        target_url: target_url,
        metadata: {
            position: loc,
            headers: req.headers['user-agent']
        }
    });
    
    console.log(`[DB SAVED] Click from ${user}`);
    res.redirect(target_url);
});