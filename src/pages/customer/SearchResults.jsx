import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import ProductCard from '../../components/ProductCard';

const formatVND = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [pageNo, setPageNo] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Reset trang và list sản phẩm khi keyword trên URL thay đổi
  useEffect(() => {
    window.scrollTo(0, 0);
    setProducts([]);
    setPageNo(0);
  }, [keyword]);

  // Fetch dữ liệu tìm kiếm
  useEffect(() => {
    if (!keyword) return;

    const fetchSearchResults = async () => {
      if (pageNo === 0) setLoading(true);
      else setLoadingMore(true);

      try {
        const res = await api.post('/products/search', {
          categorySlug: "", // Truyền rỗng để tìm trên toàn bộ cửa hàng
          pageNo: pageNo,
          pageSize: 15,
          sortBy: "createdAt",
          sortDir: "DESC",
          keyword: keyword
        });

        if (res.data.status === 200) {
          const data = res.data.data;
          if (pageNo === 0) {
            setProducts(data.content || []);
          } else {
            setProducts(prev => [...prev, ...(data.content || [])]);
          }
          setTotalElements(data.totalElements || 0);
          setHasMore(!data.last);
        }
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchSearchResults();
  }, [keyword, pageNo]);

  return (
    <div className="flex-1 w-full bg-[#f8f9fa] pb-20 pt-8 antialiased">
      <div className="max-w-[1200px] mx-auto px-6 xl:px-0">
        
        {/* BREADCRUMB */}
        <div className="flex items-center space-x-2 text-[14px] text-gray-500 mb-6">
          <span onClick={() => navigate('/')} className="hover:text-[#2D982A] cursor-pointer transition-colors">Trang chủ</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">Tìm kiếm</span>
        </div>

        {/* KẾT QUẢ TÌM KIẾM */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 border border-gray-100 flex items-center space-x-3">
             <div className="w-12 h-12 bg-[#eef8ef] text-[#2D982A] rounded-full flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
             </div>
             <div>
                <h1 className="text-[20px] font-black text-gray-900">
                    Kết quả tìm kiếm cho: <span className="text-[#2D982A]">"{keyword}"</span>
                </h1>
                {!loading && <p className="text-gray-500 text-[14px] mt-1">Tìm thấy <strong>{totalElements}</strong> sản phẩm phù hợp</p>}
             </div>
        </div>

        {/* LƯỚI SẢN PHẨM */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {loading ? (
                 Array(10).fill(0).map((_, i) => <div key={i} className="bg-white animate-pulse h-[360px] rounded-xl border border-gray-100"></div>)
            ) : products.length > 0 ? (
                 products.map(item => <ProductCard key={item.id} item={item} showAddToCart={true} />)
            ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24 text-gray-300 mb-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                    <p className="text-[18px] text-gray-800 font-bold mb-2">Không tìm thấy sản phẩm nào!</p>
                    <p className="text-[14px] text-gray-500">Vui lòng thử lại với từ khóa khác chung chung hơn.</p>
                </div>
            )}
        </div>

        {/* NÚT XEM THÊM */}
        {!loading && products.length > 0 && hasMore && (
             <div className="flex justify-center mt-12">
                 <button 
                    onClick={() => setPageNo(prev => prev + 1)}
                    disabled={loadingMore}
                    className="px-12 py-3 rounded-full border-2 border-[#2D982A] text-[#2D982A] font-bold text-[15px] hover:bg-[#eef8ef] transition-colors flex items-center space-x-2 bg-white"
                 >
                     {loadingMore ? (
                         <>
                            <div className="w-5 h-5 border-2 border-[#2D982A] border-t-transparent rounded-full animate-spin"></div>
                            <span>Đang tải...</span>
                         </>
                     ) : (
                         <>
                            <span>Xem thêm kết quả</span>
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

export default SearchResults;