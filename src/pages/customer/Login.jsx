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
  const { login, closeAuthModal, openAuthModal, authModal } = useCart();

  // Nếu không phải modal đang bật (khi component này được render như modal)
  // và nếu dùng như page riêng thì authModal undefined


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
          id: res.data.data.id,
          phone: res.data.data.phone,
          fullName: res.data.data.fullName,
          role: res.data.data.role,
        };

        // Lưu token, refreshToken và user data vào context
        login(userData, token, refreshTokenValue);

        toast.success("Đăng nhập thành công!");
        // Chờ context update trước khi navigate hoặc đóng modal
        setTimeout(() => {
          if (closeAuthModal) {
            closeAuthModal();
          } else {
            if (userData.role === 'ADMIN' || userData.role === 'admin') navigate("/admin");
            else navigate("/");
          }
        }, 500);
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
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center backdrop-blur-sm p-4 antialiased">
      <div className="bg-white rounded-3xl shadow-2xl flex max-w-[900px] w-full min-h-[500px] overflow-hidden relative animate-in fade-in zoom-in-95 duration-300">
        <button type="button" onClick={() => closeAuthModal ? closeAuthModal() : navigate('/')} className="absolute top-4 right-4 z-10 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-700"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        {/* LEFT SIDE */}
        <div className="hidden md:flex w-1/2 bg-gray-100 items-center justify-center relative">
          <img
            src="/pharmacy.png"
            alt="pharmacy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:w-1/2 bg-green-50/50 flex items-center justify-center p-8 lg:p-12 relative">
          <form
            onSubmit={handleLogin}
            className="w-full max-w-[360px]"
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
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-green-600 cursor-pointer" />
              Nhớ mật khẩu
            </label>
            <span
              onClick={() => openAuthModal ? openAuthModal('forgot') : navigate('/forgot-password')}
              className="text-green-600 text-sm hover:underline cursor-pointer font-medium"
            >
              Quên mật khẩu
            </span>
          </div>

          {/* BUTTON */}
          <button
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-full hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-bold"
          >
            {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG NHẬP"}
          </button>

          <p className="text-center text-sm mt-6 text-gray-600">
            Chưa có tài khoản?  
            <span 
              onClick={() => openAuthModal ? openAuthModal('register') : navigate('/register')}
              className="text-green-600 cursor-pointer ml-1 font-bold hover:underline"
            >
              Đăng ký ngay
            </span>
          </p>
        </form>
        </div>
      </div>
    </div>
  );
};

export default Login;