import { useState } from "react";
import {
  Train,
  Menu,
  X,
  ArrowRightLeft,
  Calendar,
  MapPin,
  ChevronRight,
  Clock,
  Shield,
  Star,
  TrendingUp,
  Users,
  Award,
  Phone,
  Mail,
  CheckCircle,
  Sparkles,
  Zap,
  Heart,
  ThumbsUp,
  Quote,
  ArrowRight,
  Plus,
  Minus,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Footer } from "./Footer";
import { PromoSlider } from "./PromoSlider";
import { stations } from "../data/mockData";
import { SearchParams } from "../types";

interface HomepageProps {
  onSearch?: (params: SearchParams) => void;
  onNavigateToLogin?: () => void;
  onNavigateToMyBookings?: () => void;
  onNavigateToSchedule?: () => void;
  onNavigateToSupport?: () => void;
  onNavigateToAdmin?: () => void;
  onLogout?: () => void;
  isSearching?: boolean;
  isLoggedIn?: boolean;
  userName?: string;
}

export function Homepage({
  onSearch = () => {},
  onNavigateToLogin,
  onNavigateToMyBookings,
  onNavigateToSchedule,
  onNavigateToSupport,
  onNavigateToAdmin,
  onLogout,
  isSearching,
  isLoggedIn = false,
  userName,
}: HomepageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [originId, setOriginId] = useState<string>("");
  const [destinationId, setDestinationId] =
    useState<string>("");
  const [departureDate, setDepartureDate] =
    useState<string>("");
  const [returnDate, setReturnDate] = useState<string>("");
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [passengerCount, setPassengerCount] = useState(1);

  // Load last search from localStorage
  useState(() => {
    try {
      const lastSearch = localStorage.getItem("lastSearch");
      if (lastSearch) {
        const parsed = JSON.parse(lastSearch);
        setOriginId(parsed.originId || "");
        setDestinationId(parsed.destinationId || "");
        setDepartureDate(parsed.date || "");
      }
    } catch (error) {
      // Ignore localStorage errors
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!originId || !destinationId || !departureDate) {
      return;
    }

    const originStation = stations.find(s => s.id === originId);
    const destinationStation = stations.find(s => s.id === destinationId);

    const searchParams = {
      originId,
      destinationId,
      originName: originStation?.name || "",
      destinationName: destinationStation?.name || "",
      date: departureDate,
      returnDate: isRoundTrip ? returnDate : undefined,
    };

    // Save to localStorage
    try {
      localStorage.setItem(
        "lastSearch",
        JSON.stringify(searchParams),
      );
    } catch (error) {
      // Ignore localStorage errors
    }

    onSearch(searchParams);
  };

  const handleSwapStations = () => {
    const temp = originId;
    setOriginId(destinationId);
    setDestinationId(temp);
  };

  const setQuickDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setDepartureDate(date.toISOString().split("T")[0]);
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Popular stations for quick selection
  const popularStations = [
    { id: "hanoi", name: "Hà Nội" },
    { id: "saigon", name: "Sài Gòn" },
    { id: "danang", name: "Đà Nẵng" },
    { id: "hue", name: "Huế" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-primary text-white shadow-railway-lg z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo - Enhanced */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg hover:bg-white/30 transition-all">
                <Train className="w-7 h-7 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-xl leading-tight tracking-tight">
                  Đường Sắt Việt Nam
                </h1>
                <p className="text-xs text-white/90 font-medium">
                  Vietnam Railways
                </p>
              </div>
              <div className="sm:hidden">
                <h1 className="font-bold text-lg">ĐSVN</h1>
              </div>
            </div>

            {/* Desktop Menu - Enhanced */}
            <nav className="hidden md:flex items-center gap-2">
              <a
                href="#"
                className="px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 rounded-lg transition-all backdrop-blur-sm border border-transparent hover:border-white/30"
              >
                Trang chủ
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateToSchedule?.();
                }}
                className="px-4 py-2 text-sm font-semibold text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-all backdrop-blur-sm border border-transparent hover:border-white/30 cursor-pointer"
              >
                Lịch trình
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateToMyBookings?.();
                }}
                className="px-4 py-2 text-sm font-semibold text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-all backdrop-blur-sm border border-transparent hover:border-white/30 cursor-pointer"
              >
                Vé của tôi
              </a>
              {isLoggedIn && (
                <a
                  href="/profile"
                  className="px-4 py-2 text-sm font-semibold text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-all backdrop-blur-sm border border-transparent hover:border-white/30 cursor-pointer"
                >
                  Hồ sơ
                </a>
              )}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateToSupport?.();
                }}
                className="px-4 py-2 text-sm font-semibold text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-all backdrop-blur-sm border border-transparent hover:border-white/30 cursor-pointer"
              >
                Hỗ trợ
              </a>

              <Separator
                orientation="vertical"
                className="h-8 bg-white/30 mx-2"
              />

              {/* Hidden admin link */}
              {onNavigateToAdmin && (
                <button
                  onClick={onNavigateToAdmin}
                  className="px-2 py-2 text-xs text-white/40 hover:text-white/70 transition-colors"
                  title="Admin Panel"
                >
                  •
                </button>
              )}

              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-white/90">
                    Xin chào, {userName || "Bạn"}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 border border-white/40 text-white hover:bg-white/30 font-semibold px-4 h-10"
                    onClick={onLogout}
                  >
                    Đăng xuất
                  </Button>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white text-primary hover:bg-white/90 font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 px-6 h-10"
                  onClick={onNavigateToLogin}
                >
                  Đăng nhập
                </Button>
              )}
            </nav>

            {/* Mobile Menu Button - Enhanced */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 hover:bg-white/20 rounded-xl transition-all backdrop-blur-sm border border-white/30 shadow-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t border-white/20">
              <div className="flex flex-col gap-3">
                <a
                  href="#"
                  className="text-sm font-medium hover:text-white/80 transition-colors py-2"
                >
                  Trang chủ
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateToSchedule?.();
                  }}
                  className="text-sm font-medium hover:text-white/80 transition-colors py-2 cursor-pointer"
                >
                  Lịch trình
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateToMyBookings?.();
                  }}
                  className="text-sm font-medium hover:text-white/80 transition-colors py-2 cursor-pointer"
                >
                  Vé của tôi
                </a>
                {isLoggedIn && (
                  <a
                    href="/profile"
                    className="text-sm font-medium hover:text-white/80 transition-colors py-2 cursor-pointer"
                  >
                    Hồ sơ
                  </a>
                )}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateToSupport();
                  }}
                  className="text-sm font-medium hover:text-white/80 transition-colors py-2 cursor-pointer"
                >
                  Hỗ trợ
                </a>
                {isLoggedIn ? (
                  <div className="flex flex-col gap-2 mt-2">
                    <p className="text-sm font-semibold text-white/90 text-center">
                      Xin chào, {userName || "Bạn"}
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-white/20 border border-white/40 text-white hover:bg-white/30 w-full"
                      onClick={onLogout}
                    >
                      Đăng xuất
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white text-primary hover:bg-white/90 w-full mt-2"
                    onClick={onNavigateToLogin}
                  >
                    Đăng nhập
                  </Button>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16">
        {/* Hero Section with New Color Scheme & Slider */}
        <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-gray-900 py-16 md:py-20 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            {/* Main Hero Content with better typography */}
            <div className="max-w-4xl mx-auto text-center mb-12">
              <Badge className="mb-5 bg-gradient-to-r from-orange-500 to-red-600 text-white border-0 hover:shadow-lg transition-shadow px-4 py-1.5">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                <span className="font-semibold">
                  Ưu đãi đặc biệt - Giảm đến 30%
                </span>
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
                <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                  Đặt Vé Tàu Trực Tuyến
                </span>
                <br />
                <span className="text-3xl md:text-4xl lg:text-5xl text-gray-700 font-semibold">
                  Nhanh Chóng & Tiện Lợi
                </span>
              </h1>

              <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
                Hành trình an toàn, thoải mái với hệ thống đặt
                vé hiện đại nhất Việt Nam
              </p>
            </div>

            {/* Promotional Slider */}
            <div className="max-w-6xl mx-auto mb-12">
              <PromoSlider />
            </div>

            {/* Enhanced Search Card */}
            <Card className="max-w-5xl mx-auto bg-white shadow-2xl border-0">
              <div className="p-8 md:p-10 bg-gradient-to-br from-white to-gray-50/50">
                <form
                  onSubmit={handleSubmit}
                  className="space-y-8"
                >
                  {/* Trip Type Tabs - Enhanced */}
                  <div className="flex gap-3 p-1.5 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl w-fit shadow-inner border border-gray-200/50">
                    <button
                      type="button"
                      onClick={() => setIsRoundTrip(false)}
                      className={`px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                        !isRoundTrip
                          ? "bg-gradient-to-br from-primary to-primary/90 text-white shadow-lg shadow-primary/30 scale-105"
                          : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4" />
                        Một chiều
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRoundTrip(true)}
                      className={`px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                        isRoundTrip
                          ? "bg-gradient-to-br from-primary to-primary/90 text-white shadow-lg shadow-primary/30 scale-105"
                          : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <ArrowRightLeft className="w-4 h-4" />
                        Khứ hồi
                      </span>
                    </button>
                  </div>

                  {/* Station Selection with Quick Picks - Enhanced */}
                  <div className="space-y-5">
                    <div className="relative">
                      {/* Single Row: Origin Select - Swap - Destination Select */}
                      <div className="flex items-center gap-4 justify-center flex-wrap">
                        {/* Origin Station */}
                        <div className="relative group w-full md:w-auto md:flex-1 md:max-w-lg">
                          <Label
                            htmlFor="origin"
                            className="flex items-center gap-2 text-gray-700 font-semibold text-sm mb-2"
                          >
                            <div className="p-1 bg-primary/10 rounded-lg">
                              <MapPin className="w-3.5 h-3.5 text-primary" />
                            </div>
                            Ga đi
                          </Label>
                          <Select
                            value={originId}
                            onValueChange={setOriginId}
                            required
                          >
                            <SelectTrigger
                              id="origin"
                              className="h-11 border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm rounded-xl hover:border-gray-300 transition-all bg-white shadow-sm group-hover:shadow-md"
                            >
                              <SelectValue placeholder="Chọn ga đi" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              {stations.map((station) => (
                                <SelectItem
                                  key={station.id}
                                  value={station.id}
                                  disabled={
                                    station.id === destinationId
                                  }
                                  className="cursor-pointer"
                                >
                                  {station.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Swap Button */}
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleSwapStations}
                          disabled={!originId || !destinationId}
                          className="h-11 w-11 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 disabled:opacity-40 transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-110 bg-white mt-0 md:mt-7"
                          aria-label="Đổi chiều"
                        >
                          <ArrowRightLeft className="w-5 h-5 text-primary" />
                        </Button>

                        {/* Destination Station */}
                        <div className="relative group w-full md:w-auto md:flex-1 md:max-w-lg">
                          <Label
                            htmlFor="destination"
                            className="flex items-center gap-2 text-gray-700 font-semibold text-sm mb-2"
                          >
                            <div className="p-1 bg-secondary/10 rounded-lg">
                              <MapPin className="w-3.5 h-3.5 text-secondary" />
                            </div>
                            Ga đến
                          </Label>
                          <Select
                            value={destinationId}
                            onValueChange={setDestinationId}
                            required
                          >
                            <SelectTrigger
                              id="destination"
                              className="h-11 border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm rounded-xl hover:border-gray-300 transition-all bg-white shadow-sm group-hover:shadow-md"
                            >
                              <SelectValue placeholder="Chọn ga đến" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              {stations.map((station) => (
                                <SelectItem
                                  key={station.id}
                                  value={station.id}
                                  disabled={
                                    station.id === originId
                                  }
                                  className="cursor-pointer"
                                >
                                  {station.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Quick Pick Popular Routes - Enhanced */}
                    <div className="flex items-center gap-3 flex-wrap pl-4 pt-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <Sparkles className="w-4 h-4 text-warning" />
                        Phổ biến:
                      </div>
                      {[
                        {
                          from: "hanoi",
                          to: "saigon",
                          label: "HN → SG",
                        },
                        {
                          from: "hanoi",
                          to: "danang",
                          label: "HN → ĐN",
                        },
                        {
                          from: "saigon",
                          to: "danang",
                          label: "SG → ĐN",
                        },
                      ].map((route, idx) => (
                        <Button
                          key={idx}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setOriginId(route.from);
                            setDestinationId(route.to);
                          }}
                          className="h-8 px-4 text-xs font-medium border-2 border-gray-200 hover:border-primary hover:bg-primary/5 hover:text-primary rounded-full transition-all shadow-sm hover:shadow-md"
                        >
                          {route.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Separator */}
                  <Separator className="bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                  {/* Date Selection with Quick Picks - Enhanced */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Departure Date - Enhanced */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="departure-date"
                        className="flex items-center gap-2 text-gray-700 font-semibold"
                      >
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                          <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        Ngày đi
                      </Label>
                      <div className="relative group">
                        <Input
                          id="departure-date"
                          type="date"
                          value={departureDate}
                          onChange={(e) =>
                            setDepartureDate(e.target.value)
                          }
                          min={today}
                          required
                          className="h-16 border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-base rounded-xl hover:border-gray-300 transition-all shadow-sm group-hover:shadow-md bg-white"
                        />
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { days: 0, label: "Hôm nay" },
                          { days: 1, label: "Ngày mai" },
                          { days: 7, label: "Tuần sau" },
                        ].map((quick) => (
                          <Button
                            key={quick.days}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setQuickDate(quick.days)
                            }
                            className="h-8 px-4 text-xs font-medium border-2 border-gray-200 hover:border-primary hover:bg-primary/5 hover:text-primary rounded-full transition-all shadow-sm hover:shadow-md"
                          >
                            <Clock className="w-3 h-3 mr-1.5" />
                            {quick.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Return Date or Passenger Count - Enhanced */}
                    {isRoundTrip ? (
                      <div className="space-y-3">
                        <Label
                          htmlFor="return-date"
                          className="flex items-center gap-2 text-gray-700 font-semibold"
                        >
                          <div className="p-1.5 bg-secondary/10 rounded-lg">
                            <Calendar className="w-4 h-4 text-secondary" />
                          </div>
                          Ngày về
                        </Label>
                        <div className="relative group">
                          <Input
                            id="return-date"
                            type="date"
                            value={returnDate}
                            onChange={(e) =>
                              setReturnDate(e.target.value)
                            }
                            min={departureDate || today}
                            required={isRoundTrip}
                            className="h-16 border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-base rounded-xl hover:border-gray-300 transition-all shadow-sm group-hover:shadow-md bg-white"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-gray-700 font-semibold">
                          <div className="p-1.5 bg-success/10 rounded-lg">
                            <Users className="w-4 h-4 text-success" />
                          </div>
                          Số hành khách
                        </Label>
                        <div className="flex items-center gap-4 h-16 px-6 border-2 border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              setPassengerCount(
                                Math.max(1, passengerCount - 1),
                              )
                            }
                            disabled={passengerCount <= 1}
                            className="h-11 w-11 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 hover:text-primary disabled:opacity-40 transition-all"
                          >
                            <Minus className="w-5 h-5" />
                          </Button>
                          <span className="flex-1 text-center font-bold text-xl text-gray-900">
                            {passengerCount}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              setPassengerCount(
                                Math.min(
                                  10,
                                  passengerCount + 1,
                                ),
                              )
                            }
                            disabled={passengerCount >= 10}
                            className="h-11 w-11 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 hover:text-primary disabled:opacity-40 transition-all"
                          >
                            <Plus className="w-5 h-5" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                          Tối đa 10 hành khách
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Submit Button - Enhanced */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-16 bg-gradient-to-r from-primary via-primary to-secondary hover:from-primary/90 hover:via-primary/90 hover:to-secondary/90 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl group relative overflow-hidden"
                      disabled={
                        !originId ||
                        !destinationId ||
                        !departureDate ||
                        (isRoundTrip && !returnDate)
                      }
                    >
                      <span className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                      <span className="relative flex items-center justify-center gap-3">
                        <Zap className="w-6 h-6 animate-pulse" />
                        Tìm chuyến tàu ngay
                        <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                    <p className="text-center text-xs text-gray-500 mt-3">
                      <CheckCircle className="w-3 h-3 inline mr-1 text-success" />
                      Miễn phí hủy vé trong 24h đầu tiên
                    </p>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
                Quy trình đơn giản
              </Badge>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
                Cách đặt vé chỉ với 3 bước
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Dễ dàng, nhanh chóng và an toàn
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="relative">
                <Card className="p-6 text-center hover:shadow-railway transition-all group">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl group-hover:scale-110 transition-transform">
                    1
                  </div>
                  <h4 className="font-semibold text-lg mb-2 text-gray-900">
                    Tìm kiếm chuyến tàu
                  </h4>
                  <p className="text-sm text-gray-600">
                    Nhập thông tin ga đi, ga đến và ngày khởi
                    hành
                  </p>
                </Card>
              </div>

              <div className="relative">
                <Card className="p-6 text-center hover:shadow-railway transition-all group">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl group-hover:scale-110 transition-transform">
                    2
                  </div>
                  <h4 className="font-semibold text-lg mb-2 text-gray-900">
                    Chọn ghế và điền thông tin
                  </h4>
                  <p className="text-sm text-gray-600">
                    Chọn ghế yêu thích và nhập thông tin hành
                    khách
                  </p>
                </Card>
              </div>

              <div>
                <Card className="p-6 text-center hover:shadow-railway transition-all group">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl group-hover:scale-110 transition-transform">
                    3
                  </div>
                  <h4 className="font-semibold text-lg mb-2 text-gray-900">
                    Thanh toán và nhận vé
                  </h4>
                  <p className="text-sm text-gray-600">
                    Thanh toán an toàn và nhận vé điện tử ngay
                    lập tức
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Routes Section - Enhanced */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-3 bg-warning/10 text-warning border-warning/20">
                <Star className="w-3 h-3 mr-1 fill-warning" />
                Được yêu thích nhất
              </Badge>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
                Tuyến đường phổ biến
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Khám phá các tuyến đường được đặt nhiều nhất
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {[
                {
                  from: "Hà Nội",
                  to: "Sài Gòn",
                  price: "950.000đ",
                  duration: "30h",
                  trains: "4 chuyến/ngày",
                },
                {
                  from: "Hà Nội",
                  to: "Đà Nẵng",
                  price: "550.000đ",
                  duration: "15h",
                  trains: "6 chuyến/ngày",
                },
                {
                  from: "Sài Gòn",
                  to: "Nha Trang",
                  price: "320.000đ",
                  duration: "8h",
                  trains: "5 chuyến/ngày",
                },
                {
                  from: "Đà Nẵng",
                  to: "Huế",
                  price: "85.000đ",
                  duration: "3h",
                  trains: "8 chuyến/ngày",
                },
              ].map((route, index) => (
                <Card
                  key={index}
                  className="p-5 hover:shadow-railway-lg transition-all cursor-pointer group border-2 hover:border-primary"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="font-semibold text-gray-900">
                          {route.from}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <div className="h-8 w-px bg-gray-300 ml-1"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="font-semibold text-gray-900">
                          {route.to}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>

                  <Separator className="my-3" />

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Thời gian
                      </span>
                      <span className="font-medium">
                        {route.duration}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Train className="w-3 h-3" />
                        Tần suất
                      </span>
                      <span className="font-medium">
                        {route.trains}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">
                        Từ
                      </p>
                      <p className="font-bold text-lg text-primary">
                        {route.price}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary hover:text-white"
                    >
                      Đặt vé
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
                Khách hàng nói gì về chúng tôi
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Hơn 50 triệu khách hàng đã tin tưởng và sử dụng
                dịch vụ
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                {
                  name: "Nguyễn Văn An",
                  location: "Hà Nội",
                  rating: 5,
                  comment:
                    "Đặt vé rất nhanh và tiện lợi. Giao diện dễ sử dụng, thanh toán an toàn. Tôi rất hài lòng với dịch vụ!",
                },
                {
                  name: "Trần Thị Bình",
                  location: "Đà Nẵng",
                  rating: 5,
                  comment:
                    "Dịch vụ tuyệt vời! Tàu chạy đúng giờ, ghế ngồi thoải mái. Hỗ trợ khách hàng rất nhiệt tình.",
                },
                {
                  name: "Lê Minh Cường",
                  location: "Sài Gòn",
                  rating: 5,
                  comment:
                    "Đã sử dụng nhiều lần, luôn ổn định. Giá vé hợp lý, có nhiều ưu đãi cho khách hàng thân thiết.",
                },
              ].map((testimonial, index) => (
                <Card
                  key={index}
                  className="p-6 hover:shadow-railway transition-shadow"
                >
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map(
                      (_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-warning text-warning"
                        />
                      ),
                    )}
                  </div>
                  <Quote className="w-8 h-8 text-primary/20 mb-2" />
                  <p className="text-sm text-gray-600 mb-4 italic">
                    "{testimonial.comment}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-primary">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 bg-railway-gradient text-white">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Sẵn sàng cho chuyến đi tiếp theo?
            </h3>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Đặt vé ngay hôm nay và trải nghiệm hành trình
              tuyệt vời cùng Đường Sắt Việt Nam
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-lg px-8"
                onClick={() =>
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  })
                }
              >
                <Zap className="w-5 h-5 mr-2" />
                Đặt vé ngay
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-[rgb(8,8,8)] hover:bg-white/10 px-8"
              >
                <Phone className="w-5 h-5 mr-2" />
                Liên hệ: 1900 1000
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}