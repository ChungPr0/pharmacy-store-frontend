import jsonServer from 'json-server';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(cors());
server.use(jsonServer.bodyParser);
server.use(middlewares);

// Middleware kiểm tra Authorization header
const checkAuth = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    return res.status(401).json({
      status: 401,
      message: 'Thiếu Authorization header',
      data: null
    });
  }
  next();
};

// Mock API Đăng nhập
server.post('/api/v1/auth/login', (req, res) => {
  const { phone, password } = req.body;
  const db = router.db;
  
  const user = db.get('users').find({ phone: phone, password: password }).value();
  
  if (!user) {
    return res.status(401).json({
      status: 401,
      message: 'Số điện thoại hoặc mật khẩu không chính xác!',
      data: null
    });
  }

  // Mock token
  const token = 'mock_token_' + phone + '_' + Date.now();
  const refreshToken = 'mock_refresh_token_' + phone + '_' + Date.now();

  res.status(200).json({
    status: 200,
    message: 'Đăng nhập thành công!',
    data: {
      phone: user.phone,
      fullName: user.fullName,
      role: 'CUSTOMER',
      type: 'Bearer',
      token: token,
      refreshToken: refreshToken
    }
  });
});

// Mock API Refresh Token
server.post('/api/v1/auth/refresh-token', (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken || !refreshToken.startsWith('mock_refresh_token_')) {
    return res.status(403).json({
      status: 403,
      message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!',
      data: null
    });
  }

  const newToken = 'mock_token_' + Date.now();
  const newRefreshToken = 'mock_refresh_token_' + Date.now();

  res.status(200).json({
    status: 200,
    message: 'Cấp lại Token thành công!',
    data: {
      type: 'Bearer',
      accessToken: newToken,
      refreshToken: newRefreshToken
    }
  });
});

//  Mock API Lấy mã OTP
server.post('/api/v1/auth/register/request-otp', (req, res) => {
  console.log("Đã nhận yêu cầu OTP cho SĐT:", req.body.phone);
  res.status(200).json({
    status: 200,
    message: "Đã gửi mã OTP (123456) đến số điện thoại của bạn.",
    data: { phone: req.body.phone, otpTimeout: 60 }
  });
});

