import { useState, useEffect } from 'react';
import styles from './Testimonial.module.css';

const testimonials = [
  {
    id: 1,
    quote: '"Thank you so much for your personal care toward me personally, not just my financial assets. What a wonderful display of humanity in an era of personal distance and impersonal online interaction."',
    name: 'Seth S.',
    city: 'Boston Street', // now appears below name
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
      className={styles.testimonial}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="container">
        <div className={styles.sliderWrapper}>
          {testimonials.map((item, index) => (
            <div
              key={item.id}
              className={`${styles.slide} ${index === current ? styles.active : ''}`}
            >
              <blockquote>{item.quote}</blockquote>
              <cite>
                <div className={styles.name}>{item.name}</div>
                {item.city && <div className={styles.location}>{item.city}</div>}
              </cite>
            </div>
          ))}
        </div>

        <button className={`${styles.control} ${styles.prev}`} onClick={prevSlide}>
          ‹
        </button>
        <button className={`${styles.control} ${styles.next}`} onClick={nextSlide}>
          ›
        </button>

        <div className={styles.dots}>
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === current ? styles.activeDot : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonial;