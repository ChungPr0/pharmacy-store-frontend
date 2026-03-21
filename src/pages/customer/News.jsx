import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const News = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [expandedArticleId, setExpandedArticleId] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Giả lập tải dữ liệu
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const toggleLinks = (id) => {
    if (expandedArticleId === id) {
      setExpandedArticleId(null); 
    } else {
      setExpandedArticleId(id); 
    }
  };

  // DỮ LIỆU TIN TỨC: 6 BẢN TIN KHÁC NHAU VÀ CHỈ CÓ 1 LINK LIÊN QUAN
  const mockNewsData = [
    {
      id: 1,
      title: "BẢN TIN SỨC KHỎE: Cẩm nang chăm sóc da mùa hè và cách dùng kem chống nắng hiệu quả.",
      date: "25/05/2024",
      excerpt: "Mùa hè là thời điểm làn da phải chịu nhiều áp lực từ tia cực tím và nhiệt độ cao. Dược sĩ Diệp khuyên dùng kem chống nắng có chỉ số SPF từ 30 trở lên, phù hợp với từng loại da để bảo vệ tối ưu khỏi sạm nám...",
      relatedLink: { text: "Cẩm nang chăm sóc da mùa hè và cách dùng kem chống nắng hiệu quả - Chi tiết tại Nhà thuốc Long Châu", url: "https://nhathuoclongchau.com.vn/bai-viet/chia-se-cach-dung-kem-chong-nang-mua-he-hieu-qua-52783.html" }
    },
    {
      id: 2,
      title: "BẢN TIN SỐT XUẤT HUYẾT: Dấu hiệu nhận biết và cách phòng ngừa hiệu quả.",
      date: "20/05/2024",
      excerpt: "Số ca mắc sốt xuất huyết đang có xu hướng gia tăng. Các triệu chứng như sốt cao liên tục, đau đầu, đau hốc mắt, phát ban cần được chú ý. Biện pháp tốt nhất là diệt muỗi, lăng quăng và dọn dẹp vệ sinh môi trường...",
      relatedLink: { text: "Hướng dẫn phòng ngừa sốt xuất huyết từ cơ quan y tế", url: "https://medlatec.vn/tin-tuc/nguyen-nhan-va-cach-phong-chong-sot-xuat-huyet-s195-n18691" }
    },
    {
      id: 3,
      title: "THỰC PHẨM CHỨC NĂNG: Lựa chọn và sử dụng thế nào để mang lại hiệu quả tốt nhất?",
      date: "15/05/2024",
      excerpt: "Thực phẩm chức năng đóng vai trò hỗ trợ nhưng không thể thay thế thuốc chữa bệnh. Cần lựa chọn sản phẩm có nguồn gốc rõ ràng, phù hợp với nhu cầu cơ thể và tham khảo ý kiến chuyên gia...",
      relatedLink: { text: "Lưu ý khi lựa chọn và sử dụng thực phẩm chức năng đúng cách", url: "https://www.vinmec.com/vie/bai-viet/bo-sung-thuc-pham-chuc-nang-nao-cho-dung-vi" }
    },
    {
      id: 4,
      title: "CẨM NANG NGƯỜI CAO TUỔI: Bí quyết chăm sóc sức khỏe lúc giao mùa.",
      date: "10/05/2024",
      excerpt: "Thời tiết giao mùa thay đổi thất thường dễ khiến người cao tuổi mắc các bệnh về hô hấp và xương khớp. Chế độ dinh dưỡng, giữ ấm cơ thể và kiểm tra huyết áp thường xuyên là cực kỳ quan trọng...",
      relatedLink: { text: "Bí quyết chăm sóc sức khỏe cho người cao tuổi lúc giao mùa", url: "https://soyte.tuyenquang.gov.vn/tin-tuc/cham-soc-suc-khoe-cho-nguoi-cao-tuoi-khi-thoi-tiet-giao-mua.html" }
    },
    {
      id: 5,
      title: "CẤM NANG PHỤ HUYNH: Dấu hiệu và cách xử lý nhanh khi trẻ bị ngộ độc thực phẩm.",
      date: "05/05/2024",
      excerpt: "Ngộ độc thực phẩm ở trẻ em diễn biến rất nhanh và nguy hiểm. Cha mẹ cần nắm rõ các biểu hiện như nôn mửa, tiêu chảy, đau bụng để có biện pháp bù nước và đưa trẻ đến cơ sở y tế gần nhất...",
      relatedLink: { text: "Cẩm nang sơ cứu y tế cơ bản tại nhà dành cho phụ huynh", url: "https://benhviennhitrunguong.gov.vn/ngo-doc-thuc-pham-o-tre-em-nhung-luu-y-quan-trong-cha-me-can-biet.html" }
    },
    {
      id: 6,
      title: "CẢNH BÁO TÁC DỤNG PHỤ CỦA KHÁNG SINH: Những lưu ý quan trọng từ Dược sĩ .",
      date: "01/05/2024",
      excerpt: "Sử dụng kháng sinh bừa bãi không chỉ gây ra tình trạng kháng thuốc mà còn dẫn đến nhiều tác dụng phụ như rối loạn tiêu hóa, dị ứng. Tuyệt đối không tự ý mua kháng sinh mà phải có chỉ định của bác sĩ...",
      relatedLink: { text: "Quy định về việc bán thuốc kê đơn theo thông tư mới", url: "https://www.vinmec.com/vie/bai-viet/cac-tac-dung-phu-cua-thuoc-khang-sinh-vi" }
    }
  ];

  if (loading) {
    return (
      <main className="flex-1 w-full bg-white py-12 px-6 xl:px-0">
        <div className="max-w-[1200px] mx-auto">
          <div className="h-8 bg-gray-200 animate-pulse w-1/4 mb-10 rounded"></div>
          <div className="space-y-6">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-[150px] bg-gray-100 animate-pulse rounded-xl"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 w-full bg-white pb-20 antialiased">
      <div className="max-w-[1200px] mx-auto px-6 xl:px-0 py-6">
        
        {/* BREADCRUMB */}
        <div className="flex items-center space-x-2 text-[14px] text-gray-500 mb-8">
          <span onClick={() => navigate('/')} className="hover:text-[#2D982A] cursor-pointer transition-colors">Trang chủ</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">Tin tức</span>
        </div>

        {/* TIÊU ĐỀ TRANG */}
        <h1 className="text-[28px] font-black text-black uppercase tracking-wide mb-10 border-b-2 border-gray-100 pb-4">
          Tin tức & Cẩm nang y tế Thái Dương
        </h1>

        {/* DANH SÁCH TIN TỨC */}
        <div className="space-y-25">
          {mockNewsData.map((item) => (
            <div 
              key={item.id} 
              className={`bg-white rounded-xl border transition-all duration-300 ${
                expandedArticleId === item.id 
                  ? 'border-[#2D982A] shadow-md p-8' 
                  : 'border-gray-900 hover:border-[#2D982A] hover:shadow-sm p-9'
              }`}
            >
              {/* NỘI DUNG CHÍNH */}
              <div onClick={() => toggleLinks(item.id)} className="cursor-pointer">
                <h3 className={`text-[36px] font-bold mb-1.5 leading-snug transition-colors ${expandedArticleId === item.id ? 'text-[#2D982A]' : 'text-gray-900'}`}>
                  {item.title}
                </h3>
                <p className="text-[15px] text-gray-400 mb-4">{item.date}</p>
                <p className="text-[20px] text-gray-700 leading-relaxed mb-5 antialiased">
                  {item.excerpt}
                </p>
              </div>

              {/* NÚT XEM CHI TIẾT */}
              <div className="flex justify-start">
                <button 
                  onClick={() => toggleLinks(item.id)}
                  className="text-[14px] font-bold text-[#2D982A] flex items-center group space-x-1 hover:text-green-700"
                >
                  <span>{expandedArticleId === item.id ? 'Thu gọn' : 'Xem chi tiết'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-3.5 h-3.5 transition-transform duration-300 ${expandedArticleId === item.id ? 'rotate-180' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              </div>

              {/* ĐƯỜNG LINK LIÊN QUAN (1 LINK DUY NHẤT) */}
              {expandedArticleId === item.id && (
                <div className="mt-6 pt-6 border-t border-gray-100 bg-gray-50 rounded-lg p-5 animate-fadeIn">
                  <p className="text-[20px] font-bold text-gray-900 mb-3">Tài liệu & Đường link liên quan:</p>
                  <a 
                    href={item.relatedLink.url} 
                    className="inline-flex text-[20px] text-[#2D982A] hover:text-green-700 hover:underline items-center space-x-2"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                    <span>{item.relatedLink.text}</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
        
      </div>
    </main>
  );
};

export default News;