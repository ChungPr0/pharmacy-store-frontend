import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center py-20 px-6 bg-[#f8f9fa] antialiased min-h-[600px]">
      <div className="w-full max-w-[500px] bg-white rounded-3xl p-10 flex flex-col items-center text-center shadow-sm border border-gray-100">
        <div className="w-40 h-40 bg-green-50 rounded-full flex items-center justify-center mb-8 relative">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-20 h-20 text-[#2D982A]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 font-black text-gray-800 text-[18px]">
            404
          </div>
        </div>
        
        <h1 className="text-[26px] font-black text-gray-900 mb-4 tracking-tight">Không tìm thấy trang</h1>
        <p className="text-[15px] text-gray-600 mb-10 leading-relaxed">
          Đường dẫn bạn đang truy cập không tồn tại hoặc đã bị xóa. Vui lòng kiểm tra lại URL hoặc quay về trang chủ.
        </p>
        
        <button 
          onClick={() => navigate('/')} 
          className="w-full py-3.5 bg-[#2D982A] text-white rounded-full font-bold text-[15px] shadow-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span>Về trang chủ</span>
        </button>
        <button 
          onClick={() => navigate(-1)} 
          className="w-full py-3 mt-3 text-gray-600 font-bold text-[14px] hover:text-[#2D982A] transition-colors"
        >
          Quay lại trang trước
        </button>
      </div>
    </div>
  );
};

export default NotFound;
