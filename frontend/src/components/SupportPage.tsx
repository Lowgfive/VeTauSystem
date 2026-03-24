import { useState } from "react";
import {
  Train,
  ArrowLeft,
  Search,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  MapPin,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle,
  AlertCircle,
  Book,
  CreditCard,
  Ticket,
  User,
  Shield,
  Headphones,
  MessageSquare,
  Zap,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface SupportPageProps {
  onBack?: () => void;
}

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  {
    category: "booking",
    question: "Làm thế nào để đặt vé tàu trực tuyến?",
    answer:
      "Để đặt vé tàu, bạn chọn ga đi, ga đến, ngày khởi hành trên trang chủ. Sau đó chọn chuyến tàu phù hợp, chọn ghế và điền thông tin hành khách. Cuối cùng, thanh toán và nhận vé điện tử qua email.",
  },
  {
    category: "booking",
    question: "Tôi có thể đặt vé cho nhiều người cùng lúc không?",
    answer:
      "Có, bạn có thể đặt tối đa 10 vé trong một lần đặt. Chỉ cần chọn số lượng hành khách khi tìm kiếm chuyến tàu.",
  },
  {
    category: "booking",
    question: "Thời gian đặt vé trước chuyến tàu là bao lâu?",
    answer:
      "Bạn có thể đặt vé trước 90 ngày và muộn nhất trước 2 giờ khởi hành của chuyến tàu.",
  },
  {
    category: "payment",
    question: "Có những hình thức thanh toán nào?",
    answer:
      "Chúng tôi chấp nhận thanh toán qua thẻ ATM, thẻ tín dụng (Visa, MasterCard), ví điện tử (MoMo, ZaloPay, VNPay) và quét mã QR.",
  },
  {
    category: "payment",
    question: "Thanh toán có an toàn không?",
    answer:
      "Tất cả giao dịch đều được mã hóa SSL 256-bit và tuân thủ chuẩn bảo mật PCI DSS. Thông tin thẻ của bạn hoàn toàn được bảo mật.",
  },
  {
    category: "payment",
    question: "Tôi có nhận được hoá đơn VAT không?",
    answer:
      "Có, bạn có thể yêu cầu xuất hoá đơn VAT khi đặt vé. Hoá đơn sẽ được gửi qua email trong vòng 24 giờ.",
  },
  {
    category: "cancellation",
    question: "Chính sách huỷ vé như thế nào?",
    answer:
      "Miễn phí huỷ vé trong 24h đầu sau khi đặt. Sau đó, phí huỷ là 10% (trước 48h), 20% (trước 24h), và 30% (trong 24h trước khởi hành).",
  },
  {
    category: "cancellation",
    question: "Làm thế nào để huỷ vé đã đặt?",
    answer:
      'Vào mục "Vé của tôi", chọn vé cần huỷ và nhấn "Huỷ vé". Tiền sẽ được hoàn lại vào tài khoản trong 5-7 ngày làm việc.',
  },
  {
    category: "ticket",
    question: "Vé điện tử có giá trị như vé giấy không?",
    answer:
      "Có, vé điện tử có giá trị pháp lý tương đương vé giấy. Bạn chỉ cần xuất trình mã QR trên điện thoại khi lên tàu.",
  },
  {
    category: "ticket",
    question: "Tôi có thể đổi chuyến tàu sau khi đã đặt vé không?",
    answer:
      "Có, bạn có thể đổi chuyến tàu miễn phí 1 lần trước 24h khởi hành. Sau đó sẽ tính phí 50.000đ/vé.",
  },
];

import { useNavigate } from "react-router-dom";

