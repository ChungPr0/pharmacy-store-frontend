import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const Profile = () => {
  const navigate = useNavigate();
  const { token, logout, user: contextUser, login } = useCart();
  
  // --- STATE PROFILE ---
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("Nam");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [rewardPoints, setRewardPoints] = useState(0);

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false); // Trạng thái Edit Profile

  // Logic đổi Avatar tĩnh dựa theo Gender
  const avatarUrl = gender === "Nữ" 
        ? "https://api.dicebear.com/7.x/notionists/svg?seed=Aneka&backgroundColor=ffedd5" // Ảnh nữ
        : "https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=ffedd5"; // Ảnh nam

  // --- STATE ADDRESS BOOK ---
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    id: null, receiverName: "", phoneNumber: "", province: "", district: "", ward: "", detailAddress: "", isDefault: false
  });
  const [addressError, setAddressError] = useState("");
  const [addressLoading, setAddressLoading] = useState(false);

  // 1. FETCH PROFILE & ADDRESSES
  useEffect(() => {
    if (!token) {
      toast.error('Vui lòng đăng nhập để xem thông tin cá nhân!');
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const profileRes = await api.get('/profile');
        if (profileRes.data.status === 200) {
          const pData = profileRes.data.data;
          setFullName(pData.fullName || "");
          setEmail(pData.email || "");
          setDob(pData.birthday || "");
          setPhone(pData.phone || "");
          setRewardPoints(pData.rewardPoints || 0);
          if (pData.gender) setGender(pData.gender === "MALE" ? "Nam" : pData.gender === "FEMALE" ? "Nữ" : "Khác");
        }

        const addressRes = await api.get('/addresses');
        if (addressRes.data.status === 200) {
          setAddresses(addressRes.data.data || []);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
          logout();
          navigate('/login');
        }
      }
    };

    fetchData();
  }, [token, navigate, logout]);

  // --- HANDLERS PROFILE ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    const apiGender = gender === "Nam" ? "MALE" : gender === "Nữ" ? "FEMALE" : "OTHER";
    const payload = { fullName, email, gender: apiGender, birthday: dob || null };
    const loadToast = toast.loading('Đang cập nhật thông tin...');

    try {
      const res = await api.put('/profile', payload);
      if (res.data.status === 200) {
        toast.success('Cập nhật hồ sơ thành công!', { id: loadToast });
        const data = res.data.data;
        setIsEditingProfile(false); // Đóng form sau khi lưu
        
        // Đồng bộ Tên lên Header
        if (contextUser) {
          const updatedUser = { ...contextUser, fullName: data.fullName };
          localStorage.setItem('user', JSON.stringify(updatedUser)); 
          localStorage.setItem('userData', JSON.stringify(updatedUser));
          
          setTimeout(() => { window.location.reload(); }, 500);
        }
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response.data?.data) {
        toast.error("Vui lòng kiểm tra lại thông tin nhập vào!", { id: loadToast });
        setFieldErrors(error.response.data.data);
      } else {
        toast.error(error.response?.data?.message || 'Lỗi cập nhật', { id: loadToast });
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelEditProfile = () => {
     setIsEditingProfile(false);
     setFieldErrors({});
     // Fetch lại data gốc để discard những gì đang nhập dở
     if(token) api.get('/profile').then(res => {
         if (res.data.status === 200) {
            const pData = res.data.data;
            setFullName(pData.fullName || "");
            setEmail(pData.email || "");
            setDob(pData.birthday || "");
            if (pData.gender) setGender(pData.gender === "MALE" ? "Nam" : pData.gender === "FEMALE" ? "Nữ" : "Khác");
         }
     });
  };


  // --- HANDLERS ADDRESS BOOK ---
  const openAddressModal = (addr = null) => {
    if (addr) {
      setIsEditingAddress(true);
      setAddressForm({ ...addr });
    } else {
      setIsEditingAddress(false);
      setAddressForm({
        id: null, receiverName: "", phoneNumber: "", province: "", district: "", ward: "", detailAddress: "", isDefault: addresses.length === 0
      });
    }
    setAddressError("");
    setShowAddressModal(true);
  };

  const closeAddressModal = () => {
    setShowAddressModal(false);
    setAddressError("");
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressLoading(true);
    setAddressError("");

    const payload = {
      receiverName: addressForm.receiverName,
      phoneNumber: addressForm.phoneNumber,
      province: addressForm.province,
      district: addressForm.district,
      ward: addressForm.ward,
      detailAddress: addressForm.detailAddress,
      isDefault: addressForm.isDefault
    };

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
          closeAddressModal();
        }
      } else {
        const res = await api.post('/addresses', payload);
        if (res.status === 201 || res.data.status === 201) {
          toast.success("Thêm mới địa chỉ thành công!");
          const newAddr = res.data.data;
          setAddresses(prev => {
            let newArr = newAddr.isDefault ? prev.map(a => ({ ...a, isDefault: false })) : [...prev];
            return [newAddr, ...newArr].sort((a, b) => b.isDefault - a.isDefault);
          });
          closeAddressModal();
        }
      }
    } catch (error) {
      if (error.response?.status === 400) {
        setAddressError(error.response.data?.message || "Lỗi dữ liệu đầu vào");
      } else {
        toast.error(error.response?.data?.message || "Thao tác thất bại!");
      }
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;
    const loadToast = toast.loading('Đang xóa...');
    try {
      const res = await api.delete(`/addresses/${id}`);
      if (res.data.status === 200) {
        toast.success("Đã xóa địa chỉ!", { id: loadToast });
        setAddresses(prev => prev.filter(a => a.id !== id));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi xóa địa chỉ", { id: loadToast });
    }
  };

  const handleSetDefaultAddress = async (id) => {
    const loadToast = toast.loading('Đang thiết lập...');
    try {
      const res = await api.patch(`/addresses/${id}/default`);
      if (res.data.status === 200) {
        toast.success("Đã cập nhật địa chỉ mặc định!", { id: loadToast });
        setAddresses(prev => {
          let newArr = prev.map(a => ({ ...a, isDefault: a.id === id }));
          return newArr.sort((a, b) => b.isDefault - a.isDefault);
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi thiết lập", { id: loadToast });
    }
  };

  if (!token) return null;

  return (
    <div className="flex-1 w-full bg-[#f8f9fa] py-8 antialiased">
      
      {/* --- MODAL ĐỊA CHỈ --- */}
      {showAddressModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-[500px] overflow-hidden">
            <div className="bg-[#2D982A] px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold text-[16px]">{isEditingAddress ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}</h3>
              <button onClick={closeAddressModal} className="text-white hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleAddressSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Tên người nhận <span className="text-red-500">*</span></label>
                  <input required type="text" value={addressForm.receiverName} onChange={e => setAddressForm({...addressForm, receiverName: e.target.value})} className="w-full p-2 border border-gray-300 rounded outline-none focus:border-[#2D982A] text-[13px]" placeholder="VD: Nguyễn Văn A"/>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                  <input required type="text" value={addressForm.phoneNumber} onChange={e => setAddressForm({...addressForm, phoneNumber: e.target.value})} className={`w-full p-2 border ${addressError ? 'border-red-500' : 'border-gray-300'} rounded outline-none focus:border-[#2D982A] text-[13px]`} placeholder="SĐT Việt Nam"/>
                  {addressError && <p className="text-red-500 text-[11px] mt-1">{addressError}</p>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Tỉnh/Thành <span className="text-red-500">*</span></label>
                  <input required type="text" value={addressForm.province} onChange={e => setAddressForm({...addressForm, province: e.target.value})} className="w-full p-2 border border-gray-300 rounded outline-none focus:border-[#2D982A] text-[13px]" placeholder="Tỉnh/Thành"/>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Quận/Huyện <span className="text-red-500">*</span></label>
                  <input required type="text" value={addressForm.district} onChange={e => setAddressForm({...addressForm, district: e.target.value})} className="w-full p-2 border border-gray-300 rounded outline-none focus:border-[#2D982A] text-[13px]" placeholder="Quận/Huyện"/>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Phường/Xã <span className="text-red-500">*</span></label>
                  <input required type="text" value={addressForm.ward} onChange={e => setAddressForm({...addressForm, ward: e.target.value})} className="w-full p-2 border border-gray-300 rounded outline-none focus:border-[#2D982A] text-[13px]" placeholder="Phường/Xã"/>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Địa chỉ cụ thể (Số nhà, Ngõ) <span className="text-red-500">*</span></label>
                <input required type="text" value={addressForm.detailAddress} onChange={e => setAddressForm({...addressForm, detailAddress: e.target.value})} className="w-full p-2 border border-gray-300 rounded outline-none focus:border-[#2D982A] text-[13px]" placeholder="VD: Số 10, Ngõ 2"/>
              </div>
              
              <label className="flex items-center cursor-pointer pt-2 group">
                <input type="checkbox" checked={addressForm.isDefault} onChange={e => setAddressForm({...addressForm, isDefault: e.target.checked})} className="w-4 h-4 accent-[#2D982A] mr-2 cursor-pointer" />
                <span className="text-[13px] font-medium text-gray-800">Đặt làm địa chỉ mặc định</span>
              </label>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={closeAddressModal} className="px-5 py-2 rounded border border-gray-300 text-gray-700 text-[13px] font-bold hover:bg-gray-50 transition-colors">Hủy bỏ</button>
                <button type="submit" disabled={addressLoading} className="px-5 py-2 rounded bg-[#2D982A] text-white text-[13px] font-bold hover:bg-green-700 transition-colors disabled:bg-gray-400">
                  {addressLoading ? "Đang lưu..." : "Lưu địa chỉ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-6 xl:px-0">
        
        {/* BREADCRUMB */}
        <div className="flex items-center space-x-2 text-[13px] text-gray-500 mb-6">
          <span onClick={() => navigate('/')} className="hover:text-[#2D982A] cursor-pointer transition-colors">Trang chủ</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">Trang cá nhân</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* SIDEBAR: THÔNG TIN USER, ĐIỂM THƯỞNG */}
          <div className="lg:col-span-3">
            <div className="bg-[#eef8ef] rounded-2xl p-6 flex flex-col items-center border border-green-100 shadow-sm">
              {/* KHỐI AVATAR */}
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm overflow-hidden">
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <h2 className="font-black text-[18px] text-gray-900 mb-1 text-center">{fullName || contextUser?.name || "Khách hàng"}</h2>
              <p className="text-[14px] text-gray-600 mb-2">{maskPhoneNumber(phone)}</p>
              
             

              <div className="w-full mt-6 space-y-2">
                <button className="w-full flex items-center justify-between p-3 rounded-xl bg-white shadow-sm border border-green-100 text-[14px] font-bold text-[#2D982A]">
                  <div className="flex items-center space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" /></svg>
                    <span>Thông tin và địa chỉ</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </button>
                <button onClick={() => navigate('/orders')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white transition-colors text-[14px] font-bold text-gray-700">
                  <div className="flex items-center space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>
                    <span>Lịch sử đơn hàng</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </button>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT: THÔNG TIN VÀ ĐỊA CHỈ */}
          <div className="lg:col-span-9 space-y-8 h-fit">
            
            {/* THÔNG TIN CÁ NHÂN */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative">
              <h2 className="text-[22px] font-black text-gray-900 mb-8">Thông tin cá nhân</h2>
              
              {!isEditingProfile ? (
                 // --- GIAO DIỆN HIỂN THỊ TĨNH ---
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 text-[15px] max-w-[800px]">
                    <div className="flex items-center">
                        <span className="w-[150px] font-bold text-gray-800">Tên khách hàng:</span>
                        <span className="text-gray-700">{fullName || "Chưa cập nhật"}</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-[150px] font-bold text-gray-800">Giới tính:</span>
                        <div className="flex items-center space-x-6">
                            <label className="flex items-center text-gray-700">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2 ${gender === 'Nam' ? 'border-[#2D982A]' : 'border-gray-300'}`}>
                                    {gender === 'Nam' && <div className="w-2.5 h-2.5 bg-[#2D982A] rounded-full"></div>}
                                </div> Nam
                            </label>
                            <label className="flex items-center text-gray-700">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2 ${gender === 'Nữ' ? 'border-[#2D982A]' : 'border-gray-300'}`}>
                                    {gender === 'Nữ' && <div className="w-2.5 h-2.5 bg-[#2D982A] rounded-full"></div>}
                                </div> Nữ
                            </label>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <span className="w-[150px] font-bold text-gray-800">Số điện thoại:</span>
                        <span className="text-gray-700">{maskPhoneNumber(phone)}</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-[150px] font-bold text-gray-800">Ngày sinh:</span>
                        <span className="text-gray-700">{dob ? new Date(dob).toLocaleDateString('vi-VN') : "Chưa cập nhật"}</span>
                    </div>
                    <div className="flex items-center md:col-span-2">
                        <span className="w-[150px] font-bold text-gray-800">Email:</span>
                        <span className="text-gray-700">{email || "Chưa cập nhật"}</span>
                    </div>

                    <div className="md:col-span-2 flex justify-end mt-4">
                        <button onClick={() => setIsEditingProfile(true)} className="px-8 py-2 border border-gray-400 rounded-full font-bold text-[14px] text-gray-700 hover:bg-gray-50 transition-colors">
                            Chỉnh sửa
                        </button>
                    </div>
                 </div>
              ) : (
                // --- GIAO DIỆN CHỈNH SỬA ---
                <form className="flex flex-col space-y-6" onSubmit={handleUpdateProfile}>
                  <div className="flex flex-col md:flex-row md:items-start">
                    <label className="w-[140px] text-[14px] font-medium text-gray-800 mt-2.5 mb-1 md:mb-0">Họ và tên:</label>
                    <div className="flex-1 relative">
                      <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={loading} className={`w-full md:max-w-[350px] p-2.5 rounded border outline-none focus:border-[#2D982A] bg-white text-[14px] shadow-inner ${fieldErrors.fullName ? 'border-red-500' : 'border-gray-300'}`} />
                      {fieldErrors.fullName && <p className="text-red-500 text-[12px] font-medium mt-1.5">{fieldErrors.fullName}</p>}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center">
                    <label className="w-[140px] text-[14px] font-medium text-gray-800 mb-1 md:mb-0">Giới tính:</label>
                    <div className="flex-1 flex items-center space-x-6">
                      <label className="flex items-center cursor-pointer group">
                        <input type="radio" name="gender" value="Nam" checked={gender === "Nam"} onChange={(e) => setGender(e.target.value)} disabled={loading} className="w-5 h-5 accent-[#2D982A] mr-2.5 cursor-pointer" />
                        <span className="text-[14px] font-medium text-gray-700">Nam</span>
                      </label>
                      <label className="flex items-center cursor-pointer group">
                        <input type="radio" name="gender" value="Nữ" checked={gender === "Nữ"} onChange={(e) => setGender(e.target.value)} disabled={loading} className="w-5 h-5 accent-[#2D982A] mr-2.5 cursor-pointer" />
                        <span className="text-[14px] font-medium text-gray-700">Nữ</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-start">
                    <label className="w-[140px] text-[14px] font-medium text-gray-800 mt-2.5 mb-1 md:mb-0">Ngày sinh:</label>
                    <div className="flex-1">
                      <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} disabled={loading} className={`w-full md:max-w-[200px] p-2.5 rounded border outline-none focus:border-[#2D982A] bg-white text-[14px] shadow-inner font-medium ${fieldErrors.birthday ? 'border-red-500' : 'border-gray-300'}`} />
                      {fieldErrors.birthday && <p className="text-red-500 text-[12px] font-medium mt-1.5">{fieldErrors.birthday}</p>}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center pt-2">
                    <label className="w-[140px] text-[14px] font-medium text-gray-800 mb-1 md:mb-0">Số điện thoại:</label>
                    <div className="flex-1">
                      <input type="tel" value={maskPhoneNumber(phone)} disabled className="w-full md:max-w-[350px] p-2.5 rounded border border-gray-200 bg-gray-100 text-[14px] text-gray-600 shadow-inner font-bold" />
                      <p className="text-[11px] text-gray-500 mt-1 pl-1">Không thể thay đổi SĐT đăng nhập</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-start">
                    <label className="w-[140px] text-[14px] font-medium text-gray-800 mt-2.5 mb-1 md:mb-0">Email:</label>
                    <div className="flex-1 relative">
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className={`w-full md:max-w-[350px] p-2.5 rounded border outline-none focus:border-[#2D982A] bg-white text-[14px] shadow-inner ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`} />
                      {fieldErrors.email && <p className="text-red-500 text-[12px] font-medium mt-1.5">{fieldErrors.email}</p>}
                    </div>
                  </div>

                  <div className="w-full h-[1px] bg-green-100 my-4"></div>
                  <div className="flex justify-center md:justify-end mt-8 space-x-3">
                    <button type="button" onClick={cancelEditProfile} disabled={loading} className="px-8 py-2.5 border border-[#2D982A] text-[#2D982A] rounded-full font-bold text-[14px] hover:bg-green-50 transition-colors">
                      Hủy
                    </button>
                    <button type="submit" disabled={loading} className="px-10 py-2.5 rounded-full bg-[#2D982A] text-white font-bold text-[14px] hover:bg-green-700 transition-colors shadow-md disabled:bg-gray-400">
                      {loading ? "Đang xử lý..." : "Cập nhật"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* KHỐI SỔ ĐỊA CHỈ */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm relative h-fit min-h-[400px]">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-[22px] font-black text-gray-900">Sổ địa chỉ nhận hàng</h2>
                </div>

                <div className="space-y-4">
                    {addresses.map((addr) => (
                        <div key={addr.id} className="bg-[#fcfdfc] rounded-xl p-5 border border-gray-200 hover:border-green-300 transition-colors relative">
                            <div className="absolute top-5 right-5 flex space-x-2">
                                <button onClick={() => openAddressModal(addr)} className="px-4 py-1 text-[13px] font-medium border border-gray-800 text-gray-800 rounded-full hover:bg-gray-100">
                                   Chỉnh sửa
                                </button>
                                <button onClick={() => handleDeleteAddress(addr.id)} title="Xóa địa chỉ" className="p-1.5 rounded-full text-red-500 hover:bg-red-50 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                            
                            <div className="flex items-center space-x-3 mb-2.5 pr-24">
                                <span className="font-bold text-[15px] text-gray-900">{addr.receiverName}</span>
                                <span className="text-[14px] text-gray-300">|</span>
                                <span className="font-bold text-[14px] text-gray-900">{maskPhoneNumber(addr.phoneNumber)}</span>
                            </div>
                            <p className="text-[14px] text-gray-800 leading-relaxed mb-4">{addr.detailAddress}, {addr.ward}, {addr.district}, {addr.province}</p>
                            
                            <label className="flex items-center cursor-pointer group w-fit">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2 transition-colors ${addr.isDefault ? 'border-[#2D982A]' : 'border-gray-400'}`}>
                                    {addr.isDefault && <div className="w-2.5 h-2.5 bg-[#2D982A] rounded-full"></div>}
                                </div>
                                <span className="text-[14px] text-gray-800">Đặt làm địa chỉ mặc định</span>
                                <input type="radio" checked={addr.isDefault} onChange={() => !addr.isDefault && handleSetDefaultAddress(addr.id)} className="hidden" />
                            </label>
                        </div>
                    ))}
                </div>
                
                <div className="flex justify-center pt-8">
                    <button onClick={() => openAddressModal()} className="px-8 py-2.5 bg-[#2D982A] text-white rounded-full font-bold text-[14px] hover:bg-green-700 transition-colors shadow-sm">
                        Thêm địa chỉ
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;