import Sidebar from "../components/admin/Sidebar";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* HEADER */}
        <header className="h-16 bg-white/80 backdrop-blur-md px-8 flex justify-between items-center shadow-sm border-b border-slate-200/60 z-10 sticky top-0 shrink-0">
          <h1 className="font-bold text-slate-800 text-lg">Hệ thống quản trị</h1>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors rounded-full hover:bg-emerald-50">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
               </svg>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">Administrator</p>
                <p className="text-xs text-slate-500">Super Admin</p>
              </div>
              <img
                src="https://api.dicebear.com/7.x/notionists/svg?seed=Admin&backgroundColor=d1fae5"
                alt="Admin"
                className="w-10 h-10 rounded-full border-2 border-slate-200 group-hover:border-emerald-500 transition-colors shadow-sm"
              />
            </div>
          </div>
        </header>

        {/* PAGE */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth relative">
          <Toaster position="top-right" toastOptions={{
             className: 'font-medium rounded-xl shadow-lg',
             success: { iconTheme: { primary: '#10b981', secondary: '#fff' } }
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