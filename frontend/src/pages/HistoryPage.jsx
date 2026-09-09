import styles from './HistoryPage.module.css';

function HistoryPage() {
  return (
    <div className={styles.historyPage}>
      {/* Hero Section - Image Only */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay}>
          {/* No text in hero - just the image with overlay */}
        </div>
      </section>

      {/* Content Section */}
      <div className={styles.contentSection}>
        <div className="container">
          <div className={styles.historyContent}>
            <h1 className={styles.pageTitle}>About Us</h1>
            <h2 className={styles.pageSubtitle}>Local roots and rich in history</h2>

            <h3 className={styles.sectionHeading}>Welcome to Gulf Coast Bank &amp; Trust Company</h3>
            <p className={styles.paragraph}>
              Gulf Coast Bank &amp; Trust Company offers several personal &amp; business banking services to the communities 
              in Baton Rouge, New Orleans, and surrounding Southeast Louisiana areas. Banking services include checking and 
              savings accounts with online and mobile banking options as well as personal loans, home loans, business loans, 
              and trust and brokerage services.
            </p>
            <p className={styles.paragraph}>
              Our mission is to strengthen our relationship with our customers by combining the values of old fashioned 
              community banking that focus on individualized customer service with innovative, competitive banking products 
              and trust and brokerage services. Simply put, we are <strong>The Bank That Cares About You!</strong>
            </p>
            <p className={styles.paragraph}>
              To learn more, phone us at <a href="tel:18002232060" className={styles.inlineLink}>1-800-223-2060</a>, 
              email <a href="mailto:callcenter@gulfbank.com" className={styles.inlineLink}>callcenter@gulfbank.com</a>, 
              or fill out our banker's appointment request today.
            </p>

            <hr className={styles.divider} />

            <h3 className={styles.sectionHeading}>History</h3>
            <p className={styles.paragraph}>
              In 1883, when Gulf Coast Bank was originally founded as American Savings, banking and life itself were much 
              simpler. Machines didn't dominate every walk of life, and banking was a matter of people talking to people – 
              and building the trust it takes to do business with each other.
            </p>
            <p className={styles.paragraph}>
              In 1990, a group of local investors led by Bank Chairman and CEO Guy T. Williams took over American Savings. 
              They shared a vision of building a bank that adhered to the old principles of customer service, yet backed 
              them with the most powerful of today's banking technologies. The result is a true community bank, able to 
              provide individuals and businesses with the strength and resources they need to succeed – and able to recognize 
              each of them individually when they walk through the front door of their local Gulf Coast Bank office.
            </p>
            <p className={styles.paragraph}>
              Gulf Coast's philosophy remains people-oriented. We help our customers get what they want, one on one. 
              Banking today is more complicated, but that doesn't mean it has to be an ordeal. We work with our customers 
              individually to match our services to their needs. We make banking easy and secure for our customers by 
              providing straight talk instead of the old run-around. This is the secret of our continued success.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistoryPage;