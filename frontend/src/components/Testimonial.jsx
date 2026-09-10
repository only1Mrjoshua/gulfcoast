// src/components/Testimonial.jsx
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    quote: '"Thank you so much for your personal care toward me personally, not just my financial assets. What a wonderful display of humanity in an era of personal distance and impersonal online interaction."',
    name: 'Seth S.',
    city: 'Boston Street',
  },
  {
    id: 2,
    quote: '"Everyone we dealt with at the Hammond office was top notch. They quickly assessed our needs and worked to get us our loan. They are absolutely the best!!!"',
    name: 'Rebecca B.',
    city: 'Hammond',
  },
  {
    id: 3,
    quote: '"The Gulf Coast team secured me great terms and provided an enjoyable efficient process. I highly recommend them for anyone needing financing."',
    name: 'Brad D.',
    city: 'Hammond',
  },
  {
    id: 4,
    quote: '"I came to have so much confidence in the folks at Gulf Coast that I stuck with them when I found a better-paying job out of state and placed an offer on a home in much better condition."',
    name: 'Don A.',
    city: 'Veterans',
  },
  {
    id: 5,
    quote: '"Amazing resource working with such highly trained, thoroughly experienced, and capable personnel. They are personable. They listen well. They relate well. [...] Simply could not imagine a better banking experience. Seriously."',
    name: 'Gerald S.',
    city: 'Magazine',
  },
  {
    id: 6,
    quote: '"Used Gulf Coast Trust for a mortgage loan. Had a great experience particularly with my loan officer. I will use them again for future real estate projects. Highly recommend."',
    name: 'India G.',
    city: 'Slidell',
  },
];

function Testimonial() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index) => {
    setCurrent(index);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 7000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section
      className="relative bg-white py-10 text-center text-body md:py-12"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="container-bank relative">
        {/* Slides */}
        <div className="relative min-h-[200px]">
          {testimonials.map((item, index) => {
            const isActive = index === current;
            return (
              <div
                key={item.id}
                className={`px-2 transition-opacity duration-700 ease-in-out sm:px-8 md:px-[60px] ${
                  isActive
                    ? 'relative opacity-100'
                    : 'pointer-events-none absolute inset-x-0 top-0 opacity-0'
                }`}
              >
                <blockquote className="mx-auto mb-4 max-w-[900px] font-sans text-lg italic leading-[30px] text-[#5295a0] sm:text-2xl sm:leading-[38px] md:text-[30px] md:leading-[48px]">
                  {item.quote}
                </blockquote>

                <cite className="block not-italic">
                  <div className="text-sm text-[#999999] sm:text-base md:text-[1.1rem]">
                    {item.name}
                  </div>
                  {item.city && (
                    <div className="mt-0.5 text-xs text-[#aaaaaa] sm:text-sm md:text-[0.95rem]">
                      {item.city}
                    </div>
                  )}
                </cite>
              </div>
            );
          })}
        </div>

        {/* Prev */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous testimonial"
          className="absolute left-1 top-1/2 z-10 inline-flex -translate-y-1/2 items-center justify-center bg-black/[0.08] p-1.5 text-[#333] transition-colors hover:bg-black/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:p-2 md:left-2.5"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
        </button>

        {/* Next */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next testimonial"
          className="absolute right-1 top-1/2 z-10 inline-flex -translate-y-1/2 items-center justify-center bg-black/[0.08] p-1.5 text-[#333] transition-colors hover:bg-black/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:p-2 md:right-2.5"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
        </button>

        {/* Dots */}
        <div className="mt-8 flex justify-center gap-3">
          {testimonials.map((_, index) => {
            const isActive = index === current;
            return (
              <button
                key={index}
                type="button"
                aria-label={`Testimonial ${index + 1}`}
                onClick={() => goToSlide(index)}
                className={`h-3 w-3 border-2 border-[#5295a0] transition-colors ${
                  isActive ? 'bg-[#5295a0]' : 'bg-transparent hover:bg-[#5295a0]/30'
                }`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Testimonial;