import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

import AdminLayout from '../layouts/AdminLayout';
import Dashboard from '../pages/admin/Dashboard';
import Products from '../pages/admin/Products';
import Orders from '../pages/admin/Orders';
import Users from '../pages/admin/Users';
import Categories from '../pages/admin/Categories';

import ProtectedAdminRoute from '../components/ProtectedAdminRoute';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* CUSTOMER ROUTES */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<Home />} />
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="product/:slug" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="about" element={<About />} />
          <Route path="news" element={<News />} />
          <Route path="support" element={<Support />} />
          <Route path="category/:slug" element={<Category />} />
        </Route>

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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}