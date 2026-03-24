import { useState, useEffect } from "react";
import {
  Train,
  MapPin,
  Clock,
  Calendar,
  Search,
  Filter,
  ChevronRight,
  ArrowLeft,
  Navigation,
  Loader2,
  CheckCircle,
  AlertCircle,
  Radio,
  TrendingUp,
  Info,
  Zap,
  Users,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { stations } from "../data/mockData";

interface TrainSchedulePageProps {
  onBack: () => void;
}

interface TrainStatus {
  id: string;
  code: string;
  name: string;
  route: {
    origin: string;
    destination: string;
  };
  currentStation: string;
  nextStation: string;
  progress: number; // 0-100
  status: "on-time" | "delayed" | "early" | "arrived";
  delay: number; // minutes
  departureTime: string;
  arrivalTime: string;
  stations: {
    name: string;
    arrivalTime: string;
    departureTime: string;
    status: "completed" | "current" | "upcoming";
    platform: string;
  }[];
  speed: number; // km/h
  occupancy: number; // 0-100
}

// Mock real-time train data
const generateMockTrains = (): TrainStatus[] => {
  return [
    {
      id: "se1",
      code: "SE1",
      name: "Thống Nhất",
      route: {
        origin: "Hà Nội",
        destination: "Sài Gòn",
      },
      currentStation: "Vinh",
      nextStation: "Đồng Hới",
      progress: 35,
      status: "on-time",
      delay: 0,
      departureTime: "19:00",
      arrivalTime: "04:30",
      speed: 65,
      occupancy: 78,
      stations: [
        {
          name: "Hà Nội",
          arrivalTime: "--",
          departureTime: "19:00",
          status: "completed",
          platform: "1",
        },
        {
          name: "Nam Định",
          arrivalTime: "20:45",
          departureTime: "20:50",
          status: "completed",
          platform: "2",
        },
        {
          name: "Thanh Hóa",
          arrivalTime: "23:15",
          departureTime: "23:20",
          status: "completed",
          platform: "3",
        },
        {
          name: "Vinh",
          arrivalTime: "01:45",
          departureTime: "01:50",
          status: "current",
          platform: "2",
        },
        {
          name: "Đồng Hới",
          arrivalTime: "04:30",
          departureTime: "04:35",
          status: "upcoming",
          platform: "1",
        },
        {
          name: "Đông Hà",
          arrivalTime: "06:15",
          departureTime: "06:20",
          status: "upcoming",
          platform: "2",
        },
        {
          name: "Huế",
          arrivalTime: "07:30",
          departureTime: "07:40",
          status: "upcoming",
          platform: "1",
        },
        {
          name: "Đà Nẵng",
          arrivalTime: "10:00",
          departureTime: "10:15",
          status: "upcoming",
          platform: "3",
        },
        {
          name: "Sài Gòn",
          arrivalTime: "04:30",
          departureTime: "--",
          status: "upcoming",
          platform: "5",
        },
      ],
    },
    {
      id: "se2",
      code: "SE2",
      name: "Thống Nhất",
      route: {
        origin: "Sài Gòn",
        destination: "Hà Nội",
      },
      currentStation: "Nha Trang",
      nextStation: "Tuy Hòa",
      progress: 42,
      status: "delayed",
      delay: 15,
      departureTime: "18:30",
      arrivalTime: "04:00",
      speed: 58,
      occupancy: 92,
      stations: [
        {
          name: "Sài Gòn",
          arrivalTime: "--",
          departureTime: "18:30",
          status: "completed",
          platform: "5",
        },
        {
          name: "Biên Hòa",
          arrivalTime: "19:30",
          departureTime: "19:35",
          status: "completed",
          platform: "2",
        },
        {
          name: "Nha Trang",
          arrivalTime: "03:45",
          departureTime: "04:00",
          status: "current",
          platform: "1",
        },
        {
          name: "Tuy Hòa",
          arrivalTime: "06:30",
          departureTime: "06:35",
          status: "upcoming",
          platform: "2",
        },
        {
          name: "Hà Nội",
          arrivalTime: "04:00",
          departureTime: "--",
          status: "upcoming",
          platform: "1",
        },
      ],
    },
    {
      id: "se3",
      code: "SE3",
      name: "Thống Nhất",
      route: {
        origin: "Hà Nội",
        destination: "Đà Nẵng",
      },
      currentStation: "Huế",
      nextStation: "Đà Nẵng",
      progress: 85,
      status: "early",
      delay: -5,
      departureTime: "06:00",
      arrivalTime: "19:30",
      speed: 72,
      occupancy: 65,
      stations: [
        {
          name: "Hà Nội",
          arrivalTime: "--",
          departureTime: "06:00",
          status: "completed",
          platform: "2",
        },
        {
          name: "Thanh Hóa",
          arrivalTime: "11:00",
          departureTime: "11:05",
          status: "completed",
          platform: "2",
        },
        {
          name: "Vinh",
          arrivalTime: "14:30",
          departureTime: "14:35",
          status: "completed",
          platform: "1",
        },
        {
          name: "Huế",
          arrivalTime: "18:00",
          departureTime: "18:10",
          status: "current",
          platform: "3",
        },
        {
          name: "Đà Nẵng",
          arrivalTime: "19:30",
          departureTime: "--",
          status: "upcoming",
          platform: "1",
        },
      ],
    },
    {
      id: "se4",
      code: "SE4",
      name: "Thống Nhất",
      route: {
        origin: "Đà Nẵng",
        destination: "Hà Nội",
      },
      currentStation: "Đà Nẵng",
      nextStation: "Huế",
      progress: 5,
      status: "on-time",
      delay: 0,
      departureTime: "21:00",
      arrivalTime: "10:30",
      speed: 0,
      occupancy: 45,
      stations: [
        {
          name: "Đà Nẵng",
          arrivalTime: "--",
          departureTime: "21:00",
          status: "current",
          platform: "2",
        },
        {
          name: "Huế",
          arrivalTime: "22:30",
          departureTime: "22:40",
          status: "upcoming",
          platform: "1",
        },
        {
          name: "Hà Nội",
          arrivalTime: "10:30",
          departureTime: "--",
          status: "upcoming",
          platform: "3",
        },
      ],
    },
  ];
};

export function TrainSchedulePage({ onBack }: TrainSchedulePageProps) {
  const [trains, setTrains] = useState<TrainStatus[]>(generateMockTrains());
  const [selectedTrain, setSelectedTrain] = useState<TrainStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRoute, setFilterRoute] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTrains((prevTrains) =>
        prevTrains.map((train) => {
          // Simulate progress increment
          const newProgress = Math.min(train.progress + 0.5, 100);
          
          // Update current station if progress crosses threshold
          let currentStationIndex = train.stations.findIndex(
            (s) => s.status === "current",
          );
          
          return {
            ...train,
            progress: newProgress,
            speed: train.speed > 0 ? train.speed + (Math.random() - 0.5) * 5 : 0,
          };
        }),
      );
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string, delay: number) => {
    switch (status) {
      case "on-time":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Đúng giờ
          </Badge>
        );
      case "delayed":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Trễ {delay} phút
          </Badge>
        );
      case "early":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <TrendingUp className="w-3 h-3 mr-1" />
            Sớm {Math.abs(delay)} phút
          </Badge>
        );
      case "arrived":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Đã đến
          </Badge>
        );
      default:
        return null;
    }
  };

  const filteredTrains = trains.filter((train) => {
    const matchesSearch =
      train.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      train.route.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      train.route.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      train.currentStation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRoute =
      filterRoute === "all" ||
      `${train.route.origin}-${train.route.destination}` === filterRoute;

    const matchesStatus =
      filterStatus === "all" || train.status === filterStatus;

    return matchesSearch && matchesRoute && matchesStatus;
  });

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
                  Lịch Trình Tàu Real-time
                </p>
              </div>
            </div>

            {/* Back Button */}
            <Button
              onClick={onBack}
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
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg">
                <Navigation className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Theo Dõi Tàu Real-time
                </h2>
                <p className="text-gray-600">
                  Xem vị trí và trạng thái tàu đang vận hành
                </p>
              </div>
            </div>

            {/* Live Indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-red-100 border-2 border-red-200 rounded-full">
                <div className="relative">
                  <Radio className="w-4 h-4 text-red-600" />
                  <span className="absolute inset-0 animate-ping">
                    <Radio className="w-4 h-4 text-red-600 opacity-75" />
                  </span>
                </div>
                <span className="text-sm font-bold text-red-800">
                  CẬP NHẬT TRỰC TIẾP
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Cập nhật mỗi 3 giây
              </Badge>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <Card className="p-6 mb-8 shadow-xl border-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Tìm mã tàu, ga..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 border-2"
                  />
                </div>
              </div>

              {/* Route Filter */}
              <div>
                <Select value={filterRoute} onValueChange={setFilterRoute}>
                  <SelectTrigger className="h-11 border-2">
                    <SelectValue placeholder="Tất cả tuyến" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả tuyến</SelectItem>
                    <SelectItem value="Hà Nội-Sài Gòn">
                      Hà Nội → Sài Gòn
                    </SelectItem>
                    <SelectItem value="Sài Gòn-Hà Nội">
                      Sài Gòn → Hà Nội
                    </SelectItem>
                    <SelectItem value="Hà Nội-Đà Nẵng">
                      Hà Nội → Đà Nẵng
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-11 border-2">
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="on-time">Đúng giờ</SelectItem>
                    <SelectItem value="delayed">Trễ</SelectItem>
                    <SelectItem value="early">Sớm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Train List */}
          <div className="grid grid-cols-1 gap-6">
            {filteredTrains.map((train) => (
              <Card
                key={train.id}
                className="p-6 hover:shadow-2xl transition-all cursor-pointer border-2 hover:border-primary group"
                onClick={() => setSelectedTrain(train)}
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left: Train Info */}
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Train className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {train.code} - {train.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {train.route.origin} → {train.route.destination}
                            </p>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(train.status, train.delay)}
                    </div>

                    {/* Current Location */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <MapPin className="w-6 h-6 text-blue-600" />
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full animate-pulse"></span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-blue-700 font-semibold mb-1">
                            ĐANG Ở GA
                          </p>
                          <p className="text-lg font-bold text-blue-900">
                            {train.currentStation}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-blue-700 font-semibold mb-1">
                            GA TIẾP THEO
                          </p>
                          <p className="text-sm font-bold text-blue-900">
                            {train.nextStation}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                        <span className="font-semibold">
                          {train.route.origin}
                        </span>
                        <span className="font-bold text-primary">
                          {train.progress.toFixed(1)}% hoàn thành
                        </span>
                        <span className="font-semibold">
                          {train.route.destination}
                        </span>
                      </div>
                      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-secondary to-primary rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${train.progress}%` }}
                        >
                          <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                        </div>
                        {/* Train Icon on Progress */}
                        <div
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-1000"
                          style={{ left: `${train.progress}%` }}
                        >
                          <div className="p-1 bg-white rounded-full shadow-lg border-2 border-primary">
                            <Train className="w-3 h-3 text-primary" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="w-3.5 h-3.5 text-gray-600" />
                          <span className="text-xs text-gray-600 font-semibold">
                            Tốc độ
                          </span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                          {train.speed.toFixed(0)} km/h
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-3.5 h-3.5 text-gray-600" />
                          <span className="text-xs text-gray-600 font-semibold">
                            Khởi hành
                          </span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                          {train.departureTime}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-3.5 h-3.5 text-gray-600" />
                          <span className="text-xs text-gray-600 font-semibold">
                            Lấp đầy
                          </span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                          {train.occupancy}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: View Details Button */}
                  <div className="flex lg:flex-col items-center justify-center lg:justify-between gap-4 lg:w-32">
                    <Button
                      className="w-full lg:w-auto bg-gradient-to-br from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 group-hover:scale-105 transition-transform shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTrain(train);
                      }}
                    >
                      <Info className="w-4 h-4 mr-2" />
                      Chi tiết
                    </Button>
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all hidden lg:block" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredTrains.length === 0 && (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Không tìm thấy tàu
              </h3>
              <p className="text-gray-600">
                Thử điều chỉnh bộ lọc hoặc tìm kiếm khác
              </p>
            </Card>
          )}
        </div>
      </main>

      {/* Train Detail Modal */}
      <Dialog open={!!selectedTrain} onOpenChange={() => setSelectedTrain(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedTrain && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Train className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {selectedTrain.code} - {selectedTrain.name}
                    </div>
                    <div className="text-sm font-normal text-gray-600">
                      {selectedTrain.route.origin} →{" "}
                      {selectedTrain.route.destination}
                    </div>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  Xem chi tiết về lịch trình và trạng thái của tàu
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Current Status */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-blue-900 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Vị trí hiện tại
                    </h4>
                    {getStatusBadge(selectedTrain.status, selectedTrain.delay)}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-blue-700 font-semibold mb-1">
                        ĐANG Ở
                      </p>
                      <p className="text-xl font-bold text-blue-900">
                        {selectedTrain.currentStation}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-700 font-semibold mb-1">
                        ĐẾN GA TIẾP THEO
                      </p>
                      <p className="text-xl font-bold text-blue-900">
                        {selectedTrain.nextStation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">
                    Tiến trình hành trình
                  </h4>
                  <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000"
                      style={{ width: `${selectedTrain.progress}%` }}
                    ></div>
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                      style={{ left: `${selectedTrain.progress}%` }}
                    >
                      <div className="p-1.5 bg-white rounded-full shadow-lg border-2 border-primary">
                        <Train className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-sm font-bold text-primary mt-2">
                    {selectedTrain.progress.toFixed(1)}% hoàn thành
                  </p>
                </div>

                {/* Station Timeline */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-4">
                    Lịch trình các ga
                  </h4>
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300"></div>

                    {/* Stations */}
                    <div className="space-y-4">
                      {selectedTrain.stations.map((station, index) => (
                        <div key={index} className="relative pl-14">
                          {/* Timeline Dot */}
                          <div
                            className={`absolute left-4 top-1 w-5 h-5 rounded-full border-4 z-10 ${
                              station.status === "completed"
                                ? "bg-green-500 border-green-200"
                                : station.status === "current"
                                  ? "bg-blue-500 border-blue-200 animate-pulse"
                                  : "bg-gray-300 border-gray-200"
                            }`}
                          ></div>

                          {/* Station Card */}
                          <div
                            className={`border-2 rounded-lg p-4 ${
                              station.status === "current"
                                ? "border-blue-500 bg-blue-50"
                                : station.status === "completed"
                                  ? "border-green-200 bg-green-50"
                                  : "border-gray-200 bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-bold text-gray-900">
                                {station.name}
                              </h5>
                              <Badge
                                variant="outline"
                                className="text-xs"
                              >
                                Nền tảng {station.platform}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-gray-600">
                                  Đến:{" "}
                                </span>
                                <span className="font-semibold">
                                  {station.arrivalTime}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Đi:{" "}
                                </span>
                                <span className="font-semibold">
                                  {station.departureTime}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-sm text-gray-600 font-semibold">
                        Tốc độ hiện tại
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedTrain.speed.toFixed(0)} km/h
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-sm text-gray-600 font-semibold">
                        Tỷ lệ lấp đầy
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedTrain.occupancy}%
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}