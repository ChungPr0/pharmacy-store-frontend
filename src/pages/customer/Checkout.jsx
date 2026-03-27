import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const formatVND = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const selectedProductIds = location.state?.selectedItems || [];

  const [cartData, setCartData] = useState({ items: [], totalItems: 0, totalPrice: 0 });
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderCode, setOrderCode] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    houseNumber: '', 
    alley: '',       
    ward: '',        
    province: '',    
    note: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const shippingFee = 25000;

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchCartForCheckout = async () => {
      try {
        const res = await api.get('/cart');
        if (res.data.status === 200) {
          let data = res.data.data;
          
          if (data && data.items && selectedProductIds.length > 0) {
             data.items = data.items.filter(item => selectedProductIds.includes(item.productId));
             data.totalPrice = data.items.reduce((sum, item) => sum + item.itemTotal, 0);
             data.totalItems = data.items.length;
          }

          if (!data || !data.items || data.items.length === 0) {
            toast.error('Giỏ hàng trống hoặc chưa chọn sản phẩm!');
            navigate('/cart');
            return;
          }
          setCartData(data);
        }
      } catch (error) {
        toast.error('Không thể tải dữ liệu đơn hàng');
        navigate('/cart');
      } finally {
        setLoading(false);
      }
    };

    fetchCartForCheckout();
  }, [navigate, selectedProductIds]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckoutSubmit = async () => {
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.houseNumber.trim() || !formData.ward.trim() || !formData.province) {
      toast.error('Vui lòng điền đầy đủ thông tin nhận hàng (các trường có dấu *)');
      return;
    }
    if (!termsAccepted) {
      toast.error('Vui lòng đồng ý với chính sách của nhà thuốc');
      return;
    }

    const addressParts = [
      formData.houseNumber.trim(), 
      formData.alley.trim(), 
      formData.ward.trim(), 
      formData.province
    ].filter(Boolean); 

    let fullAddress = addressParts.join(', ');
    if (formData.note.trim()) {
        fullAddress += ` (Ghi chú: ${formData.note.trim()})`;
    }

    // Lấy mảng ID sản phẩm khách đã chọn mua
    const listProductIds = cartData.items.map(item => item.productId);

    // Payload chuẩn theo API Contract mới nhất
    const payload = {
        receiverName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        shippingAddressText: fullAddress, 
        paymentMethod: paymentMethod,
        paymentToken: null,
        productIds: listProductIds 
    };

    const loadToast = toast.loading('Đang xử lý đơn hàng...');
    try {
      const res = await api.post('/orders/checkout', payload);
      
      if (res.data.status === 200) {
        toast.success('Xử lý thành công!', { id: loadToast });
        setOrderCode(res.data.data?.orderCode || ''); // Lưu lại mã đơn hàng (nếu cần hiển thị)
        setShowSuccessModal(true); // Hiển thị Popup thành công
        window.dispatchEvent(new Event('cartUpdated')); // Update số lượng giỏ hàng trên Header
      } else {
        toast.error(res.data.message || 'Có lỗi xảy ra khi đặt hàng', { id: loadToast });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Không thể kết nối đến máy chủ';
      toast.error(errorMsg, { id: loadToast });
    }
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-[#2D982A] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const grandTotal = cartData.totalPrice + shippingFee;

  return (
    <div className="flex-1 w-full bg-[#f8f9fa] pb-20 pt-6 antialiased relative">
      
      {/* POPUP THÔNG BÁO THÀNH CÔNG */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#eef8ef] rounded-2xl shadow-2xl w-[90%] max-w-[450px] overflow-hidden transform scale-100 transition-transform">
            {/* Header Popup */}
            <div className="bg-[#2D982A] py-4 flex items-center justify-center">
              <h2 className="text-white font-black text-[18px] uppercase tracking-wide">Đặt hàng thành công</h2>
            </div>
            
            {/* Body Popup */}
            <div className="p-8 flex flex-col items-center text-center">
              <p className="text-[#2D982A] font-bold text-[18px] mb-2">Đặt hàng thành công!</p>
              {orderCode && <p className="text-gray-800 font-bold mb-1">Mã đơn hàng: {orderCode}</p>}
              <p className="text-gray-600 text-[14px] mb-8">Vui lòng theo dõi tình trạng đơn hàng</p>
              
              <div className="flex space-x-4 w-full">
                <button 
                  onClick={() => navigate('/')} 
                  className="flex-1 py-2.5 rounded-lg border-2 border-[#2D982A] bg-white text-[#2D982A] font-bold text-[14px] hover:bg-[#eef8ef] transition-colors"
                >
                  Về trang chủ
                </button>
                <button 
                  onClick={() => navigate('/orders')} 
                  className="flex-1 py-2.5 rounded-lg bg-[#2D982A] text-white font-bold text-[14px] hover:bg-green-700 transition-colors shadow-sm"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NỘI DUNG TRANG CHECKOUT (Bên dưới) */}
      <div className={`max-w-[1200px] mx-auto px-6 xl:px-0 ${showSuccessModal ? 'pointer-events-none blur-[1px]' : ''}`}>
        
        {/* BREADCRUMB */}
        <div className="flex items-center space-x-2 text-[14px] text-gray-500 mb-6">
          <span onClick={() => navigate('/')} className="hover:text-[#2D982A] cursor-pointer transition-colors">Trang chủ</span>
          <span>/</span>
          <span onClick={() => navigate('/cart')} className="hover:text-[#2D982A] cursor-pointer transition-colors">Giỏ hàng</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">Thanh toán</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CỘT TRÁI */}
          <div className="lg:col-span-8 flex flex-col space-y-6">
            
            {/* 1. KHỐI GIỎ HÀNG */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[22px] font-black text-gray-900">Giỏ hàng ({cartData.totalItems})</h2>
                <button 
                  onClick={() => navigate('/cart')}
                  className="px-4 py-1.5 border border-gray-400 rounded-full text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Chỉnh sửa giỏ hàng
                </button>
              </div>

              <div className="grid grid-cols-12 gap-4 pb-3 border-b border-gray-200 text-[14px] font-bold text-gray-800">
                <div className="col-span-6 text-center">Sản phẩm</div>
                <div className="col-span-3 text-center">Giá thành</div>
                <div className="col-span-3 text-center">Số lượng</div>
              </div>

              <div className="divide-y divide-gray-100">
                {cartData.items.map((item) => (
                  <div key={item.productId} className="grid grid-cols-12 gap-4 py-5 items-center">
                    <div className="col-span-6 flex items-center space-x-4">
                      <div className="w-[60px] h-[60px] border border-gray-200 rounded flex items-center justify-center p-1 flex-shrink-0 bg-white">
                        <img src={item.imageUrl} alt={item.name} className="max-w-full max-h-full object-contain" onError={(e) => { e.target.onerror = null; e.target.src = "https://nhathuoclongchau.com.vn/estore-images/front-end/no-image.png"; }} />
                      </div>
                      <span className="text-[14px] font-medium text-gray-800 line-clamp-2 leading-snug">
                        {item.name}
                      </span>
                    </div>
                    <div className="col-span-3 text-center text-black font-bold text-[15px]">
                      {formatVND(item.price)}
                    </div>
                    <div className="col-span-3 text-center text-gray-800 font-medium text-[15px]">
                      {item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. KHỐI THÔNG TIN NHẬN HÀNG */}
            <div className="bg-[#eef8ef] rounded-xl shadow-sm border border-green-100 p-6 md:p-8">
              <h2 className="text-[22px] font-black text-gray-900 mb-6">Thông tin nhận hàng</h2>
              
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col md:flex-row md:items-center">
                  <label className="w-[140px] text-[14px] font-medium text-gray-800 mb-1 md:mb-0">Tên khách hàng:</label>
                  <div className="flex-1 relative">
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full p-2.5 rounded border border-gray-300 outline-none focus:border-[#2D982A] bg-white text-[14px]" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 font-bold">*</span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center">
                  <label className="w-[140px] text-[14px] font-medium text-gray-800 mb-1 md:mb-0">Số điện thoại:</label>
                  <div className="flex-1 relative">
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-2.5 rounded border border-gray-300 outline-none focus:border-[#2D982A] bg-white text-[14px]" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 font-bold">*</span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center">
                  <label className="w-[140px] text-[14px] font-medium text-gray-800 mb-1 md:mb-0">Email:</label>
                  <div className="flex-1 relative">
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-2.5 rounded border border-gray-300 outline-none focus:border-[#2D982A] bg-white text-[14px]" />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-start">
                  <label className="w-[140px] text-[14px] font-medium text-gray-800 mb-1 md:mb-0 mt-3">Địa chỉ:</label>
                  <div className="flex-1 flex flex-col space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="relative">
                        <input type="text" name="houseNumber" value={formData.houseNumber} onChange={handleInputChange} placeholder="Số nhà (VD: Số 10)" className="w-full p-2.5 rounded border border-gray-300 outline-none focus:border-[#2D982A] bg-white text-[14px]" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 font-bold">*</span>
                      </div>
                      <div className="relative">
                        <input type="text" name="alley" value={formData.alley} onChange={handleInputChange} placeholder="Ngõ/Ngách (VD: Ngõ 2)" className="w-full p-2.5 rounded border border-gray-300 outline-none focus:border-[#2D982A] bg-white text-[14px]" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="relative">
                        <input type="text" name="ward" value={formData.ward} onChange={handleInputChange} placeholder="Tên Phường/Quận (VD: Cầu Giấy)" className="w-full p-2.5 rounded border border-gray-300 outline-none focus:border-[#2D982A] bg-white text-[14px]" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 font-bold">*</span>
                      </div>

                      <div className="relative">
                        <select name="province" value={formData.province} onChange={handleInputChange} className="w-full p-2.5 rounded border border-gray-300 outline-none focus:border-[#2D982A] bg-white text-[14px] appearance-none cursor-pointer font-medium">
                          <option value="">Tỉnh/ Thành Phố</option>
                          <option value="An Giang">An Giang</option>
                          <option value="Bắc Ninh">Bắc Ninh</option>
                          <option value="Cà Mau">Cà Mau</option>
                          <option value="Cao Bằng">Cao Bằng</option>
                          <option value="Đắk Lắk">Đắk Lắk</option>
                          <option value="Điện Biên">Điện Biên</option>
                          <option value="Đồng Nai">Đồng Nai</option>
                          <option value="Đồng Tháp">Đồng Tháp</option>
                          <option value="Gia Lai">Gia Lai</option>
                          <option value="Hà Tĩnh">Hà Tĩnh</option>
                          <option value="Hưng Yên">Hưng Yên</option>
                          <option value="Khánh Hòa">Khánh Hòa</option>
                          <option value="Lai Châu">Lai Châu</option>
                          <option value="Lâm Đồng">Lâm Đồng</option>
                          <option value="Lạng Sơn">Lạng Sơn</option>
                          <option value="Lào Cai">Lào Cai</option>
                          <option value="Nghệ An">Nghệ An</option>
                          <option value="Ninh Bình">Ninh Bình</option>
                          <option value="Phú Thọ">Phú Thọ</option>
                          <option value="Quảng Ngãi">Quảng Ngãi</option>
                          <option value="Quảng Ninh">Quảng Ninh</option>
                          <option value="Quảng Trị">Quảng Trị</option>
                          <option value="Sơn La">Sơn La</option>
                          <option value="Tây Ninh">Tây Ninh</option>
                          <option value="Thái Nguyên">Thái Nguyên</option>
                          <option value="Thanh Hóa">Thanh Hóa</option>
                          <option value="TP Cần Thơ">TP Cần Thơ</option>
                          <option value="TP Đà Nẵng">TP Đà Nẵng</option>
                          <option value="TP Hà Nội">TP Hà Nội</option>
                          <option value="TP Hải Phòng">TP Hải Phòng</option>
                          <option value="TP Hồ Chí Minh">TP Hồ Chí Minh</option>
                          <option value="TP Huế">TP Huế</option>
                          <option value="Tuyên Quang">Tuyên Quang</option>
                          <option value="Vĩnh Long">Vĩnh Long</option>
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 font-bold pointer-events-none">*</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-start">
                  <label className="w-[140px] text-[14px] font-medium text-gray-800 mb-1 md:mb-0 mt-3">Ghi chú:</label>
                  <div className="flex-1">
                    <textarea name="note" value={formData.note} onChange={handleInputChange} placeholder="Nhập ghi chú (không bắt buộc)..." rows="3" className="w-full p-2.5 rounded border border-gray-300 outline-none focus:border-[#2D982A] bg-white text-[14px] resize-y"></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. KHỐI HÌNH THỨC THANH TOÁN */}
            <div className="bg-[#eef8ef] rounded-xl shadow-sm border border-green-100 p-6 md:p-8">
              <h2 className="text-[22px] font-black text-gray-900 mb-6">Hình thức thanh toán</h2>
              <div className="flex flex-col space-y-5 pl-2 md:pl-10">
                <label className="flex items-center cursor-pointer group">
                  <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-[#2D982A] mr-3 cursor-pointer" />
                  <span className={`text-[15px] ${paymentMethod === 'COD' ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>Thanh toán khi nhận hàng (COD)</span>
                </label>
                <label className="flex items-center cursor-pointer group">
                  <input type="radio" name="payment" value="ATM" checked={paymentMethod === 'ATM'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-[#2D982A] mr-3 cursor-pointer" />
                  <span className={`text-[15px] ${paymentMethod === 'ATM' ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>Thanh toán qua thẻ ATM nội địa / Internet Banking</span>
                </label>
                <label className="flex items-center cursor-pointer group">
                  <input type="radio" name="payment" value="MOMO" checked={paymentMethod === 'MOMO'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-[#2D982A] mr-3 cursor-pointer" />
                  <span className={`text-[15px] ${paymentMethod === 'MOMO' ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>Thanh toán qua ví điện tử Momo</span>
                </label>
              </div>
            </div>

          </div>

          {/* CỘT PHẢI: TỔNG KẾT ĐƠN HÀNG */}
          <div className="lg:col-span-4 h-fit sticky top-[120px]">
            <div className="bg-[#eef8ef] rounded-xl shadow-sm border border-green-100 p-6">
              
              <div className="flex items-center space-x-2 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#2D982A]"><path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clipRule="evenodd" /><path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" /></svg>
                <h2 className="text-[20px] font-black text-gray-900">Đơn hàng</h2>
              </div>
              
              <div className="space-y-4 text-[14px] text-gray-700 border-b border-gray-300 pb-5 mb-5">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">Tổng tiền</span>
                  <span className="font-bold text-black">{formatVND(cartData.totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">Giảm giá</span>
                  <span className="font-bold text-black">0đ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-black">Tạm tính</span>
                  <span className="font-bold text-black">{formatVND(cartData.totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">Phí vận chuyển</span>
                  <span className="font-bold text-black">{formatVND(shippingFee)}</span>
                </div>
              </div>

              <div className="mb-6 flex items-center border-b border-gray-400 pb-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#2D982A] mr-2"><path fillRule="evenodd" d="M5.25 2.25a3 3 0 00-3 3v4.318a3 3 0 00.879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 005.441-5.44c.758-1.16.492-2.629-.428-3.548l-9.58-9.581a3 3 0 00-2.122-.879H5.25zM6.375 7.5a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z" clipRule="evenodd" /></svg>
                <input type="text" placeholder="Nhập mã giảm giá" className="flex-1 bg-transparent outline-none text-[14px] text-gray-800 placeholder-gray-500" />
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-[16px] font-bold text-black">Thành tiền</span>
                <span className="text-[22px] font-black text-black">{formatVND(grandTotal)}</span>
              </div>

              <label className="flex items-start cursor-pointer mb-6 group">
                <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-1 w-4 h-4 accent-[#2D982A] rounded border-gray-300 flex-shrink-0 cursor-pointer" />
                <span className="text-[13px] text-gray-700 ml-2 leading-snug">
                  Đồng ý với các chính sách của Nhà thuốc để hoàn tất đơn hàng
                </span>
              </label>

              <button 
                onClick={handleCheckoutSubmit} 
                className="w-full py-3.5 rounded-lg bg-[#2D982A] font-bold text-[15px] text-white uppercase tracking-wide hover:bg-green-700 transition-all shadow-md"
              >
                HOÀN TẤT
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;