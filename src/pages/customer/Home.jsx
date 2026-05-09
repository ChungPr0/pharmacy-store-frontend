import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { IMAGES } from '../../constants/images';
import ProductCard from '../../components/ProductCard';

const BASE_URL = 'https://api.tienchung.online/api/v1';

const formatVND = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// --- COMPONENT KHỐI SẢN PHẨM ---
const ProductSection = ({ title, products, loading, bgColor = "", formatPrice }) => {
  const displayProducts = products.slice(0, 5);

  return (
    <div className={`${bgColor} p-6 rounded-2xl shadow-sm border border-gray-50`}>
      <div className="flex items-center space-x-2 mb-6 ml-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-[#2D982A]"><path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248z" clipRule="evenodd" /></svg>
        <h2 className="text-xl font-black text-black uppercase tracking-wide">{title}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {loading ? (
          Array(5).fill(0).map((_, i) => <div key={i} className="bg-gray-200 animate-pulse h-[300px] rounded-xl"></div>)
        ) : displayProducts.length > 0 ? (
          displayProducts.map((item) => <ProductCard key={item.id} item={item} showAddToCart={false} />)
        ) : (
          <div className="col-span-5 flex items-center justify-center py-10 text-gray-500 italic">Chưa có sản phẩm nào</div>
        )}
      </div>
    </div>
  );
};

// --- COMPONENT TAB DANH MỤC ---
const CategoryTabSection = ({ tabList, formatPrice, activeTextColor = "text-[#2D982A]" }) => {
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
          pageSize: 10,
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

  if (!tabList || tabList.length === 0) return null;

  return (
    <div className="bg-white p-8 rounded-2xl w-full border border-gray-100 shadow-sm">
      <div className="flex justify-center flex-wrap gap-3 mb-8">
        {tabList.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabSlug(tab.slug)}
            className={`px-6 py-2 rounded-full font-bold text-[15px] transition-all duration-300 border ${
              activeTabSlug === tab.slug 
                ? `bg-[#eef8ef] ${activeTextColor} border-[#2D982A] shadow-sm` 
                : `bg-transparent text-gray-600 border-gray-200 hover:text-[#2D982A] hover:border-[#2D982A] hover:bg-gray-50` 
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="relative group">
        <button onClick={() => scroll('left')} className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 text-[#2D982A] rounded-full p-2.5  transition shadow-lg items-center justify-center opacity-0  hidden md:flex">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>

        <div ref={scrollRef} className="flex overflow-x-auto gap-5 px-1 py-2 scrollbar-hide snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {loadingTab ? (
            Array(5).fill(0).map((_, i) => <div key={i} className="min-w-[200px] flex-1 bg-gray-100 animate-pulse h-[300px] rounded-xl"></div>)
          ) : products.length > 0 ? (
            products.map((item) => (
              <div key={item.id} className="min-w-[200px] md:min-w-[calc(20%-16px)] snap-start">
                <ProductCard item={item} showAddToCart={false} />
              </div>
            ))
          ) : (
            <div className="w-full flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-[15px] text-gray-500 font-medium">Danh mục này hiện chưa có sản phẩm.</p>
            </div>
          )}
        </div>

        <button onClick={() => scroll('right')} className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 text-[#2D982A] rounded-full p-2.5 hover:bg-[#2D982A] hover:text-white transition shadow-lg items-center justify-center opacity-0 group-hover:opacity-100 hidden md:flex">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
        </button>
      </div>

      <div className="flex justify-center mt-10">
        <button className="px-10 py-3 bg-white border border-[#2D982A] text-[#2D982A] rounded-full font-bold uppercase text-[14px] hover:bg-[#2D982A] hover:text-white transition-colors duration-300 tracking-wide shadow-sm">
          Xem tất cả
        </button>
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
        if (bestRes.data.status === 200) setBestSellers(bestRes.data.data.content || []);
        if (latestRes.data.status === 200) setLatestProducts(latestRes.data.data.content || []);
      } catch (error) {
        console.error("Lỗi API Trang chủ:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div className="flex-1 w-full flex flex-col">
      <section className="w-full bg-white flex justify-center border-b border-gray-100">
        <img src={IMAGES.BANNER_HERO} alt="Banner" className="w-full max-w-[1920px] h-auto" />
      </section>

      <main className="w-full px-6 xl:px-16 mx-auto py-10 space-y-12 mb-10">
        <ProductSection title="SẢN PHẨM BÁN CHẠY" products={bestSellers} loading={loading} bgColor="bg-white" formatPrice={formatVND} />
        <ProductSection title="SẢN PHẨM MỚI NHẤT" products={latestProducts} loading={loading} bgColor="bg-[#eef8ef]" formatPrice={formatVND} />
        
        <section className="w-full py-2">
          <img src={IMAGES.SAFETY_BANNER} alt="Mua sắm an toàn" className="w-full rounded-2xl shadow-sm object-cover h-[120px] md:h-auto" />
        </section>
        
        {/* RENDER ĐỘNG DANH MỤC (API DRIVEN) */}
        {!loading && categories.map((parentCategory, index) => {
           // Lấy danh sách danh mục con làm Tab. Nếu không có con, lấy chính nó làm 1 tab duy nhất.
           const tabList = parentCategory.children && parentCategory.children.length > 0 
              ? parentCategory.children 
              : [parentCategory];

           return (
             <React.Fragment key={parentCategory.id}>
                <CategoryTabSection 
                  tabList={tabList} 
                  formatPrice={formatVND} 
                  activeTextColor="text-[#2D982A]" 
                />

                {/* Xen kẽ Banner cứ sau mỗi khối ) */}
                {index < categories.length - 1 && (
                  <section className="w-full py-2">
                    <img src={IMAGES.SAFETY_BANNER} alt="Mua sắm an toàn" className="w-full rounded-2xl shadow-sm object-cover h-[120px] md:h-auto" />
                  </section>
                )}
             </React.Fragment>
           );
        })}

      </main>

      {/* FLOAT CHAT ICON */}
      <div className="fixed bottom-8 right-8 z-50 cursor-pointer hover:scale-110 transition-transform">
        <div className="bg-[#2D982A] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6"><path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" /></svg>
        </div>
      </div>
      
      {/* Ẩn thanh scroll */}
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}} />
    </div>
  );
};

export default Home;