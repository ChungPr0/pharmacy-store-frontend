import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  
  // Pagination & Filtering
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("DESC");

  // Modal State
  const [showDetail, setShowDetail] = useState(false);
  const [orderDetail, setOrderDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Status map
  const statusConfig = {
    PENDING: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    PAID: { label: "Đã thanh toán", color: "bg-blue-100 text-blue-800 border-blue-200" },
    PROCESSING: { label: "Đang xử lý", color: "bg-orange-100 text-orange-800 border-orange-200" },
    SHIPPING: { label: "Đang giao", color: "bg-purple-100 text-purple-800 border-purple-200" },
    DELIVERED: { label: "Đã giao", color: "bg-green-100 text-green-800 border-green-200" },
    CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-800 border-red-200" },
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  // --- FETCHING DATA ---
  const fetchOrders = async () => {
    try {
      // Chuẩn bị payload tìm kiếm
      const payload = {
        keyword: keyword.trim(),
        status: status,
        pageNo,
        pageSize,
        sortBy,
        sortDir,
      };

      // Xử lý ngày tháng theo chuẩn ISO 8601 nếu có
      if (startDate) {
        payload.startDate = `${startDate}T00:00:00`;
      }
      if (endDate) {
        payload.endDate = `${endDate}T23:59:59`;
      }

      const res = await api.post("/admin/orders/search", payload);
      const data = res.data?.data;
      if (data) {
        setOrders(data.content || []);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi tải danh sách đơn hàng");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [pageNo, pageSize, sortBy, sortDir, status]);

  // --- HANDLERS ---
  const handleSearch = (e) => {
    e.preventDefault();
    setPageNo(0);
    fetchOrders();
  };

  const handleClearFilters = () => {
    setKeyword("");
    setStatus("");
    setStartDate("");
    setEndDate("");
    setPageNo(0);
    // setTimeout to ensure state is updated before fetching
    setTimeout(() => {
      fetchOrders();
    }, 0);
  };

  const handleViewDetail = async (id) => {
    setIsLoadingDetail(true);
    setShowDetail(true);
    try {
      const res = await api.get(`/admin/orders/${id}`);
      setOrderDetail(res.data?.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi tải chi tiết đơn hàng");
      setShowDetail(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!orderDetail) return;
    try {
      await api.put(`/admin/orders/${orderDetail.id}/status`, {
        status: newStatus,
      });
      toast.success("Cập nhật trạng thái thành công");
      // Cập nhật lại UI detail và list
      handleViewDetail(orderDetail.id);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cập nhật trạng thái thất bại");
    }
  };

  // Helper để xác định các nút thao tác có thể hiển thị
  const renderActionButtons = (currentStatus) => {
    const buttons = [];
    if (currentStatus === "PENDING" || currentStatus === "PAID") {
      buttons.push(
        <button key="processing" onClick={() => handleUpdateStatus("PROCESSING")} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl shadow-sm shadow-emerald-200 hover:bg-emerald-700 transition-all font-bold">
          Xác nhận / Đang xử lý
        </button>
      );
      buttons.push(
        <button key="cancel" onClick={() => handleUpdateStatus("CANCELLED")} className="px-5 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl hover:bg-red-100 transition-all font-bold">
          Hủy đơn
        </button>
      );
    } else if (currentStatus === "PROCESSING") {
      buttons.push(
        <button key="shipping" onClick={() => handleUpdateStatus("SHIPPING")} className="px-5 py-2.5 bg-purple-600 text-white rounded-xl shadow-sm shadow-purple-200 hover:bg-purple-700 transition-all font-bold">
          Giao hàng
        </button>
      );
    } else if (currentStatus === "SHIPPING") {
      buttons.push(
        <button key="delivered" onClick={() => handleUpdateStatus("DELIVERED")} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl shadow-sm shadow-emerald-200 hover:bg-emerald-700 transition-all font-bold">
          Hoàn thành (Đã giao)
        </button>
      );
    }
    
    return buttons.length > 0 ? buttons : <span className="text-slate-500 font-medium text-sm">Không có thao tác nào cho trạng thái này.</span>;
  };

  return (
    <div className="h-full flex flex-col">
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Đơn hàng</h2>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">
            Tổng cộng <span className="text-emerald-600 font-bold">{totalElements}</span> đơn hàng
          </p>
        </div>
      </div>

      {/* FILTERS */}
      <form onSubmit={handleSearch} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold mb-2 text-slate-700">Tìm kiếm (Mã ĐH, SĐT...)</label>
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
             </div>
             <input
               type="text"
               placeholder="Nhập từ khóa..."
               value={keyword}
               onChange={(e) => setKeyword(e.target.value)}
               className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium"
             />
          </div>
        </div>
        
        <div className="w-[180px]">
          <label className="block text-sm font-semibold mb-2 text-slate-700">Trạng thái</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium appearance-none"
          >
            <option value="">Tất cả</option>
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>

        <div className="w-[160px]">
          <label className="block text-sm font-semibold mb-2 text-slate-700">Từ ngày</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium text-slate-600"
          />
        </div>

        <div className="w-[160px]">
          <label className="block text-sm font-semibold mb-2 text-slate-700">Đến ngày</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium text-slate-600"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-sm shadow-emerald-200 hover:bg-emerald-700 transition-all font-bold"
          >
            Lọc
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            className="bg-slate-100 text-slate-600 border border-slate-200 px-5 py-2.5 rounded-xl shadow-sm hover:bg-slate-200 transition-all font-bold"
          >
            Xóa lọc
          </button>
        </div>
      </form>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Mã đơn hàng</th>
                <th className="px-6 py-4">Khách hàng / SĐT</th>
                <th className="px-6 py-4 text-right">Tổng tiền</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4">Ngày đặt</th>
                <th className="px-6 py-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                      <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p>Không tìm thấy đơn hàng nào.</p>
                  </td>
                </tr>
              ) : (
                orders.map((item) => {
                  const sConf = statusConfig[item.status] || { label: item.status, color: "bg-slate-100 text-slate-800" };
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-blue-600">{item.orderCode}</div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">ID: {item.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{item.receiverName}</div>
                        <div className="text-slate-600 font-medium">{item.phoneNumber}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-bold text-emerald-600">{formatCurrency(item.totalAmount)}</div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">{item.paymentMethod}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-3 py-1.5 rounded-md text-xs font-bold border ${sConf.color}`}>
                          {sConf.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleViewDetail(item.id)}
                          className="px-4 py-2 text-sm bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all font-bold border border-slate-200 hover:border-emerald-200"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="mt-auto flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
             <div className="text-sm font-medium text-slate-500">
                Trang <span className="text-slate-800 font-bold">{pageNo + 1}</span> / {totalPages}
             </div>
             <div className="flex gap-2">
              <button
                disabled={pageNo === 0}
                onClick={() => setPageNo((p) => Math.max(0, p - 1))}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Trước
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p = i;
                if (totalPages > 5 && pageNo > 2) {
                   p = pageNo - 2 + i;
                }
                if (p >= totalPages) return null;
                
                return (
                  <button
                    key={p}
                    onClick={() => setPageNo(p)}
                    className={`w-9 h-9 flex items-center justify-center border rounded-xl text-sm font-bold transition-all ${
                      pageNo === p
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-200"
                        : "border-slate-200 text-slate-600 hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    {p + 1}
                  </button>
                );
              })}
              <button
                disabled={pageNo >= totalPages - 1}
                onClick={() => setPageNo((p) => Math.min(totalPages - 1, p + 1))}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL CHI TIẾT ĐƠN HÀNG */}
      {showDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl my-8 relative flex flex-col max-h-[90vh] overflow-hidden border border-slate-200/60">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-slate-50/50">
               <h3 className="text-2xl font-black text-slate-800">
                 Chi tiết đơn hàng {orderDetail ? <span className="text-emerald-600">#{orderDetail.orderCode}</span> : ""}
               </h3>
               <button
                  onClick={() => setShowDetail(false)}
                  className="text-slate-400 hover:text-red-500 bg-white shadow-sm border border-slate-200 hover:border-red-200 hover:bg-red-50 rounded-full p-2 transition-all"
               >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
               </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto bg-slate-50/30">
              {isLoadingDetail || !orderDetail ? (
                <div className="py-12 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-emerald-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Cột trái: Thông tin chung & Khách hàng */}
                  <div className="md:col-span-1 space-y-6">
                    {/* Status card */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60">
                      <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Trạng thái đơn</h4>
                      <div className="mb-3">
                         <span className={`inline-block px-3 py-1.5 rounded-md text-xs font-bold border ${statusConfig[orderDetail.status]?.color || "bg-slate-100 text-slate-800 border-slate-200"}`}>
                           {statusConfig[orderDetail.status]?.label || orderDetail.status}
                         </span>
                      </div>
                      <div className="text-sm text-slate-600 mt-3 space-y-1">
                        <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Ngày đặt:</span> <strong className="text-slate-800">{formatDate(orderDetail.createdAt)}</strong></div>
                        <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Thanh toán:</span> <strong className="text-slate-800">{orderDetail.paymentMethod}</strong></div>
                      </div>
                    </div>

                    {/* Customer info */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60">
                      <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Thông tin người nhận</h4>
                      <div className="text-sm text-slate-700 space-y-3">
                        <div><span className="text-slate-500 font-medium block text-xs mb-1">Họ tên</span> <span className="font-bold text-slate-800">{orderDetail.receiverName}</span></div>
                        <div><span className="text-slate-500 font-medium block text-xs mb-1">Điện thoại</span> <span className="font-bold text-slate-800">{orderDetail.phoneNumber}</span></div>
                        <div><span className="text-slate-500 font-medium block text-xs mb-1">Địa chỉ giao hàng</span> <span className="leading-relaxed font-medium">{orderDetail.shippingAddressText}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Cột phải: Danh sách sản phẩm & Tổng tiền */}
                  <div className="md:col-span-2">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 h-full flex flex-col">
                      <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Sản phẩm đã đặt</h4>
                      
                      <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-100">
                            <tr>
                              <th className="py-3 px-4 text-left">Sản phẩm</th>
                              <th className="py-3 px-4 text-center">SL</th>
                              <th className="py-3 px-4 text-right">Đơn giá</th>
                              <th className="py-3 px-4 text-right">Thành tiền</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {orderDetail.items && orderDetail.items.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-4 px-4 text-slate-800">
                                  <div className="font-bold">{item.productName}</div>
                                  <div className="text-xs font-medium text-slate-500 mt-1">ID: {item.productId}</div>
                                </td>
                                <td className="py-4 px-4 text-center font-bold text-slate-700">{item.quantity}</td>
                                <td className="py-4 px-4 text-right font-medium text-slate-600">{formatCurrency(item.price)}</td>
                                <td className="py-4 px-4 text-right font-bold text-emerald-600">{formatCurrency(item.price * item.quantity)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-6 border-t border-slate-200 pt-5">
                        <div className="flex justify-between items-center text-lg font-black text-slate-900">
                          <span>Tổng thanh toán:</span>
                          <span className="text-emerald-600 text-2xl">{formatCurrency(orderDetail.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Modal Footer (Actions) */}
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/80 rounded-b-3xl flex justify-between items-center">
               <div className="flex gap-3">
                 {orderDetail && renderActionButtons(orderDetail.status)}
               </div>
               <button
                 onClick={() => setShowDetail(false)}
                 className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
               >
                 Đóng
               </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Orders;
