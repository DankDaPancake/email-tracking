const express = require('express')
const app = express()
const port = 3000

// Giả lập Database lưu log
const trackingLogs = []

// 1. Tracking Open-Rate (SpyPixel)
// Base-64 encryption cho GIF 1x1 pixel trong suốt 
const TRANSPARENT_GIF_BUFFER = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
)

app.get('/track/open', (req, res) => {
    const { user, campaign } = req.query;
    
    // Ghi log vào console (hoặc DB)
    const log = `[OPEN] Customer: ${user} | Campaign: ${campaign} | Date: ${new Date().toISOString()}`
    trackingLogs.push(log)
    console.log(log)

    // IMPORTANT: báo cho browser đây là GIF
    res.set('Content-Type', 'image/gif')
    // IMPORTANT: chống Cache (mỗi lần mở đều mới)
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')

    // Trả về cái GIF
    res.send(TRANSPARENT_GIF_BUFFER)
})

app.get('/report', (req, res) => {
    res.json(trackingLogs)
})

app.listen(port, () => {
    console.log(`Server Tracking đang chạy tại http://localhost:${port}`)
})