import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';

function Navbar() {
  return (
    <>
      {/* Top Utility Bar - Desktop only */}
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
          {/* Hamburger - Visible on mobile (optional, can be removed) */}

          {/* Logo - Center */}
          <div className={styles.logo}>
            <Link to="/">
              <img src="/logo.svg" alt="Gulf Coast Trust" />
            </Link>
          </div>

          {/* Mobile Login Button - Right side */}
          <Link to="/login" className={styles.mobileLoginBtn}>
            Login
          </Link>

          {/* Desktop Navigation Links */}
          <ul className={styles.navLinks}>
            <li><Link to="/personal">Personal</Link></li>
            <li><Link to="/business">Business</Link></li>
            <li><Link to="/about-us">About Us</Link></li>
            <li><Link to="/resources">Resources</Link></li>
            <li>
              <Link to="/login" className={styles.loginBtn}>
                Login
              </Link>
            </li>
          </ul>
        </div>

        {/* Mobile FDIC - Below the navbar */}
        <div className={styles.mobileFdic}>
          <img src="/fdic.svg" alt="FDIC" className={styles.mobileFdicLogo} />
          <span className={styles.mobileFdicText}>
            FDIC-Insured – Backed by the full faith and credit of the U.S. Government
          </span>
        </div>
      </nav>
    </>
  );
}

export default Navbar;