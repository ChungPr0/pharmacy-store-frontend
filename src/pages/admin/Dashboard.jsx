const Dashboard = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        Tổng quan
      </h2>

      <div className="grid grid-cols-3 gap-4">

        <div className="bg-white p-4 rounded shadow">
          Tổng đơn hàng: 120
        </div>

        <div className="bg-white p-4 rounded shadow">
          Doanh thu: 50tr
        </div>

        <div className="bg-white p-4 rounded shadow">
          Người dùng: 300
        </div>

      </div>
    </div>
  );
};

export default Dashboard;