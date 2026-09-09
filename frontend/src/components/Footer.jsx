import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerInner}>
          {/* Left: lender & member badges */}
          <div className={styles.badges}>
            <img src="/lender.svg" alt="Lender" className={styles.badge} />
            <img src="/member.svg" alt="Member" className={styles.badge} />
          </div>

          {/* Center: copyright & legal links – exact three lines from image */}
          <div className={styles.center}>
            <p className={styles.copyright}>
              &copy; {currentYear} Gulf Coast Bank &amp; Trust
            </p>
            <div className={styles.legalLinks}>
              <span className={styles.line}>
                <Link to="/privacy">Internet Privacy Policy and Security Statement</Link>
                {' | '}
                <Link to="/security">Online Security</Link>
                {' | '}
              </span>
              <span className={styles.line}>
                <Link to="/accessibility">Accessibility Statement</Link>
                {' | '}
                <Link to="/ccpa">CCPA</Link>
                {' | '}
                <span className={styles.nmls}>NMLS #450086</span>
              </span>
            </div>
          </div>

          {/* Right: social media */}
          <div className={styles.social}>
            <a
              href="https://web.facebook.com/GulfCoastBank/?_rdc=1&_rdr#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <img src="/facebook.svg" alt="Facebook" />
            </a>
            <a
              href="https://www.instagram.com/gulfcoastbank/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <img src="/instagram.svg" alt="Instagram" />
            </a>
            <a
              href="https://www.youtube.com/channel/UC14o2XewLx24IBnT0S534ig?view_as=subscriber"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <img src="/youtube.svg" alt="YouTube" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;