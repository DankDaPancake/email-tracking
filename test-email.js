const SERVER_URL = 'http://localhost:3000'
const USER_EMAIL = 'vip.customer@gmail.com'
const REAL_LINK = 'https://google.com'

const openLink = `${SERVER_URL}/track/open?user=${USER_EMAIL}&campaign=summer_sale`
const clickLink = `${SERVER_URL}/track/click?user=${USER_EMAIL}&target_url=${encodeURIComponent(REAL_LINK)}`

const emailHTML = `
<!DOCTYPE html>
<html>
    <body>
        <h1>Welcome back!</h1>
        <p>Click vào link dưới để nhận quà</p>
        <a href="${clickLink}" style="font-size: 20px; color: blue;">
            NHẬN QUÀ NGAY (Click Tracking)
        </a>

        <img src="${openLink}" width="1" height="1" style="display:none;" alt="" />
    </body>
</html>
`

console.log("--- COPY ĐOẠN HTML DƯỚI ĐÂY LƯU VÀO FILE .HTML ĐỂ TEST ---");
console.log(emailHTML);