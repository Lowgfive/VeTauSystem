import { Train, Mail, Phone, MapPin, Facebook, Youtube, Clock } from 'lucide-react';
import { Separator } from './ui/separator';

export function Footer() {
  return (
    <footer className="bg-primary text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Train className="w-6 h-6 text-white" />
              <h3 className="text-white font-bold text-lg">Đường Sắt Việt Nam</h3>
            </div>
            <p className="text-sm mb-4 text-white/80">
              Hệ thống đặt vé tàu trực tuyến nhanh chóng, tiện lợi và an toàn cho mọi hành trình.
            </p>
            <div className="flex gap-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">Tra cứu lịch trình</a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">Bảng giá vé</a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">Hướng dẫn đặt vé</a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">Chính sách hủy vé</a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">Câu hỏi thường gặp</a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Hỗ trợ khách hàng</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Hotline</p>
                  <p className="text-white/80">1900 1000</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Email</p>
                  <p className="text-white/80">support@duongsatvn.vn</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Giờ làm việc</p>
                  <p className="text-white/80">24/7 - Cả tuần</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Address */}
          <div>
            <h4 className="text-white font-semibold mb-4">Trụ sở chính</h4>
            <div className="flex items-start gap-2 text-sm mb-4">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-white/80">
                118 Lê Duẩn, Phường Cửa Nam<br />
                Quận Hoàn Kiếm, Hà Nội
              </p>
            </div>
            <div className="text-sm">
              <p className="font-medium text-white mb-2">Phương thức thanh toán</p>
              <div className="flex gap-2 flex-wrap">
                <div className="bg-white rounded px-2 py-1 text-xs font-medium text-primary">Visa</div>
                <div className="bg-white rounded px-2 py-1 text-xs font-medium text-primary">Mastercard</div>
                <div className="bg-white rounded px-2 py-1 text-xs font-medium text-primary">MoMo</div>
                <div className="bg-white rounded px-2 py-1 text-xs font-medium text-primary">VNPay</div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-white/20 mb-6" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/80">
          <p>© 2026 Đường Sắt Việt Nam. Tất cả quyền được bảo lưu.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Điều khoản sử dụng</a>
            <a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a>
            <a href="#" className="hover:text-white transition-colors">Quy chế hoạt động</a>
          </div>
        </div>
      </div>
    </footer>
  );
}