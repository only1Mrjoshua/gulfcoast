import { Link } from 'react-router-dom';
import styles from './Locations.module.css';

function Locations() {
  return (
    <section className={styles.locations}>
      <div className="container">
        <div className={styles.textBox}>
          <h2>LOCATIONS &amp; ATMS WHERE YOU NEED TO FIND THEM</h2>
          <Link to="/locations" className={styles.subtextLink}>
            LIST OF LOCATIONS
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Locations;