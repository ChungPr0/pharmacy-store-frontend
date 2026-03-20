import Sidebar from "../components/admin/Sidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-[#F5F7F6]">

      {/* SIDEBAR */}
      <Sidebar />

      {/* CONTENT */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <div className="bg-white px-6 py-4 flex justify-between items-center shadow">
          <h1 className="font-semibold">Admin</h1>

          <div className="flex items-center gap-3">
            <span>Admin</span>
            <img
              src="https://i.pravatar.cc/40"
              className="w-8 h-8 rounded-full"
            />
          </div>
        </div>

        {/* PAGE */}
        <div className="p-6 overflow-y-auto">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default AdminLayout;