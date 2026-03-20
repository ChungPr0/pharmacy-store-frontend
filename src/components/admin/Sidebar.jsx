import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 bg-green-700 text-white flex flex-col p-4">

      <h2 className="text-xl font-bold mb-6">TD</h2>

      <nav className="flex flex-col gap-3">

        <Link to="/admin" className="hover:bg-green-600 p-2 rounded">
          📊 Quản lý tổng
        </Link>

        <Link to="/admin/orders" className="hover:bg-green-600 p-2 rounded">
          📦 Quản lý đơn hàng
        </Link>

        <Link to="/admin/products" className="hover:bg-green-600 p-2 rounded">
          🛒 Quản lý sản phẩm
        </Link>

        <Link to="/admin/users" className="hover:bg-green-600 p-2 rounded">
          👤 Quản lý khách hàng
        </Link>

        <Link to="/admin/categories" className="hover:bg-green-600 p-2 rounded">
          📁 Danh mục
        </Link>

      </nav>

      <div className="mt-auto text-sm opacity-80">
        ⬅️ Truy cập Website
      </div>

    </div>
  );
};

export default Sidebar;