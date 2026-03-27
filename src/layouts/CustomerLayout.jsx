import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { toast, Toaster, resolveValue } from 'react-hot-toast';
import { IMAGES } from '../constants/images';
import api from '../api/axios';
import { useCart } from '../contexts/CartContext';

export default function CustomerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, getTotalItems, logout, fetchCart } = useCart();
  
  const [showPromo, setShowPromo] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    if (token) {
      const timer = setTimeout(() => {
        fetchCart();
      }, 100);
      window.addEventListener('cartUpdated', fetchCart);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('cartUpdated', fetchCart);
      };
    }
    
  }, [token]);

  const handleProtectedAction = (path) => {
    if (!token) {
      toast.error('Vui lòng đăng nhập để tiếp tục!');
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  const handleSearch = (e) => {
    if (e && e.key && e.key !== 'Enter') return;
    if (e && e.preventDefault) e.preventDefault();

    if (!searchKeyword.trim()) {
      toast.error('Vui lòng nhập từ khóa tìm kiếm!');
      return;
    }
    document.activeElement.blur(); 
    navigate(`/search?keyword=${encodeURIComponent(searchKeyword.trim())}`);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-800 flex flex-col relative">
      
      <style>
        {`@keyframes shrink-progress { 0% { width: 100%; } 100% { width: 0%; } }`}
      </style>

      {/* TOASTER KHÔNG ĐỔI */}
      <Toaster position="top-right" containerStyle={{ zIndex: 999999, top: 20, right: 20 }} toastOptions={{ duration: 5000 }}>
        {(t) => {
          let color = "bg-blue-500"; let borderColor = "border-blue-500"; let icon = <span className="text-white font-bold text-[14px]">i</span>;
          if (t.type === 'success') {
            color = "bg-[#22c55e]"; borderColor = "border-[#22c55e]";
            icon = <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
          } else if (t.type === 'error') {
            color = "bg-[#ef4444]"; borderColor = "border-[#ef4444]";
            icon = <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
          } else if (t.type === 'loading') {
            color = "bg-[#f59e0b]"; borderColor = "border-[#f59e0b]";
            icon = <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>;
          }
          return (
            <div style={{ opacity: t.visible ? 1 : 0, transform: t.visible ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} className={`max-w-sm w-full bg-white shadow-xl rounded-lg pointer-events-auto flex flex-col border-l-[4px] ${borderColor} relative overflow-hidden`}>
              <div className="p-3.5 w-full flex items-center">
                <div className="flex-shrink-0"><div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm ${color}`}>{icon}</div></div>
                <div className="ml-3 flex-1"><p className="text-[14px] font-bold text-gray-800 pr-2 leading-snug">{resolveValue(t.message, t)}</p></div>
                <div className="flex-shrink-0 flex ml-2"><button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none"><svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button></div>
              </div>
              {t.visible && <div className={`absolute bottom-0 left-0 h-[3px] ${color} opacity-80`} style={{ animation: 'shrink-progress 5s linear forwards' }}></div>}
            </div>
          );
        }}
      </Toaster>

      {/* HEADER CÂN ĐỐI (TỈ LỆ VÀNG) */}
      <div className="sticky top-0 z-50 w-full shadow-sm flex flex-col flex-shrink-0">
        
        {/* THANH PROMO TRÊN CÙNG */}
        {showPromo && (
          <div className="bg-[#2D982A] text-white relative flex justify-center items-center py-1 px-4">
            <button onClick={() => setShowPromo(false)} className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer hover:opacity-70 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="text-center leading-none flex items-center space-x-2">
              <p className="font-bold text-[12px] uppercase tracking-wide">Mua hàng tích lũy - Nhận ngay nhiều ưu đãi</p>
              <span className="text-[12px] font-light">|</span>
              <p className="text-[12px] font-light">Đăng ký ngay <span onClick={() => navigate('/register')} className="underline font-normal hover:text-gray-200 cursor-pointer">tại đây!</span></p>
            </div>
          </div>
        )}

        {/* PHẦN HEADER CHÍNH */}
        <header className="bg-white border-b border-gray-100">
          <div className="w-full px-6 xl:px-12 py-2.5 flex items-center justify-between">
            
            {/* LOGO */}
            <div className="flex-shrink-0 mr-6 cursor-pointer" onClick={() => navigate('/')}>
              <img src={IMAGES.LOGO_MAIN} alt="Logo" className="h-10 xl:h-12 object-contain" />
            </div>

            {/* TÌM KIẾM & MENU PHỤ */}
            <div className="flex-1 flex justify-center px-4">
              <div className="w-full max-w-[600px] flex flex-col items-center">
                <div className="flex space-x-8 xl:space-x-10 mb-1.5">
                  <span onClick={() => navigate('/')} className="text-[13px] font-medium text-gray-600 hover:text-[#2D982A] cursor-pointer">Trang chủ</span>
                  <span onClick={() => navigate('/about')} className="text-[13px] font-medium text-gray-600 hover:text-[#2D982A] cursor-pointer">Giới thiệu</span>
                  <span onClick={() => navigate('/news')} className="text-[13px] font-medium text-gray-600 hover:text-[#2D982A] cursor-pointer">Tin tức</span>
                  <span onClick={() => navigate('/support')} className="text-[13px] font-medium text-gray-600 hover:text-[#2D982A] cursor-pointer">Hỗ trợ</span>
                </div>

                <div className="relative w-full">
                  <svg onClick={handleSearch} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[18px] h-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-[#2D982A] transition-colors">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <input type="text" placeholder="Tìm kiếm sản phẩm..." value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} onKeyDown={handleSearch} className="w-full border border-gray-300 rounded-full py-2 pl-10 pr-4 outline-none focus:border-[#2D982A] focus:ring-1 focus:ring-[#2D982A] text-[14px] text-gray-800 placeholder-gray-400 leading-tight" />
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex-shrink-0 flex flex-col items-end ml-4">
              <div className="flex items-center space-x-3 mb-1.5">
                <div className="text-[12px] text-gray-500">Hotline: <span className="text-[14px] font-bold text-black">1800 29YY</span></div>
                
                {user ? (
                  <div className="flex items-center space-x-2 border-l border-gray-200 pl-3">
                    <span className="text-[12px] text-gray-500">Chào, <strong className="text-[#2D982A]">{user.fullName || user.name || "Khách"}</strong></span>
                    <span onClick={() => { logout(); navigate('/login'); toast.success('Đã đăng xuất!'); }} className="text-[12px] font-bold text-gray-400 hover:text-red-500 cursor-pointer transition-colors">Đăng xuất</span>
                  </div>
                ) : (
                  <div onClick={() => navigate('/login')} className="flex items-center space-x-1 cursor-pointer hover:text-[#2D982A] group border-l border-gray-200 pl-3">
                    <span className="text-[13px] font-bold text-gray-600 group-hover:text-[#2D982A]">Đăng nhập</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button onClick={() => handleProtectedAction('/orders')} className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-100 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px] text-[#2D982A] mr-1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6" /></svg>
                  <span className="text-[13px] font-bold text-gray-700">Lịch sử</span>
                </button>
                
                <button onClick={() => handleProtectedAction('/cart')} className="relative flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-100 transition-colors">
                  <span className="text-[13px] font-bold text-gray-700 mr-1.5">Giỏ hàng</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[20px] h-[20px] text-[#2D982A]"><path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" /></svg>
                  
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#ef4444] text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm border border-white">
                      {getTotalItems()}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* MENU THANH XANH */}
         <nav className="bg-[#2D982A] text-white antialiased">
          <ul className="flex justify-center space-x-16 xl:space-x-24 py-3">
            {[
              { name: 'THUỐC', slug: 'thuoc' }, 
              { name: 'THỰC PHẨM CHỨC NĂNG', slug: 'thuc-pham-chuc-nang' }, 
              { name: 'DƯỢC - MỸ PHẨM', slug: 'duoc-my-pham' }, 
              { name: 'THIẾT BỊ Y TẾ', slug: 'thiet-bi-y-te' }
            ].map((item, index) => (
              <li 
                key={index} 
                onClick={() => navigate(`/category/${item.slug}`)}
                className="flex items-center space-x-1.5 cursor-pointer hover:text-gray-200 transition-colors group relative"
              >
                <span className="text-[15px] font-bold tracking-wide">{item.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[14px] h-[14px] mt-0.5 group-hover:rotate-180 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <main className="flex-1 w-full flex flex-col">
        <Outlet />
      </main>

      {/* FOOTER GIỮ NGUYÊN */}
      <footer className="w-full bg-white mt-auto flex flex-col">
        <div className="bg-[#dff5d8] py-8 flex flex-col items-center">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 uppercase tracking-wide mb-6">MUA HÀNG DỄ DÀNG TẠI THÁI DƯƠNG</h2>
          <div className="flex w-full max-w-3xl justify-center items-center space-x-8 px-6">
            <div className="flex-1 flex flex-col items-center text-center">
              <div className="bg-[#2D982A] w-12 h-12 rounded flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6"><path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z" clipRule="evenodd" /></svg>
              </div>
              <p className="text-gray-700 text-[13px] leading-relaxed">Mua trực tiếp<br />tại hệ thống cửa hàng Thái Dương</p>
            </div>
            <div className="w-[1px] h-16 bg-[#2D982A] opacity-30 hidden md:block"></div>
            <div className="flex-1 flex flex-col items-center text-center">
              <div className="bg-transparent border border-[#2D982A] w-12 h-12 rounded-full flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#2D982A" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
              </div>
              <p className="text-gray-700 text-[13px] leading-relaxed">Chọn và mua ngay sản phẩm<br />tại website của nhà thuốc</p>
            </div>
          </div>
        </div>

        <div className="bg-[#eef8ef] py-8 border-y border-green-100">
          <div className="w-full max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2D982A" className="w-10 h-10"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" /></svg>
              <h3 className="font-bold text-[13px] text-gray-800 uppercase">THUỐC CHÍNH HÃNG</h3>
            </div>
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#2D982A" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>
              <h3 className="font-bold text-[13px] text-gray-800 uppercase">CAM KẾT CHẤT LƯỢNG</h3>
            </div>
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2D982A" className="w-10 h-10"><path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" /></svg>
              <h3 className="font-bold text-[13px] text-gray-800 uppercase">HỖ TRỢ TƯ VẤN</h3>
            </div>
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#2D982A" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
              <h3 className="font-bold text-[13px] text-gray-800 uppercase">MIỄN PHÍ VẬN CHUYỂN</h3>
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
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center cursor-pointer hover:opacity-80 shadow-sm"><svg fill="white" viewBox="0 0 24 24" className="w-5 h-5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
              <a href="https://g.page" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-gray-50 shadow-sm border border-gray-100"><svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg></a>
              <a href="https://zalo.me" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-gray-50 shadow-sm border border-gray-100"><svg viewBox="0 0 24 24" fill="#0068FF" className="w-6 h-6"><path d="M21.036 12c0-5.111-4.704-9.253-10.5-9.253C4.74 2.747 0 6.889 0 12c0 2.502 1.109 4.773 2.923 6.438-.179 1.636-.889 3.203-.925 3.359-.059.26.155.51.423.447 2.146-.499 4.254-1.634 5.393-2.378 1.16.326 2.404.502 3.722.502 5.796 0 10.5-4.142 10.5-9.253zm-14.83 2.222v-3.79c0-.283.21-.527.49-.554h2.529c.307 0 .556.25.556.558v.481c0 .307-.25.557-.556.557H7.728v.538h1.498c.306 0 .555.25.555.557v.48c0 .308-.25.557-.555.557H7.728v.636c0 .285-.211.53-.492.556H6.702c-.282-.026-.493-.27-.493-.556zm5.83-2.124h-1.57c-.308 0-.557-.25-.557-.557v-.481c0-.308.25-.558.557-.558h1.57c.308 0 .556.25.556.558v.481c0 .307-.25.557-.556.557zm-1.57 2.124h1.57c.308 0 .556-.25.556-.557v-.48c0-.307-.25-.557-.556-.557h-1.57c-.308 0-.557.25-.557.557v.48c0 .308.25.557.557.557zm4.195-2.124h-1.57c-.307 0-.556-.25-.556-.557v-.481c0-.308.25-.558.556-.558h1.57c.308 0 .557.25.557.558v.481c0 .307-.25.557-.557.557zm-1.57 2.124h1.57c.308 0 .557-.25.557-.557v-.48c0-.307-.25-.557-.557-.557h-1.57c-.307 0-.556.25-.556.557v.48c0 .308.25.557.556.557zm4.195-1.03c0 1.222-.996 2.213-2.222 2.213s-2.222-.99-2.222-2.213.996-2.213 2.222-2.213 2.222.99 2.222 2.213zm-1.111 0c0-.61-.497-1.106-1.111-1.106s-1.111.496-1.111 1.106.497 1.106 1.111 1.106 1.111-.496 1.111-1.106z"/></svg></a>
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