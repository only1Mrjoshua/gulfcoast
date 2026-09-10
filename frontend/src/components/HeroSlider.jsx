// src/components/HeroSlider.jsx
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    image: '/hero-slide-1.jpg',
    headline: 'A Card Just For You',
    copy: 'Gulf Coast Trust offers a free contactless debit card for both personal and business accounts.',
    link: '/personal/debit-card',
  },
  {
    id: 2,
    image: '/hero-slide-2.jpg',
    headline: 'Co-Branded School Debit Cards',
    copy: 'Students, alumni, and supporters can show pride in their school with an affinity card from Gulf Coast Trust.',
    link: '/personal/school-cards',
  },
];

function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrent(index);
  };

  // Auto-advance every 7 seconds (pause on hover/focus)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 7000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section
      className="relative h-[280px] overflow-hidden sm:h-[320px] md:h-[420px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {/* Slides */}
      <div className="relative h-full w-full">
        {slides.map((slide, index) => {
          const isActive = index === current;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              {/* Dark overlay */}
              <div className="flex h-full w-full items-center bg-black/60">
                {/* Content */}
                <div className="container-bank max-w-[700px] text-white">
                  <h1 className="font-serif text-3xl font-black leading-tight text-white sm:text-4xl md:text-[52px]">
                    {slide.headline}
                  </h1>

                  <p className="mt-4 mb-7 text-sm leading-relaxed text-white/90 sm:text-base md:text-lg">
                    {slide.copy}
                  </p>

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Prev control */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 z-10 inline-flex -translate-y-1/2 items-center justify-center bg-black/30 p-2 text-white transition-colors hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:p-2.5"
      >
        <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" strokeWidth={2} />
      </button>

      {/* Next control */}
      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 z-10 inline-flex -translate-y-1/2 items-center justify-center bg-black/30 p-2 text-white transition-colors hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:p-2.5"
      >
        <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" strokeWidth={2} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-3">
        {slides.map((_, index) => {
          const isActive = index === current;
          return (
            <button
              key={index}
              type="button"
              aria-label={`Slide ${index + 1}`}
              onClick={() => goToSlide(index)}
              className={`h-3.5 w-3.5 border-2 border-white transition-colors ${
                isActive ? 'bg-white' : 'bg-transparent hover:bg-white/40'
              }`}
            />
          );
        })}
      </div>
    </section>
  );
}

export default HeroSlider;