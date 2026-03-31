import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import { useCart } from '../../contexts/CartContext';
import domtoimage from 'dom-to-image';
import jsPDF from 'jspdf';

const formatVND = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const formatDate = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const formatShortDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

const getExpectedDeliveryDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    d.setDate(d.getDate() + 3);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

const maskPhoneNumber = (phone) => {
  if (!phone || phone.length < 9) return phone;
  return phone.substring(0, 3) + '****' + phone.substring(phone.length - 3);
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

const getPaymentMethodText = (method) => {
    if (method === 'COD') return "Thanh toán khi nhận hàng";
    if (method === 'ATM') return "Thanh toán qua thẻ ATM nội địa/ Internet Banking";
    if (method === 'MOMO') return "Thanh toán qua ví điện tử Momo";
    return method;
};

// --- COMPONENT: TỪNG ĐƠN HÀNG TRONG DANH SÁCH ---
const OrderItem = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!expanded && !details) {
      setLoading(true);
      try {
        const res = await api.get(`/orders/me/${order.orderCode}`);
        if (res.data.status === 200) {
          setDetails(res.data.data);
        } else {
          toast.error(res.data.message || 'Lỗi tải chi tiết đơn hàng');
        }
      } catch (error) {
        toast.error('Không có quyền xem hoặc lỗi máy chủ');
      } finally {
        setLoading(false);
      }
    }
    setExpanded(!expanded);
  };

  const handleExportPDF = async () => {
    const sourceElement = document.getElementById(`invoice-hidden-${order.orderCode}`);
    if (!sourceElement) return;

    const loadToast = toast.loading('Đang khởi tạo file PDF...');
    const tempId = `temp-pdf-container-${order.orderCode}`;

    try {
        const tempContainer = document.createElement('div');
        tempContainer.id = tempId;
        tempContainer.style.position = 'fixed';
        tempContainer.style.top = '0px';
        tempContainer.style.left = '0px';
        tempContainer.style.zIndex = '-9999'; 
        tempContainer.style.background = '#ffffff';

        const clonedElement = sourceElement.cloneNode(true);
        clonedElement.classList.remove('hidden');
        clonedElement.style.display = 'block';

        tempContainer.appendChild(clonedElement);
        document.body.appendChild(tempContainer);

        // FIX 1: Tăng thời gian chờ lên 800ms để ảnh kịp load hoàn toàn vào bản sao
        await new Promise(resolve => setTimeout(resolve, 800));

        const height = clonedElement.offsetHeight;
        const dataUrl = await domtoimage.toPng(clonedElement, {
            bgcolor: '#ffffff',
            width: 800,
            height: height,
            quality: 1,
            cacheBust: true // FIX 2: Ép thư viện bỏ qua Cache, luôn tải lại ảnh mới nhất
        });
        
        document.body.removeChild(tempContainer);

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (height * pdfWidth) / 800;

        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Hoa-don-${order.orderCode}.pdf`); 
        
        toast.success('Tải hóa đơn về máy thành công!', { id: loadToast });
    } catch (error) {
        toast.error('Lỗi khi xuất PDF', { id: loadToast });
        console.error("Lỗi PDF chi tiết:", error);
        
        const stuckNode = document.getElementById(tempId);
        if(stuckNode) document.body.removeChild(stuckNode);
    }
  };

  const shippingFee = 25000;
  const orderTotal = order.totalAmount + shippingFee; 

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:border-[#2D982A] transition-colors duration-300">
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between bg-gray-50/50">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h3 className="font-bold text-[16px] text-gray-900">Đơn hàng: {order.orderCode}</h3>
              {getStatusBadge(order.status)}
            </div>
            <p className="text-[13px] text-gray-500">Ngày đặt: {formatDate(order.createdAt)}</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="text-right hidden md:block">
              <p className="text-[12px] text-gray-500 mb-0.5">Tổng tiền (Gồm phí ship)</p>
              <p className="font-black text-[#d0021b] text-[16px]">{formatVND(orderTotal)}</p>
            </div>
            <button 
              onClick={handleToggle}
              className="px-5 py-2 border border-gray-300 rounded-full text-[13px] font-bold text-gray-700 hover:bg-[#2D982A] hover:text-white hover:border-[#2D982A] transition-all whitespace-nowrap"
            >
              {expanded ? 'Thu gọn' : 'Xem chi tiết'}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="border-t border-gray-200 p-5 bg-white relative">
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="w-8 h-8 border-4 border-[#2D982A] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : details ? (
              <div className="flex flex-col space-y-6">
                
                <div className="bg-[#eef8ef] p-4 rounded-lg border border-green-100">
                  <h4 className="font-bold text-[14px] text-gray-900 mb-2">Thông tin nhận hàng</h4>
                  <div className="text-[13px] text-gray-700 space-y-1">
                    <p><span className="font-medium text-gray-800">Người nhận:</span> {details.receiverName}</p>
                    <p><span className="font-medium text-gray-800">Số điện thoại:</span> {details.phoneNumber}</p>
                    <p><span className="font-medium text-gray-800">Địa chỉ:</span> {details.shippingAddressText}</p>
                    <p><span className="font-medium text-gray-800">Thanh toán:</span> {getPaymentMethodText(details.paymentMethod)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-[14px] text-gray-900 mb-3">Sản phẩm đã mua</h4>
                  <div className="space-y-3">
                    {/* GIAO DIỆN HIỂN THỊ TRÊN WEB */}
                    {details.items && details.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                        <div className="w-[50px] h-[50px] bg-gray-50 border border-gray-200 rounded flex items-center justify-center p-1">
                          <img 
                            src={item.productImageUrl || "https://placehold.co/100x100/e2e8f0/a1a1aa?text=No+Image"} 
                            alt={item.productName} 
                            className="max-w-full max-h-full object-contain rounded-sm" 
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/e2e8f0/a1a1aa?text=No+Image"; }} 
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-[14px] font-bold text-gray-800">{item.productName}</p>
                          <p className="text-[13px] text-gray-500">Số lượng: {item.quantity}</p>
                        </div>
                        <div className="font-bold text-black text-[14px]">
                          {formatVND(item.price)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col md:flex-row md:justify-end items-end">
                    <div className="w-full md:w-[300px] space-y-2 text-[13px]">
                      <div className="flex justify-between text-gray-600">
                        <span>Tạm tính ({details.items?.reduce((acc, curr) => acc + curr.quantity, 0)} sản phẩm)</span>
                        <span className="font-bold text-gray-800">{formatVND(details.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Phí vận chuyển</span>
                        <span className="font-bold text-gray-800">{formatVND(shippingFee)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-100 mb-4">
                        <span className="font-bold text-gray-900 text-[14px]">Tổng cộng</span>
                        <span className="font-black text-[#d0021b] text-[18px]">{formatVND(details.totalAmount + shippingFee)}</span>
                      </div>

                      <button 
                        onClick={handleExportPDF}
                        className="w-full py-2.5 rounded-lg border-2 border-[#2D982A] text-[#2D982A] font-bold text-[14px] hover:bg-green-50 transition-colors shadow-sm flex items-center justify-center space-x-2"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                         <span>Xuất hóa đơn</span>
                      </button>
                    </div>
                  </div>

                </div>

                {/* BẢN MẪU HÓA ĐƠN BỊ GIẤU (ĐỂ XUẤT PDF) */}
                <div className="hidden bg-white w-[800px] p-10 text-black" id={`invoice-hidden-${order.orderCode}`}>
                    <h1 className="text-center font-black text-[26px] mb-10 text-black">THÔNG TIN CHI TIẾT ĐƠN HÀNG</h1>
                    
                    <div className="flex items-center space-x-4 mb-6">
                        <h2 className="text-[20px] font-bold text-black uppercase">ĐƠN HÀNG {formatShortDate(order.createdAt)}</h2>
                        {getStatusBadge(order.status)}
                    </div>

                    <h3 className="font-bold text-[16px] text-black mb-4">Thông tin nhận hàng và thanh toán</h3>
                    
                    <div className="grid grid-cols-[220px_1fr] gap-y-3.5 text-[14px] text-black mb-10">
                        <span className="font-medium text-gray-800">Mã đơn hàng</span>
                        <span>{order.orderCode}</span>
                        <span className="font-medium text-gray-800">Họ và tên người nhận</span>
                        <span>{details.receiverName}</span>
                        <span className="font-medium text-gray-800">Số điện thoại người nhận</span>
                        <span>{details.phoneNumber}</span>
                        <span className="font-medium text-gray-800">Email</span>
                        <span>{details.email || "benzen20406@gmail.com"}</span>
                        <span className="font-medium text-gray-800">Địa chỉ nhận hàng</span>
                        <span>{details.shippingAddressText}</span>
                        <span className="font-medium text-gray-800">Phương thức thanh toán</span>
                        <span>{getPaymentMethodText(details.paymentMethod)}</span>
                        <span className="font-medium text-gray-800">Thời gian dự kiến</span>
                        <span>{getExpectedDeliveryDate(order.createdAt)}</span>
                    </div>

                    <div className="bg-[#dff5d8] grid grid-cols-12 gap-4 px-4 py-3 text-[14px] font-bold text-black mb-4">
                        <div className="col-span-7">Thông tin đơn hàng</div>
                        <div className="col-span-2 text-center">Số lượng</div>
                        <div className="col-span-3 text-right pr-2">Thành tiền</div>
                    </div>

                    <div className="divide-y divide-gray-200 border-b border-gray-800 mb-8">
                        {details.items && details.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-4 py-4 px-4 items-center">
                                <div className="col-span-7 flex items-center space-x-4">
                                    <div className="w-[60px] h-[60px] border border-gray-200 p-1 flex-shrink-0 bg-white">
                                        
                                        <img 
                                          crossOrigin="anonymous" 
                                          src={item.productImageUrl || "https://placehold.co/100x100/e2e8f0/a1a1aa?text=No+Image"} 
                                          alt={item.productName} 
                                          className="w-full h-full object-contain" 
                                        />
                                    </div>
                                    <span className="text-[13px] font-medium text-black">{item.productName}</span>
                                </div>
                                <div className="col-span-2 text-center text-[13px] text-black">{item.quantity}</div>
                                <div className="col-span-3 text-right text-[13px] text-black pr-2">{formatVND(item.price)}</div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end">
                        <div className="w-[350px] space-y-4 text-[14px]">
                            <div className="flex justify-between font-bold text-black">
                                <span>Tạm tính:</span>
                                <span>{formatVND(details.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-black">
                                <span>Mã giảm giá:</span>
                                <span>0đ</span>
                            </div>
                            <div className="flex justify-between font-bold text-black">
                                <span>Phí vận chuyển:</span>
                                <span>{formatVND(shippingFee)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="font-bold text-[16px] text-black">Tổng tiền:</span>
                                <span className="font-black text-[18px] text-black">{formatVND(details.totalAmount + shippingFee)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* KẾT THÚC BẢN MẪU BỊ GIẤU */}

              </div>
            ) : (
              <p className="text-center text-red-500 text-[14px]">Không tải được dữ liệu chi tiết.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

// --- COMPONENT CHÍNH: TRANG ORDERS ---
const Orders = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useCart();
  
  const [orders, setOrders] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  const TABS = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'PENDING', label: 'Chờ xác nhận' },
    { id: 'SHIPPING', label: 'Đang giao' },
    { id: 'DELIVERED', label: 'Hoàn thành' },
    { id: 'CANCELLED', label: 'Đã hủy' }
  ];

  useEffect(() => {
    if (!token) {
      toast.error('Vui lòng đăng nhập để xem lịch sử đơn hàng');
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, profileRes] = await Promise.all([
            api.get('/orders/me'),
            api.get('/profile')
        ]);

        if (ordersRes.data.status === 200) {
          setOrders(ordersRes.data.data || []);
        }
        if (profileRes.data.status === 200) {
          setProfileData(profileRes.data.data);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!');
          logout();
          navigate('/login');
        } else {
          toast.error('Không thể tải dữ liệu');
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token, logout, navigate]);

  const filteredOrders = activeTab === 'ALL' 
    ? orders 
    : orders.filter(o => o.status === activeTab);

  if (!token) return null;

  return (
    <div className="flex-1 w-full bg-[#f8f9fa] py-8 antialiased">
      <div className="max-w-[1200px] mx-auto px-6 xl:px-0">
        
        <div className="flex items-center space-x-2 text-[13px] text-gray-500 mb-6">
          <span onClick={() => navigate('/')} className="hover:text-[#2D982A] cursor-pointer transition-colors">Trang chủ</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">Lịch sử đơn hàng</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-3">
            <div className="bg-[#eef8ef] rounded-2xl p-6 flex flex-col items-center border border-green-100 h-full">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm overflow-hidden p-1">
                <img 
                    src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=ffedd5" 
                    alt="Avatar Mặc định" 
                    className="w-full h-full object-cover" 
                />
              </div>
              <h2 className="font-black text-[18px] text-gray-900 mb-1 text-center">
                {profileData?.fullName || user?.name || "Khách hàng"}
              </h2>
              <p className="text-[14px] text-gray-600 mb-2">
                {profileData?.phone ? maskPhoneNumber(profileData.phone) : "Chưa cập nhật SĐT"}
              </p>

              <div className="w-full mt-6 space-y-2">
                <button onClick={() => navigate('/profile')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white transition-colors text-[14px] font-bold text-gray-700">
                  <div className="flex items-center space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" /></svg>
                    <span>Thông tin và địa chỉ</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </button>

                <button className="w-full flex items-center justify-between p-3 rounded-xl bg-white shadow-sm border border-green-100 text-[14px] font-bold text-[#2D982A]">
                  <div className="flex items-center space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>
                    <span>Lịch sử đơn hàng</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-9 bg-[#eef8ef] rounded-2xl p-6 md:p-8 border border-green-100 h-fit min-h-[500px]">
            <h2 className="text-[22px] font-black text-gray-900 mb-6">Lịch sử đơn hàng</h2>
            
            <div className="flex flex-wrap items-center bg-[#dff5d8] rounded-full p-1.5 mb-8">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[120px] py-2.5 rounded-full text-[14px] font-bold transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'bg-[#2D982A] text-white shadow-md' 
                      : 'text-gray-600 hover:text-[#2D982A]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-[#2D982A] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="space-y-6">
                {filteredOrders.map(order => (
                  <OrderItem key={order.id} order={order} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-16 flex flex-col items-center justify-center border border-gray-100 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24 text-gray-300 mb-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>
                <p className="text-[16px] font-bold text-gray-800">Không có đơn hàng nào.</p>
                <button onClick={() => navigate('/')} className="mt-6 px-8 py-2.5 bg-[#2D982A] text-white rounded-full font-bold text-[14px] shadow-sm hover:bg-green-700 transition-colors">
                  Tiếp tục mua sắm
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;