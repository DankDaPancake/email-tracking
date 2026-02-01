// const express = require("express");
// const app = express();
// const port = 3000;
// const DB = require('./lib/database')

// // Giả lập Database lưu log
// const trackingLogs = [];

// // 1. Tracking Open-Rate (SpyPixel)
// // Ảnh GIF 1x1 trong suốt (Base64) dùng cho tất cả các pixel
// const TRANSPARENT_GIF_BUFFER = Buffer.from(
//   "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
//   "base64",
// );

// // Middleware lấy IP (Hỗ trợ khi chạy sau Ngrok/Proxy)
// app.set('trust proxy', true);

// // 1. 
// app.get("/track/open", (req, res) => {
//   const { user, campaign } = req.query;
//   const userAgent = req.headers['user-agent'];
//   const ip = req.ip;

//   // Ghi vào DB
//   DB.logEvent({
//     type: 'OPEN',
//     email: user,

//   })

//   // Ghi log vào console (hoặc DB)
//   const log = `[OPEN] Customer: ${user} | Campaign: ${campaign} | Date: ${new Date().toISOString()}`;
//   trackingLogs.push(log);
//   console.log(log);

//   // IMPORTANT: báo cho browser đây là GIF
//   // res.set('Content-Type', 'image/gif')
//   // // IMPORTANT: chống Cache (mỗi lần mở đều mới)
//   // res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
//   // res.set('Content-Length', TRANSPARENT_GIF_BUFFER.length)

//   // // Trả về cái GIF
//   // res.send(TRANSPARENT_GIF_BUFFER)

//   const RELIABLE_PIXEL_URL =
//     "https://raw.githubusercontent.com/make-github-pseudonymous-again/pixels/main/1x1%23FFFFFF.jpg";
//   // 307: Temporary Redirect (Để lần sau nó vẫn hỏi lại)
//   res.redirect(307, RELIABLE_PIXEL_URL);
// });

// const db = {
//   clicks: [],
//   bot_ips: new Set(),
// };

// app.get("/track/click", (req, res) => {
//   const { user, target_url, loc, is_trap } = req.query;
//   const clientIp = req.ip || req.socket.remoteAddress;

//   // 1. Kiểm tra bot (honeypot)
//   if (is_trap === "true") {
//     console.warn(`[BOT DETECTED] IP: ${clientIp} has clicked into the trap!`);
//     db.bot_ips.add(clientIp);
//     DB.logEvent({
//         type: 'CLICK',
//         email: user,
//         target_url: target_url,
//         metadata: {
//             position: loc,
//             headers: req.headers['user-agent'] 
//         }
//     });

//     console.log(`[DB]`)
//     return res.status(200).send("You have been caught. Goodbye.");
//   }

//   if (db.bot_ips.has(clientIp)) {
//     console.log(`[BLOCKED] Clicked from Bot IP: ${clientIp} was declined.`);
//     return res.status(403).send("Forbidden");
//   }

//   // 2. Ghi nhận Heatmap (vị trí click)
//   const log = {
//     user,
//     url: target_url,
//     position: loc || "unknown",
//     timestamp: new Date(),
//   };

//   db.clicks.push(log);
//   console.log(`[CLICK] User: ${user} | Pos: ${loc} | Link: ${target_url}`);

//   log = `[CLICK] Customer: ${user} | Clicked link to: ${target_url}`;
//   trackingLogs.push(log);
//   console.log(log);

//   // Redirect user đến trang đích
//   // 302 (Found) hoặc 307 (Temporary Redirect)
//   if (target_url) {
//     res.redirect(target_url);
//   } else {
//     res.send("Error. Không tìm thấy link đích.");
//   }
// });

// app.get("/track/dark-mode-pixel", (req, res) => {
//   const { user } = req.query;
//   console.log(`[DARK MODE] User ${user} is using dark mode.`);

//   // Ghi vào User profile trong DB: { user_email: ..., prefers_dark: true }
//   // Để lần sau gửi email dark theme

//   const pixel = Buffer.from(
//     "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
//     "base64",
//   );
//   res.set("Content-Type", "image/gif");
//   res.set("Cache-Control", "no-store");
//   res.send(pixel);
// });

// app.get("/track/duration", (req, res) => {
//   const { user } = req.query;
//   const startTime = Date.now();
//   console.log(`[READ START] User ${user} has begin reading...`);

//   // 1. Cấu hình Header "keep-alive"
//   res.writeHead(200, {
//     "content-type": "image/gif",
//     "transfer-encoding": "chinked",
//     "cache-control": "no-store, no-cache",
//     connection: "keep-alive",
//   });

