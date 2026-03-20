import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Link } from "react-router-dom";

const Login = () => {

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {

      const res = await api.post("/auth/login", {
        phone,
        password,
      });

      localStorage.setItem("token", res.data.data.token);

      navigate("/");

    } catch (err) {
      alert("Sai số điện thoại hoặc mật khẩu");
      console.log(err);
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
              className="w-full border-b border-gray-400 bg-transparent focus:outline-none focus:border-green-500"
              onChange={(e) => setPhone(e.target.value)}
            />

          </div>


          {/* PASSWORD */}
          <div className="mb-6">

            <label className="text-sm text-gray-600">
              Mật khẩu
            </label>

            <input
              type="password"
              className="w-full border-b border-gray-400 bg-transparent focus:outline-none focus:border-green-500"
              onChange={(e) => setPassword(e.target.value)}
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
            className="w-full bg-green-600 text-white py-3 rounded-full hover:bg-green-700 transition"
          >
            ĐĂNG NHẬP
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
const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await api.post("/auth/login", {
      phone,
      password,
    });

    console.log(res.data); // 👈 debug

    const token = res.data.data.token;
    const role = res.data.data.role;

    console.log("TOKEN:", token);
    console.log("ROLE:", role);

    localStorage.setItem("token", token);
    localStorage.setItem("role", role);

    if (role === "ADMIN") {
      navigate("/admin");
    } else {
      navigate("/");
    }

  } catch (err) {
    console.log(err);
    alert("Sai tài khoản hoặc lỗi API");
  }
};
export default Login;