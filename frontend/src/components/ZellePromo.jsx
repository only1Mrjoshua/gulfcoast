import styles from './ZellePromo.module.css';

function ZellePromo() {
  return (
    <section className={`section-padding ${styles.promo}`}>
      <div className="container">
        <div className={styles.wrapper}>
          <div className={styles.content}>
            <img src="/zelle_logo_for_hp.png" alt="Zelle" className={styles.zelleLogo} />
            <ul className={styles.bullets}>
              <li>
                Fast, easy way to send and receive money to friends and family<sup>5</sup>
              </li>
              <li>Send money directly from your account to enrolled recipients in minutes</li>
              <li>Send from the convenience of online banking or our mobile app</li>
              <li>Your money and information is safe and secure</li>
            </ul>
          </div>
          <div className={styles.imageWrapper}>
            <img src="/zelle_gif.gif" alt="Zelle mobile app" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default ZellePromo;