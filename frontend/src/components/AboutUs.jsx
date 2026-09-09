import styles from './AboutUs.module.css';

function AboutUs() {
  return (
    <section className={styles.about}>
      <div className="container">
        <div className={styles.wrapper}>
          <div className={styles.imageWrapper}>
            <img src="/about_us_image.jpeg" alt="About Gulf Coast Trust" />
          </div>
          <div className={styles.content}>
            <h2>About Us</h2>
            <p>
              Gulf Coast Trust offers several personal &amp; business banking services to the communities
              in Baton Rouge, New Orleans, and surrounding Southeast Louisiana areas, as well as Florida
              and Alabama. Banking services include checking and savings accounts with online and mobile
              banking options as well as personal loans, home loans, business loans, and trust and
              brokerage services.
            </p>
            <p>
              Our mission is to strengthen our relationship with our customers by combining the values
              of old fashioned community banking that focus on individualized customer service with
              innovative, competitive banking products and trust and brokerage services.
            </p>
            <p className={styles.tagline}>Simply put, we are The Bank That Cares About You!</p>
            <a href="/about-us/history" className={styles.link}>
              Our History
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutUs;