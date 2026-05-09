import { Navigate } from "react-router-dom";

const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  let role = localStorage.getItem("role");

  if (!role) {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        role = user.role;
      }
    } catch (error) {
      console.error("Error parsing user:", error);
    }
  }

  if (!token || (role !== "ADMIN" && role !== "admin")) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedAdminRoute;