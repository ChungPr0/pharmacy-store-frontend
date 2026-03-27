import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import { useCart } from '../../contexts/CartContext';

const formatVND = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
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

// COMPONENT: TỪNG ĐƠN HÀNG TRONG DANH SÁCH
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

  const shippingFee = 25000;
  // Cộng thêm phí ship vào tổng tiền vì Backend đang chỉ trả về tổng tiền hàng
  const orderTotal = order.totalAmount + shippingFee; 

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:border-[#2D982A] transition-colors duration-300">
      {/* Header Đơn hàng */}
      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between bg-gray-50/50">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h3 className="font-bold text-[16px] text-gray-900">Đơn hàng: {order.orderCode}</h3>
            {getStatusBadge(order.status)}
          </div>
          <p className="text-[13px] text-gray-500">Ngày đặt: {formatDate(order.createdAt)}</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <div className="text-right">
            <p className="text-[12px] text-gray-500 mb-0.5">Tổng tiền (Gồm phí ship)</p>
            <p className="font-black text-[#d0021b] text-[16px]">{formatVND(orderTotal)}</p>
          </div>
          <button 
            onClick={handleToggle}
            className="px-5 py-2 border border-gray-300 rounded-full text-[13px] font-bold text-gray-700 hover:bg-[#2D982A] hover:text-white hover:border-[#2D982A] transition-all"
          >
            {expanded ? 'Thu gọn' : 'Xem chi tiết'}
          </button>
        </div>
      </div>

      {/* Chi tiết Đơn hàng (Hiển thị khi bấm Xem chi tiết) */}
      {expanded && (
        <div className="border-t border-gray-200 p-5 bg-white">
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="w-8 h-8 border-4 border-[#2D982A] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : details ? (
            <div className="flex flex-col space-y-6">
              {/* Thông tin giao hàng */}
              <div className="bg-[#eef8ef] p-4 rounded-lg border border-green-100">
                <h4 className="font-bold text-[14px] text-gray-900 mb-2">Thông tin nhận hàng</h4>
                <div className="text-[13px] text-gray-700 space-y-1">
                  <p><span className="font-medium">Người nhận:</span> {details.receiverName}</p>
                  <p><span className="font-medium">Số điện thoại:</span> {details.phoneNumber}</p>
                  <p><span className="font-medium">Địa chỉ:</span> {details.shippingAddressText}</p>
                  <p><span className="font-medium">Thanh toán:</span> {details.paymentMethod}</p>
                </div>
              </div>

              {/* Danh sách sản phẩm */}
              <div>
                <h4 className="font-bold text-[14px] text-gray-900 mb-3">Sản phẩm đã mua</h4>
                <div className="space-y-3">
                  {details.items && details.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                      <div className="w-[50px] h-[50px] bg-gray-50 border border-gray-200 rounded flex items-center justify-center p-1">
                        {/* FIX ẢNH: Đã đổi sang productImageUrl theo đúng Swagger của Backend */}
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

                {/* BẢNG TỔNG KẾT TIỀN */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                  <div className="w-full md:w-[300px] space-y-2 text-[13px]">
                    <div className="flex justify-between text-gray-600">
                      <span>Tạm tính ({details.items?.reduce((acc, curr) => acc + curr.quantity, 0)} sản phẩm)</span>
                      <span className="font-bold text-gray-800">{formatVND(details.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Phí vận chuyển</span>
                      <span className="font-bold text-gray-800">{formatVND(shippingFee)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-100">
                      <span className="font-bold text-gray-900 text-[14px]">Tổng cộng</span>
                      <span className="font-black text-[#d0021b] text-[18px]">{formatVND(details.totalAmount + shippingFee)}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <p className="text-center text-red-500 text-[14px]">Không tải được dữ liệu chi tiết.</p>
          )}
        </div>
      )}
    </div>
  );
};


// COMPONENT: TRANG CHÍNH
const Orders = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useCart();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  const TABS = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'PENDING', label: 'Chờ xác nhận' },
    { id: 'SHIPPING', label: 'Đang giao' },
    { id: 'DELIVERED', label: 'Hoàn thành' },
    { id: 'CANCELLED', label: 'Đã hủy' }
  ];

  // Chặn user chưa đăng nhập
  useEffect(() => {
    if (!token) {
      toast.error('Vui lòng đăng nhập để xem lịch sử đơn hàng');
      navigate('/login');
    }
  }, [token, navigate]);

  // Fetch danh sách đơn hàng
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/me');
        if (res.data.status === 200) {
          setOrders(res.data.data || []);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!');
          logout();
          navigate('/login');
        } else {
          toast.error('Không thể lấy danh sách đơn hàng');
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchOrders();
  }, [token, logout, navigate]);

  const filteredOrders = activeTab === 'ALL' 
    ? orders 
    : orders.filter(o => o.status === activeTab);

  if (!token) return null;

  return (
    <div className="flex-1 w-full bg-[#f8f9fa] py-8 antialiased">
      <div className="max-w-[1200px] mx-auto px-6 xl:px-0">
        
        {/* BREADCRUMB */}
        <div className="flex items-center space-x-2 text-[13px] text-gray-500 mb-6">
          <span onClick={() => navigate('/')} className="hover:text-[#2D982A] cursor-pointer transition-colors">Trang chủ</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">Trang cá nhân</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* SIDEBAR: THÔNG TIN USER */}
          <div className="lg:col-span-3">
            <div className="bg-[#eef8ef] rounded-2xl p-6 flex flex-col items-center border border-green-100">
              {/* Avatar giả lập theo thiết kế */}
              <div className="w-24 h-24 bg-[#ffedd5] rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm overflow-hidden">
                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=ffedd5" alt="Avatar" className="w-full h-full" />
              </div>
              <h2 className="font-black text-[18px] text-gray-900 mb-1 text-center">
                {user?.fullName || user?.name || "Khách hàng"}
              </h2>
              <p className="text-[14px] text-gray-600 mb-2">{user?.phone || "Chưa cập nhật SĐT"}</p>
              

              <div className="w-full mt-6 space-y-2">
                <button 
                  onClick={() => navigate('/profile')} 
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white transition-colors text-[14px] font-bold text-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" /></svg>
                    <span>Thông tin và địa chỉ</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </button>

                <button 
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white shadow-sm border border-green-100 text-[14px] font-bold text-[#2D982A]"
                >
                  <div className="flex items-center space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>
                    <span>Lịch sử đơn hàng</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </button>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT: LỊCH SỬ ĐƠN HÀNG */}
          <div className="lg:col-span-9 bg-[#eef8ef] rounded-2xl p-6 md:p-8 border border-green-100 h-fit min-h-[500px]">
            <h2 className="text-[22px] font-black text-gray-900 mb-6">Lịch sử đơn hàng</h2>
            
            {/* TABS */}
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

            {/* DANH SÁCH ĐƠN HÀNG */}
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
                <p className="text-[14px] text-gray-500 mt-1">Bạn chưa có đơn hàng nào trong trạng thái này.</p>
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