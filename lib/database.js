const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.resolve(__dirname, "../tracking_data.db");
const db = new Database(dbPath, { verbose: console.log });

// 1. Khởi tạo schema (nếu chưa có)
const initScript = `
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,  -- 'OPEN', 'CLICK', 'READ_TIME'
        user_email TEXT NOT NULL,
        campaign_id TEXT,
        target_url TEXT,           -- Chỉ dùng cho CLICK
        metadata TEXT,             -- Lưu JSON (Duration, User Agent, IP...)
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_email ON events(user_email);
    CREATE INDEX IF NOT EXISTS idx_campaign ON events(campaign_id);
`;

db.exec(initScript);

// 2. Hàm helper cho tiện dùng
const TrackingDB = {
  logEvent: (data) => {
    const stmt = db.prepare(`
            INSERT INTO events (event_type, user_email, campaign_id, target_url, metadata)
            VALUES (@type, @email, @campaign, @url, @meta) 
        `);

    return stmt.run({
      type: data.type,
      email: data.email || "anonymous",
      campaign: data.campaign || "default",
      url: data.target_url || null,
      meta: JSON.stringify(data.metadata || {}),
    });
  },

  getReport: () => {
    return db
      .prepare("SELECT * FROM events ORDER BY created_at DESC LIMIT 50")
      .all();
  },

  getStats: () => {
    return db
      .prepare(
        "SELECT event_type, COUNT(*) as count FROM events GROUP BY event_type",
      )
      .all();
  },
};

module.exports = TrackingDB;
