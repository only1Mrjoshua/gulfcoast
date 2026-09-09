import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
        {/* Top Utility Bar */}
        <div className={styles.utilityBar}>
        <div className={`container ${styles.utilityInner}`}>
            <span className={styles.utilityLeft}>
            <img
                src="/fdic.svg"
                alt="FDIC"
                className={styles.fdicLogo}
            />
            <span className={styles.fdicText}>
                FDIC-Insured – Backed by the full faith and credit of the U.S. Government
            </span>
            </span>

            <div className={styles.utilityRight}>
            <Link to="/locations">Locations</Link>
            <Link to="/contact">Contact Us</Link>
            </div>
        </div>
        </div>

      {/* Main Navigation */}
      <nav className={styles.navbar}>
        <div className={`container ${styles.navInner}`}>
          <div className={styles.logo}>
            <Link to="/">
              <img src="/logo.svg" alt="Gulf Coast Trust" />
            </Link>
          </div>

          <button
            className={styles.hamburger}
            onClick={toggleMenu}
            aria-label="Toggle navigation"
          >
            <span className={styles.bar}></span>
            <span className={styles.bar}></span>
            <span className={styles.bar}></span>
          </button>

          <ul className={`${styles.navLinks} ${isMenuOpen ? styles.open : ''}`}>
            <li>
              <Link to="/login" className={styles.loginBtn}>
                Login
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}

export default Navbar;