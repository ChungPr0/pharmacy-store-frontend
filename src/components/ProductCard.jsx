import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

const formatVND = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const ProductCard = ({ 
  product, 
  item,
  showAddToCart = true,
  onAddToCart,
  className = ""
}) => {
  const navigate = useNavigate();
  // Support both 'product' and 'item' prop names for flexibility
  const productData = product || item;
  
  if (!productData) return null;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng!');
      navigate('/login');
      return;
    }

    if (onAddToCart) {
      onAddToCart(productData);
      return;
    }

    const loadToast = toast.loading('Đang thêm vào giỏ...');
    try {
      const res = await api.post('/cart/items', { 
        productId: productData.id, 
        quantity: 1 
      });
      if (res.data.status === 200 || res.status === 200) {
        toast.success('Đã thêm sản phẩm vào giỏ hàng', { id: loadToast });
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi thêm vào giỏ hàng', { id: loadToast });
    }
  };

  const handleCardClick = () => {
    const slug = productData.slug;
    if (slug) {
      navigate(`/product/${slug}`);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`bg-[#f5f5f5] rounded-xl border border-gray-300 hover:border-[#2D982A] transition-all duration-300 group/card flex flex-col overflow-hidden shadow-sm hover:shadow-lg cursor-pointer w-full h-full ${className}`}
    >
      {/* Image Container */}
      <div className="bg-white m-2 rounded-lg h-[240px] md:h-[260px] flex items-center justify-center p-4 relative shadow-xs hover:shadow-sm transition-shadow">
        <img 
          src={productData.imageUrl}
          alt={productData.name}
          className="max-h-full max-w-full object-contain group-hover/card:scale-110 transition-transform duration-300" 
          onError={(e) => { 
            e.target.onerror = null; 
            e.target.src = "https://nhathuoclongchau.com.vn/estore-images/front-end/no-image.png"; 
          }}
        />
      </div>

      {/* Content Container */}
      <div className="p-3 flex flex-col flex-1">
        {/* Product Name */}
        <h3 className="text-[14px] md:text-[15px] font-bold text-gray-800 line-clamp-2 min-h-[42px] mb-2.5 leading-snug transition-colors duration-200">
          {productData.name}
        </h3>

        {/* Tags (Optional - if provided) */}
        {productData.tags && productData.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {productData.tags.slice(0, 2).map((tag, idx) => (
              <span 
                key={idx}
                className="bg-[#f0f8ff] text-[#0068ff] text-[10px] md:text-[11px] font-medium px-2 py-1 rounded whitespace-nowrap"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <p className="text-black font-bold text-[16px] md:text-[17px] mb-3.5 text-nowrap">
          {formatVND(productData.price)}
        </p>

        {/* Action Button */}
        {showAddToCart ? (
          <button 
            onClick={handleAddToCart}
            className="mt-auto w-full py-2 md:py-2.5 border border-gray-300 rounded-lg font-bold text-[12px] md:text-[13px] text-gray-700 bg-white hover:bg-[#2D982A] hover:text-white hover:border-[#2D982A] transition-colors duration-300 uppercase tracking-wide shadow-xs"
          >
            Thêm vào giỏ
          </button>
        ) : (
          <button className="mt-auto w-full py-2 md:py-2.5 border border-[#d1d5db] rounded-lg font-bold text-[12px] md:text-[13px] text-gray-700 bg-transparent group-hover/card:bg-[#2D982A] group-hover/card:text-white group-hover/card:border-[#2D982A] transition-colors duration-300 uppercase tracking-wide">
            Xem chi tiết
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;