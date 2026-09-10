// src/components/Footer.jsx
import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#262A2D] py-6 text-white sm:py-7">
      <div className="container-bank">
        <div className="flex flex-col items-center gap-5 md:flex-row md:items-center md:justify-between md:gap-5">
          {/* Left: lender & member badges */}
          <div className="flex shrink-0 items-center justify-center gap-3">
            <img
              src="/lender.svg"
              alt="Lender"
              className="block h-[30px] w-auto brightness-0 invert sm:h-10"
            />
            <img
              src="/member.svg"
              alt="Member"
              className="block h-[30px] w-auto brightness-0 invert sm:h-10"
            />
          </div>

          {/* Center: copyright & legal links */}
          <div className="min-w-0 w-full flex-1 text-left md:w-auto">
            <p className="mb-1 text-[0.85rem] leading-snug text-white sm:text-base">
              &copy; {currentYear} Gulf Coast Bank &amp; Trust
            </p>

            <div className="flex flex-wrap gap-x-1.5 gap-y-1 text-[0.7rem] leading-snug text-white sm:text-[0.85rem]">
              <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
                <Link
                  to="/privacy"
                  className="text-white transition-colors hover:text-[#cccccc] hover:underline"
                >
                  Internet Privacy Policy and Security Statement
                </Link>
                <span aria-hidden="true">|</span>
                <Link
                  to="/security"
                  className="text-white transition-colors hover:text-[#cccccc] hover:underline"
                >
                  Online Security
                </Link>
                <span aria-hidden="true">|</span>
              </span>

              <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
                <Link
                  to="/accessibility"
                  className="text-white transition-colors hover:text-[#cccccc] hover:underline"
                >
                  Accessibility Statement
                </Link>
                <span aria-hidden="true">|</span>
                <Link
                  to="/ccpa"
                  className="text-white transition-colors hover:text-[#cccccc] hover:underline"
                >
                  CCPA
                </Link>
                <span aria-hidden="true">|</span>
                <span className="text-white">NMLS #450086</span>
              </span>
            </div>
          </div>

          {/* Right: social media */}
          <div className="flex shrink-0 items-center justify-center gap-3.5">
            <a
              href="https://web.facebook.com/GulfCoastBank/?_rdc=1&_rdr#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="inline-block transition-opacity hover:opacity-70"
            >
              <img
                src="/facebook.svg"
                alt="Facebook"
                className="block h-6 w-6 brightness-0 invert sm:h-7 sm:w-7"
              />
            </a>
            <a
              href="https://www.instagram.com/gulfcoastbank/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-block transition-opacity hover:opacity-70"
            >
              <img
                src="/instagram.svg"
                alt="Instagram"
                className="block h-6 w-6 brightness-0 invert sm:h-7 sm:w-7"
              />
            </a>
            <a
              href="https://www.youtube.com/channel/UC14o2XewLx24IBnT0S534ig?view_as=subscriber"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="inline-block transition-opacity hover:opacity-70"
            >
              <img
                src="/youtube.svg"
                alt="YouTube"
                className="block h-6 w-6 brightness-0 invert sm:h-7 sm:w-7"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;