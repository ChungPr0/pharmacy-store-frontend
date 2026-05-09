import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import { IMAGES } from '../../constants/images';
import ProductCard from '../../components/ProductCard';

const Category = () => {
  const { slug } = useParams(); // Lấy slug danh mục cha từ URL (VD: /category/thuoc)
  const navigate = useNavigate();

  const [mainCategory, setMainCategory] = useState(null);
  const [activeSlug, setActiveSlug] = useState(''); // Lưu slug đang được chọn (cha hoặc con)
  
  const [products, setProducts] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [pageNo, setPageNo] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // 1. Khi URL slug thay đổi: Lấy thông tin danh mục & Reset state
  useEffect(() => {
    if (!slug) {
        navigate('/');
        return;
    }
    window.scrollTo(0, 0);
    setActiveSlug(slug);
    setPageNo(0);
    setProducts([]);
    setMainCategory(null);

    const fetchCategoryDetails = async () => {
      setLoadingCategory(true);
      try {
        const res = await api.get(`/categories/${slug}`);
        if (res.data.status === 200) {
          setMainCategory(res.data.data);
        } else {
            toast.error("Không tìm thấy danh mục!");
            navigate('/');
        }
      } catch (error) {
        console.error("Lỗi lấy chi tiết danh mục:", error);
        toast.error("Lỗi lấy thông tin danh mục");
      } finally {
        setLoadingCategory(false);
      }
    };
    fetchCategoryDetails();
  }, [slug, navigate]);

  // 2. Khi activeSlug hoặc pageNo thay đổi: Fetch danh sách sản phẩm
  useEffect(() => {
    if (!activeSlug) return;

    const fetchProducts = async () => {
      if (pageNo === 0) setLoadingProducts(true);
      else setLoadingMore(true);

      try {
        const res = await api.post('/products/search', {
          categorySlug: activeSlug,
          pageNo: pageNo,
          pageSize: 15,
          sortBy: "createdAt",
          sortDir: "DESC",
          keyword: ""
        });

        if (res.data.status === 200) {
          const data = res.data.data;
          if (pageNo === 0) {
            setProducts(data.content || []);
          } else {
            setProducts(prev => [...prev, ...(data.content || [])]);
          }
          setTotalElements(data.totalElements || 0);
          setHasMore(!data.last); // Nếu last = true nghĩa là đã hết trang
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách sản phẩm:", error);
      } finally {
        setLoadingProducts(false);
        setLoadingMore(false);
      }
    };

    fetchProducts();
  }, [activeSlug, pageNo]);

  // Handle khi click vào Sub-category
  const handleSubCategoryClick = (subSlug) => {
      if (activeSlug === subSlug) return;
      setActiveSlug(subSlug);
      setPageNo(0); // Reset về trang 1
      setProducts([]); // Clear list hiện tại
  };

  return (
    <div className="flex-1 w-full bg-white pb-20 antialiased">
      <div className="max-w-[1200px] mx-auto px-6 xl:px-0 pt-6">
        
        {/* BREADCRUMB */}
        <div className="flex items-center space-x-2 text-[14px] text-gray-500 mb-6">
          <span onClick={() => navigate('/')} className="hover:text-[#2D982A] cursor-pointer transition-colors">Trang chủ</span>
          <span>/</span>
          {loadingCategory ? (
              <span className="w-20 h-4 bg-gray-200 animate-pulse rounded"></span>
          ) : (
              <span className="text-gray-900 font-medium">{mainCategory?.name}</span>
          )}
        </div>

        {/* BANNER */}
        <section className="w-full mb-8">
          <img src={IMAGES.SAFETY_BANNER} alt="Banner Danh mục" className="w-full rounded-2xl shadow-sm object-cover h-[120px] md:h-auto" />
        </section>

        {/* DANH SÁCH DANH MỤC CON (SUB-CATEGORIES) */}
        {!loadingCategory && mainCategory?.children && mainCategory.children.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-4 mb-12">
                {/* Nút "Tất cả" hiển thị toàn bộ sản phẩm của Danh mục cha */}
                <div 
                    onClick={() => handleSubCategoryClick(mainCategory.slug)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all duration-300 min-h-[110px] shadow-sm ${activeSlug === mainCategory.slug ? 'border-[#2D982A] bg-[#eef8ef]' : 'border-gray-200 hover:border-[#2D982A] bg-white'}`}
                >
                    <div className="w-10 h-10 mb-2 flex items-center justify-center bg-white rounded-full shadow-inner p-2">
                         {/* Icon thuốc chung */}
                        <svg viewBox="0 0 24 24" fill={activeSlug === mainCategory.slug ? '#2D982A' : '#9ca3af'} className="w-full h-full"><path d="M4.5 10.5h15a1.5 1.5 0 000-3h-15a1.5 1.5 0 000 3zM2.25 15a1.5 1.5 0 001.5 1.5h16.5a1.5 1.5 0 001.5-1.5v-1.5H2.25V15zM8.25 19.5h7.5a1.5 1.5 0 001.5-1.5v-1.5H6.75v1.5a1.5 1.5 0 001.5 1.5zM6.75 6v-.75c0-.828.672-1.5 1.5-1.5h7.5c.828 0 1.5.672 1.5 1.5V6h1.5v-.75A3 3 0 0015.75 2.25h-7.5A3 3 0 005.25 5.25V6h1.5z" /></svg>
                    </div>
                    <span className={`text-[12px] font-bold text-center line-clamp-2 ${activeSlug === mainCategory.slug ? 'text-[#2D982A]' : 'text-gray-700'}`}>Tất cả</span>
                </div>

                {/* Các danh mục con */}
                {mainCategory.children.map(child => (
                    <div 
                        key={child.id}
                        onClick={() => handleSubCategoryClick(child.slug)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all duration-300 min-h-[110px] shadow-sm ${activeSlug === child.slug ? 'border-[#2D982A] bg-[#eef8ef]' : 'border-gray-200 hover:border-[#2D982A] bg-white'}`}
                    >
                        <div className="w-10 h-10 mb-2 flex items-center justify-center bg-white rounded-full shadow-inner p-2">
                            {/* Icon lọ thuốc */}
                            <svg viewBox="0 0 24 24" fill={activeSlug === child.slug ? '#2D982A' : '#9ca3af'} className="w-full h-full"><path d="M16 4h-2V2h-4v2H8C6.9 4 6 4.9 6 6v14c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-1 8h-2v2h-2v-2H9v-2h2V8h2v2h2v2z"/></svg>
                        </div>
                        <span className={`text-[12px] font-bold text-center line-clamp-2 leading-snug ${activeSlug === child.slug ? 'text-[#2D982A]' : 'text-gray-700'}`}>{child.name}</span>
                    </div>
                ))}
            </div>
        )}

        {/* TIÊU ĐỀ SỐ LƯỢNG */}
        {!loadingCategory && (
            <h2 className="text-[24px] font-black text-black mb-8 border-l-4 border-[#2D982A] pl-3">
                {totalElements} sản phẩm
            </h2>
        )}

        {/* LƯỚI SẢN PHẨM */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {loadingProducts ? (
                 Array(10).fill(0).map((_, i) => <div key={i} className="bg-gray-100 animate-pulse h-[320px] rounded-xl border border-gray-200"></div>)
            ) : products.length > 0 ? (
                 products.map(item => <ProductCard key={item.id} item={item} />)
            ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-20 h-20 text-gray-300 mb-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                    <p className="text-[16px] text-gray-500 font-medium">Không tìm thấy sản phẩm nào trong danh mục này.</p>
                </div>
            )}
        </div>

        {/* NÚT XEM THÊM */}
        {!loadingProducts && products.length > 0 && hasMore && (
             <div className="flex justify-center mt-12">
                 <button 
                    onClick={() => setPageNo(prev => prev + 1)}
                    disabled={loadingMore}
                    className="px-12 py-3 rounded-full border-2 border-[#2D982A] text-[#2D982A] font-bold text-[15px] hover:bg-[#eef8ef] transition-colors flex items-center space-x-2"
                 >
                     {loadingMore ? (
                         <>
                            <div className="w-5 h-5 border-2 border-[#2D982A] border-t-transparent rounded-full animate-spin"></div>
                            <span>Đang tải...</span>
                         </>
                     ) : (
                         <>
                            <span>Xem thêm</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clipRule="evenodd" /></svg>
                         </>
                     )}
                 </button>
             </div>
        )}

      </div>
    </div>
  );
};

export default Category;