import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CustomerLayout from '../layouts/CustomerLayout';
import Home from '../pages/customer/Home';
import Register from '../pages/customer/Register';
import ProductDetail from '../pages/customer/ProductDetail'; 
import About from '../pages/customer/About';
import News from '../pages/customer/News';
import Support from '../pages/customer/Support';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<Home />} />
          <Route path="register" element={<Register />} />
          
          <Route path="product/:slug" element={<ProductDetail />} />
          <Route path="about" element={<About />} />
          <Route path="news" element={<News />} />
          <Route path="support" element={<Support />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}