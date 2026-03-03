import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Percent, Gift, Ticket } from 'lucide-react';
import { Button } from './ui/button';

interface Slide {
  id: number;
  title: string;
  description: string;
  image: string;
  icon: typeof Percent | typeof Gift | typeof Ticket;
  color: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Ưu đãi đặc biệt - Giảm đến 30%",
    description: "Áp dụng cho khách hàng đặt vé trước 7 ngày",
    image: "https://images.unsplash.com/photo-1725209285038-a7d2192e74a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWV0bmFtJTIwdHJhaW4lMjBiZWF1dGlmdWwlMjBsYW5kc2NhcGUlMjBzY2VuaWN8ZW58MXx8fHwxNzY5OTk1Mjk4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    icon: Percent,
    color: "from-orange-500/90 to-red-600/90"
  },
  {
    id: 2,
    title: "Tích điểm - Đổi quà hấp dẫn",
    description: "Mỗi chuyến đi tích lũy điểm thưởng",
    image: "https://images.unsplash.com/photo-1596139086800-e5ee0ccf5db7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB0cmFpbiUyMGludGVyaW9yJTIwbHV4dXJ5JTIwY29tZm9ydGFibGV8ZW58MXx8fHwxNzY5OTk1Mjk4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    icon: Gift,
    color: "from-purple-500/90 to-indigo-600/90"
  },
  {
    id: 3,
    title: "Vé tháng - Tiết kiệm đến 40%",
    description: "Dành cho khách hàng thường xuyên",
    image: "https://images.unsplash.com/photo-1764965654176-6af68d05b0b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWlsd2F5JTIwam91cm5leSUyMHRyYXZlbCUyMGFkdmVudHVyZXxlbnwxfHx8fDE3Njk5OTUyOTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    icon: Ticket,
    color: "from-green-500/90 to-teal-600/90"
  }
];

export function PromoSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const currentSlideData = slides[currentSlide];
  const Icon = currentSlideData.icon;

  return (
    <div className="relative w-full h-[350px] md:h-[400px] rounded-2xl overflow-hidden group shadow-railway-lg">
      {/* Background Image */}
      <div className="absolute inset-0 transition-opacity duration-700">
        <img
          src={currentSlideData.image}
          alt={currentSlideData.title}
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${currentSlideData.color}`} />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center items-center text-white px-6 md:px-12 text-center">
        <div className="mb-6 p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
          <Icon className="w-12 h-12 md:w-16 md:h-16" />
        </div>
        <h3 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight max-w-4xl">
          {currentSlideData.title}
        </h3>
        <p className="text-lg md:text-xl lg:text-2xl text-white/95 max-w-2xl font-medium">
          {currentSlideData.description}
        </p>
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 h-12 w-12 rounded-full"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 h-12 w-12 rounded-full"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? 'bg-white w-10 h-2'
                : 'bg-white/50 w-2 h-2 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}