import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import { useCart } from '../../contexts/CartContext';

const formatVND = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const maskPhoneNumber = (phone) => {
  if (!phone || phone.length < 9) return phone;
  return phone.substring(0, 3) + '****' + phone.substring(phone.length - 3);
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, openAuthModal } = useCart();
  
  const selectedProductIds = location.state?.selectedItems || [];

  const [cartData, setCartData] = useState({ items: [], totalItems: 0, totalPrice: 0 });
  const [loading, setLoading] = useState(true);

  // --- STATE ĐỊA CHỈ ---
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // --- STATE FORM ĐỊA CHỈ (INLINE) ---
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    id: null, receiverName: "", phoneNumber: "", province: "", district: "", ward: "", detailAddress: "", isDefault: false
  });
  const [addressLoading, setAddressLoading] = useState(false);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    if (showAddressForm) {
      fetch('https://esgoo.net/api-tinhthanh/1/0.htm')
        .then(res => res.json())
        .then(data => {
            if (data.error === 0) {
               setProvinces(data.data);
               if (addressForm.province) {
                  const p = data.data.find(x => x.full_name === addressForm.province || x.name === addressForm.province || addressForm.province.includes(x.name));
                  if (p) {
                      fetch(`https://esgoo.net/api-tinhthanh/2/${p.id}.htm`)
                        .then(res => res.json())
                        .then(dData => {
                            if (dData.error === 0) {
                                setDistricts(dData.data);
                                if (addressForm.district) {
                                    const d = dData.data.find(x => x.full_name === addressForm.district || x.name === addressForm.district || addressForm.district.includes(x.name));
                                    if (d) {
                                        fetch(`https://esgoo.net/api-tinhthanh/3/${d.id}.htm`)
                                          .then(res => res.json())
                                          .then(wData => {
                                              if (wData.error === 0) setWards(wData.data);
                                          });
                                    }
                                }
                            }
                        });
                  }
               }
            }
        });
    } else {
        setDistricts([]);
        setWards([]);
    }
  }, [showAddressForm]);

  const handleProvinceChange = (e) => {
      const pId = e.target.options[e.target.selectedIndex].getAttribute('data-id');
      const pName = e.target.value;
      setAddressForm({...addressForm, province: pName, district: '', ward: ''});
      setDistricts([]);
      setWards([]);
      if (pId) {
          fetch(`https://esgoo.net/api-tinhthanh/2/${pId}.htm`)
            .then(res => res.json())
            .then(data => {
                if (data.error === 0) setDistricts(data.data);
            });
      }
  };

  const handleDistrictChange = (e) => {
      const dId = e.target.options[e.target.selectedIndex].getAttribute('data-id');
      const dName = e.target.value;
      setAddressForm({...addressForm, district: dName, ward: ''});
      setWards([]);
      if (dId) {
          fetch(`https://esgoo.net/api-tinhthanh/3/${dId}.htm`)
            .then(res => res.json())
            .then(data => {
                if (data.error === 0) setWards(data.data);
            });
      }
  };

  const handleWardChange = (e) => {
      const wName = e.target.value;
      setAddressForm({...addressForm, ward: wName});
  };

  // --- STATE ĐẶT HÀNG ---
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderCode, setOrderCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const shippingFee = 25000;

  useEffect(() => {
    if (!token) {
        toast.error("Vui lòng đăng nhập để thanh toán!");
        navigate('/');
        openAuthModal('login');
    }
  }, [token, navigate, openAuthModal]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        const [cartRes, addressRes] = await Promise.all([
            api.get('/cart'),
            api.get('/addresses')
        ]);

        if (cartRes.data.status === 200) {
          let data = cartRes.data.data;
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

        if (addressRes.data.status === 200) {
          const addrs = addressRes.data.data || [];
          setAddresses(addrs);
          
          if (addrs.length > 0) {
              const defaultAddr = addrs.find(a => a.isDefault) || addrs[0];
              setSelectedAddressId(defaultAddr.id);
          } else {
              setShowAddressForm(true); 
          }
        }
      } catch (error) {
        toast.error('Không thể tải dữ liệu thanh toán');
        navigate('/cart');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [navigate, selectedProductIds, token]);

  const handleOpenAddressForm = (addr = null) => {
    if (addr) {
      setIsEditingAddress(true);
      setAddressForm({ ...addr });
    } else {
      setIsEditingAddress(false);
      setAddressForm({
        id: null, receiverName: "", phoneNumber: "", province: "", district: "", ward: "", detailAddress: "", isDefault: addresses.length === 0
      });
    }
    setShowAddressForm(true);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressLoading(true);

    const payload = { ...addressForm };

    try {
      if (isEditingAddress) {
        const res = await api.put(`/addresses/${addressForm.id}`, payload);
        if (res.data.status === 200) {
          toast.success("Cập nhật địa chỉ thành công!");
          const updatedAddr = res.data.data;
          setAddresses(prev => {
            let newArr = prev.map(a => a.id === updatedAddr.id ? updatedAddr : (updatedAddr.isDefault ? { ...a, isDefault: false } : a));
            return newArr.sort((a, b) => b.isDefault - a.isDefault); 
          });
          setSelectedAddressId(updatedAddr.id);
          setShowAddressForm(false);
        }
      } else {
        const res = await api.post('/addresses', payload);
        if (res.status === 201 || res.data.status === 201) {
          toast.success("Thêm địa chỉ thành công!");
          const newAddr = res.data.data;
          setAddresses(prev => {
            let newArr = newAddr.isDefault ? prev.map(a => ({ ...a, isDefault: false })) : [...prev];
            return [newAddr, ...newArr].sort((a, b) => b.isDefault - a.isDefault);
          });
          setSelectedAddressId(newAddr.id);
          setShowAddressForm(false);
        }
      }
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.data && typeof errorData.data === 'object') {
        // Nếu có lỗi ở từng field (như phoneNumber)
        const fieldErrors = Object.values(errorData.data).join(", ");
        toast.error(fieldErrors || errorData.message || "Thao tác thất bại!");
      } else {
        toast.error(errorData?.message || "Thao tác thất bại!");
      }
    } finally {
      setAddressLoading(false);
    }
  };

  const handleCheckoutSubmit = async () => {
    if (showAddressForm) {
        toast.error('Vui lòng lưu địa chỉ đang nhập dở trước khi đặt hàng!');
        return;
    }
    if (!selectedAddressId) {
      toast.error('Vui lòng chọn hoặc thêm một địa chỉ giao hàng!');
      return;
    }
    if (!termsAccepted) {
      toast.error('Vui lòng đồng ý với các chính sách của Nhà thuốc!');
      return;
    }

    const selectedAddr = addresses.find(a => a.id === selectedAddressId);
    if (!selectedAddr) return;

    let fullAddress = `${selectedAddr.detailAddress}, ${selectedAddr.ward}, ${selectedAddr.district}, ${selectedAddr.province}`;

    const listProductIds = cartData.items.map(item => item.productId);

    const payload = {
        receiverName: selectedAddr.receiverName,
        phone: selectedAddr.phoneNumber,
        shippingAddressText: fullAddress, 
        paymentMethod: paymentMethod,
        paymentToken: null,
        productIds: listProductIds 
    };

    const loadToast = toast.loading('Đang xử lý đơn hàng...');
    try {
      const res = await api.post('/orders/checkout', payload);
      if (res.data.status === 200) {
        toast.success('Đặt hàng thành công!', { id: loadToast });
        setOrderCode(res.data.data?.orderCode || ''); 
        setShowSuccessModal(true); 
        window.dispatchEvent(new Event('cartUpdated')); 
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng', { id: loadToast });
    }
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-[#2D982A] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const grandTotal = cartData.totalPrice + shippingFee;

  return (
    <div className="flex-1 w-full bg-[#f8f9fa] pb-20 pt-6 antialiased relative">
      
      {/* POPUP THÀNH CÔNG */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#eef8ef] rounded-2xl shadow-2xl w-[90%] max-w-[450px] overflow-hidden">
            <div className="bg-[#2D982A] py-4 flex items-center justify-center">
              <h2 className="text-white font-black text-[18px] uppercase tracking-wide">Đặt hàng thành công</h2>
            </div>
            <div className="p-8 flex flex-col items-center text-center">
              <p className="text-[#2D982A] font-bold text-[18px] mb-2">Đặt hàng thành công!</p>
              {orderCode && <p className="text-gray-800 font-bold mb-1">Mã đơn hàng: {orderCode}</p>}
              <p className="text-gray-600 text-[14px] mb-8">Vui lòng theo dõi tình trạng đơn hàng</p>
              <div className="flex space-x-4 w-full">
                <button onClick={() => navigate('/')} className="flex-1 py-2.5 rounded-lg border-2 border-[#2D982A] bg-white text-[#2D982A] font-bold text-[14px] hover:bg-[#eef8ef] transition-colors">Về trang chủ</button>
                <button onClick={() => navigate('/orders')} className="flex-1 py-2.5 rounded-lg bg-[#2D982A] text-white font-bold text-[14px] hover:bg-green-700 transition-colors shadow-sm">Xem đơn hàng</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`max-w-[1200px] mx-auto px-6 xl:px-0 ${showSuccessModal ? 'pointer-events-none blur-[1px]' : ''}`}>
        
        {/* BREADCRUMB */}
        <div className="flex items-center space-x-2 text-[14px] text-gray-500 mb-6">
          <span onClick={() => navigate('/')} className="hover:text-[#2D982A] cursor-pointer transition-colors">Trang chủ</span><span>/</span>
          <span onClick={() => navigate('/cart')} className="hover:text-[#2D982A] cursor-pointer transition-colors">Giỏ hàng</span><span>/</span>
          <span className="text-gray-900 font-medium">Thanh toán</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CỘT TRÁI */}
          <div className="lg:col-span-8 flex flex-col space-y-6">
            
            {/* 1. KHỐI GIỎ HÀNG */}
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200">
                <h2 className="text-[22px] font-black text-black">Giỏ hàng ({cartData.totalItems})</h2>
                <button onClick={() => navigate('/cart')} className="px-4 py-1.5 border border-gray-800 rounded-full text-[13px] font-medium text-gray-800 hover:bg-gray-100 transition-colors">
                  Chỉnh sửa giỏ hàng
                </button>
              </div>

              <div className="grid grid-cols-12 gap-4 pb-3 border-b border-gray-200 text-[14px] font-bold text-gray-800">
                <div className="col-span-7 text-left pl-2">Sản phẩm</div>
                <div className="col-span-3 text-center">Giá thành</div>
                <div className="col-span-2 text-center">Số lượng</div>
              </div>

              <div className="divide-y divide-gray-100">
                {cartData.items.map((item) => (
                  <div key={item.productId} className="grid grid-cols-12 gap-4 py-5 items-center">
                    <div className="col-span-7 flex items-center space-x-4 pl-2">
                      <div className="w-[70px] h-[70px] border border-gray-200 rounded flex items-center justify-center p-1 flex-shrink-0 bg-white">
                        <img src={item.imageUrl} alt={item.name} className="max-w-full max-h-full object-contain" onError={(e) => { e.target.onerror = null; e.target.src = "https://nhathuoclongchau.com.vn/estore-images/front-end/no-image.png"; }} />
                      </div>
                      <span className="text-[14px] font-medium text-gray-800 line-clamp-2 leading-snug">{item.name}</span>
                    </div>
                    <div className="col-span-3 text-center text-black font-bold text-[15px]">{formatVND(item.price)}</div>
                    <div className="col-span-2 text-center text-gray-800 font-medium text-[15px]">{item.quantity}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. KHỐI THÔNG TIN NHẬN HÀNG */}
            <div className="bg-[#eef8ef] rounded-2xl shadow-sm p-6 md:p-8">
              <h2 className="text-[22px] font-black text-black mb-6">Thông tin nhận hàng</h2>
              
              {!showAddressForm && (
                <div className="space-y-4">
                  {addresses.map(addr => (
                    <div 
                      key={addr.id} 
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`bg-white rounded-xl p-6 border transition-all duration-300 relative group cursor-pointer ${
                        selectedAddressId === addr.id ? 'border-[#2D982A] ring-1 ring-[#2D982A] shadow-[0_4px_20px_rgb(45,152,42,0.1)]' : 'border-gray-200 hover:border-[#2D982A] hover:shadow-md'
                      }`}
                    >
                      <div className="absolute top-5 right-5">
                         {selectedAddressId === addr.id && (
                           <div className="w-7 h-7 bg-[#2D982A] rounded-full flex items-center justify-center shadow-md animate-in zoom-in duration-300">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                           </div>
                         )}
                      </div>

                      <div className="flex items-center space-x-3 mb-3 pr-14">
                        <span className="font-black text-[16px] text-gray-900">{addr.receiverName}</span>
                        <span className="text-gray-300">|</span>
                        <span className="font-bold text-[15px] text-gray-700">{maskPhoneNumber(addr.phoneNumber)}</span>
                        {addr.isDefault && <span className="text-[11px] font-bold bg-green-50 text-[#2D982A] px-2.5 py-1 rounded-md border border-green-200 uppercase tracking-wide">Mặc định</span>}
                      </div>

                      <p className={`text-[15px] text-gray-600 leading-relaxed ${selectedAddressId !== addr.id ? 'mb-5' : 'mb-3'}`}>
                        {addr.detailAddress}, {addr.ward}, {addr.district}, {addr.province}
                      </p>

                      <div className={`flex items-center ${selectedAddressId !== addr.id ? 'pt-5 border-t border-gray-100/60' : 'pt-3 border-t border-gray-100/60'}`}>
                        {selectedAddressId !== addr.id ? (
                          <button onClick={(e) => { e.stopPropagation(); setSelectedAddressId(addr.id); }} className="flex items-center space-x-2 px-5 py-2 rounded-full text-[13px] font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-[0_4px_15px_rgb(79,70,229,0.4)] transition-all duration-300 group hover:-translate-y-0.5 w-full justify-center md:w-auto md:justify-start">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover:scale-110 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                            <span>Giao đến địa chỉ này</span>
                          </button>
                        ) : (
                          <div className="flex-1"></div>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); handleOpenAddressForm(addr); }} className={`px-4 py-1.5 text-[12px] font-bold border border-gray-300 text-gray-700 rounded-full hover:border-[#2D982A] hover:text-[#2D982A] transition-colors ${selectedAddressId !== addr.id ? 'ml-auto' : ''}`}>
                          Chỉnh sửa
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* NÚT THÊM ĐỊA CHỈ (CĂN GIỮA MÀU XANH) */}
                  <div className="flex justify-center pt-6">
                      <button 
                        onClick={() => handleOpenAddressForm()} 
                        className="flex items-center space-x-2 px-8 py-2.5 bg-gradient-to-r from-[#2D982A] to-[#258022] text-white rounded-full font-bold text-[14px] hover:shadow-[0_4px_15px_rgb(45,152,42,0.3)] transition-all duration-300 hover:-translate-y-0.5 shadow-md"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        <span>Thêm địa chỉ giao hàng</span>
                      </button>
                  </div>
                </div>
              )}

              {/* FORM NHẬP LIỆU ĐỊA CHỈ (INLINE) */}
              {showAddressForm && (
                <form onSubmit={handleAddressSubmit} className="bg-[#fcfdfc] p-6 md:p-8 rounded-xl border border-green-200 mt-2">
                  <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6 mb-6">
                    <div className="flex-1 flex items-center">
                      <label className="w-[130px] text-[14px] font-medium text-black">Tên người nhận:</label>
                      <input required type="text" value={addressForm.receiverName} onChange={e => setAddressForm({...addressForm, receiverName: e.target.value})} className="flex-1 p-2 border border-gray-300 rounded outline-none focus:border-[#2D982A] text-[14px]" placeholder="Nhập tên" />
                    </div>
                    <div className="flex-1 flex items-center">
                      <label className="w-[170px] text-[14px] font-medium text-black">Số điện thoại người nhận:</label>
                      <input required type="tel" value={addressForm.phoneNumber} onChange={e => setAddressForm({...addressForm, phoneNumber: e.target.value})} className="flex-1 p-2 border border-gray-300 rounded outline-none focus:border-[#2D982A] text-[14px]" placeholder="000-000-000" />
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-start mb-6">
                    <label className="w-[130px] text-[14px] font-medium text-black mt-2 mb-2 md:mb-0">Địa chỉ:</label>
                    <div className="flex-1 flex flex-col space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select required value={addressForm.province} onChange={handleProvinceChange} className="w-full p-2 border border-gray-300 rounded outline-none focus:border-[#2D982A] text-[14px] bg-white">
                          <option value="" data-id="">Chọn Tỉnh/Thành</option>
                          {provinces.map(p => (
                            <option key={p.id} value={p.full_name} data-id={p.id}>{p.full_name}</option>
                          ))}
                        </select>
                        <select required value={addressForm.district} onChange={handleDistrictChange} disabled={!addressForm.province || districts.length === 0} className="w-full p-2 border border-gray-300 rounded outline-none focus:border-[#2D982A] text-[14px] bg-white disabled:bg-gray-100">
                          <option value="" data-id="">Chọn Quận/Huyện</option>
                          {districts.map(d => (
                            <option key={d.id} value={d.full_name} data-id={d.id}>{d.full_name}</option>
                          ))}
                        </select>
                        <select required value={addressForm.ward} onChange={handleWardChange} disabled={!addressForm.district || wards.length === 0} className="w-full p-2 border border-gray-300 rounded outline-none focus:border-[#2D982A] text-[14px] bg-white disabled:bg-gray-100">
                          <option value="">Chọn Phường/Xã</option>
                          {wards.map(w => (
                            <option key={w.id} value={w.full_name}>{w.full_name}</option>
                          ))}
                        </select>
                      </div>
                      <input required type="text" value={addressForm.detailAddress} onChange={e => setAddressForm({...addressForm, detailAddress: e.target.value})} className="w-full p-2 border border-gray-300 rounded outline-none focus:border-[#2D982A] text-[14px]" placeholder="Số nhà/ tòa nhà cụ thể..." />
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-between mt-8">
                    <label className="flex items-center cursor-pointer mb-4 md:mb-0">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2 ${addressForm.isDefault ? 'border-[#2D982A]' : 'border-gray-400'}`}>
                          {addressForm.isDefault && <div className="w-2.5 h-2.5 bg-[#2D982A] rounded-full"></div>}
                      </div>
                      <input type="checkbox" checked={addressForm.isDefault} onChange={e => setAddressForm({...addressForm, isDefault: e.target.checked})} className="hidden" />
                      <span className="text-[14px] text-black">Đặt làm địa chỉ mặc định</span>
                    </label>
                    <div className="flex space-x-3 w-full md:w-auto">
                      {addresses.length > 0 && (
                          <button type="button" onClick={() => setShowAddressForm(false)} className="flex-1 md:flex-none px-8 py-2 border border-[#2D982A] text-[#2D982A] rounded-full font-bold text-[14px] hover:bg-green-50">Hủy</button>
                      )}
                      <button type="submit" disabled={addressLoading} className="flex-1 md:flex-none px-10 py-2 bg-[#2D982A] text-white rounded-full font-bold text-[14px] hover:bg-green-700 disabled:bg-gray-400">Lưu</button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* 3. KHỐI HÌNH THỨC THANH TOÁN */}
            <div className="bg-[#eef8ef] rounded-2xl shadow-sm p-6 md:p-8">
              <h2 className="text-[22px] font-black text-black mb-6">Hình thức thanh toán</h2>
              <div className="flex flex-col space-y-6 md:pl-10">
                <label className="flex items-center cursor-pointer group">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${paymentMethod === 'COD' ? 'border-[#2D982A]' : 'border-gray-400'}`}>
                    {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 bg-[#2D982A] rounded-full"></div>}
                  </div>
                  <input type="radio" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                  <span className={`text-[15px] text-black ${paymentMethod === 'COD' ? 'font-medium' : ''}`}>Thanh toán khi nhận hàng</span>
                </label>
                
                <label className="flex items-center cursor-pointer group">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${paymentMethod === 'ATM' ? 'border-[#2D982A]' : 'border-gray-400'}`}>
                    {paymentMethod === 'ATM' && <div className="w-2.5 h-2.5 bg-[#2D982A] rounded-full"></div>}
                  </div>
                  <input type="radio" value="ATM" checked={paymentMethod === 'ATM'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                  <span className={`text-[15px] text-black ${paymentMethod === 'ATM' ? 'font-medium' : ''}`}>Thanh toán qua thẻ ATM nội địa/ Internet Banking</span>
                </label>
                
                <label className="flex items-center cursor-pointer group">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${paymentMethod === 'MOMO' ? 'border-[#2D982A]' : 'border-gray-400'}`}>
                    {paymentMethod === 'MOMO' && <div className="w-2.5 h-2.5 bg-[#2D982A] rounded-full"></div>}
                  </div>
                  <input type="radio" value="MOMO" checked={paymentMethod === 'MOMO'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                  <span className={`text-[15px] text-black ${paymentMethod === 'MOMO' ? 'font-medium' : ''}`}>Thanh toán qua ví điện tử Momo</span>
                </label>
              </div>
            </div>

          </div>

          {/* CỘT PHẢI: TỔNG KẾT ĐƠN HÀNG */}
          <div className="lg:col-span-4 h-fit sticky top-[120px]">
            <div className="bg-[#eef8ef] rounded-2xl shadow-sm border border-green-100 p-6 md:p-8">
              
              <div className="flex items-center space-x-2 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#2D982A]"><path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clipRule="evenodd" /><path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" /></svg>
                <h2 className="text-[20px] font-black text-gray-900">Đơn hàng</h2>
              </div>
              
              <div className="space-y-4 text-[14px] text-gray-800 border-b border-gray-300 pb-5 mb-5">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Tổng tiền</span>
                  <span className="font-bold text-black">{formatVND(cartData.totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Giảm giá</span>
                  <span className="font-bold text-black">0đ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-black">Tạm tính</span>
                  <span className="font-bold text-black">{formatVND(cartData.totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Phí vận chuyển</span>
                  <span className="font-bold text-black">{formatVND(shippingFee)}</span>
                </div>
              </div>

              {/* Ô nhập mã giảm giá (CHUẨN THEO ẢNH) */}
              <div className="mb-6 flex items-center border-b border-gray-400 pb-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#2D982A] mr-2"><path fillRule="evenodd" d="M5.25 2.25a3 3 0 00-3 3v4.318a3 3 0 00.879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 005.441-5.44c.758-1.16.492-2.629-.428-3.548l-9.58-9.581a3 3 0 00-2.122-.879H5.25zM6.375 7.5a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z" clipRule="evenodd" /></svg>
                <input type="text" placeholder="Nhập mã giảm giá" className="flex-1 bg-transparent outline-none text-[14px] text-gray-800 placeholder-gray-500 font-medium" />
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-[16px] font-bold text-black">Thành tiền</span>
                <span className="text-[22px] font-black text-black">{formatVND(grandTotal)}</span>
              </div>

              <label className="flex items-start cursor-pointer mb-6 group">
                <div className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center flex-shrink-0 mr-2 transition-colors ${termsAccepted ? 'bg-[#2D982A] border-[#2D982A]' : 'border-gray-400 bg-white'}`}>
                  {termsAccepted && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-white"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>}
                </div>
                <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="hidden" />
                <span className="text-[12px] text-gray-800 font-medium leading-snug">
                  Đồng ý với các chính sách của Nhà thuốc Benzen để hoàn tất đơn hàng
                </span>
              </label>

              <div className="flex justify-center">
                  <button 
                    onClick={handleCheckoutSubmit} 
                    className="w-full max-w-[200px] py-2.5 rounded-full bg-[#2D982A] font-bold text-[15px] text-white uppercase tracking-wide hover:bg-green-700 transition-all shadow-md"
                  >
                    HOÀN TẤT
                  </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;