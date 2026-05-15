import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../api/axios";
import { useCart } from "../../contexts/CartContext";

const ForgotPassword = () => {

  const navigate = useNavigate();
  const { openAuthModal, closeAuthModal } = useCart();

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendOtp = async () => {
    try {
      const res = await api.post("/auth/forgot-password/request-otp", { phone });
      toast.success(res.data?.message || "Đã gửi mã OTP!");
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.data?.phone) {
        toast.error(errorData.data.phone);
      } else if (errorData?.message) {
        toast.error(errorData.message);
      } else {
        toast.error("Lỗi gửi OTP. Vui lòng thử lại!");
      }
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return toast.error("Vui lòng nhập mã OTP");
    try {
      const res = await api.post("/auth/forgot-password/verify-otp", {
        phone,
        otpCode: otp,
      });
      toast.success(res.data?.message || "Mã OTP hợp lệ!");
      setStep(2);
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.data?.otpCode) {
        toast.error(errorData.data.otpCode);
      } else if (errorData?.message) {
        toast.error(errorData.message);
      } else {
        toast.error("Mã OTP không hợp lệ hoặc đã hết hạn");
      }
    }
  };

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      toast.error("Mật khẩu nhập lại không khớp");
      return;
    }

    try {
      const res = await api.post("/auth/forgot-password/reset", {
        phone,
        otpCode: otp,
        newPassword: password,
      });
      toast.success(res.data?.message || "Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      if (openAuthModal) openAuthModal('login');
      else navigate("/login");
    } catch (error) {
      const errorData = error.response?.data;
      toast.error(errorData?.message || "Đổi mật khẩu thất bại. Vui lòng thử lại!");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center backdrop-blur-sm p-4 antialiased">
      <div className="bg-white rounded-3xl shadow-2xl flex max-w-[900px] w-full min-h-[500px] overflow-hidden relative animate-in fade-in zoom-in-95 duration-300">
        
        <button onClick={() => closeAuthModal ? closeAuthModal() : navigate('/')} className="absolute top-4 right-4 z-10 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-700"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* LEFT IMAGE */}
        <div className="hidden md:flex w-1/2 bg-gray-100 items-center justify-center relative">
          <img
            src="/pharmacy.png"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* RIGHT */}
        <div className="w-full md:w-1/2 bg-green-50/50 flex items-center justify-center p-8 lg:p-12 relative">

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
                onClick={() => openAuthModal ? openAuthModal('login') : navigate("/login")}
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
    </div>
  );
};

export default ForgotPassword;