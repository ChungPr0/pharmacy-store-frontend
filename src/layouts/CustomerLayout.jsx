import { Outlet, useLocation } from 'react-router-dom';

export default function CustomerLayout() {
  const location = useLocation();
  const isRegisterPage = location.pathname === '/register';

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* */}
      {!isRegisterPage && (
        <header className="bg-[#2e7d32] text-white p-4 w-full">
          <div className="flex justify-between items-center px-10">
            <h1 className="text-xl font-bold">Nhà Thuốc Thái Dương</h1>
          </div>
        </header>
      )}

      {/*  */}
      <main className="flex-1 w-full flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}