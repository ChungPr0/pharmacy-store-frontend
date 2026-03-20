const AdminHeader = () => {
  return (
    <div className="bg-white shadow p-4 flex justify-between">

      <h1 className="font-semibold">
        Admin Dashboard
      </h1>

      <button className="text-red-500">
        Đăng xuất
      </button>

    </div>
  );
};

export default AdminHeader;