// Xác thực OTP & GHI DỮ LIỆU VÀO db.json
server.post('/api/v1/auth/register/verify-otp', (req, res) => {
  const { otpCode, fullName, phone, email, address, gender, password } = req.body;

  if (otpCode === "123456") {
    const db = router.db;

    // Kiểm tra xem SĐT đã tồn tại chưa
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

    // Tạo giỏ hàng mới cho user
    const newCart = {
      cartId: Date.now(),
      phoneNumber: phone,
      totalItems: 0,
      totalPrice: 0,
      items: []
    };
    db.get('carts').push(newCart).write();

    console.log("Đã lưu người dùng mới:", fullName);

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

// API Lấy giỏ hàng
server.get('/api/v1/cart', checkAuth, (req, res) => {
  const authHeader = req.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  // Mock extract phone from token
  const phoneMatch = token?.match(/mock_token_(.+?)_/);
  const phone = phoneMatch ? phoneMatch[1] : null;
  
  if (!phone) {
    return res.status(401).json({
      status: 401,
      message: 'Token không hợp lệ',
      data: null
    });
  }

  const db = router.db;
  const cart = db.get('carts').find({ phoneNumber: phone }).value();
  
  if (!cart) {
    return res.status(200).json({
      status: 200,
      message: 'Lấy thông tin giỏ hàng thành công',
      data: {
        cartId: null,
        totalItems: 0,
        totalPrice: 0,
        items: []
      }
    });
  }

  res.status(200).json({
    status: 200,
    message: 'Lấy thông tin giỏ hàng thành công',
    data: cart
  });
});

// API Thêm sản phẩm vào giỏ
server.post('/api/v1/cart/items', checkAuth, (req, res) => {
  const authHeader = req.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  const phoneMatch = token?.match(/mock_token_(.+?)_/);
  const phone = phoneMatch ? phoneMatch[1] : null;
  
  if (!phone) {
    return res.status(401).json({
      status: 401,
      message: 'Token không hợp lệ',
      data: null
    });
  }

  const { productId, quantity } = req.body;
  const db = router.db;
  
  let cart = db.get('carts').find({ phoneNumber: phone }).value();
  
  if (!cart) {
    cart = {
      cartId: Date.now(),
      phoneNumber: phone,
      totalItems: 0,
      totalPrice: 0,
      items: []
    };
    db.get('carts').push(cart).write();
  }

  const product = db.get('products').find({ id: parseInt(productId) }).value();
  if (!product) {
    return res.status(404).json({
      status: 404,
      message: 'Sản phẩm không tồn tại',
      data: null
    });
  }

  const existingItem = cart.items.find(item => item.productId === parseInt(productId));
  
  if (existingItem) {
    existingItem.quantity += parseInt(quantity);
    existingItem.itemTotal = existingItem.quantity * existingItem.price;
  } else {
    cart.items.push({
      productId: parseInt(productId),
      name: product.name,
      slug: product.slug,
      imageUrl: product.imageUrl,
      price: product.price,
      quantity: parseInt(quantity),
      itemTotal: product.price * parseInt(quantity)
    });
  }

  // Recalculate totals
  cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cart.totalPrice = cart.items.reduce((sum, item) => sum + item.itemTotal, 0);

  db.set('carts', db.get('carts').map(c => c.phoneNumber === phone ? cart : c).value()).write();

  res.status(200).json({
    status: 200,
    message: 'Đã thêm sản phẩm vào giỏ hàng',
    data: null
  });
});

// API Cập nhật số lượng
server.put('/api/v1/cart/items', checkAuth, (req, res) => {
  const authHeader = req.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  const phoneMatch = token?.match(/mock_token_(.+?)_/);
  const phone = phoneMatch ? phoneMatch[1] : null;
  
  if (!phone) {
    return res.status(401).json({
      status: 401,
      message: 'Token không hợp lệ',
      data: null
    });
  }

  const { productId, quantity } = req.body;
  const db = router.db;
  
  let cart = db.get('carts').find({ phoneNumber: phone }).value();
  
  if (!cart) {
    return res.status(404).json({
      status: 404,
      message: 'Giỏ hàng không tồn tại',
      data: null
    });
  }

  if (quantity <= 0) {
    // Xóa sản phẩm nếu quantity <= 0
    cart.items = cart.items.filter(item => item.productId !== parseInt(productId));
  } else {
    const item = cart.items.find(item => item.productId === parseInt(productId));
    if (item) {
      item.quantity = parseInt(quantity);
      item.itemTotal = item.quantity * item.price;
    }
  }

  // Recalculate totals
  cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cart.totalPrice = cart.items.reduce((sum, item) => sum + item.itemTotal, 0);

  db.set('carts', db.get('carts').map(c => c.phoneNumber === phone ? cart : c).value()).write();

  res.status(200).json({
    status: 200,
    message: 'Cập nhật số lượng thành công',
    data: null
  });
});

// API Xóa sản phẩm khỏi giỏ
server.delete('/api/v1/cart/items/:productId', checkAuth, (req, res) => {
  const authHeader = req.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  const phoneMatch = token?.match(/mock_token_(.+?)_/);
  const phone = phoneMatch ? phoneMatch[1] : null;
  
  if (!phone) {
    return res.status(401).json({
      status: 401,
      message: 'Token không hợp lệ',
      data: null
    });
  }

  const { productId } = req.params;
  const db = router.db;
  
  let cart = db.get('carts').find({ phoneNumber: phone }).value();
  
  if (!cart) {
    return res.status(404).json({
      status: 404,
      message: 'Giỏ hàng không tồn tại',
      data: null
    });
  }

  cart.items = cart.items.filter(item => item.productId !== parseInt(productId));

  // Recalculate totals
  cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cart.totalPrice = cart.items.reduce((sum, item) => sum + item.itemTotal, 0);

  db.set('carts', db.get('carts').map(c => c.phoneNumber === phone ? cart : c).value()).write();

  res.status(200).json({
    status: 200,
    message: 'Đã xóa sản phẩm khỏi giỏ hàng',
    data: null
  });
});

server.use(router);
server.listen(5000, () => {
  console.log('✅ MOCK SERVER ĐÃ CHẠY -- http://localhost:5000');
});
