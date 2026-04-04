import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import { toast } from "react-hot-toast";
import { useCart } from "../../contexts/CartContext";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // THÊM STATE ĐỂ CHỨA LỖI HIỂN THỊ TRỰC TIẾP TRÊN FORM
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const { login } = useCart();

  // Auto-fill phone từ đăng ký xong
  useEffect(() => {
    const registeredPhone = localStorage.getItem('registeredPhone');
    if (registeredPhone) {
      setPhone(registeredPhone);
      localStorage.removeItem('registeredPhone');
      toast.success('Vui lòng nhập mật khẩu để đăng nhập!');
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Xóa lỗi cũ khi bắt đầu submit lại
    
    if (!phone || !password) {
      setErrorMessage("Vui lòng nhập đầy đủ Số điện thoại và Mật khẩu!");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        phone,
        password,
      });

      if (res.data.status === 200) {
        const token = res.data.data.token;
        const refreshTokenValue = res.data.data.refreshToken;
        const userData = {
          phone: res.data.data.phone,
          fullName: res.data.data.fullName,
          role: res.data.data.role,
        };

        // Lưu token, refreshToken và user data vào context
        login(userData, token, refreshTokenValue);

        // Chuyển hướng về trang chủ
        navigate("/");
      } else {
        // Bắt lỗi khi API gọi thành công nhưng trả về status lỗi logic
        setErrorMessage(res.data.message || "Tài khoản hoặc mật khẩu không chính xác!");
      }

    } catch (err) {
      // Bắt lỗi hiển thị trực tiếp lên Form
      const errorMsg = err.response?.data?.message || "Sai số điện thoại hoặc mật khẩu. Vui lòng thử lại!";
      setErrorMessage(errorMsg);
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* LEFT SIDE */}
      <div className="w-1/2 bg-gray-100 flex items-center justify-center">
        <img
          src="/pharmacy.png"
          alt="pharmacy"
          className="w-full h-full object-cover"
        />
      </div>

      {/* RIGHT SIDE */}
      <div className="w-1/2 bg-green-50 flex items-center justify-center">
        <form
          onSubmit={handleLogin}
          className="w-96"
        >
          <h2 className="text-2xl font-bold text-green-700 mb-8 text-center">
            ĐĂNG NHẬP
          </h2>

        
          {errorMessage && (
            <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded shadow-sm flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* PHONE */}
          <div className="mb-6">
            <label className="text-sm text-gray-600">
              Số điện thoại
            </label>
            <input
              type="text"
              value={phone}
              className="w-full border-b border-gray-400 bg-transparent focus:outline-none focus:border-green-500 py-2"
              onChange={(e) => {
                setPhone(e.target.value);
                setErrorMessage(""); // Xóa lỗi khi người dùng gõ lại
              }}
              disabled={loading}
            />
          </div>

          {/* PASSWORD */}
          <div className="mb-6">
            <label className="text-sm text-gray-600">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              className="w-full border-b border-gray-400 bg-transparent focus:outline-none focus:border-green-500 py-2"
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage(""); // Xóa lỗi khi người dùng gõ lại
              }}
              disabled={loading}
            />
          </div>

          {/* REMEMBER */}
          <div className="flex justify-between items-center mb-6 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Nhớ mật khẩu
            </label>
            <Link
              to="/forgot-password"
              className="text-green-600 text-sm hover:underline"
            >
              Quên mật khẩu
            </Link>
          </div>

          {/* BUTTON */}
          <button
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-full hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-bold"
          >
            {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG NHẬP"}
          </button>

          <p className="text-center text-sm mt-6">
            Chưa có tài khoản?  
            <Link to="/register">
            <span className="text-green-600 cursor-pointer ml-1 font-medium hover:underline">
              Đăng ký ngay
            </span>
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;