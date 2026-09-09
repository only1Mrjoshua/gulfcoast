import { useState, useEffect } from 'react';
import styles from './HeroSlider.module.css';

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

  // Auto‑advance every 7 seconds (pause on hover/focus)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 7000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section
      className={styles.slider}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className={styles.slidesWrapper}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`${styles.slide} ${index === current ? styles.active : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className={styles.overlay}>
              <div className={`container ${styles.content}`}>
                <h1>{slide.headline}</h1>
                <p>{slide.copy}</p>
                <a href={slide.link} className={styles.ctaBtn}>
                  {slide.cta}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <button className={`${styles.control} ${styles.prev}`} onClick={prevSlide}>
        ‹
      </button>
      <button className={`${styles.control} ${styles.next}`} onClick={nextSlide}>
        ›
      </button>

      {/* Dots – now only 2 dots */}
      <div className={styles.dots}>
        {slides.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${index === current ? styles.activeDot : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default HeroSlider;