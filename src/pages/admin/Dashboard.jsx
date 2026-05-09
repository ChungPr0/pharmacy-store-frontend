const Dashboard = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Tổng quan Dashboard
      </h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Total Orders */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Tổng đơn hàng</p>
            <h3 className="text-2xl font-bold text-gray-800">120</h3>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Doanh thu</p>
            <h3 className="text-2xl font-bold text-gray-800">50,000,000₫</h3>
          </div>
        </div>

        {/* Users */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Người dùng</p>
            <h3 className="text-2xl font-bold text-gray-800">300</h3>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Sản phẩm</p>
            <h3 className="text-2xl font-bold text-gray-800">85</h3>
          </div>
        </div>

      </div>

      {/* Recent Activity / Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Đơn hàng gần đây</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-sm">
                  <th className="pb-3 font-medium">Mã ĐH</th>
                  <th className="pb-3 font-medium">Khách hàng</th>
                  <th className="pb-3 font-medium">Ngày đặt</th>
                  <th className="pb-3 font-medium">Tổng tiền</th>
                  <th className="pb-3 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-gray-100">
                  <td className="py-4 font-medium text-gray-800">#DH101</td>
                  <td className="py-4">Nguyễn Văn A</td>
                  <td className="py-4 text-gray-500">20/10/2023</td>
                  <td className="py-4 font-semibold text-gray-800">1,250,000₫</td>
                  <td className="py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Hoàn thành</span></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 font-medium text-gray-800">#DH102</td>
                  <td className="py-4">Trần Thị B</td>
                  <td className="py-4 text-gray-500">19/10/2023</td>
                  <td className="py-4 font-semibold text-gray-800">450,000₫</td>
                  <td className="py-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Đang giao</span></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 font-medium text-gray-800">#DH103</td>
                  <td className="py-4">Lê Văn C</td>
                  <td className="py-4 text-gray-500">18/10/2023</td>
                  <td className="py-4 font-semibold text-gray-800">890,000₫</td>
                  <td className="py-4"><span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Chờ xử lý</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Sản phẩm bán chạy</h3>
          <ul className="space-y-4">
            <li className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Panadol Extra</p>
                <p className="text-xs text-gray-500">Đã bán: 120 hộp</p>
              </div>
            </li>
            <li className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Vitamin C sủi</p>
                <p className="text-xs text-gray-500">Đã bán: 85 hộp</p>
              </div>
            </li>
            <li className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Khẩu trang y tế</p>
                <p className="text-xs text-gray-500">Đã bán: 300 hộp</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;