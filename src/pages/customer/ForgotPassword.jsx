import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const ForgotPassword = () => {

  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendOtp = async () => {
    try {
      await api.post("/api/v1/auth/forgot-password/request-otp", { phone });
      alert("Đã gửi OTP");
    } catch {
      alert("Lỗi gửi OTP");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await api.post("/api/v1/auth/forgot-password/verify-otp", {
        phone,
        otpCode: otp,
      });
      setStep(2);
    } catch {
      alert("OTP sai");
    }
  };

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      alert("Mật khẩu không khớp");
      return;
    }

    try {
      await api.post("/api/v1/auth/forgot-password/reset", {
        phone,
        otpCode: otp,
        newPassword: password,
      });
      alert("Thành công");
      navigate("/login");
    } catch {
      alert("Lỗi");
    }
  };

  return (
    <div className="flex min-h-screen">

      {/* LEFT IMAGE */}
      <div className="w-1/2 h-screen">
        <img
          src="/pharmacy.png"
          className="w-full h-full object-cover"
        />
      </div>

      {/* RIGHT */}
      <div className="w-1/2 bg-[#EEF5F0] flex items-center justify-center">

        <div className="w-[400px]">

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold text-green-700 mb-8 text-center">
                QUÊN MẬT KHẨU
              </h2>

              {/* PHONE */}
              <div className="mb-6">
                <label className="text-sm text-gray-600">Số điện thoại:</label>
                <input
                  type="text"
                  className="w-full border-b border-gray-400 bg-transparent focus:outline-none focus:border-green-500"
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* OTP */}
              <div className="mb-2 flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-sm text-gray-600">Nhập mã xác nhận:</label>
                  <input
                    className="w-full border-b border-gray-400 bg-transparent focus:outline-none focus:border-green-500"
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleSendOtp}
                  className="bg-green-600 text-white px-4 py-2 rounded-full text-sm mt-5"
                >
                  Gửi mã
                </button>
              </div>

              <p className="text-xs text-gray-500 mb-6">
                Chưa nhận được mã? <span className="text-green-600 cursor-pointer">Gửi lại mã (60s)</span>
              </p>

              <button
                onClick={handleVerifyOtp}
                className="w-full bg-green-600 text-white py-3 rounded-full"
              >
                HOÀN TẤT
              </button>

              <p
                onClick={() => navigate("/login")}
                className="text-center mt-6 text-sm cursor-pointer"
              >
                &lt;&lt; Trở về
              </p>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold text-green-700 mb-8 text-center">
                ĐẶT LẠI MẬT KHẨU
              </h2>

              <div className="mb-6">
                <label className="text-sm">Mật khẩu:</label>
                <input
                  type="password"
                  className="w-full border-b outline-none py-2 bg-transparent"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="mb-8">
                <label className="text-sm">Nhập lại mật khẩu:</label>
                <input
                  type="password"
                  className="w-full border-b outline-none py-2 bg-transparent"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                onClick={handleResetPassword}
                className="w-full bg-green-600 text-white py-3 rounded-full"
              >
                HOÀN TẤT
              </button>
            </>
          )}

        </div>
      </div>

    </div>
  );
};

export default ForgotPassword;