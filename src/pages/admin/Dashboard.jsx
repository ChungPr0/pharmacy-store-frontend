import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const statusConfig = {
    PENDING: { label: "Chờ xử lý", color: "bg-amber-50 text-amber-700 border-amber-200/60", dot: "bg-amber-500" },
    PAID: { label: "Đã thanh toán", color: "bg-blue-50 text-blue-700 border-blue-200/60", dot: "bg-blue-500" },
    PROCESSING: { label: "Đang xử lý", color: "bg-orange-50 text-orange-700 border-orange-200/60", dot: "bg-orange-500" },
    SHIPPING: { label: "Đang giao", color: "bg-purple-50 text-purple-700 border-purple-200/60", dot: "bg-purple-500 animate-pulse" },
    DELIVERED: { label: "Hoàn thành", color: "bg-emerald-50 text-emerald-700 border-emerald-200/60", dot: "bg-emerald-500" },
    CANCELLED: { label: "Đã hủy", color: "bg-red-50 text-red-700 border-red-200/60", dot: "bg-red-500" },
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateString));
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch overview stats in parallel
        const [ordersRes, productsRes, customersRes, revenueRes] = await Promise.all([
          api.post("/admin/orders/search", { pageNo: 0, pageSize: 5, sortBy: "createdAt", sortDir: "DESC" }),
          api.get("/admin/products", { params: { pageNo: 0, pageSize: 5 } }),
          api.get("/admin/customers", { params: { pageNo: 0, pageSize: 1 } }),
          api.post("/admin/orders/search", { status: "DELIVERED", pageNo: 0, pageSize: 1000 })
        ]);

        const ordersData = ordersRes.data?.data;
        const productsData = productsRes.data?.data;
        const customersData = customersRes.data?.data;
        const revenueOrders = revenueRes.data?.data?.content || [];
        
        // Calculate total revenue from delivered orders
        const calculatedRevenue = revenueOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        setStats({
          totalOrders: ordersData?.totalElements || 0,
          totalProducts: productsData?.totalElements || 0,
          totalCustomers: customersData?.totalElements || 0,
          totalRevenue: calculatedRevenue
        });

        // Set recent orders
        setRecentOrders(ordersData?.content || []);
        
        // Use recent products as 'top products' placeholder since we don't have a best-seller API
        setTopProducts(productsData?.content || []);

      } catch (error) {
        console.error("Lỗi tải dữ liệu dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-[#2D982A]"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Tổng quan</h2>
        <p className="text-sm text-slate-500 mt-1.5 font-medium">Theo dõi hiệu suất cửa hàng hôm nay</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Total Orders */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Tổng đơn hàng</p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">{stats.totalOrders}</h3>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Doanh thu</p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">{formatCurrency(stats.totalRevenue)}</h3>
          </div>
        </div>

        {/* Users */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Khách hàng</p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">{stats.totalCustomers}</h3>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Sản phẩm</p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">{stats.totalProducts}</h3>
          </div>
        </div>

      </div>

      {/* Recent Activity / Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders Table */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">Đơn hàng gần đây</h3>
            <Link to="/admin/orders" className="text-sm font-semibold text-[#2D982A] hover:text-green-700">Xem tất cả</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-4 px-4 rounded-tl-lg">Mã ĐH</th>
                  <th className="py-4 px-4">Khách hàng</th>
                  <th className="py-4 px-4">Ngày đặt</th>
                  <th className="py-4 px-4">Tổng tiền</th>
                  <th className="py-4 px-4 rounded-tr-lg">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-500">Chưa có đơn hàng nào.</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const sConf = statusConfig[order.status] || { label: order.status, color: "bg-slate-50 text-slate-700 border-slate-200", dot: "bg-slate-500" };
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4 font-bold text-blue-600">{order.orderCode}</td>
                        <td className="py-4 px-4 font-semibold text-slate-800">{order.receiverName}</td>
                        <td className="py-4 px-4 text-slate-500 font-medium">{formatDate(order.createdAt)}</td>
                        <td className="py-4 px-4 font-bold text-slate-800">{formatCurrency(order.totalAmount)}</td>
                        <td className="py-4 px-4">
                           <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${sConf.color}`}>
                              <span className={`w-2 h-2 rounded-full ${sConf.dot}`}></span>
                              {sConf.label}
                           </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Sản phẩm mới cập nhật</h3>
          <ul className="space-y-5">
            {topProducts.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có sản phẩm nào.</p>
            ) : (
              topProducts.map((product) => (
                <li key={product.id} className="flex items-center gap-4 group">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-[#2D982A] group-hover:bg-[#eef8ef] transition-colors overflow-hidden border border-slate-100">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 mb-0.5 truncate" title={product.name}>{product.name}</p>
                    <p className="text-xs font-medium text-slate-500">Kho: {product.totalStockQuantity} | {formatCurrency(product.price)}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;