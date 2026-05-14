import Sidebar from "../components/admin/Sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { useCart } from "../contexts/CartContext";

const AdminLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useCart();

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất!');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* HEADER */}
        <header className="h-16 bg-white/80 backdrop-blur-md px-8 flex justify-between items-center shadow-sm border-b border-gray-100 z-10 sticky top-0 shrink-0">
          <h1 className="font-bold text-gray-800 text-lg tracking-tight">Hệ thống quản trị</h1>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-[#2D982A] transition-colors rounded-full hover:bg-green-50">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
               </svg>
            </button>
            <div className="h-8 w-px bg-gray-200 mx-2"></div>
            
            <div className="relative group flex items-center cursor-pointer py-1">
              <div className="flex items-center space-x-2.5">
                <div className="text-right hidden sm:block">
                  <p className="text-[14px] font-bold text-gray-800 group-hover:text-[#2D982A] transition-colors">{user?.fullName || user?.name || "Administrator"}</p>
                  <p className="text-[12px] text-gray-500 font-medium">Quản trị viên</p>
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-100 bg-[#ffedd5] shadow-sm group-hover:border-[#2D982A] transition-colors">
                  <img src={user?.avatarUrl || "https://api.dicebear.com/7.x/notionists/svg?seed=Admin&backgroundColor=ffedd5"} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Menu thả xuống */}
              <div className="absolute top-[100%] right-0 pt-2 w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <ul className="bg-white border border-gray-100 rounded-lg shadow-xl py-2 overflow-hidden">
                  <li onClick={() => navigate('/')} className="px-4 py-2.5 text-[13px] text-gray-700 hover:bg-green-50 hover:text-[#2D982A] cursor-pointer font-medium flex items-center space-x-2 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
                    <span>Về trang khách hàng</span>
                  </li>
                  <div className="w-full h-[1px] bg-gray-100 my-1"></div>
                  <li onClick={handleLogout} className="px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 cursor-pointer font-medium flex items-center space-x-2 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
                    <span>Đăng xuất</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth relative">
          <Toaster position="top-right" toastOptions={{
             className: 'font-medium rounded-xl shadow-lg text-[14px]',
             success: { iconTheme: { primary: '#2D982A', secondary: '#fff' } }
          }} />
          <div className="max-w-7xl mx-auto h-full flex flex-col">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;