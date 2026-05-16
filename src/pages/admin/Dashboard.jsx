import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar 
} from 'recharts';

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

  // Chart states
  const [selectedCard, setSelectedCard] = useState(null); // 'ORDERS', 'REVENUE', 'CUSTOMERS', 'PRODUCTS'
  const [chartData, setChartData] = useState([]);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [dateRange, setDateRange] = useState('7'); // '7', '30', 'thisMonth'

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
          api.post("/admin/orders/search", { status: "DELIVERED", pageNo: 0, pageSize: 100 })
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

  useEffect(() => {
    if (!selectedCard) return;

    const fetchChartData = async () => {
      setIsChartLoading(true);
      try {
        const today = new Date();
        let fromDate = new Date();
        
        if (dateRange === '7') {
          fromDate.setDate(today.getDate() - 6);
        } else if (dateRange === '30') {
          fromDate.setDate(today.getDate() - 29);
        } else if (dateRange === 'thisMonth') {
          fromDate.setDate(1);
        }

        const from = fromDate.toISOString().split('T')[0];
        const to = today.toISOString().split('T')[0];

        const res = await api.get('/admin/dashboard/chart', {
          params: { type: selectedCard, from, to }
        });

        if (res.data?.status === 200) {
          // Format date for display
          const formattedData = res.data.data.map(item => {
            const dateObj = new Date(item.date);
            return {
              ...item,
              displayDate: `${dateObj.getDate()}/${dateObj.getMonth() + 1}`
            };
          });
          setChartData(formattedData);
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu biểu đồ:", error);
      } finally {
        setIsChartLoading(false);
      }
    };

    fetchChartData();
  }, [selectedCard, dateRange]);

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
        <div 
          onClick={() => setSelectedCard(selectedCard === 'ORDERS' ? null : 'ORDERS')}
          className={`bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-5 cursor-pointer transition-all duration-300
            ${selectedCard === 'ORDERS' ? 'ring-2 ring-blue-500 border-blue-500 shadow-md transform -translate-y-1' : 'border-slate-200/60 hover:shadow-md hover:border-blue-300'}`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-colors
            ${selectedCard === 'ORDERS' ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600'}`}>
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
        <div 
          onClick={() => setSelectedCard(selectedCard === 'REVENUE' ? null : 'REVENUE')}
          className={`bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-5 cursor-pointer transition-all duration-300
            ${selectedCard === 'REVENUE' ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-md transform -translate-y-1' : 'border-slate-200/60 hover:shadow-md hover:border-emerald-300'}`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-colors
            ${selectedCard === 'REVENUE' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
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
        <div 
          onClick={() => setSelectedCard(selectedCard === 'CUSTOMERS' ? null : 'CUSTOMERS')}
          className={`bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-5 cursor-pointer transition-all duration-300
            ${selectedCard === 'CUSTOMERS' ? 'ring-2 ring-purple-500 border-purple-500 shadow-md transform -translate-y-1' : 'border-slate-200/60 hover:shadow-md hover:border-purple-300'}`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-colors
            ${selectedCard === 'CUSTOMERS' ? 'bg-purple-500 text-white' : 'bg-purple-50 text-purple-600'}`}>
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
        <div 
          onClick={() => setSelectedCard(selectedCard === 'PRODUCTS' ? null : 'PRODUCTS')}
          className={`bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-5 cursor-pointer transition-all duration-300
            ${selectedCard === 'PRODUCTS' ? 'ring-2 ring-amber-500 border-amber-500 shadow-md transform -translate-y-1' : 'border-slate-200/60 hover:shadow-md hover:border-amber-300'}`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-colors
            ${selectedCard === 'PRODUCTS' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600'}`}>
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

      {/* Expandable Chart Section */}
      {selectedCard && (
        <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                {selectedCard === 'ORDERS' && 'Biểu đồ Đơn hàng'}
                {selectedCard === 'REVENUE' && 'Biểu đồ Doanh thu'}
                {selectedCard === 'CUSTOMERS' && 'Biểu đồ Khách hàng mới'}
                {selectedCard === 'PRODUCTS' && 'Biểu đồ Sản phẩm bán ra'}
              </h3>
              <p className="text-sm text-slate-500 mt-1">Dữ liệu thống kê theo thời gian</p>
            </div>
            
            <div className="flex items-center bg-slate-100/80 p-1 rounded-xl">
              <button 
                onClick={() => setDateRange('7')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${dateRange === '7' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                7 ngày qua
              </button>
              <button 
                onClick={() => setDateRange('30')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${dateRange === '30' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                30 ngày qua
              </button>
              <button 
                onClick={() => setDateRange('thisMonth')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${dateRange === 'thisMonth' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Tháng này
              </button>
            </div>
          </div>

          <div className="h-[350px] w-full">
            {isChartLoading ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-3 border-slate-200 border-t-blue-500 mb-4"></div>
                <p className="text-slate-500 text-sm font-medium">Đang tải dữ liệu biểu đồ...</p>
              </div>
            ) : chartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">
                Không có dữ liệu cho khoảng thời gian này
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {selectedCard === 'REVENUE' ? (
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="displayDate" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                      tickFormatter={(value) => value >= 1000000 ? `${(value/1000000).toFixed(1)}M` : `${value/1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', fontWeight: 600 }}
                      formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                      labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="displayDate" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', fontWeight: 600 }}
                      formatter={(value) => [
                        value, 
                        selectedCard === 'ORDERS' ? 'Đơn hàng' : selectedCard === 'CUSTOMERS' ? 'Khách hàng' : 'Sản phẩm'
                      ]}
                      labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                      cursor={{ fill: '#f1f5f9' }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill={
                        selectedCard === 'ORDERS' ? '#3b82f6' : 
                        selectedCard === 'CUSTOMERS' ? '#a855f7' : '#f59e0b'
                      } 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

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
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
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