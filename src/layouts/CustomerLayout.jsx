import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { IMAGES } from '../constants/images';

const BASE_URL = 'http://35.247.173.19:8080/api/v1';

export default function CustomerLayout() {
  const navigate = useNavigate();
  
  // State cho Header
  const [showPromo, setShowPromo] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');

  // =====================================================================
  // HÀM KIỂM TRA ĐĂNG NHẬP: Dùng cho Giỏ hàng và Lịch sử
  // =====================================================================
  const handleProtectedAction = (path) => {
    // Giả sử sau này bạn Login thành công, bạn sẽ lưu token vào localStorage
    const isLoggedIn = localStorage.getItem('accessToken'); 
    
    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để tiếp tục!');
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  const handleSearch = async (e) => {
    if (e && e.key && e.key !== 'Enter') return;
    if (e && e.preventDefault) e.preventDefault();

    if (!searchKeyword.trim()) {
      toast.error('Vui lòng nhập từ khóa tìm kiếm!');
      return;
    }

    const searchToast = toast.loading('Đang tìm kiếm...');

    try {
      const requestBody = {
        categorySlug: "", 
        pageNo: 0,
        pageSize: 15,
        sortBy: "createdAt",
        sortDir: "DESC",
        keyword: searchKeyword.trim()
      };

      const res = await axios.post(`${BASE_URL}/products/search`, requestBody);
      
      if (res.data.status === 200) {
        const foundProducts = res.data.data.content;
        const totalFound = res.data.data.totalElements;

        if (foundProducts.length > 0) {
          toast.success(`Tìm thấy ${totalFound} sản phẩm khớp với "${searchKeyword}"`, { id: searchToast });
        } else {
          toast.error(`Không tìm thấy sản phẩm nào khớp với "${searchKeyword}"`, { id: searchToast });
        }
      }
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
      toast.error('Lỗi kết nối đến máy chủ khi tìm kiếm!', { id: searchToast });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-800 flex flex-col relative">
      <Toaster position="top-center" />

      {/* =========================================================
          HEADER (Luôn hiển thị)
          ========================================================= */}
      <div className="sticky top-0 z-50 w-full shadow-md flex flex-col flex-shrink-0">
        {showPromo && (
          <div className="bg-[#2D982A] text-white relative flex justify-center items-center py-1.5 px-4">
            <button onClick={() => setShowPromo(false)} className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer hover:opacity-70 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="text-center leading-snug">
              <p className="font-bold text-[15px] uppercase tracking-wide">Mua hàng tích lũy - Nhận ngay nhiều ưu đãi</p>
              <p className="text-[13px] font-light mt-0.5">Đăng ký thành viên ngay <span onClick={() => navigate('/register')} className="underline font-normal hover:text-gray-200 cursor-pointer">tại đây!</span></p>
            </div>
          </div>
        )}

        <header className="bg-white border-b border-gray-200">
          <div className="w-full px-6 xl:px-16 py-3 flex items-center justify-between">
            
            {/* Logo */}
            <div className="flex-shrink-0 mr-4 cursor-pointer" onClick={() => navigate('/')}>
              <img src={IMAGES.LOGO_MAIN} alt="Nhà thuốc Thái Dương" className="h-16 xl:h-20 object-contain" />
            </div>

            {/* Menu & Search */}
            <div className="flex-1 flex justify-center px-4">
              <div className="w-full max-w-[650px] flex flex-col items-center">
                <div className="flex space-x-10 xl:space-x-12 mb-2">
                  <span onClick={() => navigate('/')} className="text-[14px] font-medium text-gray-800 hover:text-[#2D982A] cursor-pointer">Trang chủ</span>
                  <span onClick={() => navigate('/about')} className="text-[14px] font-medium text-gray-800 hover:text-[#2D982A] cursor-pointer">Giới thiệu</span>
                  <span onClick={() => navigate('/news')} className="text-[14px] font-medium text-gray-800 hover:text-[#2D982A] cursor-pointer">Tin tức</span>
                  <span onClick={() => navigate('/support')} className="text-[14px] font-medium text-gray-800 hover:text-[#2D982A] cursor-pointer">Hỗ trợ</span>
                </div>

                <div className="relative w-full">
                  <svg onClick={handleSearch} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[20px] h-[20px] absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer hover:text-[#2D982A] transition-colors">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <input type="text" placeholder="Tìm kiếm sản phẩm..." value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} onKeyDown={handleSearch} className="w-full border border-gray-400 rounded-full py-2.5 pl-11 pr-4 outline-none focus:border-[#2D982A] focus:ring-1 focus:ring-[#2D982A] text-[15px] text-gray-800" />
                </div>
              </div>
            </div>

            {/* Các nút tương tác bên phải */}
            <div className="flex-shrink-0 flex flex-col items-end ml-4">
              <div className="flex items-center space-x-6 mb-2">
                <div className="text-[14px] text-gray-700">Hotline: <span className="text-[17px] font-bold text-black ml-1">1800 29YY</span></div>
                
                {/* NÚT ĐĂNG NHẬP */}
                <div onClick={() => navigate('/login')} className="flex items-center space-x-1.5 cursor-pointer hover:text-[#2D982A] group">
                  <span className="text-[14px] font-bold text-gray-800 group-hover:text-[#2D982A]">Đăng nhập</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[26px] h-[26px] text-[#2D982A]"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 4.5a7.5 7.5 0 100 15 7.5 7.5 0 000-15zM12 12a3.375 3.375 0 100-6.75 3.375 3.375 0 000 6.75zM6.621 17.073a5.25 5.25 0 0110.758 0 .75.75 0 01-1.071.936A3.75 3.75 0 0012 15a3.75 3.75 0 00-4.308 3.009.75.75 0 01-1.071-.936z" clipRule="evenodd" /></svg>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* NÚT LỊCH SỬ MUA HÀNG: Bị chặn nếu chưa login */}
                <button 
                  onClick={() => handleProtectedAction('/orders')} 
                  className="flex items-center border cursor-pointer border-gray-300 rounded-lg px-3.5 py-1.5 hover:bg-gray-50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[24px] h-[24px] text-[#2D982A] mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6" /></svg>
                  <div className="text-left leading-[1.1]"><span className="block text-[13px] font-bold text-gray-800">Lịch sử</span><span className="block text-[13px] font-bold text-gray-800">mua hàng</span></div>
                </button>

                {/* NÚT GIỎ HÀNG: Bị chặn nếu chưa login */}
                <button 
                  onClick={() => handleProtectedAction('/cart')} 
                  className="flex items-center border cursor-pointer border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-[14px] font-bold text-gray-800 mr-2.5">Giỏ hàng</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#2D982A]"><path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" /></svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        <nav className="bg-[#2D982A] text-white antialiased">
          <ul className="flex justify-center space-x-16 xl:space-x-24 py-3">
            {['THUỐC', 'THỰC PHẨM CHỨC NĂNG', 'DƯỢC - MỸ PHẨM', 'THIẾT BỊ Y TẾ'].map((item, index) => (
              <li key={index} className="flex items-center space-x-1.5 cursor-pointer hover:text-gray-100 transition-colors group relative">
                <span className="text-[15px] font-normal tracking-wide">{item}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[14px] h-[14px] mt-0.5 group-hover:rotate-180 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* =========================================================
          NỘI DUNG ĐỘNG
          ========================================================= */}
      <main className="flex-1 w-full flex flex-col">
        <Outlet />
      </main>

      {/* =========================================================
          FOOTER (Luôn hiển thị)
          ========================================================= */}
      <footer className="w-full bg-white mt-auto flex flex-col">
        
        <div className="bg-[#dff5d8] py-10 flex flex-col items-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 uppercase tracking-wide mb-8">MUA HÀNG DỄ DÀNG TẠI THÁI DƯƠNG</h2>
          <div className="flex w-full max-w-4xl justify-center items-center space-x-12 px-6">
            <div className="flex-1 flex flex-col items-center text-center">
              <div className="bg-[#2D982A] w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-8 h-8"><path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z" clipRule="evenodd" /></svg>
              </div>
              <p className="text-gray-800 text-[15px] leading-relaxed">Mua trực tiếp<br />tại hệ thống cửa hàng Thái Dương</p>
            </div>
            <div className="w-[1px] h-24 bg-[#2D982A] opacity-30 hidden md:block"></div>
            <div className="flex-1 flex flex-col items-center text-center">
              <div className="bg-transparent border-2 border-[#2D982A] w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#2D982A" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53a.75.75 0 011.06 0z" /></svg>
              </div>
              <p className="text-gray-800 text-[15px] leading-relaxed">Chọn và mua ngay sản phẩm<br />tại website của nhà thuốc Thái Dương</p>
            </div>
          </div>
        </div>

        <div className="h-16 bg-white w-full border-t border-gray-100"></div>

        <div className="bg-[#eef8ef] py-10 border-y border-green-100">
          <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2D982A" className="w-12 h-12"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" /></svg>
              <h3 className="font-bold text-[14px] text-gray-800 uppercase">THUỐC CHÍNH HÃNG</h3>
            </div>
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#2D982A" className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>
              <h3 className="font-bold text-[14px] text-gray-800 uppercase">CAM KẾT CHẤT LƯỢNG</h3>
            </div>
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2D982A" className="w-12 h-12"><path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" /></svg>
              <h3 className="font-bold text-[14px] text-gray-800 uppercase">HỖ TRỢ TƯ VẤN</h3>
            </div>
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#2D982A" className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
              <h3 className="font-bold text-[14px] text-gray-800 uppercase">MIỄN PHÍ VẬN CHUYỂN</h3>
            </div>
          </div>
        </div>

        <div className="bg-white py-12 px-6 xl:px-16 w-full max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-4">
            <img src={IMAGES.LOGO_MAIN} alt="Logo" className="h-16 object-contain mb-6" />
            <p className="font-bold text-[14px] text-gray-900">Công ty cổ phần bán lẻ Nhà thuốc Thái Dương</p>
            <p className="text-[13px] text-gray-700 leading-relaxed"><strong>Số ĐKKD 12346789</strong> cấp 04/11/2018 tại Sở KH ĐT Hà Nội</p>
            <p className="text-[13px] text-gray-700"><strong>Địa chỉ:</strong> XX Hoàng Mai, Hà Nội</p>
          </div>
          <div className="lg:col-span-3">
            <h3 className="font-bold text-[15px] text-gray-900 mb-6 uppercase">GIỚI THIỆU</h3>
            <ul className="space-y-3">
              {['Giới thiệu nhà thuốc', 'Hướng dẫn mua hàng', 'Đổi trả, bảo hành'].map((link, idx) => (
                <li key={idx}><span onClick={() => navigate('/about')} className="text-[13px] text-gray-600 hover:text-[#2D982A] cursor-pointer">{link}</span></li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-2">
            <h3 className="font-bold text-[15px] text-gray-900 mb-6 uppercase">DANH MỤC</h3>
            <ul className="space-y-3">
              {['Thuốc', 'TPCN', 'Dược - Mỹ phẩm', 'Thiết bị y tế'].map((link, idx) => (
                <li key={idx}><a href="#" className="text-[13px] text-gray-600 hover:text-[#2D982A]">{link}</a></li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-3">
            <h3 className="font-bold text-[15px] text-[#2D982A] mb-4 uppercase">KẾT NỐI VỚI THÁI DƯƠNG</h3>
            <div className="flex space-x-4 mb-6">
              
              {/* 1. Facebook */}
              <a 
                href="https://www.facebook.com/trang-cua-ban" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center cursor-pointer hover:opacity-80 shadow-sm"
              >
                <svg fill="white" viewBox="0 0 24 24" className="w-5 h-5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>

              {/* 2. Google */}
              <a 
                href="https://g.page/nhathuocthaiduong" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-gray-50 shadow-sm border border-gray-100"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              </a>

              {/* 3. Zalo */}
              <a 
                href="https://zalo.me/098xxxxxxx"
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-gray-50 shadow-sm border border-gray-100"
              >
                <svg viewBox="0 0 24 24" fill="#0068FF" className="w-6 h-6"><path d="M21.036 12c0-5.111-4.704-9.253-10.5-9.253C4.74 2.747 0 6.889 0 12c0 2.502 1.109 4.773 2.923 6.438-.179 1.636-.889 3.203-.925 3.359-.059.26.155.51.423.447 2.146-.499 4.254-1.634 5.393-2.378 1.16.326 2.404.502 3.722.502 5.796 0 10.5-4.142 10.5-9.253zm-14.83 2.222v-3.79c0-.283.21-.527.49-.554h2.529c.307 0 .556.25.556.558v.481c0 .307-.25.557-.556.557H7.728v.538h1.498c.306 0 .555.25.555.557v.48c0 .308-.25.557-.555.557H7.728v.636c0 .285-.211.53-.492.556H6.702c-.282-.026-.493-.27-.493-.556zm5.83-2.124h-1.57c-.308 0-.557-.25-.557-.557v-.481c0-.308.25-.558.557-.558h1.57c.308 0 .556.25.556.558v.481c0 .307-.25.557-.556.557zm-1.57 2.124h1.57c.308 0 .556-.25.556-.557v-.48c0-.307-.25-.557-.556-.557h-1.57c-.308 0-.557.25-.557.557v.48c0 .308.25.557.557.557zm4.195-2.124h-1.57c-.307 0-.556-.25-.556-.557v-.481c0-.308.25-.558.556-.558h1.57c.308 0 .557.25.557.558v.481c0 .307-.25.557-.557.557zm-1.57 2.124h1.57c.308 0 .557-.25.557-.557v-.48c0-.307-.25-.557-.557-.557h-1.57c-.307 0-.556.25-.556.557v.48c0 .308.25.557.556.557zm4.195-1.03c0 1.222-.996 2.213-2.222 2.213s-2.222-.99-2.222-2.213.996-2.213 2.222-2.213 2.222.99 2.222 2.213zm-1.111 0c0-.61-.497-1.106-1.111-1.106s-1.111.496-1.111 1.106.497 1.106 1.111 1.106 1.111-.496 1.111-1.106z"/></svg>
              </a>

            </div>
            <p className="text-[14px] text-gray-800 mb-6 flex items-center"><strong>Hotline:</strong> <span className="font-black text-[18px] text-black tracking-wide ml-2">1800 29YY</span></p>
          </div>
        </div>
        <div className="bg-[#2D982A] py-3 text-center w-full mt-auto">
          <p className="text-white text-[13px] font-medium">Copyright©</p>
        </div>
      </footer>
    </div>
  );
}