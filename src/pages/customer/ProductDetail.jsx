import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom'; 
import api from '../../api/axios'; 
import { useCart } from '../../contexts/CartContext';

const formatVND = (price) => {
  if (!price) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// Thêm SVG cho ngôi sao
const StarIcon = ({ filled, onClick, className = "w-5 h-5 cursor-pointer transition-colors" }) => (
  <svg 
    onClick={onClick}
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill={filled ? "#f59e0b" : "none"} 
    stroke={filled ? "#f59e0b" : "currentColor"} 
    strokeWidth={1.5}
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);

// --- COMPONENT THẺ SẢN PHẨM KHÁC ---
const ProductCard = ({ item }) => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(`/product/${item.slug}`)} 
      className="bg-[#f5f5f5] rounded-2xl border border-gray-200 hover:border-[#2D982A] transition-all duration-300 flex flex-col cursor-pointer w-full p-3"
    >
      <div className="bg-white rounded-xl h-[180px] flex items-center justify-center p-3 mb-4 shadow-sm relative">
        <img src={item.imageUrl} alt={item.name} className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
             onError={(e) => { e.target.onerror = null; e.target.src = "https://nhathuoclongchau.com.vn/estore-images/front-end/no-image.png"; }} />
      </div>
      <div className="flex flex-col flex-1 px-1">
        <h3 className="text-[13px] text-gray-800 line-clamp-2 min-h-[38px] mb-2 leading-snug font-medium">
          {item.name}
        </h3>
        <p className="text-black font-extrabold text-[15px] mb-4">
          {formatVND(item.price)}
        </p>
        <button className="mt-auto w-full py-2 border border-gray-300 rounded-lg font-medium text-[13px] text-gray-700 bg-transparent hover:bg-gray-200 hover:text-black transition-colors duration-300">
          Xem chi tiết
        </button>
      </div>
    </div>
  );
};