//   // 2. Gửi header của GIF
//   // GIF Header (GIF89a) + kích thước 1x1
//   res.write(Buffer.from("47494638396101000100800000", "hex"));

//   // 3. Tạo vòng lặp ping để giữ connection
//   // Mỗi giây gửi 1 byte data rác để client không timeout
//   const timer = setInterval(() => {
//     // Gửi Extension Block rỗng của GIF để không phá ảnh
//     res.write(Buffer.from("21fe010000", "hex"));
//   }, 1000);

//   // 4. Bắt event ngắt kết nối (đóng mail / chuyển tab)
//   req.on("close", () => {
//     clearInterval(timer);
//     const endTime = Date.now();
//     const duration = (endTime - startTime) / 1000;

//     console.log(
//       `[READ END] User ${user} has stopped reading. Duration: ${duration}s`,
//     );

//     // Phân loại
//     let type = "Glancer";
//     if (duration > 8) type = "Reader";
//     else if (duration > 2) type = "Skimmer";

//     console.log(`=> Classification: ${type}`);
//   });
// });

// const crypto = require("crypto");
// const { posix } = require("path");

// app.get("/track/click-conversion", (req, res) => {
//   const { target_url, user } = req.query;

//   // 1. Tạo ID cho click
//   const clickId = crypto.randomUUID();

//   // 2. Lưu lại để đối chiếu
//   console.log(`[LEAD] Tạo ClickID: ${clickId} cho User ${user}`);

//   // 3. Gắn ClickID vào target URL
//   // Web đích bán hàng thu thập tham số id này
//   const finalUrl = new url(target_url);
//   finalUrl.searchParams.append("cid", clickId);

//   res.redirect(finalUrl.toString());
// });

// // Endpoint giả lập webhook từ hệ thống POS (point of sale) / giao hàng
// app.post("/webhook/offline-conversion", express.json(), (req, res) => {
//   // Giả sử bên giao hàng gọi API này khi xong
//   const { cid, status, revenue } = req.body;

//   if (status === "DELIVERED") {
//     // Tìm trong DB xem cid của user nào
//     console.log(
//       `[TRANSACTION] ClickID ${cid} transaction went through. Revenue: ${revenue} VND`,
//     );
//   }
//   res.send("OK");
// });

// app.get("/report", (req, res) => {
//   res.json(trackingLogs);
// });

// app.listen(port, () => {
//   console.log(`Server Tracking is running at http://localhost:${port}`);
// });

const express = require('express');
const DB = require('./lib/database'); // Import module Database
const app = express();
const port = 3000; // Hoặc 3001 nếu bạn muốn tránh xung đột

// --- CẤU HÌNH DỮ LIỆU TĨNH ---
// Ảnh GIF 1x1 trong suốt (Base64) dùng cho tất cả các pixel
const TRANSPARENT_GIF_BUFFER = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
);

// Middleware lấy IP (Hỗ trợ khi chạy sau Ngrok/Proxy)
app.set('trust proxy', true);

// --- 1. TRACKING MỞ EMAIL (OPEN RATE) ---
app.get('/track/open', (req, res) => {
    const { user, campaign } = req.query;
    const userAgent = req.headers['user-agent'];
    const ip = req.ip;

    // Ghi vào DB
    DB.logEvent({
        type: 'OPEN',
        email: user,
        campaign: campaign,
        metadata: { ip, user_agent: userAgent }
    });

    console.log(`[DB SAVED] OPEN event for ${user}`);

    // Trả về ảnh pixel
    res.set({
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
    });
    res.send(TRANSPARENT_GIF_BUFFER);
});

// --- 2. TRACKING CLICK & HEATMAP & HONEYPOT ---
app.get('/track/click', (req, res) => {
    const { user, target_url, loc, is_trap, campaign } = req.query;
    const userAgent = req.headers['user-agent'];
    const ip = req.ip;

    // A. XỬ LÝ HONEYPOT (BẪY BOT)
    if (is_trap === 'true') {
        DB.logEvent({
            type: 'BOT_TRAP',
            email: user,
            campaign: campaign,
            target_url: target_url,
            metadata: { ip, user_agent: userAgent, note: 'Caught by Honeypot' }
        });
        console.warn(`[BOT DETECTED] IP ${ip} fell into the trap!`);
        return res.status(200).send("Hello Bot. You have been logged.");
    }

    // B. XỬ LÝ CLICK HỢP LỆ
    if (target_url) {
        DB.logEvent({
            type: 'CLICK',
            email: user,
            campaign: campaign,
            target_url: target_url,
            metadata: { 
                position: loc, // Vị trí click (Header/Footer)
                ip, 
                user_agent: userAgent 
            }
        });
        console.log(`[DB SAVED] CLICK event for ${user} at ${loc}`);
        
        // Chuyển hướng người dùng
        return res.redirect(target_url);
    } else {
        res.status(400).send("Missing target_url");
    }
});

