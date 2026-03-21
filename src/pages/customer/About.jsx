import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();
  
  // STATE: Lưu trữ vị trí tab đang được chọn (Mặc định là 0 - Giới thiệu)
  const [activeTab, setActiveTab] = useState(0);

  // Cuộn lên đầu trang mỗi khi chuyển tab
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // MẢNG DỮ LIỆU: Chứa tiêu đề menu và nội dung HTML tương ứng bên phải
  const tabsData = [
    {
      title: 'Giới thiệu nhà thuốc',
      content: (
        <>
          <h1 className="text-[28px] font-bold text-black mb-8">Giới thiệu nhà thuốc Thái Dương</h1>
          <h3 className="text-[18px] font-bold text-black mb-3">I. Về nhà thuốc Thái Dương</h3>
          <p className="mb-4">
            Được thành lập từ năm 2019, Nhà thuốc Thái Dương là cửa hàng dược phẩm bán lẻ uy tín tại Việt Nam đạt chuẩn GPP trên toàn quốc. 
            Nhà thuốc Thái Dương đang kinh doanh và cung cấp các loại sản phẩm nằm trong danh mục được Bộ Y tế cấp phép lưu hành, gồm: 
            Thuốc; Dược - mỹ phẩm; Thực phẩm chức năng và Thiết bị y tế.
          </p>
          <p className="mb-2">Thông tin liên hệ nhà thuốc Thái Dương:</p>
          <p className="mb-1">Đơn vị: Công ty cổ phần bán lẻ Nhà thuốc Thái Dương</p>
          <p className="mb-1">Địa chỉ: XX Hoàng Mai, Hà Nội</p>
          <p className="mb-1">Hotline miễn phí: 1800 29YY</p>
          <p className="mb-8">Email: nhathuocthaiduong@mail.com</p>

          <h3 className="text-[18px] font-bold text-black mb-3">II. Sứ mệnh nhà thuốc</h3>
          <p className="mb-4">
            Từ khi thành lập, Thái Dương đặt ra sứ mệnh mong muốn được phục vụ, chăm sóc sức khỏe cộng đồng với sự đồng hành của đội ngũ dược sĩ chuyên môn cao, giàu kinh nghiệm; sản phẩm có chất lượng và giá cả hợp lý.
          </p>
          <p className="mb-8">
            Với sứ mệnh này, Nhà thuốc Thái Dương luôn không ngừng cải thiện chất lượng dịch vụ từ những điều nhỏ nhất, nhằm nâng cao trải nghiệm của khách hàng và đem lại sự hài lòng, thoải mái nhất tới khách hàng khi đến với nhà thuốc.
          </p>

          <h3 className="text-[18px] font-bold text-black mb-3">III. Giá trị cốt lõi</h3>
          <p className="mb-4">
            Nhà thuốc Thái Dương đạt chuẩn Thực hành thuốc tốt – GPP, với đội ngũ dược sĩ có chuyên môn và giàu kinh nghiệm. Cam kết phục vụ theo 3 tiêu chí:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-8">
            <li>Tất cả sản phẩm chính hãng, có nguồn gốc rõ ràng.</li>
            <li>Giá cả sản phẩm đều được niêm yết công khai và minh bạch.</li>
            <li>Dược sĩ trung thực và tư vấn tận tâm với khách hàng.</li>
          </ul>
        </>
      )
    },
    {
      title: 'Hướng dẫn mua hàng Online',
      content: (
        <>
          <h1 className="text-[28px] font-bold text-black mb-8">Hướng dẫn mua hàng Online</h1>
          <p className="mb-6">Để mua hàng tại website Nhà thuốc Thái Dương, quý khách vui lòng thực hiện theo các bước sau:</p>
          
          <h3 className="text-[18px] font-bold text-[#2D982A] mb-2">Bước 1: Tìm kiếm sản phẩm</h3>
          <p className="mb-6">Quý khách có thể tìm kiếm sản phẩm theo tên, theo danh mục hoặc theo công dụng tại thanh tìm kiếm trên cùng của website.</p>
          
          <h3 className="text-[18px] font-bold text-[#2D982A] mb-2">Bước 2: Thêm vào giỏ hàng</h3>
          <p className="mb-6">Kiểm tra thông tin, giá cả sản phẩm. Chọn số lượng mong muốn và bấm vào nút <strong>"Thêm vào giỏ hàng"</strong> hoặc <strong>"Mua ngay"</strong>.</p>
          
          <h3 className="text-[18px] font-bold text-[#2D982A] mb-2">Bước 3: Cung cấp thông tin giao hàng</h3>
          <p className="mb-6">Tại trang Giỏ hàng, quý khách điền đầy đủ và chính xác thông tin người nhận (Họ tên, SĐT, Địa chỉ) để chúng tôi giao hàng nhanh nhất.</p>

          <h3 className="text-[18px] font-bold text-[#2D982A] mb-2">Bước 4: Chọn phương thức thanh toán & Đặt hàng</h3>
          <p className="mb-6">Quý khách có thể chọn thanh toán khi nhận hàng (COD) hoặc thanh toán online. Sau đó bấm <strong>"Hoàn tất đặt hàng"</strong>. Hệ thống sẽ gọi điện xác nhận trong vòng 15 phút.</p>
        </>
      )
    },
    {
      title: 'Chính sách giao hàng',
      content: (
        <>
          <h1 className="text-[28px] font-bold text-black mb-8">Chính sách giao hàng</h1>
          <h3 className="text-[18px] font-bold text-black mb-3">1. Phí giao hàng</h3>
          <ul className="list-disc pl-5 space-y-2 mb-6">
            <li><strong>Miễn phí giao hàng (Freeship)</strong> toàn quốc cho mọi đơn hàng có giá trị từ <strong>300.000đ</strong> trở lên.</li>
            <li>Đối với đơn hàng dưới 300.000đ, phí giao hàng đồng giá toàn quốc là <strong>25.000đ/đơn</strong>.</li>
          </ul>

          <h3 className="text-[18px] font-bold text-black mb-3">2. Thời gian giao hàng dự kiến</h3>
          <ul className="list-disc pl-5 space-y-2 mb-6">
            <li><strong>Khu vực Nội thành Hà Nội:</strong> Giao hàng hỏa tốc trong ngày hoặc từ 1-2 ngày làm việc.</li>
            <li><strong>Khu vực Tỉnh thành khác:</strong> Giao hàng từ 3-5 ngày làm việc tùy thuộc vào đơn vị vận chuyển.</li>
          </ul>
          <p className="italic text-gray-500">* Lưu ý: Thời gian giao hàng có thể bị ảnh hưởng bởi các yếu tố khách quan như thời tiết, dịch bệnh, lễ tết...</p>
        </>
      )
    },
    {
      title: 'Chính sách thanh toán',
      content: (
        <>
          <h1 className="text-[28px] font-bold text-black mb-8">Chính sách thanh toán</h1>
          <p className="mb-6">Nhà thuốc Thái Dương cung cấp các phương thức thanh toán linh hoạt và an toàn cho khách hàng:</p>
          
          <h3 className="text-[18px] font-bold text-black mb-3">1. Thanh toán tiền mặt khi nhận hàng (COD)</h3>
          <p className="mb-6">Khách hàng sẽ thanh toán bằng tiền mặt trực tiếp cho nhân viên giao hàng sau khi đã kiểm tra và nhận đủ sản phẩm.</p>

          <h3 className="text-[18px] font-bold text-black mb-3">2. Thanh toán chuyển khoản (Thẻ ATM, Visa, Master, Momo, ZaloPay)</h3>
          <p className="mb-6">Hệ thống hỗ trợ thanh toán trực tuyến qua cổng Napas, các ví điện tử hoặc chuyển khoản ngân hàng trực tiếp bằng mã QR. Đơn hàng thanh toán trước sẽ được ưu tiên xử lý gửi đi sớm nhất.</p>
        </>
      )
    },
    {
      title: 'Chính sách đổi trả, bảo hành',
      content: (
        <>
          <h1 className="text-[28px] font-bold text-black mb-8">Chính sách đổi trả và bảo hành</h1>
          <h3 className="text-[18px] font-bold text-black mb-3">1. Điều kiện đổi trả</h3>
          <ul className="list-disc pl-5 space-y-2 mb-6">
            <li>Sản phẩm bị lỗi, hỏng do nhà sản xuất hoặc quá trình vận chuyển.</li>
            <li>Sản phẩm giao không đúng loại, mẫu mã, số lượng như đơn đặt hàng.</li>
            <li>Sản phẩm còn nguyên tem mác, hộp, bao bì và chưa qua sử dụng.</li>
            <li>Thời gian yêu cầu đổi trả: Trong vòng <strong>07 ngày</strong> kể từ khi nhận hàng.</li>
          </ul>

          <h3 className="text-[18px] font-bold text-black mb-3">2. Quy trình đổi trả</h3>
          <p className="mb-6">Quý khách vui lòng gọi vào Hotline <strong>1800 29YY</strong> và cung cấp mã đơn hàng, video mở hộp. Nhân viên sẽ hướng dẫn gửi hàng về kho để được đổi mới hoặc hoàn tiền 100%.</p>
        </>
      )
    },
    {
      title: 'Chính sách bảo mật',
      content: (
        <>
          <h1 className="text-[28px] font-bold text-black mb-8">Chính sách bảo mật thông tin</h1>
          <p className="mb-4">Chúng tôi cam kết bảo vệ an toàn tối đa thông tin cá nhân của Quý khách hàng.</p>
          <ul className="list-disc pl-5 space-y-3 mb-6">
            <li><strong>Mục đích thu thập:</strong> Thông tin (Tên, SĐT, Email, Địa chỉ) chỉ được sử dụng để xử lý đơn hàng, giao hàng và hỗ trợ chăm sóc khách hàng.</li>
            <li><strong>Cam kết bảo mật:</strong> Không mua bán, trao đổi hay tiết lộ thông tin cá nhân của khách hàng cho bất kỳ bên thứ 3 nào khác vì mục đích thương mại.</li>
            <li><strong>Lưu trữ:</strong> Dữ liệu được mã hóa và bảo vệ trên hệ thống máy chủ bảo mật của chúng tôi.</li>
          </ul>
        </>
      )
    },
    
  ];

  return (
    <main className="flex-1 w-full bg-white pb-20">
      <div className="max-w-[1200px] mx-auto px-6 xl:px-0 py-6">
        
        {/* BREADCRUMB */}
        <div className="flex items-center space-x-2 text-[14px] text-gray-500 mb-8">
          <span onClick={() => navigate('/')} className="hover:text-[#2D982A] cursor-pointer">Trang chủ</span>
          <span>/</span>
          <span className="text-gray-900">{tabsData[activeTab].title}</span>
        </div>

        {/* BỐ CỤC CHÍNH CHIA 2 CỘT */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* CỘT TRÁI: SIDEBAR MENU */}
          <div className="md:col-span-3">
            <h2 className="text-xl font-bold text-[#2D982A] mb-4 pl-4">Tất cả bài viết</h2>
            <ul className="space-y-1">
              {tabsData.map((tab, index) => (
                <li 
                  key={index}
                  onClick={() => setActiveTab(index)} // Sự kiện Click chuyển Tab
                  className={`px-4 py-3 rounded-lg text-[15px] cursor-pointer transition-colors ${
                    activeTab === index 
                      ? 'bg-[#eef8ef] font-bold text-black' 
                      : 'text-gray-700 hover:text-[#2D982A] hover:bg-gray-50'
                  }`}
                >
                  {tab.title}
                </li>
              ))}
            </ul>
          </div>

          {/* CỘT PHẢI: RENDER NỘI DUNG TƯƠNG ỨNG VỚI TAB ĐANG CHỌN */}
          <div className="md:col-span-9 pt-2 text-gray-800 leading-relaxed text-[15px] antialiased">
             {tabsData[activeTab].content}
          </div>

        </div>
      </div>
    </main>
  );
};

export default About;