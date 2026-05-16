import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
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

const getStatusBadge = (status) => {
  switch (status) {
    case 'PENDING': return <span className="text-[#f59e0b] bg-yellow-50 px-2.5 py-1 rounded text-[12px] font-bold border border-yellow-200 whitespace-nowrap inline-block">Chờ xác nhận</span>;
    case 'PAID': return <span className="text-blue-500 bg-blue-50 px-2.5 py-1 rounded text-[12px] font-bold border border-blue-200 whitespace-nowrap inline-block">Đã thanh toán</span>;
    case 'PROCESSING': return <span className="text-blue-500 bg-blue-50 px-2.5 py-1 rounded text-[12px] font-bold border border-blue-200 whitespace-nowrap inline-block">Đang xử lý</span>;
    case 'SHIPPING': return <span className="text-blue-500 bg-blue-50 px-2.5 py-1 rounded text-[12px] font-bold border border-blue-200 whitespace-nowrap inline-block">Đang giao</span>;
    case 'DELIVERED': return <span className="text-[#2D982A] bg-[#eef8ef] px-2.5 py-1 rounded text-[12px] font-bold border border-green-200 whitespace-nowrap inline-block">Hoàn thành</span>;
    case 'CANCELLED': return <span className="text-red-500 bg-red-50 px-2.5 py-1 rounded text-[12px] font-bold border border-red-200 whitespace-nowrap inline-block">Đã hủy</span>;
    default: return <span className="text-gray-500 bg-gray-100 px-2.5 py-1 rounded text-[12px] font-bold whitespace-nowrap inline-block">{status}</span>;
  }
};

const getPaymentMethodText = (method) => {
    if (method === 'COD') return "Thanh toán khi nhận hàng";
    if (method === 'ATM') return "Thanh toán qua thẻ ATM nội địa/ Internet Banking";
    if (method === 'MOMO') return "Thanh toán qua ví điện tử Momo";
    return method;
};

const CANCEL_REASONS = [
  "Tôi muốn thay đổi sản phẩm",
  "Tôi muốn thay đổi địa chỉ giao hàng",
  "Tôi tìm được giá tốt hơn ở nơi khác",
  "Tôi không còn nhu cầu mua nữa",
  "Đặt nhầm sản phẩm",
  "Lý do khác"
];