export function SupportPage({ onBack }: SupportPageProps) {
  const navigate = useNavigate();
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const categories = [
    { id: "all", name: "Tất cả", icon: Book },
    { id: "booking", name: "Đặt vé", icon: Ticket },
    { id: "payment", name: "Thanh toán", icon: CreditCard },
    { id: "cancellation", name: "Huỷ vé", icon: AlertCircle },
    { id: "ticket", name: "Vé điện tử", icon: Zap },
  ];

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-primary text-white shadow-railway-lg z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg">
                <Train className="w-7 h-7 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-xl leading-tight tracking-tight">
                  Đường Sắt Việt Nam
                </h1>
                <p className="text-xs text-white/90 font-medium">
                  Trung Tâm Hỗ Trợ
                </p>
              </div>
            </div>

            {/* Back Button */}
            <Button
              onClick={handleBack}
              variant="secondary"
              size="sm"
              className="bg-white text-primary hover:bg-white/90 font-bold shadow-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Về trang chủ
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-xl mb-6">
              <Headphones className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Chúng tôi có thể giúp gì cho bạn?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tìm câu trả lời nhanh chóng hoặc liên hệ với đội ngũ hỗ trợ 24/7
            </p>
          </div>

          {/* Quick Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 hover:shadow-xl transition-all border-2 hover:border-primary group cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-xl group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">Hotline 24/7</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Gọi ngay để được hỗ trợ
                  </p>
                  <a
                    href="tel:19001000"
                    className="text-lg font-bold text-primary hover:underline"
                  >
                    1900 1000
                  </a>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all border-2 hover:border-primary group cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Gửi email cho chúng tôi
                  </p>
                  <a
                    href="mailto:support@railway.vn"
                    className="text-sm font-bold text-primary hover:underline break-all"
                  >
                    support@railway.vn
                  </a>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all border-2 hover:border-primary group cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-xl group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">Live Chat</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Chat trực tiếp với nhân viên
                  </p>
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 mt-1"
                  >
                    Bắt đầu chat
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Left: Categories */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Book className="w-5 h-5 text-primary" />
                  Danh mục
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                        selectedCategory === category.id
                          ? "bg-primary text-white shadow-lg"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <category.icon className="w-5 h-5" />
                      <span className="font-medium">{category.name}</span>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right: FAQs */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-primary" />
                    Câu hỏi thường gặp
                  </h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Tìm kiếm câu hỏi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 border-2"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredFAQs.length > 0 ? (
                    filteredFAQs.map((faq, index) => (
                      <div
                        key={index}
                        className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-primary transition-all"
                      >
                        <button
                          onClick={() =>
                            setExpandedFAQ(expandedFAQ === index ? null : index)
                          }
                          className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left"
                        >
                          <span className="font-semibold text-gray-900 pr-4">
                            {faq.question}
                          </span>
                          {expandedFAQ === index ? (
                            <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                        </button>
                        {expandedFAQ === index && (
                          <div className="p-4 bg-blue-50 border-t-2 border-blue-100">
                            <p className="text-gray-700 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">
                        Không tìm thấy câu hỏi phù hợp
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <Card className="p-8 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-xl mb-4">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Gửi yêu cầu hỗ trợ
              </h3>
              <p className="text-gray-600">
                Chúng tôi sẽ phản hồi trong vòng 24 giờ
              </p>
            </div>

            {formSubmitted ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  Gửi thành công!
                </h4>
                <p className="text-gray-600">
                  Chúng tôi đã nhận được yêu cầu của bạn và sẽ phản hồi sớm nhất.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-gray-700 font-semibold mb-2 block">
                      Họ và tên *
                    </Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="h-11 border-2"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-700 font-semibold mb-2 block">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="h-11 border-2"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone" className="text-gray-700 font-semibold mb-2 block">
                      Số điện thoại
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="h-11 border-2"
                      placeholder="0987654321"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject" className="text-gray-700 font-semibold mb-2 block">
                      Chủ đề *
                    </Label>
                    <Select
                      required
                      value={formData.subject}
                      onValueChange={(value: string) =>
                        setFormData({ ...formData, subject: value })
                      }
                    >
                      <SelectTrigger id="subject" className="h-11 border-2">
                        <SelectValue placeholder="Chọn chủ đề" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="booking">Đặt vé</SelectItem>
                        <SelectItem value="payment">Thanh toán</SelectItem>
                        <SelectItem value="cancellation">Huỷ vé</SelectItem>
                        <SelectItem value="refund">Hoàn tiền</SelectItem>
                        <SelectItem value="technical">Kỹ thuật</SelectItem>
                        <SelectItem value="other">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="message" className="text-gray-700 font-semibold mb-2 block">
                    Nội dung *
                  </Label>
                  <Textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="min-h-32 border-2 resize-none"
                    placeholder="Mô tả chi tiết vấn đề của bạn..."
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Gửi yêu cầu
                </Button>
              </form>
            )}
          </Card>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-4xl mx-auto">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">
                    Giờ làm việc
                  </h4>
                  <p className="text-sm text-gray-600 mb-1">
                    Thứ 2 - Thứ 6: 7:00 - 22:00
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    Thứ 7 - CN: 8:00 - 20:00
                  </p>
                  <Badge className="mt-2 bg-green-100 text-green-800">
                    Hotline 24/7
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <MapPin className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Địa chỉ</h4>
                  <p className="text-sm text-gray-600">
                    118 Lê Duẩn, Hoàn Kiếm,
                    <br />
                    Hà Nội, Việt Nam
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
