import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path || (path !== "/admin" && location.pathname.startsWith(path));

  const menuItems = [
    { name: "Tổng quan", path: "/admin", icon: "📊" },
    { name: "Đơn hàng", path: "/admin/orders", icon: "📦" },
    { name: "Sản phẩm", path: "/admin/products", icon: "🛒" },
    { name: "Kho hàng", path: "/admin/inventory", icon: "🏭" },
    { name: "Khách hàng", path: "/admin/users", icon: "👥" },
    { name: "Danh mục", path: "/admin/categories", icon: "📁" },
  ];

  return (
    <div className="w-64 bg-gray-900 text-gray-300 flex flex-col transition-all duration-300 shadow-xl z-20 shrink-0">
      <div className="h-16 flex items-center px-6 bg-gray-950/50 border-b border-gray-800">
        <h2 className="text-2xl font-black text-white tracking-wider flex items-center gap-2">
          <span className="text-[#3ec43a]">TD</span> PHARMA
        </h2>
      </div>

      <nav className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Menu chính</div>
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                active
                  ? "bg-[#2D982A]/20 text-[#4ade80] shadow-[inset_4px_0_0_0_#2D982A]"
                  : "hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className={`text-xl ${active ? "grayscale-0" : "grayscale"}`}>{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800 bg-gray-900/50">
        <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
          <span className="text-xl">🏠</span>
          Về trang khách hàng
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;