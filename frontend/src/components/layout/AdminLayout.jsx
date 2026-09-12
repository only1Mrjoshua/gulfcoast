// src/components/layout/AdminLayout.jsx
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Users,
  Wallet,
  ArrowRightLeft,
  Receipt,
  FileText,
  ArrowLeftRight,
  FileSpreadsheet,
  CreditCard,
  Landmark,
  Target,
  Bell,
  LogOut,
  Menu,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItems = [
    { label: 'Manage Users', path: '/admin/users', icon: Users },
    { label: 'Manage Accounts', path: '/admin/accounts', icon: Wallet },
    { label: 'Manage Transfers', path: '/admin/transfers', icon: ArrowRightLeft },
    { label: 'Manage Payments', path: '/admin/payments', icon: Receipt },
    { label: 'Manage Deposits', path: '/admin/deposits', icon: FileText },
    { label: 'Manage Transactions', path: '/admin/transactions', icon: ArrowLeftRight },
    { label: 'Manage Statements', path: '/admin/statements', icon: FileSpreadsheet },
    { label: 'Manage Cards', path: '/admin/cards', icon: CreditCard },
    { label: 'Manage Loans', path: '/admin/loans', icon: Landmark },
    { label: 'Manage Financial Goals', path: '/admin/goals', icon: Target },
    { label: 'Manage Notifications', path: '/admin/notifications', icon: Bell },
  ];

  const handleLogoutClick = () => {
    setIsSidebarOpen(false);
    setShowLogoutConfirm(true);
  };

  const cancelLogout = () => {
    if (loggingOut) return;
    setShowLogoutConfirm(false);
  };

  const confirmLogout = async () => {
    setLoggingOut(true);
    try {
      // AuthContext.logout() clears the user in memory + localStorage,
      // and (if implemented that way) hits the backend to clear the cookie.
      // This is what makes the Navbar update immediately on the next render.
      if (typeof logout === 'function') {
        await logout();
      }
      setShowLogoutConfirm(false);
      navigate('/', { replace: true });
    } catch (err) {
      console.warn('Logout failed:', err?.message);
      // Even on error, clear local state and redirect — no reason to trap
      // the admin in the panel if the API is down.
      setShowLogoutConfirm(false);
      navigate('/', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden font-sans">

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-deep-accent transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
          <span className="font-serif text-xl font-bold text-white tracking-tight">
            Admin Portal
          </span>
          <button
            className="text-white/70 lg:hidden hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 flex flex-col gap-1 px-3 overflow-y-auto h-[calc(100vh-140px)]">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.end}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white border-l-4 border-primary'
                    : 'text-white/70 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
                }`
              }
            >
              <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-white/10 p-4">
          <button
            onClick={handleLogoutClick}
            className="flex w-full items-center gap-3 px-3 py-3 text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} /> Log out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-hairline bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              className="text-body lg:hidden hover:text-deep-accent"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="font-serif text-lg font-bold text-deep-accent hidden sm:block">
              System Administration
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative text-body hover:text-deep-accent transition-colors">
              <Bell className="h-5 w-5" strokeWidth={1.75} />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d9534f] opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#d9534f]"></span>
              </span>
            </button>
            <div className="flex items-center gap-3 border-l border-hairline pl-4">
              <div className="hidden text-right sm:block">
                <div className="text-sm font-semibold text-deep-accent">Admin User</div>
                <div className="text-xs text-muted">Super Admin</div>
              </div>
              <div className="flex h-9 w-9 items-center justify-center bg-faint font-serif font-bold text-primary">
                A
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
          onClick={cancelLogout}
        >
          <div
            className="relative w-full max-w-[440px] border border-hairline bg-white p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={cancelLogout}
              disabled={loggingOut}
              aria-label="Close"
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent disabled:opacity-40"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>

            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#fdf2f2] text-[#d9534f]">
                <AlertCircle className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-deep-accent sm:text-2xl">
                  Log Out?
                </h2>
                <p className="mt-1 text-sm text-body">
                  Are you sure you want to log out of the admin portal? You will
                  need to sign in again to continue.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelLogout}
                disabled={loggingOut}
                className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint disabled:opacity-60"
              >
                No, Stay
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                disabled={loggingOut}
                className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-[#d9534f] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#c9302c] disabled:opacity-70"
              >
                {loggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                ) : (
                  <LogOut className="h-4 w-4" strokeWidth={2.25} />
                )}
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;