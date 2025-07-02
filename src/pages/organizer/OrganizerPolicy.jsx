import React from 'react';
import OrganizerSidebar from '../../components/organizer/OrganizerSidebar';
import OrganizerHeader from '../../components/organizer/OrganizerHeader';
import { useState } from 'react';

const OrganizerPolicy = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const sections = [
    {
      title: "1. Giới Thiệu",
      content: `
        Bằng việc đăng ký và sử dụng tài khoản nhà tổ chức (Organizer) trên nền tảng Workshophy, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý bị ràng buộc bởi các điều khoản và điều kiện dưới đây.
      `,
      icon: "📋"
    },
    {
      title: "2. Đăng ký và Quản lý Tài khoản",
      content: `
        Organizer phải cung cấp thông tin chính xác, đầy đủ khi tạo tài khoản.
        Mỗi Organizer chỉ được sử dụng một tài khoản duy nhất trên nền tảng.
        Organizer có trách nhiệm bảo mật thông tin đăng nhập và không chia sẻ với bên thứ ba.
        Workshophy có quyền tạm khóa hoặc hủy tài khoản nếu phát hiện vi phạm điều khoản hoặc hành vi gian lận.
      `,
      icon: "👤"
    },
    {
      title: "3. Tạo và Quản lý Workshop",
      content: `
        Organizer có thể tạo workshop sau khi đăng nhập và được duyệt bởi Admin.
        Thông tin workshop phải rõ ràng, trung thực, bao gồm: tiêu đề, mô tả, thời gian, địa điểm, số lượng, hình ảnh, chi phí.
        Organizer phải đảm bảo rằng mọi thông tin được cập nhật thường xuyên và chính xác.
        Workshop không được chứa nội dung vi phạm pháp luật, bạo lực, phân biệt chủng tộc, kích động, khiêu dâm hoặc lừa đảo.
      `,
      icon: "🎯"
    },
    {
      title: "4. Trách nhiệm của Nhà Tổ Chức",
      content: `
        Đảm bảo tổ chức workshop đúng như mô tả.
        Không hủy workshop trừ khi có lý do chính đáng (và phải thông báo trước tối thiểu 48 giờ).
        Đảm bảo an toàn, hợp pháp cho mọi hoạt động trong workshop.
        Hỗ trợ người tham gia trong suốt quá trình đặt vé và tham dự.
      `,
      icon: "⚖️"
    },
    {
      title: "5. Chính sách Hủy & Hoàn tiền",
      content: `
        Nếu Organizer hủy workshop, bạn phải hoàn trả toàn bộ chi phí cho người tham gia (nếu có).
        Mọi yêu cầu hoàn tiền từ người tham gia sẽ được xử lý theo quy định riêng của Workshophy, và có thể yêu cầu Organizer cung cấp bằng chứng hợp lệ.
        Phí hoa hồng (nếu đã thu) không hoàn lại trong các trường hợp vi phạm điều khoản.
      `,
      icon: "↩️"
    },
    {
      title: "6. Chiết khấu và Phí hoa hồng",
      content: `
        Workshophy thu 3% phí hoa hồng trên tổng số tiền vé bán ra.
        Phí hoa hồng sẽ được khấu trừ tự động khi thanh toán doanh thu cho Organizer.
        Doanh thu sẽ được thanh toán vào tài khoản ngân hàng mà Organizer cung cấp, trong vòng 7–10 ngày làm việc sau khi workshop kết thúc (và không có tranh chấp).
      `,
      icon: "💰"
    },
    {
      title: "7. Quyền của Workshophy",
      content: `
        Từ chối hoặc xóa bất kỳ workshop nào nếu vi phạm điều khoản hoặc ảnh hưởng xấu đến uy tín nền tảng.
        Tạm khóa tài khoản nếu phát hiện hành vi gian lận, thông tin sai lệch, hoặc bị báo cáo bởi nhiều người dùng.
        Thay đổi các điều khoản này bất kỳ lúc nào và sẽ thông báo trước bằng email hoặc thông báo hệ thống.
      `,
      icon: "🔐"
    },
    {
      title: "8. Bảo vệ Dữ liệu Cá nhân",
      content: `
        Organizer đồng ý rằng thông tin cá nhân và workshop có thể được lưu trữ, xử lý theo chính sách bảo mật của Workshophy.
        Không được chia sẻ dữ liệu người tham gia với bên thứ ba nếu chưa có sự đồng ý của họ.
      `,
      icon: "🛡️"
    },
    {
      title: "9. Giải quyết Khiếu nại",
      content: `
        Mọi khiếu nại từ người tham gia sẽ được Workshophy tiếp nhận và xử lý trong vòng 3–5 ngày làm việc.
        Organizer cần phối hợp cung cấp thông tin, bằng chứng cần thiết để xử lý khiếu nại.
        Trong trường hợp tranh chấp không giải quyết được, Workshophy có quyền đưa ra quyết định cuối cùng.
      `,
      icon: "🤝"
    },
    {
      title: "10. Chấm dứt Hợp tác",
      content: `
        Organizer có thể yêu cầu ngừng hợp tác bất cứ lúc nào, với điều kiện không có workshop đang diễn ra hoặc chưa xử lý xong thanh toán.
        Workshophy có quyền chấm dứt hợp tác và xóa tài khoản nếu Organizer vi phạm nghiêm trọng điều khoản.
      `,
      icon: "🚪"
    },
    {
      title: "11. Luật áp dụng",
      content: `
        Mọi tranh chấp phát sinh sẽ được giải quyết theo pháp luật Việt Nam và thông qua tòa án có thẩm quyền tại nơi Workshophy đặt trụ sở.
      `,
      icon: "⚖️"
    },
  ];

  return (
    <div className="flex h-screen">
      <OrganizerSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <OrganizerHeader />
        
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="bg-[#091238] rounded-2xl shadow-xl border border-[#091238] mb-8 overflow-hidden">
              <div className="bg-[#091238] p-8">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                    <span className="text-3xl">📄</span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      Chính Sách Nhà Tổ Chức
                    </h1>
                    <p className="text-white/90 text-lg">
                      Điều khoản và điều kiện sử dụng nền tảng Workshophy
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="bg-[#e6eaf7] border border-[#bfc7e6] rounded-xl p-6">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">ℹ️</span>
                    <div>
                      <h3 className="font-semibold text-[#091238] mb-2">Thông tin quan trọng</h3>
                      <p className="text-[#091238] leading-relaxed">
                        Các điều khoản và điều kiện này giúp đảm bảo quyền lợi và trách nhiệm của 
                        Nhà Tổ Chức trên nền tảng Workshophy. Vui lòng đọc kỹ trước khi sử dụng dịch vụ.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Policy Sections */}
            <div className="space-y-6">
              {sections.map((section, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg border border-[#091238] overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="p-8">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="bg-[#e6eaf7] rounded-full p-3 flex-shrink-0">
                        <span className="text-2xl">{section.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#091238] mb-3">
                          {section.title}
                        </h3>
                        <div className="prose prose-slate max-w-none">
                          {section.content.trim().split('\n').filter(line => line.trim()).map((line, lineIndex) => (
                            <div key={lineIndex} className="mb-3 last:mb-0">
                              <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-[#091238] rounded-full mt-2 flex-shrink-0"></div>
                                <p className="text-[#091238] leading-relaxed">
                                  {line.trim()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Bottom accent line */}
                  <div className="h-1 bg-[#091238]"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerPolicy;