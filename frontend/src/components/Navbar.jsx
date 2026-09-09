import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';

// SVG icons for username and password fields
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

function Navbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      {/* Top Utility Bar - Desktop only */}
      <div className={styles.utilityBar}>
        <div className={`container ${styles.utilityInner}`}>
          <span className={styles.utilityLeft}>
            <img src="/fdic.svg" alt="FDIC" className={styles.fdicLogo} />
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
          <button className={styles.hamburger} aria-label="Menu">
            <span className={styles.bar}></span>
            <span className={styles.bar}></span>
            <span className={styles.bar}></span>
          </button>

          <div className={styles.logo}>
            <Link to="/">
              <img src="/logo.svg" alt="Gulf Coast Trust" />
            </Link>
          </div>

          <button className={styles.mobileLoginBtn} onClick={openModal}>
            Login
          </button>

          <ul className={styles.navLinks}>
            <li><Link to="/personal">Personal</Link></li>
            <li><Link to="/business">Business</Link></li>
            <li><Link to="/about-us">About Us</Link></li>
            <li><Link to="/resources">Resources</Link></li>
            <li>
              <button onClick={openModal} className={styles.loginBtn}>
                Login
              </button>
            </li>
          </ul>
        </div>

        <div className={styles.mobileFdic}>
          <img src="/fdic.svg" alt="FDIC" className={styles.mobileFdicLogo} />
          <span className={styles.mobileFdicText}>
            FDIC-Insured – Backed by the full faith and credit of the U.S. Government
          </span>
        </div>
      </nav>

      {/* Login Overlay - Large Panel */}
      {isModalOpen && (
        <div className={styles.loginOverlay} onClick={closeModal}>
          <div className={styles.loginPanel} onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button className={styles.modalClose} onClick={closeModal}>×</button>

            <div className={styles.loginContent}>
              <h2 className={styles.loginSmallHeading}>DIGITAL BANKING LOGIN</h2>
              <h1 className={styles.loginMainHeading}>Access your accounts.</h1>

              <form className={styles.loginForm} onSubmit={(e) => e.preventDefault()}>
                <div className={styles.inputGroup}>
                  <div className={styles.inputIcon}>
                    <UserIcon />
                  </div>
                  <input
                    type="text"
                    placeholder="Username"
                    className={styles.loginInput}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <div className={styles.inputIcon}>
                    <LockIcon />
                  </div>
                  <input
                    type="password"
                    placeholder="Password"
                    className={styles.loginInput}
                  />
                </div>

                <div className={styles.loginActions}>
                  <a href="#" className={styles.forgotPassword}>Forgot Password?</a>
                  <button type="submit" className={styles.loginSubmitBtn}>
                    LOG IN
                    <span className={styles.btnUnderline}></span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;