const ProductDetail = () => {
  const { slug } = useParams(); 
  const navigate = useNavigate();
  const { fetchCart, openAuthModal, user } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // --- REVIEW STATE ---
  const [reviews, setReviews] = useState([]);
  const [reviewPageNo, setReviewPageNo] = useState(0);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);
  const [reviewTotalElements, setReviewTotalElements] = useState(0);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (!slug) {
      navigate('/');
      return;
    }

    const fetchProductData = async () => {
      setLoading(true);
      window.scrollTo(0, 0); 
      setQuantity(1); 
      setIsExpanded(false); 

      try {
        const detailRes = await api.get(`/products/${slug}`);
        
        if (detailRes.data.status === 200) {
          const productData = detailRes.data.data;
          setProduct(productData);
          
          if (productData.images && productData.images.length > 0) {
            setSelectedImage(productData.images[0]);
          } else {
            setSelectedImage("https://nhathuoclongchau.com.vn/estore-images/front-end/no-image.png");
          }

          // Gọi API Sản phẩm liên quan (Sử dụng API mới theo chuẩn Contract)
          try {
            const relatedRes = await api.get(`/products/${slug}/related?limit=5`);
            if (relatedRes.data.status === 200) {
              setRelatedProducts(relatedRes.data.data || []);
            }
          } catch (relError) {
             console.error("Không lấy được sp liên quan", relError);
          }

          // Lấy reviews ban đầu
          if (productData && productData.id) {
             fetchReviews(productData.id, 0);
          }

        }
      } catch (error) {
        console.error("Lỗi tải chi tiết:", error);
        navigate('/not-found', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [slug, navigate]);

  const changeQuantity = (type) => {
    if (!product) return;
    if (type === 'minus') {
      setQuantity(prev => prev > 1 ? prev - 1 : 1);
    } else {
      setQuantity(prev => prev < product.totalStockQuantity ? prev + 1 : product.totalStockQuantity);
    }
  };

  const fetchReviews = async (productId, page = 0) => {
    try {
      const res = await api.get(`/products/${productId}/reviews?pageNo=${page}&pageSize=5`);
      if (res.data.status === 200) {
        const data = res.data.data;
        if (page === 0) {
          setReviews(data.content);
        } else {
          setReviews(prev => [...prev, ...data.content]);
        }
        setReviewPageNo(data.pageNo);
        setReviewTotalPages(data.totalPages);
        setReviewTotalElements(data.totalElements);
      }
    } catch (error) {
      console.error("Lỗi khi tải đánh giá:", error);
    }
  };

  const handleLoadMoreReviews = () => {
    if (reviewPageNo + 1 < reviewTotalPages && product) {
      fetchReviews(product.id, reviewPageNo + 1);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Vui lòng đăng nhập để đánh giá sản phẩm!');
      openAuthModal('login');
      return;
    }
    if (!newReviewComment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá!');
      return;
    }
    setIsSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        productId: product.id,
        rating: newReviewRating,
        comment: newReviewComment.trim()
      });
      if (res.data.status === 201 || res.status === 201) {
        toast.success('Đã gửi đánh giá thành công!');
        setNewReviewComment('');
        setNewReviewRating(5);
        // Tải lại reviews
        fetchReviews(product.id, 0);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi gửi đánh giá!');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // =========================================================================
  // API GỌI THÊM GIỎ HÀNG THẬT
  // =========================================================================
  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng!');
      openAuthModal('login');
      return;
    }

    if (!product || !product.id) {
      toast.error('Dữ liệu sản phẩm bị lỗi!');
      return;
    }

    const loadToast = toast.loading('Đang thêm vào giỏ hàng...');
    try {
      const res = await api.post('/cart/items', {
        productId: product.id, 
        quantity: quantity
      });

      if (res.data.status === 200 || res.status === 200) {
        toast.success('Đã thêm sản phẩm vào giỏ hàng!', { id: loadToast });
        window.dispatchEvent(new Event('cartUpdated'));
        setTimeout(() => fetchCart(), 200);
      } else {
        toast.error(res.data.message || 'Lỗi thêm vào giỏ hàng!', { id: loadToast });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi kết nối khi thêm vào giỏ!', { id: loadToast });
    }
  };

  // =========================================================================
  // API GỌI MUA NGAY (THÊM GIỎ + CHUYỂN TRANG)
  // =========================================================================
  const handleBuyNow = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Vui lòng đăng nhập để mua hàng!');
      openAuthModal('login');
      return;
    }

    const loadToast = toast.loading('Đang xử lý...');
    try {
      await api.post('/cart/items', {
        productId: product.id,
        quantity: quantity
      });
      toast.success('Đã đưa vào giỏ, chuyển sang thanh toán...', { id: loadToast });
      window.dispatchEvent(new Event('cartUpdated'));
      navigate('/cart');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi xử lý đơn hàng!', { id: loadToast });
    }
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center bg-white py-20"><div className="w-10 h-10 border-4 border-[#2D982A] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!product) return null;

  const isOutOfStock = product.totalStockQuantity <= 0;

  return (
    <main className="flex-1 w-full bg-white pb-16">
      <div className="max-w-[1200px] mx-auto px-6 xl:px-0 py-6">
        
        {/* BREADCRUMB */}
        <div className="flex items-center space-x-2 text-[14px] text-gray-600 mb-8">
          <span onClick={() => navigate('/')} className="hover:text-[#2D982A] cursor-pointer">Trang chủ</span>
          <span>/</span>
          <span className="hover:text-[#2D982A] cursor-pointer">{product.categoryName}</span>
          <span>/</span>
          <span className="text-gray-900 truncate">{product.name}</span>
        </div>

        {/* NỘI DUNG CHÍNH */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          <div className="md:col-span-5 flex flex-col">
            <div className="w-full flex items-center justify-center h-[400px] mb-6 border border-gray-100 rounded-xl p-4 shadow-sm">
              <img src={selectedImage} alt={product.name} className="max-h-full max-w-full object-contain" 
                   onError={(e) => { e.target.onerror = null; e.target.src = "https://nhathuoclongchau.com.vn/estore-images/front-end/no-image.png"; }}/>
            </div>
            
            {product.images && product.images.length > 0 && (
              <div className="flex gap-4 overflow-x-auto justify-center">
                {product.images.map((img, index) => (
                  <div key={index} 
                       onClick={() => setSelectedImage(img)}
                       className={`w-20 h-20 p-1 flex items-center justify-center cursor-pointer transition-all border ${selectedImage === img ? 'border-[#2D982A]' : 'border-gray-200 hover:border-gray-300'} rounded-lg shadow-inner bg-gray-50`}>
                    <img src={img} alt={`Thumb ${index}`} className="max-h-full max-w-full object-contain" 
                         onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}/>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-7 flex flex-col pt-4">
            
            <h1 className="text-[26px] font-bold text-gray-900 leading-snug mb-6">
              {product.name}
            </h1>

            <p className="text-[32px] font-bold text-[#2D982A] mb-8">
              {formatVND(product.price)}
            </p>

            <ul className="list-disc pl-5 space-y-3 text-[15px] text-gray-800 mb-10 antialiased leading-relaxed">
              {product.attributes && product.attributes.length > 0 ? (
                product.attributes.map((attr, idx) => (
                  <li key={idx}><span className="font-medium text-black">{attr.name}:</span> {attr.value}</li>
                ))
              ) : (
                <li>Chưa có thông tin thuộc tính</li>
              )}
            </ul>

            <div className="flex items-center space-x-6 mb-8 py-6 border-y border-gray-100">
                <p className="text-gray-900 font-bold text-[15px]">Chọn số lượng:</p>
                <div className={`flex items-center border border-gray-300 rounded overflow-hidden h-10 w-[140px] shadow-inner ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
                    <button onClick={() => changeQuantity('minus')} className="w-11 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer font-bold text-lg">-</button>
                    <span className="flex-1 h-full flex items-center justify-center font-bold text-[16px] text-black bg-white border-x border-gray-300 shadow-inner">{quantity}</span>
                    <button onClick={() => changeQuantity('plus')} className="w-11 h-full flex items-center justify-center text-[#2D982A] hover:bg-green-50 cursor-pointer font-bold text-lg">+</button>
                </div>
                {isOutOfStock && <p className="text-red-600 text-[14px] font-bold">Tạm hết hàng</p>}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-[450px]">
                <button 
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                  className={`flex-1 py-3.5 rounded-lg text-[14px] font-bold uppercase transition-colors shadow-md ${isOutOfStock ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed' : 'bg-[#eef8ef] text-[#2D982A] border-2 border-[#2D982A] hover:bg-green-100'}`}>
                  {isOutOfStock ? "Tạm hết hàng" : "Chọn mua"}
                </button>
                <button 
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className={`flex-1 py-3.5 rounded-lg text-[14px] font-bold uppercase transition-colors shadow-md ${isOutOfStock ? 'bg-gray-300 text-white cursor-not-allowed' : 'bg-[#2D982A] text-white border-2 border-[#2D982A] hover:bg-green-700'}`}>
                  Thêm vào giỏ hàng
                </button>
            </div>
          </div>
        </div>

        <div className="w-full h-[1px] bg-gray-200 mb-12"></div>

        {/* THÔNG TIN CHI TIẾT */}
        <div className="mb-16 w-full md:max-w-[900px]">
            <div className="bg-white border border-gray-100 shadow-md rounded-2xl p-10 relative">
              <h2 className="text-[26px] font-black text-black uppercase mb-10 tracking-wide">Mô tả sản phẩm</h2>

              <div 
                className={`text-[15px] text-gray-900 leading-relaxed transition-all duration-500 
                  [&>img]:mx-auto [&>img]:my-8 [&>img]:rounded-xl [&>img]:max-w-full [&>img]:shadow-lg 
                  [&>h3]:text-[19px] [&>h3]:font-black [&>h3]:mb-4 [&>h3]:mt-10 [&>h3]:text-black [&>h3]:uppercase [&>h3]:tracking-wide 
                  [&>p]:mb-5 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-5 [&>ul]:space-y-2
                  ${!isExpanded ? 'max-h-[600px] overflow-hidden' : ''}
                `}
                dangerouslySetInnerHTML={{ __html: product.description || "<p>Đang cập nhật thông tin mô tả chi tiết.</p>" }}
              />

              {/* ĐÃ XÓA BỎ LỚP SƯƠNG MÙ TRẮNG CHE CHỮ Ở ĐÂY */}

              <div className="flex justify-center mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center space-x-2 px-8 py-2.5 border border-[#2D982A] text-[#2D982A] rounded-full hover:bg-green-50 transition-colors text-[14px] font-bold shadow-sm"
                >
                  <span>{isExpanded ? 'Thu gọn' : 'Xem thêm'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              </div>
            </div>
        </div>

        {/* BÌNH LUẬN VÀ ĐÁNH GIÁ */}
        <div className="mb-16 w-full max-w-[950px]">
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-[26px] font-black text-black uppercase tracking-wide">ĐÁNH GIÁ SẢN PHẨM</h2>
                  <span className="text-gray-500 font-medium">{reviewTotalElements} đánh giá</span>
                </div>
                
                {user?.role?.toUpperCase() !== 'ADMIN' && (
                  <form onSubmit={handleSubmitReview} className="flex flex-col mb-12 bg-gray-50 p-6 rounded-xl border border-gray-100">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Gửi đánh giá của bạn</h3>
                      <div className="flex items-center gap-3 mb-4">
                          <span className="text-[15px] font-medium text-gray-700">Chất lượng:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIcon 
                                key={star} 
                                filled={star <= newReviewRating} 
                                onClick={() => setNewReviewRating(star)} 
                                className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform" 
                              />
                            ))}
                          </div>
                      </div>
                      
                      <textarea 
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        placeholder="Nhập trải nghiệm của bạn về sản phẩm này..." 
                        className="w-full border border-gray-300 rounded-lg p-4 text-[15px] min-h-[120px] outline-none focus:border-[#2D982A] focus:ring-1 focus:ring-[#2D982A] resize-y text-gray-800 placeholder-gray-400"
                      ></textarea>
                      
                      <div className="flex justify-end mt-4">
                          <button 
                            type="submit" 
                            disabled={isSubmittingReview}
                            className="bg-[#2D982A] text-white font-bold text-[15px] px-8 py-2.5 rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                          >
                            {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                          </button>
                      </div>
                  </form>
                )}

                <div className="space-y-6">
                    {reviews.length === 0 ? (
                      <div className="text-center py-10 text-gray-500">
                        Chưa có đánh giá nào cho sản phẩm này. Trở thành người đầu tiên đánh giá!
                      </div>
                    ) : (
                      reviews.map(review => (
                          <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 mb-2">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="text-[16px] font-bold text-gray-900 flex items-center gap-2">
                                    {review.userFullName}
                                    <span className="text-[12px] font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Đã mua hàng</span>
                                  </h4>
                                  <div className="flex gap-0.5 mt-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <StarIcon key={star} filled={star <= review.rating} className="w-4 h-4" />
                                    ))}
                                  </div>
                                </div>
                                <span className="text-[13px] text-gray-400">
                                  {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                              
                              <p className="text-[15px] text-gray-700 leading-relaxed whitespace-pre-line mb-4">
                                {review.comment}
                              </p>
                              
                              {review.adminReply && (
                                  <div className="border-l-4 border-[#2D982A] pl-4 py-1 ml-4 mt-2">
                                      <h5 className="text-[14px] font-bold text-[#2D982A] mb-1">Phản hồi từ Nhà thuốc:</h5>
                                      <p className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-3 rounded-lg">
                                        {review.adminReply}
                                      </p>
                                  </div>
                              )}
                          </div>
                      ))
                    )}
                </div>
                
                {reviewPageNo + 1 < reviewTotalPages && (
                  <div className="flex justify-center mt-8">
                    <button 
                      onClick={handleLoadMoreReviews}
                      className="px-6 py-2 border border-[#2D982A] text-[#2D982A] font-medium text-[14px] rounded-full hover:bg-green-50 transition-colors"
                    >
                      Xem thêm đánh giá
                    </button>
                  </div>
                )}
            </div>
        </div>

        {/* SẢN PHẨM KHÁC */}
        {relatedProducts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-[26px] font-black text-black uppercase mb-10 tracking-wide">SẢN PHẨM KHÁC</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {relatedProducts.map(item => <ProductCard key={item.id} item={item} />)}
            </div>
          </section>
        )}

      </div>
    </main>
  );
};

export default ProductDetail;