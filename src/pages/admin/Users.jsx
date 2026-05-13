import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const Users = () => {
  const [customers, setCustomers] = useState([]);
  
  // Pagination & Filtering
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal State
  const [showForm, setShowForm] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  
  // Form Fields
  const [editId, setEditId] = useState(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  // --- HÀM CHECK STATUS BẤT TỬ ---
  // Bắt mọi trường hợp backend có thể trả về: boolean, số, chuỗi hoa/thường
  const checkIsActive = (customer) => {
    if (!customer) return false;
    
    // Nếu truyền vào chuỗi/số/boolean trực tiếp (trường hợp fallback)
    if (typeof customer !== 'object') {
      const val = customer;
      if (val === true || val === 1) return true;
      if (typeof val === "string") {
        const s = val.trim().toUpperCase();
        return ["ACTIVE", "TRUE", "1", "ACTIVED", "HOẠT ĐỘNG"].includes(s);
      }
      return false;
    }

    // Ưu tiên check các field boolean
    if (customer.isActive === true || customer.active === true || customer.enabled === true) return true;
    if (customer.isActive === false || customer.active === false || customer.enabled === false) return false;

    // Check các field string/number liên quan đến trạng thái
    const statusFields = ['status', 'accountStatus', 'userStatus', 'state'];
    for (let field of statusFields) {
      if (customer[field] !== undefined && customer[field] !== null) {
        const val = customer[field];
        if (val === true || val === 1) return true;
        if (val === false || val === 0) return false;
        if (typeof val === "string") {
          const s = val.trim().toUpperCase();
          if (["ACTIVE", "TRUE", "1", "ACTIVED", "HOẠT ĐỘNG"].includes(s)) return true;
          if (["BANNED", "INACTIVE", "FALSE", "0", "LOCKED", "BỊ KHÓA", "DEACTIVATED"].includes(s)) return false;
        }
      }
    }
    return false;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit", minute: "2-digit",
      day: "2-digit", month: "2-digit", year: "numeric",
    }).format(new Date(dateString));
  };

  // Tạo Avatar từ chữ cái đầu của tên
  const getInitials = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  // --- FETCHING DATA ---
  const fetchCustomers = async () => {
    try {
      const res = await api.get("/admin/customers", {
        params: {
          pageNo,
          pageSize,
          keyword: keyword.trim() || undefined,
          status: statusFilter || undefined,
        }
      });
      const data = res.data?.data;
      if (data) {
        setCustomers(data.content || []);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi tải danh sách khách hàng");
    }
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNo, pageSize, statusFilter]);

  // --- HANDLERS ---
  const handleSearch = (e) => {
    e.preventDefault();
    setPageNo(0);
    fetchCustomers();
  };

  const handleClearFilters = () => {
    setKeyword("");
    setStatusFilter("");
    setPageNo(0);
    setTimeout(() => fetchCustomers(), 0);
  };

  const handleOpenEdit = async (id) => {
    setEditId(id);
    setIsEditLoading(true);
    setShowForm(true);
    
    try {
      const res = await api.get(`/admin/customers/${id}`);
      const data = res.data?.data;
      if (data) {
        setFullName(data.fullName || "");
        setPhone(data.phone || "");
        setEmail(data.email || "");
        setAddress(data.address || "");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi lấy chi tiết khách hàng");
      setShowForm(false);
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) return toast.error("Vui lòng nhập họ tên");

    try {
      await api.put(`/admin/customers/${editId}`, {
        fullName: fullName.trim(),
        email: email.trim(),
        address: address.trim(),
      });
      toast.success("Cập nhật thông tin thành công");
      setShowForm(false);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const handleToggleStatus = async (customer) => {
    const isActive = checkIsActive(customer);
    // Nếu đang active thì gửi status báo khóa, ngược lại gửi active
    // Lưu ý: Cần điều chỉnh string "BANNED"/"ACTIVE" theo đúng chuẩn backend của bạn yêu cầu
    const payloadStatus = isActive ? "BANNED" : "ACTIVE"; 
    
    const confirmMsg = isActive 
      ? `Bạn có chắc chắn muốn KHÓA tài khoản của ${customer.fullName}?` 
      : `Bạn muốn MỞ KHÓA tài khoản cho ${customer.fullName}?`;
      
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.patch(`/admin/customers/${customer.id}/status`, {
        status: payloadStatus
      });
      toast.success(`Đã ${isActive ? "khóa" : "mở khóa"} tài khoản thành công!`);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi đổi trạng thái");
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* HEADER SECTION */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Khách hàng</h2>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">
            Hệ thống đang có tổng cộng <span className="text-emerald-600 font-bold">{totalElements}</span> người dùng
          </p>
        </div>
      </div>

      {/* FILTER CARDS */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[280px]">
            <label className="block text-sm font-semibold mb-2 text-slate-700">Tìm kiếm</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Tên, số điện thoại, email..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium text-sm"
              />
            </div>
          </div>
          
          <div className="w-full md:w-[220px]">
            <label className="block text-sm font-semibold mb-2 text-slate-700">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPageNo(0);
              }}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none font-medium text-sm"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="BANNED">Đã bị khóa</option>
            </select>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              type="submit"
              className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm shadow-emerald-200 transition-all"
            >
              Lọc kết quả
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="flex-1 md:flex-none px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all border border-slate-200"
            >
              Làm mới
            </button>
          </div>
        </form>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Liên hệ</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4">Ngày tham gia</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                      <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <p className="text-slate-500 text-base">Không tìm thấy dữ liệu khách hàng nào.</p>
                  </td>
                </tr>
              ) : (
                customers.map((item) => {
                  const isActive = checkIsActive(item);
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-inner ${isActive ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-200' : 'bg-gradient-to-br from-slate-400 to-slate-500'}`}>
                            {getInitials(item.fullName)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{item.fullName}</div>
                            <div className="text-xs text-slate-500 font-medium">ID: #{item.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-700 font-medium">{item.phone}</div>
                        <div className="text-slate-500 text-xs">{item.email || 'Chưa cập nhật email'}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                          isActive 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" 
                            : "bg-red-50 text-red-700 border-red-200/60"
                        }`}>
                          <span className={`w-2 h-2 rounded-full animate-pulse ${isActive ? "bg-emerald-500" : "bg-red-500"}`}></span>
                          {isActive ? "Hoạt động" : "Bị khóa"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {formatDate(item.registrationDate)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(item.id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-200"
                            title="Chi tiết / Chỉnh sửa"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                          
                          {/* Nút Khóa / Mở Khóa rõ ràng hơn */}
                          <button
                            onClick={() => handleToggleStatus(item)}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                              isActive
                                ? "text-red-600 hover:bg-red-50 border-transparent hover:border-red-200"
                                : "text-emerald-600 hover:bg-emerald-50 border-transparent hover:border-emerald-200"
                            }`}
                          >
                            {isActive ? (
                               <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>Khóa</span>
                               </>
                            ) : (
                               <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                </svg>
                                <span>Mở khóa</span>
                               </>
                            )}
                          </button>
                        </div>
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
                if (totalPages > 5 && pageNo > 2) p = pageNo - 2 + i;
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

      {/* MODAL UPDATE / DETAIL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowForm(false)}></div>
          
          {/* Modal Content */}
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative flex flex-col max-h-[90vh] transform transition-all">
            
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
               <h3 className="text-xl font-bold text-slate-800">
                 Hồ sơ khách hàng
               </h3>
               <button
                  onClick={() => setShowForm(false)}
                  className="text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-full p-2 transition-colors"
               >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
               </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {isEditLoading ? (
                <div className="py-16 flex flex-col justify-center items-center gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-blue-600"></div>
                  <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
                </div>
              ) : (
                <form id="customer-form" onSubmit={handleSubmitEdit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-2 text-slate-700">Họ và tên <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium text-slate-800"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold mb-2 text-slate-700">Số điện thoại</label>
                      <input
                        type="text"
                        value={phone}
                        readOnly
                        className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-slate-700">Địa chỉ Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-slate-700">Địa chỉ liên hệ</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full h-28 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium text-slate-800 resize-none"
                    />
                  </div>
                </form>
              )}
            </div>

            <div className="px-6 py-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 transition-all"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                form="customer-form"
                disabled={isEditLoading}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition-all disabled:opacity-50"
              >
                Lưu thông tin
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Users;