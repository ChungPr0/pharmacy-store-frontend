import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { IMAGES } from '../../constants/images'; 

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', address: '',
    gender: 'MALE', password: '', confirmPassword: '', otpCode: ''
  });

  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false
  });

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validateField = (name, value) => {
    let error = '';
    const phoneRegex = /^(0|\+84)[0-9]{8,9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    switch (name) {
      case 'fullName':
        if (!value.trim()) error = 'Tên không được để trống';
        break;
      case 'phone':
        if (!value) error = 'Số điện thoại là bắt buộc';
        else if (!phoneRegex.test(value)) error = 'SĐT không đúng định dạng';
        break;
      case 'email':
        if (value && !emailRegex.test(value)) error = 'Email không hợp lệ';
        break;
      case 'password':
        if (value.length < 6) error = 'Mật khẩu tối thiểu 6 ký tự';
        break;
      case 'confirmPassword':
        if (value !== formData.password) error = 'Mật khẩu không khớp';
        break;
      case 'otpCode':
        if (value.length !== 6) error = 'Mã OTP phải đủ 6 số';
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const togglePasswordVisibility = (name) => {
    setShowPassword((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGetOTP = async () => {
    if (countdown > 0) return; 
    const phoneError = validateField('phone', formData.phone);
    if (phoneError) {
      setErrors(prev => ({...prev, phone: phoneError}));
      return toast.error(phoneError);
    }

    try {
      setLoading(true);
      const response = await axios.post('http://35.247.173.19:8080/api/v1/auth/register/request-otp', {
        phone: formData.phone
      });
      if (response.data.status === 200) {
        toast.success("Mã OTP đã được gửi!");
        setCountdown(60);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi gửi mã OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateAll();
    if (!isValid) {
      toast.error("Vui lòng kiểm tra lại các thông tin bị lỗi!");
      return;
    }

    try {
      setLoading(true);
      const { confirmPassword, ...dataToSend } = formData;
      const response = await axios.post('http://35.247.173.19:8080/api/v1/auth/register/verify-otp', dataToSend);
      if (response.data.status === 201) {
        toast.success("Đăng ký thành công!");
        localStorage.setItem('registeredPhone', response.data.data.phone);
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      const apiRes = error.response?.data;
      if (apiRes?.data) setErrors(apiRes.data);
      toast.error(apiRes?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  const isReady = useMemo(() => {
    const phoneRegex = /^(0|\+84)[0-9]{8,9}$/;
    return (
      formData.fullName.trim() !== '' && 
      phoneRegex.test(formData.phone) &&
      formData.password.length >= 6 && 
      formData.password === formData.confirmPassword &&
      formData.otpCode.length === 6 &&
      !loading
    );
  }, [formData, loading]);

  // Cuộn lên đầu khi vào trang
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="flex-1 w-full bg-[#f8f9fa] py-12 px-4 sm:px-6 flex justify-center items-center font-sans antialiased">
      <Toaster />
      
      {/* KHỐI CARD ĐĂNG KÝ BỌC NGOÀI */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 w-full max-w-[1000px] flex flex-col md:flex-row overflow-hidden">
        
        {/* Cột Trái (Ảnh) */}
        <div className="hidden md:flex md:w-5/12 bg-[#eef8ef] items-center justify-center p-10">
          <img src={IMAGES.LOGO_DK} alt="Pharmacy" className="w-full h-auto object-contain hover:scale-105 transition-transform duration-500" />
        </div>

        {/* Cột Phải (Form) */}
        <div className="w-full md:w-7/12 py-10 px-8 sm:px-12 flex flex-col">
          <div className="text-center mb-8">
            <h2 className="text-[28px] font-black text-[#2D982A] uppercase tracking-wide">Đăng ký thành viên</h2>
            <div className="h-1.5 w-16 bg-[#2D982A] mx-auto mt-3 rounded-full"></div>
            <p className="text-gray-500 text-[14px] mt-4">Điền thông tin bên dưới để tận hưởng ưu đãi từ Thái Dương</p>
          </div>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Tên, SĐT, Email, Địa chỉ */}
            {[
              { label: 'Họ và tên', name: 'fullName', type: 'text', req: true },
              { label: 'Số điện thoại', name: 'phone', type: 'text', req: true },
              { label: 'Email', name: 'email', type: 'email', req: false },
              { label: 'Địa chỉ', name: 'address', type: 'text', req: false },
            ].map((field) => (
              <div key={field.name} className="flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                  <label className="sm:w-32 text-[14px] font-bold text-gray-800">{field.label}:</label>
                  <div className={`flex-1 relative border-b-2 transition-all ${errors[field.name] ? 'border-red-500' : 'border-gray-300 focus-within:border-[#2D982A]'}`}>
                    <input 
                      type={field.type} name={field.name} value={formData[field.name]} 
                      onChange={handleChange} onBlur={handleBlur}
                      className="w-full bg-transparent outline-none py-1.5 text-[15px] text-gray-900" 
                    />
                    {field.req && <span className="absolute right-0 top-1/2 -translate-y-1/2 text-red-500 font-bold">*</span>}
                  </div>
                </div>
                {errors[field.name] && <p className="text-red-500 text-[13px] font-medium italic mt-1 sm:ml-[140px]">{errors[field.name]}</p>}
              </div>
            ))}

            {/* Giới tính */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <label className="sm:w-32 text-[14px] font-bold text-gray-800">Giới tính:</label>
              <div className="flex space-x-8">
                {['MALE', 'FEMALE'].map((g) => (
                  <label key={g} className="flex items-center space-x-2 cursor-pointer group">
                    <input type="radio" name="gender" value={g} checked={formData.gender === g} onChange={handleChange} className="accent-[#2D982A] w-4 h-4 cursor-pointer" />
                    <span className="text-[15px] font-medium text-gray-700 group-hover:text-[#2D982A] transition-colors">{g === 'MALE' ? 'Nam' : 'Nữ'}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Mật khẩu */}
            <div className="space-y-5 pt-1">
              {[{label: 'Mật khẩu', name: 'password'}, {label: 'Nhập lại MK', name: 'confirmPassword'}].map(f => (
                <div key={f.name} className="flex flex-col">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                    <label className="sm:w-32 text-[14px] font-bold text-gray-800">{f.label}:</label>
                    <div className={`flex-1 relative border-b-2 transition-all ${errors[f.name] ? 'border-red-500' : 'border-gray-300 focus-within:border-[#2D982A]'}`}>
                      <input 
                        type={showPassword[f.name] ? "text" : "password"} 
                        name={f.name} 
                        onChange={handleChange} 
                        onBlur={handleBlur}
                        className="w-full bg-transparent outline-none py-1.5 text-[15px] text-gray-900 pr-10" 
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(f.name)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2D982A] transition-colors"
                      >
                        {showPassword[f.name] ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.413 8.242 7.244 4.5 12 4.5c4.757 0 8.587 3.742 9.964 7.178.07.333.07.678 0 1.012-1.377 3.436-5.207 7.178-9.964 7.178-4.757 0-8.588-3.742-9.964-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                  {errors[f.name] && <p className="text-red-500 text-[13px] font-medium italic mt-1 sm:ml-[140px]">{errors[f.name]}</p>}
                </div>
              ))}
            </div>

            {/* Khối lấy OTP */}
            <div className="flex flex-col items-center space-y-4 pt-6">
              <button 
                type="button" onClick={handleGetOTP} disabled={countdown > 0} 
                className={`text-[15px] font-bold underline transition-all ${countdown > 0 ? 'text-gray-400' : 'text-[#2D982A] hover:text-green-700 cursor-pointer'}`}
              >
                {countdown > 0 ? `Gửi lại mã (${countdown}s)` : "Lấy mã OTP"}
              </button>
              
              <div className="flex flex-col w-full px-4 sm:px-12">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <label className="text-[14px] font-bold text-gray-700 whitespace-nowrap">Mã xác nhận:</label>
                  <input 
                    name="otpCode" maxLength="6" onChange={handleChange} onBlur={handleBlur}
                    type="text" 
                    className={`flex-1 border-2 rounded-lg py-2 text-xl text-center font-bold tracking-[0.3em] outline-none transition-colors ${errors.otpCode ? 'border-red-500' : 'border-gray-300 focus:border-[#2D982A]'}`} 
                    placeholder="6 SỐ" 
                  />
                </div>
                {errors.otpCode && <p className="text-red-500 text-[13px] font-medium italic mt-1 text-center">{errors.otpCode}</p>}
              </div>
            </div>

            {/* Nút Submit */}
            <div className="flex justify-center pt-6">
              <button 
                type="submit" 
                className={`w-full sm:w-auto px-16 py-3.5 rounded-full font-bold text-[15px] text-white uppercase shadow-md transition-all
                  ${isReady 
                    ? "bg-[#2D982A] hover:bg-green-700 hover:shadow-lg cursor-pointer" 
                    : "bg-[#2D982A] opacity-50 cursor-not-allowed"} 
                `}
              >
                {loading ? "Đang xử lý..." : "Hoàn tất đăng ký"}
              </button>
            </div>

            <div className="pt-6 border-t border-gray-100 text-center">
              <span className="text-[14px] text-gray-600">Đã có tài khoản? </span>
              <span onClick={() => navigate('/login')} className="text-[#2D982A] text-[15px] font-bold hover:underline cursor-pointer">Đăng nhập ngay</span>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Register;