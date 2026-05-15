import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CustomerLayout from '../layouts/CustomerLayout';
import Home from '../pages/customer/Home';
import Register from '../pages/customer/Register';
import ProductDetail from '../pages/customer/ProductDetail'; 
import Cart from '../pages/customer/Cart';
import About from '../pages/customer/About';
import News from '../pages/customer/News';
import Support from '../pages/customer/Support';
import Login from '../pages/customer/Login';
import ForgotPassword from '../pages/customer/ForgotPassword';
import Category from '../pages/customer/Category';
import SearchResults from '../pages/customer/SearchResults';

import Profile from '../pages/customer/Profile';

import NotFound from '../pages/customer/NotFound';

import AdminLayout from '../layouts/AdminLayout';
import Dashboard from '../pages/admin/Dashboard';
import Products from '../pages/admin/Products';
import Orders from '../pages/admin/Orders';
import Users from '../pages/admin/Users';
import Categories from '../pages/admin/Categories';
import Inventory from '../pages/admin/Inventory';
import Checkout from '../pages/customer/Checkout';

import ProtectedAdminRoute from '../components/ProtectedAdminRoute';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* CUSTOMER ROUTES */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<Home />} />
          
          <Route path="product/:slug" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="about" element={<About />} />
          <Route path="news" element={<News />} />
          <Route path="support" element={<Support />} />
          <Route path="category/:slug" element={<Category />} />
          <Route path="checkout" element={<Checkout />} />

          <Route element={<Profile />}>
            <Route path="profile" />
            <Route path="orders" />
          </Route>
          {/* CATCH-ALL ROUTE DÀNH CHO CÁC URL SAI HOẶC KHÔNG TỒN TẠI */}
          <Route path="*" element={<NotFound />} />
        </Route>
        
        {/* CHUYỂN HƯỚNG CÁC ROUTE AUTH CŨ THÀNH MODAL POPUP Ở TRANG CHỦ */}
        <Route path="/login" element={<Navigate to="/" state={{ authModal: 'login' }} replace />} />
        <Route path="/register" element={<Navigate to="/" state={{ authModal: 'register' }} replace />} />
        <Route path="/forgot-password" element={<Navigate to="/" state={{ authModal: 'forgot' }} replace />} />
        
        {/* ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="users" element={<Users />} />
          <Route path="categories" element={<Categories />} />
          <Route path="inventory" element={<Inventory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}