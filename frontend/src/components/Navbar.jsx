// src/components/Navbar.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, X } from 'lucide-react';

function Navbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  // Demo credentials (hardcoded for testing)
  const DEMO_USER = 'demo';
  const DEMO_PASS = 'demo123';

  const openModal = () => {
    setUsername('');
    setPassword('');
    setLoginError('');
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    if (username === DEMO_USER && password === DEMO_PASS) {
      closeModal();
      navigate('/home');
    } else {
      setLoginError('Invalid username or password. Try demo / demo123');
    }
  };

  return (
    <>
      {/* ============ Top Utility Bar — desktop only ============ */}
      <div className="hidden border-b border-hairline bg-faint py-1.5 text-xs text-muted md:block">
        <div className="container-bank flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-2 font-normal">
            <img
              src="/fdic.svg"
              alt="FDIC"
              className="h-auto w-[42px] shrink-0"
            />
            <span className="italic">
              FDIC-Insured – Backed by the full faith and credit of the U.S. Government
            </span>
          </span>
          <div className="flex items-center gap-5">
            <Link
              to="/locations"
              className="text-muted transition-colors hover:text-primary hover:underline"
            >
              Locations
            </Link>
            <Link
              to="/contact"
              className="text-muted transition-colors hover:text-primary hover:underline"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* ============ Main Navigation ============ */}
      <nav className="relative border-b border-hairline bg-canvas py-3">
        <div className="container-bank flex items-center justify-between gap-3">
          {/* Logo — centered on mobile, left-aligned on desktop */}
          <div className="flex flex-1 items-center justify-center md:flex-none md:justify-start">
            <Link to="/">
              <img
                src="/logo.svg"
                alt="Gulf Coast Trust"
                className="h-9 w-auto md:h-10"
              />
            </Link>
          </div>

          {/* Mobile login button — hidden on desktop */}
          <button
            type="button"
            onClick={openModal}
            className="inline-flex min-h-[36px] shrink-0 items-center justify-center bg-primary px-4 pb-1.5 pt-2 text-[0.85rem] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-primary-deep sm:min-h-[42px] sm:px-5.5 sm:pb-2 sm:pt-2.5 sm:text-base md:hidden"
          >
            Login
          </button>

          {/* Desktop nav links */}
          <ul className="hidden list-none items-center gap-7 p-0 md:flex">
            <li>
              <button
                type="button"
                onClick={openModal}
                className="inline-flex min-h-[45px] items-center justify-center bg-primary px-7 pb-2 pt-3.5 text-base font-semibold uppercase tracking-wide text-white transition-colors hover:bg-primary-deep"
              >
                Login
              </button>
            </li>
          </ul>
        </div>

        {/* ============ Mobile FDIC bar — hidden on desktop ============ */}
        <div className="mt-2 flex items-center justify-center gap-1.5 border-t border-hairline px-5 pb-1.5 pt-2 text-[0.8rem] text-[#222] md:hidden sm:mt-0 sm:gap-[30px] sm:px-[30px] sm:py-2 sm:text-[1.25rem]">
          <img
            src="/fdic.svg"
            alt="FDIC"
            className="h-auto w-[30px] shrink-0 sm:w-[100px]"
          />
          <span className="text-left italic leading-[1.05] text-[0.95rem] sm:text-[1.25rem]">
            FDIC-Insured – Backed by the full faith and credit of the U.S. Government
          </span>
        </div>
      </nav>

      {/* ============ Login Overlay — Large Panel ============ */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-5"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-full border-0 bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.12)] sm:p-7 md:p-8 md:pb-7.5 md:px-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close"
              className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center text-xl leading-none text-[#999] transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:right-3 sm:top-2.5 sm:text-[22px] md:right-4 md:top-3 md:text-[26px]"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>

            <div className="mx-auto max-w-[540px]">
              {/* Headings */}
              <h2 className="mb-2.5 font-sans text-[13px] font-normal uppercase tracking-wide text-muted sm:text-base md:mb-4 md:text-lg">
                DIGITAL BANKING LOGIN
              </h2>

              <h1 className="mb-4 font-serif text-[22px] font-light leading-tight text-primary sm:mb-6 sm:text-[28px] md:mb-8 md:text-[34px]">
                Access your accounts
              </h1>

              {/* Form */}
              <form onSubmit={handleLogin} className="flex flex-col gap-3.5 sm:gap-[18px] md:gap-6">
                {/* Username */}
                <div className="flex h-[38px] items-stretch border border-hairline bg-white sm:h-[42px] md:h-[46px]">
                  <div className="flex w-[38px] shrink-0 items-center justify-center border-r border-hairline bg-faint sm:w-[42px] md:w-[46px]">
                    <User
                      className="h-3.5 w-3.5 text-[#888] sm:h-4 sm:w-4 md:h-[18px] md:w-[18px]"
                      strokeWidth={1.5}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="flex-1 border-none bg-transparent px-2.5 text-base text-body outline-none placeholder:font-light placeholder:text-[#999] md:px-3"
                  />
                </div>

                {/* Password */}
                <div className="flex h-[38px] items-stretch border border-hairline bg-white sm:h-[42px] md:h-[46px]">
                  <div className="flex w-[38px] shrink-0 items-center justify-center border-r border-hairline bg-faint sm:w-[42px] md:w-[46px]">
                    <Lock
                      className="h-3.5 w-3.5 text-[#888] sm:h-4 sm:w-4 md:h-[18px] md:w-[18px]"
                      strokeWidth={1.5}
                    />
                  </div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="flex-1 border-none bg-transparent px-2.5 text-base text-body outline-none placeholder:font-light placeholder:text-[#999] md:px-3"
                  />
                </div>

                {loginError && (
                  <div className="-mt-2 mb-2 text-left font-sans text-sm text-[#d9534f]">
                    {loginError}
                  </div>
                )}

                {/* Actions row */}
                <div className="mt-0 flex flex-col items-stretch gap-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-0 md:mt-0.5">
                  <a
                    href="#"
                    className="text-left text-[13px] text-muted transition-colors hover:text-primary hover:underline sm:text-[15px]"
                  >
                    Forgot Password?
                  </a>
                  <button
                    type="submit"
                    className="relative inline-flex min-h-[38px] w-full items-center justify-center bg-primary px-4 pb-[5px] pt-2 font-sans text-[13px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-deep sm:min-h-[42px] sm:w-auto sm:min-w-[110px] sm:px-5 sm:pb-1.5 sm:pt-2.5 sm:text-[15px] md:min-h-[46px]"
                  >
                    LOG IN
                    <span
                      className="absolute bottom-0 left-0 right-0 h-1 bg-primary-deep sm:h-[5px]"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </form>

              {/* Demo hint */}
              <div className="mt-5 border-t border-hairline pt-4 text-center font-sans text-[0.85rem] text-muted">
                Demo: username <strong className="text-deep-accent">demo</strong> / password{' '}
                <strong className="text-deep-accent">demo123</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;