import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Support = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqs = [
    { q: 'Làm thế nào để đặt hàng online trên website?', a: 'Bạn chỉ cần tìm kiếm sản phẩm, chọn số lượng, bấm "Thêm vào giỏ hàng" và tiến hành điền thông tin thanh toán theo các bước hướng dẫn trên màn hình.' },
    { q: 'Nhà thuốc có giao hàng tận nơi không?', a: 'Có. Chúng tôi giao hàng toàn quốc. Miễn phí vận chuyển cho đơn hàng từ 300.000đ trở lên.' },
    { q: 'Tôi có thể đổi trả thuốc đã mua không?', a: 'Bạn có thể đổi trả trong vòng 7 ngày nếu sản phẩm bị lỗi từ nhà sản xuất hoặc giao sai mẫu mã. Vui lòng giữ nguyên tem mác.' },
    { q: 'Làm sao để tôi liên hệ trực tiếp với Dược sĩ tư vấn?', a: 'Bạn có thể gọi trực tiếp vào Hotline miễn phí 1800 29YY hoặc nhắn tin qua Zalo số 098xxxxxxx để được các Dược sĩ hỗ trợ 24/7.' }
  ];

  return (
    <main className="flex-1 w-full bg-[#f8f9fa] pb-20">
      <div className="bg-white border-b border-gray-200">
          <div className="max-w-[1200px] mx-auto px-6 xl:px-0 py-10 text-center">
             <h1 className="text-[36px] font-black text-black uppercase tracking-wide mb-4">Trung tâm hỗ trợ khách hàng</h1>
             <p className="text-[15px] italic text-gray-600 max-w-2xl mx-auto">Nhà thuốc Thái Dương luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn. Hãy chọn chủ đề bạn cần hỗ trợ hoặc liên hệ trực tiếp với chúng tôi.</p>
          </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 xl:px-0 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* CỘT THÔNG TIN LIÊN HỆ */}
          <div className="md:col-span-4 space-y-6">
             <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                 <div className="w-16 h-16 bg-[#eef8ef] rounded-full flex items-center justify-center text-[#2D982A] mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75v-4.5m0 4.5h4.5m-4.5 0l6-6m-3 18c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 014.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 00-.38 1.21 12.035 12.035 0 007.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 011.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 01-2.25 2.25h-2.25z" /></svg>
                 </div>
                 <h3 className="font-bold text-lg mb-2 text-black">Hotline Tư vấn</h3>
                 <p className="text-gray-500 text-[14px] mb-4">Hỗ trợ đặt hàng & Tư vấn thuốc (Miễn phí)</p>
                 <p className="text-[#2D982A] font-black text-2xl">1800 29YY</p>
             </div>
             <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                 <div className="w-16 h-16 bg-[#eef8ef] rounded-full flex items-center justify-center text-[#2D982A] mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                 </div>
                 <h3 className="font-bold text-lg mb-2 text-black">Email Hỗ trợ</h3>
                 <p className="text-gray-500 text-[14px] mb-4">Gửi thắc mắc hoặc yêu cầu của bạn</p>
                 <p className="text-[#2D982A] font-bold text-[16px]">nhathuocthaiduong@mail.com</p>
             </div>
          </div>

          {/* CỘT FAQ (CÂU HỎI THƯỜNG GẶP) */}
          <div className="md:col-span-8 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-[22px] font-black text-black mb-6 uppercase">Câu hỏi thường gặp</h2>
              <div className="space-y-4">
                  {faqs.map((faq, index) => (
                      <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                          <button 
                            onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                            className="w-full flex items-center justify-between p-5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                          >
                              <span className={`font-bold text-[15px] ${openFaq === index ? 'text-[#2D982A]' : 'text-gray-800'}`}>{faq.q}</span>
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 transition-transform ${openFaq === index ? 'rotate-180 text-[#2D982A]' : 'text-gray-500'}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                          </button>
                          {/* Nội dung xổ xuống */}
                          {openFaq === index && (
                              <div className="p-5 text-[14px] text-gray-700 leading-relaxed border-t border-gray-200 bg-white">
                                  {faq.a}
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>

        </div>
      </div>
    </main>
  );
};

export default Support;