const OrderItem = ({ order, profileData, onOrderCancelled }) => {
  const [expanded, setExpanded] = useState(false);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(order.status);

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

  const canCancel = currentStatus === 'PENDING' || currentStatus === 'PAID';

  const handleCancelOrder = async () => {
    const reason = cancelReason === 'Lý do khác' ? customReason.trim() : cancelReason;
    if (!reason) {
      toast.error('Vui lòng chọn hoặc nhập lý do hủy đơn hàng!');
      return;
    }
    setCancelling(true);
    try {
      const res = await api.put(`/orders/me/${order.orderCode}/cancel`, { cancelReason: reason });
      if (res.data.status === 200) {
        toast.success('Hủy đơn hàng thành công!');
        setCurrentStatus('CANCELLED');
        setShowCancelModal(false);
        setCancelReason('');
        setCustomReason('');
        if (onOrderCancelled) onOrderCancelled(order.orderCode);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Hủy đơn hàng thất bại!');
    } finally {
      setCancelling(false);
    }
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

        await new Promise(resolve => setTimeout(resolve, 800));

        const height = clonedElement.offsetHeight;
        const dataUrl = await domtoimage.toPng(clonedElement, {
            bgcolor: '#ffffff',
            width: 800,
            height: height,
            quality: 1,
            cacheBust: true 
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
      {/* MODAL XÁC NHẬN HỦY ĐƠN */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center backdrop-blur-sm" onClick={() => !cancelling && setShowCancelModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-[480px] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold text-[16px] flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                <span>Xác nhận hủy đơn hàng</span>
              </h3>
              <button onClick={() => setShowCancelModal(false)} disabled={cancelling} className="text-white/80 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-[14px] text-gray-800 font-medium">Bạn có chắc chắn muốn hủy đơn hàng <span className="font-black text-red-600">{order.orderCode}</span>?</p>
                <p className="text-[12px] text-gray-500 mt-1">Hành động này không thể hoàn tác sau khi xác nhận.</p>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">Lý do hủy đơn <span className="text-red-500">*</span></label>
                <div className="space-y-2">
                  {CANCEL_REASONS.map(reason => (
                    <label key={reason} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${cancelReason === reason ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-red-200 hover:bg-red-50/30'}`}>
                      <input type="radio" name="cancelReason" value={reason} checked={cancelReason === reason} onChange={e => setCancelReason(e.target.value)} className="w-4 h-4 accent-red-500 mr-3 cursor-pointer" />
                      <span className="text-[13px] text-gray-800 font-medium">{reason}</span>
                    </label>
                  ))}
                </div>
                {cancelReason === 'Lý do khác' && (
                  <textarea value={customReason} onChange={e => setCustomReason(e.target.value)} placeholder="Nhập lý do cụ thể của bạn..." rows={3} className="w-full mt-3 p-3 border border-gray-300 rounded-lg outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 text-[13px] resize-none transition-all" />
                )}
              </div>
              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowCancelModal(false)} disabled={cancelling} className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-[13px] font-bold hover:bg-gray-50 transition-colors">Quay lại</button>
                <button type="button" onClick={handleCancelOrder} disabled={cancelling || (!cancelReason || (cancelReason === 'Lý do khác' && !customReason.trim()))} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white text-[13px] font-bold hover:from-red-600 hover:to-rose-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
                  {cancelling ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Đang xử lý...</span></>) : (<><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg><span>Xác nhận hủy</span></>)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:border-[#2D982A] transition-colors duration-300">
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between bg-gray-50/50">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h3 className="font-bold text-[16px] text-gray-900">Đơn hàng: {order.orderCode}</h3>
              {getStatusBadge(currentStatus)}
            </div>
            <p className="text-[13px] text-gray-500">Ngày đặt: {formatDate(order.createdAt)}</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="text-right hidden md:block">
              <p className="text-[12px] text-gray-500 mb-0.5">Tổng tiền (Gồm phí ship)</p>
              <p className="font-black text-[#d0021b] text-[16px]">{formatVND(orderTotal)}</p>
            </div>
            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-5 py-2 border border-red-300 rounded-full text-[13px] font-bold text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all whitespace-nowrap"
              >
                Hủy đơn
              </button>
            )}
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
                        <span>{details.email || profileData?.email || "Chưa cập nhật"}</span>
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

export default function OrdersContent({ orders, profileData, onNavigate, onOrderCancelled }) {
  const [activeTab, setActiveTab] = useState('ALL');
  
  const TABS = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'PENDING', label: 'Chờ xác nhận' },
    { id: 'SHIPPING', label: 'Đang giao' },
    { id: 'DELIVERED', label: 'Hoàn thành' },
    { id: 'CANCELLED', label: 'Đã hủy' }
  ];

  const filteredOrders = activeTab === 'ALL' 
    ? orders 
    : orders.filter(o => o.status === activeTab);

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm h-fit min-h-[700px]">
      <h2 className="text-[22px] font-black text-gray-900 mb-6 uppercase tracking-tight">Lịch sử đơn hàng</h2>
      
      <div className="flex flex-wrap items-center bg-gray-50 rounded-2xl p-1.5 mb-8 border border-gray-100">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[100px] py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 ${
              activeTab === tab.id 
                ? 'bg-[#2D982A] text-white shadow-md' 
                : 'text-gray-500 hover:text-[#2D982A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredOrders.length > 0 ? (
        <div className="space-y-6">
          {filteredOrders.map(order => (
            <OrderItem key={order.id} order={order} profileData={profileData} onOrderCancelled={onOrderCancelled} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-16 flex flex-col items-center justify-center border border-gray-100 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24 text-gray-300 mb-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>
          <p className="text-[16px] font-bold text-gray-800">Không có đơn hàng nào.</p>
          <button onClick={() => onNavigate('/')} className="mt-6 px-8 py-2.5 bg-[#2D982A] text-white rounded-full font-bold text-[14px] shadow-sm hover:bg-green-700 transition-colors">
            Tiếp tục mua sắm
          </button>
        </div>
      )}
    </div>
  );
}
