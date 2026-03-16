const jsonServer = require('json-server');
const cors = require('cors');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(cors());
server.use(jsonServer.bodyParser);
server.use(middlewares);

//  Mock API Lấy mã OTP
server.post('/api/v1/auth/register/request-otp', (req, res) => {
  console.log("Đã nhận yêu cầu OTP cho SĐT:", req.body.phone);
  res.status(200).json({
    status: 200,
    message: "Đã gửi mã OTP (123456) đến số điện thoại của bạn.",
    data: { phone: req.body.phone, otpTimeout: 60 }
  });
});

// I Xác thực OTP & GHI DỮ LIỆU VÀO db.json
server.post('/api/v1/auth/register/verify-otp', (req, res) => {
  // Lấy toàn bộ dữ liệu từ formData gửi lên
  const { otpCode, fullName, phone, email, address, gender, password } = req.body;

  if (otpCode === "123456") {
    const db = router.db; // Truy cập vào cơ sở dữ liệu db.json

    // Kiểm tra xem SĐT đã tồn tại chưa (tránh trùng lặp)
    const userExists = db.get('users').find({ phone: phone }).value();
    if (userExists) {
      return res.status(400).json({
        status: 400,
        message: "Số điện thoại này đã được đăng ký trước đó!",
        data: null
      });
    }

    
    const newUser = {
      id: Date.now(), 
      fullName,
      phone,
      email,
      address,
      gender,
      password
    };

    // Ghi vào mảng 'users' db.json
    db.get('users').push(newUser).write();

    console.log(" Đã lưu người dùng mới:", fullName);

    res.status(201).json({
      status: 201,
      message: "Đăng ký thành công!",
      data: { phone: newUser.phone }
    });
  } else {
    res.status(400).json({
      status: 400,
      message: "Mã OTP không chính xác!",
      data: null
    });
  }
});

server.use(router);
server.listen(5000, () => {
  console.log(' MOCK SERVER ĐÃ CHẠY  http://localhost:5000');
});