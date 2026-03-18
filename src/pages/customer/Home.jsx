import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { IMAGES } from '../../constants/images';

const BASE_URL = 'http://35.247.173.19:8080/api/v1';

const formatVND = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// --- COMPONENT THẺ SẢN PHẨM ---
const ProductCard = ({ item, formatPrice }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/product/${item.slug}`)} 
      className="bg-[#f9fafb] rounded-xl border border-gray-100 hover:border-[#2D982A] transition-all duration-300 group flex flex-col overflow-hidden shadow-sm hover:shadow-md cursor-pointer w-full"
    >
      <div className="bg-white m-2 rounded-lg h-[190px] flex items-center justify-center p-3 relative">
        <img src={item.imageUrl} alt={item.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" 
             onError={(e) => { e.target.onerror = null; e.target.src = "https://nhathuoclongchau.com.vn/estore-images/front-end/no-image.png"; }} />
      </div>
      <div className="p-3.5 flex flex-col flex-1">
        <h3 className="text-[20px] font-medium text-gray-800 line-clamp-2 min-h-[40px] mb-2 leading-snug group-hover:text-[#2D982A] transition-colors">
          {item.name}
        </h3>
        <p className="text-black font-extrabold text-[20px] mb-4">
          {formatPrice(item.price)}
        </p>
        <button className="mt-auto w-full py-2 border border-[#d1d5db] rounded-lg font-medium text-[18px] text-gray-700 bg-transparent group-hover:bg-[#2D982A] group-hover:text-white group-hover:border-[#2D982A] transition-colors duration-300">
          Xem chi tiết
        </button>
      </div>
    </div>
  );
};

// --- COMPONENT KHỐI SẢN PHẨM (ĐÃ XÓA NÚT XEM TẤT CẢ) ---
const ProductSection = ({ title, products, loading, bgColor = "", formatPrice }) => {
  let displayProducts = [...products];
  if (displayProducts.length > 0 && displayProducts.length < 5) {
    const firstItem = displayProducts[0];
    while (displayProducts.length < 5) {
      displayProducts.push({ ...firstItem, id: Math.random() }); 
    }
  }
  displayProducts = displayProducts.slice(0, 5);

  return (
    <div className={`${bgColor} p-6 rounded-2xl`}>
      <div className="flex items-center space-x-2 mb-6 ml-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-[#2D982A]"><path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248z" clipRule="evenodd" /></svg>
        <h2 className="text-xl font-black text-black uppercase">{title}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {loading ? (
          Array(5).fill(0).map((_, i) => <div key={i} className="bg-gray-200 animate-pulse h-[300px] rounded-xl"></div>)
        ) : (
          displayProducts.map((item) => <ProductCard key={item.id} item={item} formatPrice={formatPrice} />)
        )}
      </div>
      {/* Đã xóa nút Xem Tất Cả ở đây */}
    </div>
  );
};

// --- COMPONENT TAB DANH MỤC (VẪN GIỮ NÚT XEM TẤT CẢ) ---
const CategoryTabSection = ({ tabList, formatPrice, fallbackProduct, activeTextColor = "text-[#2D982A]" }) => {
  const [activeTabSlug, setActiveTabSlug] = useState(null); 
  const [products, setProducts] = useState([]);
  const [loadingTab, setLoadingTab] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (tabList && tabList.length > 0) {
      setActiveTabSlug(tabList[0].slug); 
    }
  }, [tabList]);

  useEffect(() => {
    if (!activeTabSlug) return;
    const fetchTabProducts = async () => {
      setLoadingTab(true);
      try {
        const requestBody = {
          categorySlug: activeTabSlug,
          pageNo: 0,
          pageSize: 5,
          sortBy: "createdAt",
          sortDir: "DESC",
          keyword: "" 
        };
        const res = await axios.post(`${BASE_URL}/products/search`, requestBody);
        if (res.data.status === 200) {
          setProducts(res.data.data.content || []);
        }
      } catch (error) {
        console.error("Lỗi Tab API POST:", error);
      } finally {
        setLoadingTab(false);
      }
    };
    fetchTabProducts();
  }, [activeTabSlug]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  let displayProducts = [...products];
  if (displayProducts.length === 0 && fallbackProduct) {
    for (let i = 0; i < 5; i++) {
      displayProducts.push({ ...fallbackProduct, id: Math.random() });
    }
  } else if (displayProducts.length > 0 && displayProducts.length < 5) {
    const firstItem = displayProducts[0];
    while (displayProducts.length < 5) {
      displayProducts.push({ ...firstItem, id: Math.random() }); 
    }
  }
  displayProducts = displayProducts.slice(0, 5);

  return (
    <div className="bg-white p-6 rounded-2xl w-full border border-gray-100 shadow-sm">
      <div className="flex justify-center flex-wrap gap-4 mb-8">
        {tabList.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabSlug(tab.slug)}
            className={`px-6 py-2 rounded-lg font-medium text-[20px] transition-all duration-300 border ${
              activeTabSlug === tab.slug 
                ? `bg-[#eef8ef] ${activeTextColor} border-[#2D982A] shadow-sm` 
                : `bg-transparent text-gray-800 border-transparent hover:text-[#2D982A] hover:bg-gray-50` 
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="relative">
        <button onClick={() => scroll('left')} className="absolute -left-6 top-1/2 -translate-y-1/2 z-10 bg-white border-2 border-[#2D982A] text-[#2D982A] rounded-full p-2 hover:bg-[#2D982A] hover:text-white transition shadow-md flex items-center justify-center opacity-80 hover:opacity-100"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg></button>

        <div ref={scrollRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-hidden">
          {loadingTab ? (
            Array(5).fill(0).map((_, i) => <div key={i} className="bg-gray-100 animate-pulse h-[300px] rounded-xl"></div>)
          ) : displayProducts.length > 0 ? (
            displayProducts.map((item) => <ProductCard key={item.id} item={item} formatPrice={formatPrice} />)
          ) : (
            <div className="col-span-5 flex flex-col items-center justify-center py-20"><p className="text-[15px] text-[#4a5568] font-medium mb-10">Danh mục này hiện chưa có sản phẩm.</p></div>
          )}
        </div>

        <button onClick={() => scroll('right')} className="absolute -right-6 top-1/2 -translate-y-1/2 z-10 bg-white border-2 border-[#2D982A] text-[#2D982A] rounded-full p-2 hover:bg-[#2D982A] hover:text-white transition shadow-md flex items-center justify-center opacity-80 hover:opacity-100"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></button>
      </div>

      <div className="flex justify-center mt-10">
        <button className="px-10 py-2.5 border border-[#2D982A] text-[#2D982A] rounded-full font-bold hover:bg-[#2D982A] hover:text-white transition-colors duration-300">Xem tất cả</button>
      </div>
    </div>
  );
};

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [catRes, bestRes, latestRes] = await Promise.all([
          axios.get(`${BASE_URL}/categories/tree`),
          axios.get(`${BASE_URL}/products/best-sellers?limit=10`),
          axios.get(`${BASE_URL}/products/latest?limit=10`)
        ]);

        if (catRes.data.status === 200) setCategories(catRes.data.data);
        if (bestRes.data.status === 200) setBestSellers(bestRes.data.data.content);
        if (latestRes.data.status === 200) setLatestProducts(latestRes.data.data.content);
      } catch (error) {
        console.error("Lỗi API Trang chủ:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const mockProduct = bestSellers[0] || latestProducts[0];

  const tabsGroup1 = [{ id: 1, name: 'Giảm đau, hạ sốt', slug: 'giam-dau-ha-sot' }, { id: 2, name: 'Tim mạch', slug: 'tim-mach' }, { id: 3, name: 'Hỗ trợ tiêu hóa', slug: 'ho-tro-tieu-hoa' }, { id: 4, name: 'Bổ sung Vitamin', slug: 'bo-sung-vitamin' }, { id: 5, name: 'Chăm sóc da mặt', slug: 'cham-soc-da-mat' }];
  const tabsGroup2 = [{ id: 6, name: 'Tiêu hóa', slug: 'tieu-hoa' }, { id: 7, name: 'Chăm sóc, làm đẹp', slug: 'cham-soc-lam-dep' }, { id: 8, name: 'Điều trị', slug: 'dieu-tri' }, { id: 9, name: 'Tim mạch', slug: 'tim-mach-2' }, { id: 10, name: 'Cải thiện chức năng', slug: 'cai-thien-chuc-nang' }];
  const tabsGroup3 = [{ id: 11, name: 'Chăm sóc cơ thể', slug: 'cham-soc-co-the' }, { id: 12, name: 'Chăm sóc da mặt', slug: 'cham-soc-da-mat-2' }, { id: 13, name: 'Chăm sóc tóc', slug: 'cham-soc-toc' }, { id: 14, name: 'Mỹ phẩm', slug: 'my-pham' }, { id: 15, name: 'Tình trạng da', slug: 'tinh-trang-da' }];
  const tabsGroup4 = [{ id: 16, name: 'Nhiệt kế', slug: 'nhiet-ke' }, { id: 17, name: 'Máy đo huyết áp', slug: 'may-do-huyet-ap' }, { id: 18, name: 'Máy đo đường huyết', slug: 'may-do-duong-huyet' }, { id: 19, name: 'Khẩu trang', slug: 'khau-trang' }, { id: 20, name: 'Kit test covid', slug: 'kit-test-covid' }];

  return (
    <div className="flex-1 w-full flex flex-col">
      <section className="w-full bg-[#f8f9fa] flex justify-center">
        <img src={IMAGES.BANNER_HERO} alt="Banner" className="w-full max-w-[1920px] h-auto object-contain" />
      </section>

      <main className="w-full px-6 xl:px-16 mx-auto py-10 space-y-12 mb-10">
        <ProductSection title="SẢN PHẨM BÁN CHẠY" products={bestSellers} loading={loading} bgColor="bg-[#eef8ef]" formatPrice={formatVND} />
        <ProductSection title="SẢN PHẨM MỚI NHẤT" products={latestProducts} loading={loading} bgColor="bg-white" formatPrice={formatVND} />
        <section className="w-full pb-4">
          <img src={IMAGES.SAFETY_BANNER} alt="Mua sắm an toàn" className="w-full rounded-2xl shadow-sm object-contain" />
        </section>
        <CategoryTabSection tabList={tabsGroup1} formatPrice={formatVND} fallbackProduct={mockProduct} activeTextColor="text-[#2D982A]" />

        <section className="w-full pb-4">
          <img src={IMAGES.SAFETY_BANNER} alt="Mua sắm an toàn" className="w-full rounded-2xl shadow-sm object-contain" />
        </section>

        <CategoryTabSection tabList={tabsGroup2} formatPrice={formatVND} fallbackProduct={mockProduct} activeTextColor="text-gray-900" />
        <CategoryTabSection tabList={tabsGroup3} formatPrice={formatVND} fallbackProduct={mockProduct} activeTextColor="text-gray-900" />
        <section className="w-full pb-4">
          <img src={IMAGES.SAFETY_BANNER} alt="Mua sắm an toàn" className="w-full rounded-2xl shadow-sm object-contain" />
        </section>
        <CategoryTabSection tabList={tabsGroup4} formatPrice={formatVND} fallbackProduct={mockProduct} activeTextColor="text-gray-900" />
      </main>

      {/* FLOAT CHAT ICON */}
      <div className="fixed bottom-8 right-8 z-50 cursor-pointer hover:scale-110 transition-transform">
        <div className="bg-[#2D982A] w-16 h-16 rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-8 h-8"><path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" /></svg>
        </div>
      </div>
    </div>
  );
};

export default Home;