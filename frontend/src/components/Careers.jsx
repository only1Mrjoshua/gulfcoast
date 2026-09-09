import styles from './Careers.module.css';

function Careers() {
  return (
    <section className={styles.careers}>
      <div className="container">
        <div className={styles.wrapper}>
          <div className={styles.content}>
            <h2>Careers</h2>
            <p>
              Looking for a rewarding career with a stable and well-respected financial institution? 
              We are a dynamic and growing bank committed to the customers and communities we serve.
            </p>
            <p>
              Gulf Coast Trust is growing and we are looking for energetic employees who share our 
              passion for serving our customers and our communities.
            </p>
            <p>
              We offer challenging work, competitive pay, excellent benefits, and a pleasant working 
              environment with opportunities for advancement. We welcome your interest in growing 
              your career with us.
            </p>
          </div>
          <div className={styles.imageWrapper}>
            <img src="/comejoinourteam.png" alt="Join our team" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Careers;