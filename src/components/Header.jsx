import { Link, useNavigate } from "react-router-dom";

const Header = () => {

  const navigate = useNavigate(); // 👈 thêm dòng này

  return (
    <div className="bg-green-500 text-white p-4 flex justify-between">

      <Link to="/" className="font-bold">
        Pharmacy
      </Link>

      <div className="flex gap-4 items-center">

        <Link to="/login">
          Đăng nhập
        </Link>

        <button
          onClick={() => navigate("/admin")}
          className="bg-green-600 px-4 py-2 rounded"
        >
          Vào Admin
        </button>

      </div>

    </div>
  );
};

export default Header;