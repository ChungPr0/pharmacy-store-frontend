import { Link } from "react-router-dom";

const Header = () => {
  return (
    <div className="bg-green-500 text-white p-4 flex justify-between">

      <Link to="/" className="font-bold">
        Pharmacy
      </Link>

      <Link to="/login">
        Đăng nhập
      </Link>

    </div>
  );
};

export default Header;