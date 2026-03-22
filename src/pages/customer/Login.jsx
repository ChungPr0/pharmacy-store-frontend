import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useCart } from "../../contexts/CartContext";

const Login = () => {

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
    
    if (!phone || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
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

        // Lưu token, refreshToken và user data vào context (sẽ tự động fetch cart)
        login(userData, token, refreshTokenValue);

        toast.success("Đăng nhập thành công!");
        // Chờ context update trước khi navigate
        setTimeout(() => navigate("/"), 500);
      }

    } catch (err) {
      const errorMsg = err.response?.data?.message || "Sai số điện thoại hoặc mật khẩu";
      toast.error(errorMsg);
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

          {/* PHONE */}
          <div className="mb-6">

            <label className="text-sm text-gray-600">
              Số điện thoại
            </label>

            <input
              type="text"
              value={phone}
              className="w-full border-b border-gray-400 bg-transparent focus:outline-none focus:border-green-500 py-2"
              onChange={(e) => setPhone(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
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
            className="w-full bg-green-600 text-white py-3 rounded-full hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
          </button>


          <p className="text-center text-sm mt-6">

            Chưa có tài khoản?  
            <Link to="/register">
            <span className="text-green-600 cursor-pointer ml-1">
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