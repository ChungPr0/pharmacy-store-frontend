import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import { useCart } from '../../contexts/CartContext';
import ProductCard from '../../components/ProductCard';

const formatVND = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const Cart = () => {
  const navigate = useNavigate();
  const { fetchCart } = useCart();
  const [cartData, setCartData] = useState({ items: [], totalItems: 0, totalPrice: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  
  // STATE MỚI: Lưu ID của sản phẩm đang chuẩn bị xóa để hiện Modal
  const [itemToDelete, setItemToDelete] = useState(null);

  const selectedTotalPrice = cartData.items
    ?.filter(item => selectedItems.includes(item.productId))
    .reduce((sum, item) => sum + item.itemTotal, 0) || 0;

  const isAllSelected = cartData.items?.length > 0 && selectedItems.length === cartData.items.length;

  const fetchCartData = async () => {
    try {
      const res = await api.get('/cart');
      if (res.data.status === 200) {
        const data = res.data.data;
        setCartData(data || { items: [], totalItems: 0, totalPrice: 0 });
        
        if (data && data.items) {
            setSelectedItems(data.items.map(item => item.productId));
        }
      }
    } catch (error) {
      setCartData({ items: [], totalItems: 0, totalPrice: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedProducts = async () => {
    try {
      const res = await api.post('/products/search', { categorySlug: "", pageNo: 0, pageSize: 5, sortBy: "createdAt", sortDir: "DESC", keyword: "" });
      if (res.data.status === 200) {
        setSuggestedProducts(res.data.data.content || []);
      }
    } catch (error) {
      console.error("Lỗi lấy sản phẩm gợi ý:", error);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCartData();
    fetchSuggestedProducts();
    // Also update context cart
    fetchCart();

    window.addEventListener('cartUpdated', fetchCartData);
    return () => window.removeEventListener('cartUpdated', fetchCartData);
  }, []);

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartData.items.map(item => item.productId));
    }
  };

  const handleToggleSelect = (productId) => {
    if (selectedItems.includes(productId)) {
      setSelectedItems(selectedItems.filter(id => id !== productId));
    } else {
      setSelectedItems([...selectedItems, productId]);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    // Nếu số lượng <= 0, bật Modal xác nhận xóa
    if (newQuantity <= 0) {
      return setItemToDelete(productId);
    }
    
    setCartData(prev => {
        const newItems = prev.items.map(item => 
            item.productId === productId 
            ? { ...item, quantity: newQuantity, itemTotal: item.price * newQuantity } 
            : item
        );
        return { ...prev, items: newItems };
    });

    try {
      await api.put('/cart/items', { productId, quantity: newQuantity });
      fetchCartData();
      fetchCart();
    } catch (error) {
      toast.error('Cập nhật số lượng thất bại');
      fetchCartData(); 
    }
  };

  // HÀM XÓA CHÍNH THỨC (Được gọi khi bấm "Đồng ý" trong Modal)
  const handleDeleteItem = async (productId) => {
    setItemToDelete(null); // Tắt Modal
    const loadToast = toast.loading('Đang xóa sản phẩm...');
    try {
      await api.delete(`/cart/items/${productId}`);
      toast.success('Đã xóa sản phẩm khỏi giỏ', { id: loadToast });
      setSelectedItems(selectedItems.filter(id => id !== productId));
      fetchCartData();
      fetchCart();
      window.dispatchEvent(new Event('cartUpdated')); // Báo cho Header cập nhật số lượng
    } catch (error) {
      toast.error('Xóa sản phẩm thất bại', { id: loadToast });
    }
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-[#2D982A] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const isEmpty = !cartData.items || cartData.items.length === 0;

  return (
    <div className="flex-1 w-full bg-[#f8f9fa] pb-20 pt-6 antialiased relative">
      <div className="max-w-[1200px] mx-auto px-6 xl:px-0">
        
        {/* BREADCRUMB */}
        <div className="flex items-center space-x-2 text-[14px] text-gray-500 mb-6">
          <span onClick={() => navigate('/')} className="hover:text-[#2D982A] cursor-pointer transition-colors">Trang chủ</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">Giỏ hàng</span>
        </div>

        {/* NỘI DUNG CHÍNH */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          
          {/* CỘT TRÁI */}
          <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-fit">
            <div className="px-6 py-5 border-b border-gray-100">
              <h1 className="text-[22px] font-black text-gray-900">Giỏ hàng ({cartData.totalItems || 0})</h1>
            </div>

            {isEmpty ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-32 h-32 text-[#bbf7d0] mb-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <p className="text-[16px] text-gray-800 font-medium mb-6">Không có sản phẩm trong giỏ hàng</p>
                <button 
                  onClick={() => navigate('/')} 
                  className="px-8 py-2.5 bg-[#eef8ef] text-[#2D982A] border border-[#2D982A] rounded-lg font-bold hover:bg-green-100 transition-colors"
                >
                  Về trang chủ
                </button>
              </div>
            ) : (
              <div className="w-full flex flex-col">
                <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50 text-[14px] font-bold text-gray-700">
                  <div className="col-span-6 flex items-center space-x-4">
                    <input 
                      type="checkbox" 
                      checked={isAllSelected}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 accent-[#2D982A] cursor-pointer rounded border-gray-300" 
                    />
                    <span>Sản phẩm</span>
                  </div>
                  <div className="col-span-3 text-center">Giá thành</div>
                  <div className="col-span-3 text-center">Số lượng</div>
                </div>

                <div className="divide-y divide-gray-100">
                  {cartData.items.map((item) => (
                    <div key={item.productId} className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-gray-50 transition-colors">
                      <div className="col-span-6 flex items-center space-x-4">
                        <input 
                          type="checkbox" 
                          checked={selectedItems.includes(item.productId)}
                          onChange={() => handleToggleSelect(item.productId)}
                          className="w-4 h-4 accent-[#2D982A] cursor-pointer rounded border-gray-300 flex-shrink-0" 
                        />
                        <div className="w-[80px] h-[80px] border border-gray-200 rounded bg-white flex items-center justify-center p-1 flex-shrink-0 cursor-pointer" onClick={() => navigate(`/product/${item.slug}`)}>
                          <img src={item.imageUrl} alt={item.name} className="max-w-full max-h-full object-contain" onError={(e) => { e.target.onerror = null; e.target.src = "https://nhathuoclongchau.com.vn/estore-images/front-end/no-image.png"; }} />
                        </div>
                        <span 
                          onClick={() => navigate(`/product/${item.slug}`)} 
                          className="text-[14px] font-bold text-gray-800 line-clamp-2 leading-snug cursor-pointer hover:text-[#2D982A] transition-colors"
                        >
                          {item.name}
                        </span>
                      </div>

                      <div className="col-span-3 text-center text-[#2D982A] font-black text-[16px]">
                        {formatVND(item.price)}
                      </div>

                      <div className="col-span-3 flex items-center justify-center space-x-4">
                        <div className="flex items-center border border-gray-300 rounded overflow-hidden h-9 w-[100px] shadow-sm bg-white">
                          <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-8 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer font-bold transition-colors">-</button>
                          <span className="flex-1 h-full flex items-center justify-center font-bold text-[14px] text-black border-x border-gray-300 bg-gray-50">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-8 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer font-bold transition-colors">+</button>
                        </div>
                        {/* Xac nhan */}
                        <button 
                          onClick={() => setItemToDelete(item.productId)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Xóa sản phẩm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CỘT PHẢI */}
          <div className="lg:col-span-4 h-fit sticky top-[120px]">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#2D982A]"><path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clipRule="evenodd" /><path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" /></svg>
                <h2 className="text-[20px] font-black text-gray-900">Đơn hàng</h2>
              </div>
              
              <div className="space-y-4 text-[14px] text-gray-700 border-b border-gray-100 pb-5 mb-5">
                <div className="flex justify-between items-center">
                  <span>Tổng tiền</span>
                  <span className="font-bold text-black">{formatVND(selectedTotalPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Giảm giá</span>
                  <span className="font-bold text-black">0 ₫</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-[16px] font-bold text-black">Tạm tính</span>
                <span className="text-[22px] font-black text-black">{formatVND(selectedTotalPrice)}</span>
              </div>

              <button 
                disabled={isEmpty || selectedItems.length === 0}
                onClick={() => navigate('/checkout', { state: { selectedItems } })}
                className={`w-full py-3.5 rounded-lg font-bold text-[15px] text-white uppercase tracking-wide transition-all shadow-md ${
                  (isEmpty || selectedItems.length === 0) 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-[#2D982A] hover:bg-green-700 hover:shadow-lg'
                }`}
              >
                ĐẶT HÀNG
              </button>
              
              {!isEmpty && selectedItems.length === 0 && (
                  <p className="text-red-500 text-[13px] text-center mt-3 font-medium">Vui lòng chọn ít nhất 1 sản phẩm để đặt hàng</p>
              )}
            </div>
          </div>
        </div>

        {/* SẢN PHẨM KHÁC */}
        <div className="mb-10">
          <h2 className="text-[22px] font-black text-gray-900 uppercase mb-6 tracking-wide">SẢN PHẨM KHÁC</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
             {suggestedProducts.length > 0 ? (
                suggestedProducts.map((item) => <ProductCard key={item.id} item={item} />)
             ) : (
                Array(5).fill(0).map((_, i) => <div key={i} className="bg-gray-100 animate-pulse h-[300px] rounded-xl"></div>)
             )}
          </div>
        </div>

      </div>

      {/* =====================================================================
          MODAL XÁC NHẬN XÓA SẢN PHẨM
          ===================================================================== */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100 animate-fadeIn">
            <div className="flex flex-col items-center text-center">
              
              {/* Icon Cảnh Báo */}
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </div>

              <h3 className="text-[18px] font-black text-gray-900 mb-2">Xóa sản phẩm</h3>
              <p className="text-[14px] text-gray-600 mb-8 leading-relaxed">Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?</p>
              
              <div className="flex w-full space-x-3">
                <button 
                  onClick={() => setItemToDelete(null)} 
                  className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={() => handleDeleteItem(itemToDelete)} 
                  className="flex-1 py-2.5 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 shadow-md shadow-red-500/30 transition-all"
                >
                  Đồng ý xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thêm chút CSS cho hiệu ứng hiện Modal */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}} />
    </div>
  );
};

export default Cart;