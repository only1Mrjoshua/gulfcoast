// src/components/Navbar.jsx
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, X, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Step 1 — credentials
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 2 — OTP
  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'
  const [attemptId, setAttemptId] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const otpRefs = useRef([]);

  const navigate = useNavigate();
  const { user, loginStep, verifyOTP, logout } = useAuth();

  // Focus first OTP input when the OTP step opens
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    }
  }, [step]);

  const resetAll = () => {
    setUsername('');
    setPassword('');
    setLoginError('');
    setStep('credentials');
    setAttemptId('');
    setMaskedEmail('');
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
  };

  const openModal = () => {
    resetAll();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetAll();
  };

  // ─────────────────────────────────────────────────────
  //  Step 1 — credentials submit
  // ─────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    try {
      const result = await loginStep(username, password);

      // Server wants an OTP
      if (result.requiresOTP) {
        setAttemptId(result.attemptId);
        setMaskedEmail(result.maskedEmail || '');
        setStep('otp');
        setIsSubmitting(false);
        return;
      }

      // Trusted device — session already persisted by AuthContext
      closeModal();
      navigate(
        result.user.role === 'admin' ? '/admin/users' : '/home',
        { replace: true }
      );
    } catch (err) {
      setLoginError(err.message || 'Login failed');
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────
  //  Step 2 — OTP input handlers
  // ─────────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (otpError) setOtpError('');

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 are filled
    if (digit && index === 5 && next.every((d) => d)) {
      submitOTP(next.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData.getData('text') || '')
      .replace(/\D/g, '')
      .slice(0, 6);
    if (!pasted) return;

    const next = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtp(next);
    setOtpError('');

    const focusIdx = Math.min(pasted.length, 5);
    otpRefs.current[focusIdx]?.focus();

    if (pasted.length === 6) submitOTP(pasted);
  };

  // ─────────────────────────────────────────────────────
  //  Step 2 — OTP submit
  // ─────────────────────────────────────────────────────
  const submitOTP = async (code) => {
    setVerifying(true);
    setOtpError('');

    try {
      const verifiedUser = await verifyOTP(attemptId, code);

      // AuthContext has already persisted the session.
      // Just close the modal and route.
      closeModal();
      navigate(
        verifiedUser.role === 'admin' ? '/admin/users' : '/home',
        { replace: true }
      );
    } catch (err) {
      setOtpError(err.message || 'Verification failed');
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
      setVerifying(false);
    }
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setOtpError('Please enter the 6-digit code.');
      return;
    }
    submitOTP(code);
  };

  const handleBack = () => {
    setStep('credentials');
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
  };

  // ─────────────────────────────────────────────────────
  //  Logout
  // ─────────────────────────────────────────────────────
  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <>
      {/* ============ Top Utility Bar ============ */}
      <div className="hidden border-b border-hairline bg-faint py-1.5 text-xs text-muted md:block">
        <div className="container-bank flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-2 font-normal">
            <img src="/fdic.svg" alt="FDIC" className="h-auto w-[42px] shrink-0" />
            <span className="italic">
              FDIC-Insured – Backed by the full faith and credit of the U.S. Government
            </span>
          </span>
          <div className="flex items-center gap-5">
            <Link to="/locations" className="text-muted transition-colors hover:text-primary hover:underline">
              Locations
            </Link>
            <Link to="/contact" className="text-muted transition-colors hover:text-primary hover:underline">
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* ============ Main Navigation ============ */}
      <nav className="relative border-b border-hairline bg-canvas py-3">
        <div className="container-bank flex items-center justify-between gap-3">
          <div className="flex flex-1 items-center justify-center md:flex-none md:justify-start">
            <Link to="/">
              <img src="/logo.svg" alt="Gulf Coast Trust" className="h-9 w-auto md:h-10" />
            </Link>
          </div>

          {/* Mobile button */}
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex min-h-[36px] shrink-0 items-center justify-center bg-primary px-4 pb-1.5 pt-2 text-[0.85rem] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-primary-deep sm:min-h-[42px] sm:px-5.5 sm:pb-2 sm:pt-2.5 sm:text-base md:hidden"
            >
              Logout
            </button>
          ) : (
            <button
              type="button"
              onClick={openModal}
              className="inline-flex min-h-[36px] shrink-0 items-center justify-center bg-primary px-4 pb-1.5 pt-2 text-[0.85rem] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-primary-deep sm:min-h-[42px] sm:px-5.5 sm:pb-2 sm:pt-2.5 sm:text-base md:hidden"
            >
              Login
            </button>
          )}

          {/* Desktop button */}
          <ul className="hidden list-none items-center gap-7 p-0 md:flex">
            <li>
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex min-h-[45px] items-center justify-center bg-primary px-7 pb-2 pt-3.5 text-base font-semibold uppercase tracking-wide text-white transition-colors hover:bg-primary-deep"
                >
                  Logout
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openModal}
                  className="inline-flex min-h-[45px] items-center justify-center bg-primary px-7 pb-2 pt-3.5 text-base font-semibold uppercase tracking-wide text-white transition-colors hover:bg-primary-deep"
                >
                  Login
                </button>
              )}
            </li>
          </ul>
        </div>

        {/* Mobile FDIC bar */}
        <div className="mt-2 flex items-center justify-center gap-1.5 border-t border-hairline px-5 pb-1.5 pt-2 text-[0.8rem] text-[#222] md:hidden sm:mt-0 sm:gap-[30px] sm:px-[30px] sm:py-2 sm:text-[1.25rem]">
          <img src="/fdic.svg" alt="FDIC" className="h-auto w-[30px] shrink-0 sm:w-[100px]" />
          <span className="text-left italic leading-[1.05] text-[0.95rem] sm:text-[1.25rem]">
            FDIC-Insured – Backed by the full faith and credit of the U.S. Government
          </span>
        </div>
      </nav>

      {/* ============ Login Overlay ============ */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-5"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-full border-0 bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.12)] sm:p-7 md:max-w-[520px] md:p-8 md:pb-7.5 md:px-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close"
              className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center text-xl leading-none text-[#999] transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:right-3 sm:top-2.5 sm:text-[22px] md:right-4 md:top-3 md:text-[26px]"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>

            {step === 'credentials' && (
              <div className="mx-auto">
                <h2 className="mb-2.5 font-sans text-[13px] font-normal uppercase tracking-wide text-muted sm:text-base md:mb-4 md:text-lg">
                  DIGITAL BANKING LOGIN
                </h2>

                <h1 className="mb-4 font-serif text-[22px] font-light leading-tight text-primary sm:mb-6 sm:text-[28px] md:mb-8 md:text-[34px]">
                  Access your accounts
                </h1>

                <form onSubmit={handleLogin} className="flex flex-col gap-3.5 sm:gap-[18px] md:gap-6">
                  <div className="flex h-[38px] items-stretch border border-hairline bg-white sm:h-[42px] md:h-[46px]">
                    <div className="flex w-[38px] shrink-0 items-center justify-center border-r border-hairline bg-faint sm:w-[42px] md:w-[46px]">
                      <User className="h-3.5 w-3.5 text-[#888] sm:h-4 sm:w-4 md:h-[18px] md:w-[18px]" strokeWidth={1.5} />
                    </div>
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoComplete="username"
                      className="flex-1 border-none bg-transparent px-2.5 text-base text-body outline-none placeholder:font-light placeholder:text-[#999] md:px-3"
                    />
                  </div>

                  <div className="flex h-[38px] items-stretch border border-hairline bg-white sm:h-[42px] md:h-[46px]">
                    <div className="flex w-[38px] shrink-0 items-center justify-center border-r border-hairline bg-faint sm:w-[42px] md:w-[46px]">
                      <Lock className="h-3.5 w-3.5 text-[#888] sm:h-4 sm:w-4 md:h-[18px] md:w-[18px]" strokeWidth={1.5} />
                    </div>
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="flex-1 border-none bg-transparent px-2.5 text-base text-body outline-none placeholder:font-light placeholder:text-[#999] md:px-3"
                    />
                  </div>

                  {loginError && (
                    <div className="-mt-2 mb-2 text-left font-sans text-sm text-[#d9534f]">
                      {loginError}
                    </div>
                  )}

                  <div className="mt-0 flex flex-col items-stretch gap-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-0 md:mt-0.5">
                    <a href="#" className="text-left text-[13px] text-muted transition-colors hover:text-primary hover:underline sm:text-[15px]">
                      Forgot Password?
                    </a>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="relative inline-flex min-h-[38px] w-full items-center justify-center bg-primary px-4 pb-[5px] pt-2 font-sans text-[13px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-deep disabled:opacity-60 sm:min-h-[42px] sm:w-auto sm:min-w-[110px] sm:px-5 sm:pb-1.5 sm:pt-2.5 sm:text-[15px] md:min-h-[46px]"
                    >
                      {isSubmitting ? 'LOGGING IN...' : 'LOG IN'}
                      <span className="absolute bottom-0 left-0 right-0 h-1 bg-primary-deep sm:h-[5px]" aria-hidden="true" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 'otp' && (
              <div className="mx-auto">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={verifying}
                  className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted transition-colors hover:text-primary disabled:opacity-50"
                >
                  <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.25} />
                  Back
                </button>

                <div className="mb-6 flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                    <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <div>
                    <h2 className="font-serif text-[20px] font-bold leading-tight text-deep-accent sm:text-[22px]">
                      Verify your identity
                    </h2>
                    <p className="mt-1 text-sm text-body">
                      We sent a 6-digit code to{' '}
                      <strong className="text-deep-accent">
                        {maskedEmail || 'your email'}
                      </strong>
                      . Enter it below to continue.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleVerifySubmit} className="flex flex-col gap-5">
                  <div
                    className="flex justify-between gap-2 sm:gap-3"
                    onPaste={handleOtpPaste}
                  >
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpRefs.current[i] = el)}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={1}
                        value={digit}
                        disabled={verifying}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="h-[52px] w-full max-w-[56px] border border-hairline bg-white text-center text-xl font-bold text-deep-accent outline-none transition-colors focus:border-primary disabled:opacity-50 sm:h-[58px]"
                      />
                    ))}
                  </div>

                  {otpError && (
                    <div className="text-sm text-[#d9534f]">{otpError}</div>
                  )}

                  <button
                    type="submit"
                    disabled={verifying || otp.some((d) => !d)}
                    className="relative inline-flex min-h-[44px] w-full items-center justify-center gap-2 bg-primary px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-deep disabled:opacity-50 sm:text-base"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                        VERIFYING...
                      </>
                    ) : (
                      'VERIFY & SIGN IN'
                    )}
                  </button>

                  <p className="text-center text-xs text-muted sm:text-sm">
                    Didn&rsquo;t receive the code? Check your spam folder, or{' '}
                    <button
                      type="button"
                      onClick={handleBack}
                      className="font-semibold text-primary hover:underline"
                    >
                      try again
                    </button>
                    .
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;