// --- 3. TRACKING DARK MODE ---
app.get('/track/dark-mode-pixel', (req, res) => {
    const { user, campaign } = req.query;

    // Chỉ khi thiết bị bật Dark Mode mới tải ảnh này -> Ghi nhận
    DB.logEvent({
        type: 'DARK_MODE',
        email: user,
        campaign: campaign,
        metadata: { detected: true }
    });

    console.log(`[DB SAVED] DARK_MODE detected for ${user}`);

    res.set({
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache',
    });
    res.send(TRANSPARENT_GIF_BUFFER);
});

// --- 4. TRACKING THỜI GIAN ĐỌC (REAL READ TIME) ---
app.get('/track/duration', (req, res) => {
    const { user, campaign } = req.query;
    const startTime = Date.now();
    
    console.log(`[READING] User ${user} started reading...`);

    // Thiết lập Header để giữ kết nối (Chunked Transfer)
    res.writeHead(200, {
        'Content-Type': 'image/gif',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-store, no-cache',
        'Connection': 'keep-alive'
    });

    // Gửi phần đầu của ảnh GIF
    res.write(Buffer.from('47494638396101000100800000', 'hex'));

    // Ping mỗi giây để giữ kết nối
    const timer = setInterval(() => {
        // Gửi block rỗng để duy trì kết nối
        res.write(Buffer.from('21fe010000', 'hex'));
    }, 1000);

    // KHI USER ĐÓNG MAIL -> KẾT NỐI NGẮT -> TÍNH GIỜ
    req.on('close', () => {
        clearInterval(timer);
        const duration = (Date.now() - startTime) / 1000; // Giây

        // Phân loại độc giả
        let readerType = 'Glancer'; // Lướt qua (<2s)
        if (duration > 8) readerType = 'Reader'; // Đọc kỹ (>8s)
        else if (duration > 2) readerType = 'Skimmer'; // Đọc lướt (2-8s)

        // Ghi vào DB
        DB.logEvent({
            type: 'READ_SESSION',
            email: user,
            campaign: campaign,
            metadata: { 
                duration_seconds: duration,
                reader_type: readerType
            }
        });

        console.log(`[DB SAVED] READ_SESSION: ${user} read for ${duration}s (${readerType})`);
    });
});

// --- 5. DASHBOARD XEM BÁO CÁO NHANH (HTML) ---
// Truy cập vào: http://localhost:3000/dashboard
app.get('/dashboard', (req, res) => {
    const logs = DB.getReport(); // Lấy 50 dòng mới nhất
    const stats = DB.getStats(); // Lấy thống kê tổng

    let html = `
    <html>
    <head>
        <title>Tracking Dashboard</title>
        <style>
            body { font-family: sans-serif; padding: 20px; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; color: white;}
            .OPEN { background: #0070f3; }
            .CLICK { background: #198754; }
            .BOT_TRAP { background: #dc3545; }
            .READ_SESSION { background: #6610f2; }
            .DARK_MODE { background: #212529; }
        </style>
    </head>
    <body>
        <h1>📊 Email Tracking Report</h1>
        
        <h3>Thống kê nhanh:</h3>
        <ul>
            ${stats.map(s => `<li><b>${s.event_type}:</b> ${s.count}</li>`).join('')}
        </ul>

        <h3>50 Sự kiện gần nhất:</h3>
        <table>
            <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Email</th>
                <th>URL / Info</th>
                <th>Metadata</th>
                <th>Time</th>
            </tr>
            ${logs.map(row => `
                <tr>
                    <td>${row.id}</td>
                    <td><span class="badge ${row.event_type}">${row.event_type}</span></td>
                    <td>${row.user_email}</td>
                    <td>${row.target_url || '-'}</td>
                    <td><pre>${row.metadata}</pre></td>
                    <td>${row.created_at}</td>
                </tr>
            `).join('')}
        </table>
        
        <p><a href="/dashboard">🔄 Refresh Data</a></p>
    </body>
    </html>
    `;
    res.send(html);
});

// Khởi động server
app.listen(port, () => {
    console.log(`🚀 Server Tracking (with DB) đang chạy tại http://localhost:${port}`);
    console.log(`📈 Xem báo cáo tại http://localhost:${port}/dashboard`);
});