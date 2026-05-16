import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import { useCart } from '../../contexts/CartContext';
import OrdersContent from './OrdersContent';

const formatVND = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const maskPhoneNumber = (phone) => {
  if (!phone || phone.length < 9) return phone;
  return phone.substring(0, 3) + '****' + phone.substring(phone.length - 3);
};

const formatDate = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'PENDING': return <span className="text-[#f59e0b] bg-yellow-50 px-2.5 py-1 rounded text-[12px] font-bold border border-yellow-200">Chờ xác nhận</span>;
    case 'PAID': return <span className="text-blue-500 bg-blue-50 px-2.5 py-1 rounded text-[12px] font-bold border border-blue-200">Đã thanh toán</span>;
    case 'PROCESSING': return <span className="text-blue-500 bg-blue-50 px-2.5 py-1 rounded text-[12px] font-bold border border-blue-200">Đang xử lý</span>;
    case 'SHIPPING': return <span className="text-blue-500 bg-blue-50 px-2.5 py-1 rounded text-[12px] font-bold border border-blue-200">Đang giao</span>;
    case 'DELIVERED': return <span className="text-[#2D982A] bg-[#eef8ef] px-2.5 py-1 rounded text-[12px] font-bold border border-green-200">Hoàn thành</span>;
    case 'CANCELLED': return <span className="text-red-500 bg-red-50 px-2.5 py-1 rounded text-[12px] font-bold border border-red-200">Đã hủy</span>;
    default: return <span className="text-gray-500 bg-gray-100 px-2.5 py-1 rounded text-[12px] font-bold">{status}</span>;
  }
};

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, logout, user: contextUser, login, openAuthModal } = useCart();
  const isAdmin = contextUser?.role?.toUpperCase() === 'ADMIN' || contextUser?.role?.toUpperCase() === 'STAFF';
  
  // --- STATE PROFILE ---
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("Nam");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [rewardPoints, setRewardPoints] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false); // Trạng thái Edit Profile
  const [uploadingAvatar, setUploadingAvatar] = useState(false); // Trạng thái Upload ảnh

  const [activeSidebarTab, setActiveSidebarTab] = useState('PROFILE'); // 'PROFILE', 'ADDRESS', 'PASSWORD', 'ORDERS'
  const [orders, setOrders] = useState([]);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPwd, setShowPwd] = useState({ old: false, new: false, confirm: false });

  // Logic đổi Avatar tĩnh dựa theo Gender nếu không có avatar
  const defaultAvatarUrl = gender === "Nữ" 
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
  const [isChangingDefault, setIsChangingDefault] = useState(false);

  // Thêm state cho API địa chỉ
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    if (showAddressModal) {
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
  }, [showAddressModal]); // Only run when modal opens/closes

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

  // Tự động mở Tab nếu điều hướng từ nơi khác tới (ví dụ từ Header dropdown)
  useEffect(() => {
    if (location.pathname === '/orders') {
      setActiveSidebarTab('ORDERS');
    } else if (location.state?.activeTab) {
      setActiveSidebarTab(location.state.activeTab);
      // Xóa state sau khi đã nhận để tránh lặp lại khi reload
      window.history.replaceState({}, document.title);
    } else {
      setActiveSidebarTab('PROFILE');
    }
  }, [location]);

  // 1. FETCH PROFILE & ADDRESSES
  useEffect(() => {
    if (!token) {
      toast.error('Vui lòng đăng nhập để xem thông tin cá nhân!');
      navigate('/');
      openAuthModal('login');
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
          setAvatarUrl(pData.avatarUrl || "");
          if (pData.gender) setGender(pData.gender === "MALE" ? "Nam" : pData.gender === "FEMALE" ? "Nữ" : "Khác");
        }

        if (!isAdmin) {
          const [addressRes, ordersRes] = await Promise.all([
            api.get('/addresses'),
            api.get('/orders/me')
          ]);
          if (addressRes.data.status === 200) {
            setAddresses(addressRes.data.data || []);
          }
          if (ordersRes.data.status === 200) {
            setOrders(ordersRes.data.data || []);
          }
        }
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
          logout();
          navigate('/');
          openAuthModal('login');
        }
      }
    };

    fetchData();
  }, [token, navigate, logout, openAuthModal]);

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
            setAvatarUrl(pData.avatarUrl || "");
            if (pData.gender) setGender(pData.gender === "MALE" ? "Nam" : pData.gender === "FEMALE" ? "Nữ" : "Khác");
         }
     });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setPasswordErrors({});

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErrors({ confirmPassword: 'Mật khẩu nhập lại không khớp!' });
      return;
    }

    const loadToast = toast.loading('Đang đổi mật khẩu...');
    try {
      const res = await api.post('/auth/change-password', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      if (res.data.status === 200) {
        toast.success(res.data.message || 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.', { id: loadToast });
        setTimeout(() => {
          logout();
          navigate('/');
          openAuthModal('login');
        }, 1500);
      }
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.status === 400 && typeof errorData.data === 'object') {
        setPasswordErrors(errorData.data);
        toast.error('Vui lòng kiểm tra lại thông tin nhập vào!', { id: loadToast });
      } else {
        toast.error(errorData?.message || 'Đổi mật khẩu thất bại!', { id: loadToast });
      }
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Dung lượng ảnh phải dưới 2MB!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const loadToast = toast.loading('Đang tải ảnh lên...');
    setUploadingAvatar(true);
    
    try {
      const res = await api.post('/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.status === 200) {
        toast.success('Cập nhật ảnh đại diện thành công!', { id: loadToast });
        setAvatarUrl(res.data.data?.avatarUrl || "");
        
        // Cập nhật avatar trên context header (tuỳ logic header)
        if (contextUser) {
          const updatedUser = { ...contextUser, avatarUrl: res.data.data?.avatarUrl };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          localStorage.setItem('userData', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Tải ảnh thất bại!', { id: loadToast });
    } finally {
      setUploadingAvatar(false);
      e.target.value = null; // reset input
    }
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
      const errorData = error.response?.data;
      if (error.response?.status === 400 && errorData?.data && typeof errorData.data === 'object') {
        const fieldError = Object.values(errorData.data)[0]; // Lấy lỗi đầu tiên để hiển thị
        setAddressError(fieldError || errorData.message || "Lỗi dữ liệu đầu vào");
      } else if (error.response?.status === 403) {
        toast.error(errorData?.message || "Bạn không có quyền chỉnh sửa địa chỉ này!");
      } else {
        toast.error(errorData?.message || "Thao tác thất bại!");
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
        setIsChangingDefault(false);
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
                  <select required value={addressForm.province} onChange={handleProvinceChange} className="w-full p-2 border border-gray-300 rounded outline-none focus:border-[#2D982A] text-[13px] bg-white">
                    <option value="" data-id="">Chọn Tỉnh/Thành</option>
                    {provinces.map(p => (
                      <option key={p.id} value={p.full_name} data-id={p.id}>{p.full_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Quận/Huyện <span className="text-red-500">*</span></label>
                  <select required value={addressForm.district} onChange={handleDistrictChange} disabled={!addressForm.province || districts.length === 0} className="w-full p-2 border border-gray-300 rounded outline-none focus:border-[#2D982A] text-[13px] bg-white disabled:bg-gray-100">
                    <option value="" data-id="">Chọn Quận/Huyện</option>
                    {districts.map(d => (
                      <option key={d.id} value={d.full_name} data-id={d.id}>{d.full_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Phường/Xã <span className="text-red-500">*</span></label>
                  <select required value={addressForm.ward} onChange={handleWardChange} disabled={!addressForm.district || wards.length === 0} className="w-full p-2 border border-gray-300 rounded outline-none focus:border-[#2D982A] text-[13px] bg-white disabled:bg-gray-100">
                    <option value="">Chọn Phường/Xã</option>
                    {wards.map(w => (
                      <option key={w.id} value={w.full_name}>{w.full_name}</option>
                    ))}
                  </select>
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
              <div className="relative w-24 h-24 mb-4 group">
                  <div className={`w-full h-full bg-white rounded-full flex items-center justify-center border-4 border-white shadow-sm overflow-hidden ${uploadingAvatar ? 'opacity-50' : ''}`}>
                      <img src={avatarUrl || defaultAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  {/* Nút overlay upload ảnh */}
                  <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>
                      <input type="file" accept="image/jpeg, image/png" className="hidden" onChange={handleAvatarChange} disabled={uploadingAvatar} />
                  </label>
                  {uploadingAvatar && <div className="absolute inset-0 flex items-center justify-center"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>}
              </div>
              <h2 className="font-black text-[18px] text-gray-900 mb-1 text-center">{fullName || contextUser?.name || "Khách hàng"}</h2>
              <p className="text-[14px] text-gray-600 mb-2">{maskPhoneNumber(phone)}</p>
              
             

              <div className="w-full mt-6 space-y-2">
                <button 
                  onClick={() => navigate('/profile')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors text-[14px] font-bold ${activeSidebarTab === 'PROFILE' ? 'bg-white shadow-sm border border-green-100 text-[#2D982A]' : 'text-gray-700 hover:bg-white'}`}
                >
                  <div className="flex items-center space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                    <span>Hồ sơ cá nhân</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </button>

                {!isAdmin && (
                  <button 
                    onClick={() => navigate('/profile', { state: { activeTab: 'ADDRESS' } })}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors text-[14px] font-bold ${activeSidebarTab === 'ADDRESS' ? 'bg-white shadow-sm border border-green-100 text-[#2D982A]' : 'text-gray-700 hover:bg-white'}`}
                  >
                    <div className="flex items-center space-x-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                      <span>Sổ địa chỉ</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                  </button>
                )}

                <button 
                  onClick={() => navigate('/profile', { state: { activeTab: 'PASSWORD' } })}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors text-[14px] font-bold ${activeSidebarTab === 'PASSWORD' ? 'bg-white shadow-sm border border-green-100 text-[#2D982A]' : 'text-gray-700 hover:bg-white'}`}
                >
                  <div className="flex items-center space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                    <span>Đổi mật khẩu</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </button>

                {!isAdmin && (
                  <button 
                    onClick={() => navigate('/orders')} 
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors text-[14px] font-bold ${activeSidebarTab === 'ORDERS' ? 'bg-white shadow-sm border border-green-100 text-[#2D982A]' : 'text-gray-700 hover:bg-white'}`}
                  >
                    <div className="flex items-center space-x-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>
                      <span>Lịch sử mua hàng</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                  </button>
                )}


              </div>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="lg:col-span-9 space-y-8 h-fit">
            
            {activeSidebarTab === 'PROFILE' ? (
                /* THÔNG TIN CÁ NHÂN */
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative min-h-[700px]">
              <h2 className="text-[22px] font-black text-gray-900 mb-6 uppercase tracking-tight">Hồ sơ cá nhân</h2>
              
              {!isEditingProfile ? (
                 // --- GIAO DIỆN HIỂN THỊ TĨNH ---
                 <div className="bg-gray-50/50 rounded-2xl p-6 md:p-8 border border-gray-100 max-w-[800px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                        <div className="flex flex-col space-y-1.5">
                            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Tên khách hàng</span>
                            <span className="text-gray-900 font-bold text-[16px]">{fullName || "Chưa cập nhật"}</span>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Giới tính</span>
                            <span className="text-gray-900 font-bold text-[16px]">{gender || "Chưa cập nhật"}</span>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Số điện thoại</span>
                            <span className="text-gray-900 font-bold text-[16px]">{maskPhoneNumber(phone)}</span>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Ngày sinh</span>
                            <span className="text-gray-900 font-bold text-[16px]">{dob ? new Date(dob).toLocaleDateString('vi-VN') : "Chưa cập nhật"}</span>
                        </div>
                        <div className="flex flex-col space-y-1.5 md:col-span-2">
                            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Email</span>
                            <span className="text-gray-900 font-bold text-[16px]">{email || "Chưa cập nhật"}</span>
                        </div>
                    </div>

                    <div className="flex justify-end mt-8 pt-6 border-t border-gray-200 border-dashed">
                        <button onClick={() => setIsEditingProfile(true)} className="px-8 py-2.5 bg-white border border-gray-300 rounded-full font-bold text-[14px] text-gray-800 hover:border-[#2D982A] hover:text-[#2D982A] transition-colors shadow-sm flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                            <span>Chỉnh sửa hồ sơ</span>
                        </button>
                    </div>
                 </div>
              ) : (
                /* --- GIAO DIỆN CHỈNH SỬA --- */
                <form className="flex flex-col space-y-6" onSubmit={handleUpdateProfile}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                      <label className="text-[13px] font-bold text-gray-600 mb-2 uppercase tracking-wide">Họ và tên</label>
                      <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={loading} className={`w-full p-3.5 rounded-xl border outline-none focus:border-[#2D982A] focus:ring-4 focus:ring-green-50 text-[15px] font-medium transition-all ${fieldErrors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`} placeholder="Nhập họ và tên" />
                      {fieldErrors.fullName && <p className="text-red-500 text-[12px] font-medium mt-1.5">{fieldErrors.fullName}</p>}
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[13px] font-bold text-gray-600 mb-2 uppercase tracking-wide">Ngày sinh</label>
                      <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} disabled={loading} className={`w-full p-3.5 rounded-xl border outline-none focus:border-[#2D982A] focus:ring-4 focus:ring-green-50 text-[15px] font-medium transition-all ${fieldErrors.birthday ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`} />
                      {fieldErrors.birthday && <p className="text-red-500 text-[12px] font-medium mt-1.5">{fieldErrors.birthday}</p>}
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[13px] font-bold text-gray-600 mb-2 uppercase tracking-wide">Email</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className={`w-full p-3.5 rounded-xl border outline-none focus:border-[#2D982A] focus:ring-4 focus:ring-green-50 text-[15px] font-medium transition-all ${fieldErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`} placeholder="Nhập email" />
                      {fieldErrors.email && <p className="text-red-500 text-[12px] font-medium mt-1.5">{fieldErrors.email}</p>}
                    </div>
                    <div className="flex flex-col md:col-span-2 mt-2">
                      <label className="text-[13px] font-bold text-gray-600 mb-3 uppercase tracking-wide">Giới tính</label>
                      <div className="flex items-center space-x-8 bg-gray-50 p-4 rounded-xl border border-gray-200 w-fit">
                        {["Nam", "Nữ", "Khác"].map((g) => (
                          <label key={g} className="flex items-center cursor-pointer group">
                            <input type="radio" name="gender" value={g} checked={gender === g} onChange={(e) => setGender(e.target.value)} disabled={loading} className="w-5 h-5 accent-[#2D982A] mr-2.5 cursor-pointer" />
                            <span className="text-[15px] font-medium text-gray-800">{g}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-6 space-x-4 border-t border-gray-100 mt-8">
                    <button type="button" onClick={cancelEditProfile} disabled={loading} className="px-8 py-3 rounded-xl font-bold text-[14px] text-gray-600 hover:bg-gray-100 transition-colors">Hủy bỏ</button>
                    <button type="submit" disabled={loading} className="px-10 py-3 rounded-xl bg-[#2D982A] text-white font-bold text-[14px] hover:bg-green-700 transition-colors shadow-sm disabled:bg-gray-400">
                      {loading ? "Đang xử lý..." : "Lưu thay đổi"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : activeSidebarTab === 'ADDRESS' && !isAdmin ? (
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm relative h-fit min-h-[700px]">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
                <h2 className="text-[22px] font-black text-gray-900 uppercase tracking-tight">Sổ địa chỉ nhận hàng</h2>
                <div className="flex items-center space-x-3">
                  <button onClick={() => setIsChangingDefault(!isChangingDefault)} className={`px-5 py-2.5 rounded-full font-bold text-[13px] transition-all duration-300 shadow-md flex items-center space-x-2 text-white ${isChangingDefault ? 'bg-gradient-to-r from-red-500 to-rose-500 hover:shadow-[0_4px_15px_rgb(244,63,94,0.3)] hover:-translate-y-0.5' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-[0_4px_15px_rgb(79,70,229,0.3)] hover:-translate-y-0.5'}`}>
                    {isChangingDefault ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        <span>Hủy thay đổi</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                        <span>Thay đổi địa chỉ mặc định</span>
                      </>
                    )}
                  </button>
                  <button onClick={() => openAddressModal()} className="hidden md:flex px-5 py-2.5 bg-gradient-to-r from-[#2D982A] to-[#258022] text-white rounded-full font-bold text-[13px] transition-all duration-300 shadow-md hover:shadow-[0_4px_15px_rgb(45,152,42,0.3)] hover:-translate-y-0.5 items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    <span>Thêm địa chỉ mới</span>
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-[#2D982A] hover:shadow-[0_4px_20px_rgb(45,152,42,0.1)] transition-all duration-300 relative group">
                    <div className="absolute top-5 right-5 flex space-x-2">
                      <button onClick={() => openAddressModal(addr)} className="px-4 py-1.5 text-[13px] font-bold border border-gray-300 text-gray-700 rounded-full hover:border-[#2D982A] hover:text-[#2D982A] transition-colors">Chỉnh sửa</button>
                      <button onClick={() => handleDeleteAddress(addr.id)} className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" /></svg>
                      </button>
                    </div>
                    <div className="flex items-center space-x-3 mb-3 pr-24">
                      <span className="font-black text-[16px] text-gray-900">{addr.receiverName}</span>
                      <span className="text-gray-300">|</span>
                      <span className="font-bold text-[15px] text-gray-700">{maskPhoneNumber(addr.phoneNumber)}</span>
                      {addr.isDefault && <span className="text-[11px] font-bold bg-green-50 text-[#2D982A] px-2.5 py-1 rounded-md border border-green-200 uppercase tracking-wide">Mặc định</span>}
                    </div>
                    <p className={`text-[15px] text-gray-600 leading-relaxed ${(!addr.isDefault && isChangingDefault) ? 'mb-5' : 'mb-0'}`}>{addr.detailAddress}, {addr.ward}, {addr.district}, {addr.province}</p>
                    {(!addr.isDefault && isChangingDefault) && (
                      <div className="pt-5 border-t border-gray-100/60 flex items-center">
                        <button onClick={() => handleSetDefaultAddress(addr.id)} className="flex items-center space-x-2 px-5 py-2 rounded-full text-[13px] font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-[0_4px_15px_rgb(79,70,229,0.4)] transition-all duration-300 group hover:-translate-y-0.5 w-full justify-center md:w-auto md:justify-start">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover:scale-110 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                          <span>Chọn làm mặc định</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 md:hidden">
                <button onClick={() => openAddressModal()} className="w-full py-3.5 bg-[#2D982A] text-white rounded-xl font-bold text-[14px] hover:bg-green-700 transition-colors shadow-sm flex justify-center items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  <span>Thêm địa chỉ mới</span>
                </button>
              </div>
            </div>
          ) : activeSidebarTab === 'PASSWORD' ? (
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative h-fit min-h-[700px]">
                <h2 className="text-[22px] font-black text-gray-900 mb-6 uppercase tracking-tight">Đổi mật khẩu</h2>
                <form className="max-w-[500px] flex flex-col space-y-6" onSubmit={handleChangePassword}>
                  {/* ... form content exactly as is ... */}
                  {/* Mật khẩu cũ */}
                  <div className="flex flex-col">
                    <label className="text-[13px] font-bold text-gray-600 mb-2 uppercase tracking-wide">Mật khẩu hiện tại</label>
                    <div className="relative">
                      <input 
                        type={showPwd.old ? "text" : "password"} 
                        value={passwordForm.oldPassword} 
                        onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})} 
                        className={`w-full p-3.5 rounded-xl border outline-none focus:border-[#2D982A] focus:ring-4 focus:ring-green-50 text-[15px] font-medium pr-10 transition-all ${passwordErrors.oldPassword ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                      <button type="button" onClick={() => setShowPwd({...showPwd, old: !showPwd.old})} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600">
                        {showPwd.old ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.413 8.242 7.244 4.5 12 4.5c4.757 0 8.587 3.742 9.964 7.178.07.333.07.678 0 1.012-1.377 3.436-5.207 7.178-9.964 7.178-4.757 0-8.588-3.742-9.964-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        )}
                      </button>
                    </div>
                    {passwordErrors.oldPassword && <p className="text-red-500 text-[12px] font-medium mt-1">{passwordErrors.oldPassword}</p>}
                  </div>

                  {/* Mật khẩu mới */}
                  <div className="flex flex-col">
                    <label className="text-[13px] font-bold text-gray-600 mb-2 uppercase tracking-wide">Mật khẩu mới</label>
                    <div className="relative">
                      <input 
                        type={showPwd.new ? "text" : "password"} 
                        value={passwordForm.newPassword} 
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} 
                        className={`w-full p-3.5 rounded-xl border outline-none focus:border-[#2D982A] focus:ring-4 focus:ring-green-50 text-[15px] font-medium pr-10 transition-all ${passwordErrors.newPassword ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                        placeholder="Nhập mật khẩu mới"
                      />
                      <button type="button" onClick={() => setShowPwd({...showPwd, new: !showPwd.new})} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600">
                        {showPwd.new ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.413 8.242 7.244 4.5 12 4.5c4.757 0 8.587 3.742 9.964 7.178.07.333.07.678 0 1.012-1.377 3.436-5.207 7.178-9.964 7.178-4.757 0-8.588-3.742-9.964-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        )}
                      </button>
                    </div>
                    {passwordErrors.newPassword && <p className="text-red-500 text-[12px] font-medium mt-1">{passwordErrors.newPassword}</p>}
                  </div>

                  {/* Xác nhận mật khẩu mới */}
                  <div className="flex flex-col">
                    <label className="text-[13px] font-bold text-gray-600 mb-2 uppercase tracking-wide">Xác nhận mật khẩu mới</label>
                    <div className="relative">
                      <input 
                        type={showPwd.confirm ? "text" : "password"} 
                        value={passwordForm.confirmPassword} 
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} 
                        className={`w-full p-3.5 rounded-xl border outline-none focus:border-[#2D982A] focus:ring-4 focus:ring-green-50 text-[15px] font-medium pr-10 transition-all ${passwordErrors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                        placeholder="Xác nhận mật khẩu mới"
                      />
                      <button type="button" onClick={() => setShowPwd({...showPwd, confirm: !showPwd.confirm})} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600">
                        {showPwd.confirm ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.413 8.242 7.244 4.5 12 4.5c4.757 0 8.587 3.742 9.964 7.178.07.333.07.678 0 1.012-1.377 3.436-5.207 7.178-9.964 7.178-4.757 0-8.588-3.742-9.964-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        )}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && <p className="text-red-500 text-[12px] font-medium mt-1">{passwordErrors.confirmPassword}</p>}
                  </div>

                  <div className="pt-4">
                    <button type="submit" disabled={loading} className="px-8 py-3 w-full sm:w-auto bg-[#2D982A] text-white rounded-xl font-bold text-[14px] hover:bg-green-700 transition-colors shadow-sm disabled:bg-gray-400">
                      {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
                    </button>
                  </div>
                </form>
              </div>
            ) : activeSidebarTab === 'ORDERS' && !isAdmin ? (
               <OrdersContent orders={orders} profileData={{fullName, email, gender, birthday: dob, phone, avatarUrl}} onNavigate={navigate} onOrderCancelled={(orderCode) => setOrders(prev => prev.map(o => o.orderCode === orderCode ? {...o, status: 'CANCELLED'} : o))} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;