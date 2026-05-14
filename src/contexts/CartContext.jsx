import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [authModal, setAuthModal] = useState(null); // 'login' | 'register' | 'forgot' | null

  // Initialize token and user on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (storedToken) {
      setToken(storedToken);
    }
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user:", error);
      }
    }
  }, []);

  const getTotalItems = () => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const fetchCart = async () => {
    if (!token) return;
    try {
      const response = await api.get("/cart");
      if (response.data?.data) {
        const data = response.data.data;
        // Ensure we always set an array
        if (Array.isArray(data)) {
          setCartItems(data);
        } else if (data && typeof data === 'object' && data.items && Array.isArray(data.items)) {
          setCartItems(data.items);
        } else {
          setCartItems([]);
        }
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
    }
  };

  const login = async (userData, token, refreshToken) => {
    setUser(userData);
    setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("role", userData.role);
    
    // Fetch cart with new token
    try {
      const response = await api.get("/cart", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data?.data) {
        const data = response.data.data;
        if (Array.isArray(data)) {
          setCartItems(data);
        } else if (data && typeof data === 'object' && data.items && Array.isArray(data.items)) {
          setCartItems(data.items);
        } else {
          setCartItems([]);
        }
      }
    } catch (error) {
      console.error("Error fetching cart after login:", error);
      setCartItems([]);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setCartItems([]);
  };

  const openAuthModal = (type) => setAuthModal(type);
  const closeAuthModal = () => setAuthModal(null);

  const value = {
    cartItems,
    getTotalItems,
    fetchCart,
    user,
    setUser,
    token,
    setToken,
    logout,
    login,
    authModal,
    openAuthModal,
    closeAuthModal,
  };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
