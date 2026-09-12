import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
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
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Strictly following your requested order
  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
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
    { label: 'Admin Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden font-sans">
      
      {isSidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-deep-accent transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
          <span className="font-serif text-xl font-bold text-white tracking-tight">Admin Portal</span>
          <button className="text-white/70 lg:hidden hover:text-white" onClick={() => setIsSidebarOpen(false)}>
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
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-3 text-sm font-medium text-white/70 transition-colors hover:text-white">
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} /> Log out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-hairline bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button className="text-body lg:hidden hover:text-deep-accent" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="font-serif text-lg font-bold text-deep-accent hidden sm:block">System Administration</h1>
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
              <div className="flex h-9 w-9 items-center justify-center bg-faint font-serif font-bold text-primary">A</div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;