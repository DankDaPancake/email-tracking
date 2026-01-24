const SERVER_URL = 'http://localhost:3000'
const USER_EMAIL = 'vip.customer@gmail.com'

const openLink = `${SERVER_URL}/track/open?user=${USER_EMAIL}&campaign=summer_sale`

const emailHTML = `
<!DOCTYPE html>
<html>
    <body>
        <h1>Welcome back!</h1>
        <img src="${openLink}" width="1" height="1" style="display:none;" alt="" />
    </body>
</html>
`

console.log("--- COPY ĐOẠN HTML DƯỚI ĐÂY LƯU VÀO FILE .HTML ĐỂ TEST ---");
console.log(emailHTML);