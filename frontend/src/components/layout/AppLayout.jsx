import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import styles from './AppLayout.module.css';

// SVG icons (unchanged)
const Icon = ({ name, className }) => {
  const paths = {
    home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    accounts: 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    transfers: 'M12 4v16m0 0l-4-4m4 4l4-4',
    payments: 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    deposits: 'M4 4v16h16V4H4z M8 8h8 M8 12h6 M8 16h4',
    transactions: 'M9 17l-4-4m0 0l4-4m-4 4h14M15 7l4 4m0 0l-4 4m4-4H5',
    statements: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    cards: 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    loans: 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    goals: 'M12 4v16m0 0l-4-4m4 4l4-4',
    messages: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    help: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M12 15a3 3 0 100-6 3 3 0 000 6z',
    logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    bell: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0',
    user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2',
  };
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  );
};

// Sidebar component
const Sidebar = ({ isOpen, toggleDrawer, onLogoutRequest }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { key: 'home', label: 'Home', icon: 'home', path: '/home' },
    { key: 'accounts', label: 'Accounts', icon: 'accounts', path: '/accounts' },
    { key: 'transfers', label: 'Transfers', icon: 'transfers', path: '/transfers' },
    { key: 'payments', label: 'Payments', icon: 'payments', path: '/payments' },
    { key: 'deposits', label: 'Deposits', icon: 'deposits', path: '/deposits' },
    { key: 'transactions', label: 'Transactions', icon: 'transactions', path: '/transactions' },
    { key: 'statements', label: 'Statements', icon: 'statements', path: '/statements' },
    { key: 'cards', label: 'Cards', icon: 'cards', path: '/cards' },
    { key: 'loans', label: 'Loans', icon: 'loans', path: '/loans' },
    { key: 'goals', label: 'Financial Goals', icon: 'goals', path: '/goals' },
    { key: 'notifications', label: 'Notifications', icon: 'bell', path: '/notifications' },
    { key: 'help', label: 'Help', icon: 'help', path: '/help' },
    { key: 'settings', label: 'Settings', icon: 'settings', path: '/settings' },
    { key: 'logout', label: 'Log Out', icon: 'logout', path: '/' },
  ];

  const handleNavClick = (item) => (e) => {
    if (item.key === 'logout') {
      e.preventDefault();
      onLogoutRequest();
    }
  };

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={toggleDrawer}></div>}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.logo}>
          <img src="/logo.svg" alt="Gulf Coast Trust" className={styles.logoImage} />
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.key}
                to={item.path}
                className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                onClick={handleNavClick(item)}
              >
                <Icon name={item.icon} className={styles.navIcon} />
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

// Top Header component
const TopHeader = ({ onLogoutRequest }) => {
  return (
    <header className={styles.topHeader}>
      <div className={styles.headerLeft}>
        <img src="/logo.svg" alt="Gulf Coast Trust" className={styles.headerLogoImage} />
      </div>
      <div className={styles.headerRight}>
        <Link
          to="/notifications"
          className={styles.headerIconBtn}
          aria-label="Notifications"
        >
          <Icon name="bell" className={styles.headerIcon} />
        </Link>
        <Link
          to="/help"
          className={styles.headerIconBtn}
          aria-label="Help"
        >
          <Icon name="help" className={styles.headerIcon} />
        </Link>
        <button className={styles.headerLogout} onClick={onLogoutRequest}>
          Log Out
        </button>
      </div>
    </header>
  );
};

// Main AppLayout
const AppLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  const handleLogoutRequest = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    navigate('/');
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className={styles.layout}>
      {/* Mobile top bar */}
      <div className={styles.mobileTopBar}>
        <button className={styles.hamburger} onClick={toggleDrawer}>
          <span></span><span></span><span></span>
        </button>
        <img src="/logo.svg" alt="Gulf Coast Trust" className={styles.mobileLogoImage} />
      </div>

      <Sidebar
        isOpen={drawerOpen}
        toggleDrawer={toggleDrawer}
        onLogoutRequest={handleLogoutRequest}
      />

      <div className={styles.contentWrapper}>
        <TopHeader onLogoutRequest={handleLogoutRequest} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
          onClick={handleCancelLogout}
        >
          <div
            className="relative w-full max-w-[400px] border border-hairline bg-white p-6 text-center sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="mx-auto flex h-12 w-12 items-center justify-center bg-[#fdf2f2] text-[#d9534f]">
              <Icon name="logout" className="h-6 w-6" />
            </span>
            <h2 className="mt-4 font-serif text-xl font-bold text-deep-accent sm:text-2xl">
              Log Out
            </h2>
            <p className="mt-2 text-sm text-body">
              Are you sure you want to log out?
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={handleCancelLogout}
                className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                No, stay
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-[#d9534f] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#c9302c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d9534f]/50"
              >
                Yes, log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;