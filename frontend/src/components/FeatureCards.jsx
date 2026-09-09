import styles from './FeatureCards.module.css';

const features = [
  {
    title: 'Interest Checking',
    description:
      'Earn interest on your balance with an Interest Checking Account featuring no monthly service fee and no minimum balance required.',
    link: '/personal/checking',
    image: '/homepage_pic_2.png',
  },
  {
    title: 'Mortgage Loans',
    description:
      'Searching for a home? We offer a variety of loan programs to fit your needs. Connect with one of our mortgage lenders and start the pre-qualification process today.',
    link: '/personal/mortgage',
    image: '/smaller_homepage_pic_2.png',
  },
  {
    title: 'Business Solutions',
    description:
      'No matter how large or small your business may be, save time and money through a variety of solutions designed to fit your needs.',
    link: '/business/solutions',
    image: '/homepage_pic_1.png',
  },
];

function FeatureCards() {
  return (
    <section className={`section-padding ${styles.features}`}>
      <div className="container">
        <div className={styles.grid}>
          {features.map((item, index) => (
            <div className={styles.card} key={index}>
              <div className={styles.imageWrapper}>
                <img src={item.image} alt={item.title} />
                <div className={styles.tealLine}></div>
              </div>
              <div className={styles.cardContent}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.localBanner}>
          <h2>LOCALLY OWNED AND OPERATED</h2>
          <p>Helping our customers achieve their financial goals</p>
        </div>
      </div>
    </section>
  );
}

export default FeatureCards;