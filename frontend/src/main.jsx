import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import App from './App';
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

import Home from './pages/Home';
import Accounts from './pages/Accounts';
import Transfers from './pages/Transfers';
import Payments from './pages/Payments';
import Deposits from './pages/Deposits';
import Transactions from './pages/Transactions';
import Statements from './pages/Statements';
import Cards from './pages/Cards';
import Loans from './pages/Loans';
import Goals from './pages/Goals';
import Notifications from './pages/Notifications';
import Help from './pages/Help';
import Settings from './pages/Settings';
import LandingPage from './pages/LandingPage';
import PlaceholderPage from './pages/PlaceholderPage';
import LocationsPage from './pages/LocationsPage';
import ContactsPage from './pages/ContactsPage';
import HistoryPage from './pages/HistoryPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageAccounts from './pages/admin/ManageAccounts';
import ManageTransfers from './pages/admin/ManageTransfers';
import ManagePayments from './pages/admin/ManagePayments';
import ManageDeposits from './pages/admin/ManageDeposits';
import ManageTransactions from './pages/admin/ManageTransactions';
import ManageStatements from './pages/admin/ManageStatements';
import ManageCards from './pages/admin/ManageCards';
import ManageLoans from './pages/admin/ManageLoans';
import ManageGoals from './pages/admin/ManageGoals';
import ManageNotifications from './pages/admin/ManageNotifications';
import AdminSettings from './pages/admin/AdminSettings';

import './index.css';

const router = createBrowserRouter([
  // ----- Public routes (Navbar + Footer) -----
  {
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'personal', element: <PlaceholderPage title="Personal Banking" /> },
      { path: 'business', element: <PlaceholderPage title="Business Banking" /> },
      { path: 'about-us', element: <PlaceholderPage title="About Us" /> },
      { path: 'resources', element: <PlaceholderPage title="Resources" /> },
      { path: 'login', element: <PlaceholderPage title="Login" /> },
      { path: 'locations', element: <LocationsPage /> },
      { path: 'contact', element: <ContactsPage /> },
      { path: 'careers', element: <PlaceholderPage title="Careers" /> },
      { path: 'privacy', element: <PlaceholderPage title="Privacy Policy" /> },
      { path: 'security', element: <PlaceholderPage title="Online Security" /> },
      { path: 'accessibility', element: <PlaceholderPage title="Accessibility" /> },
      { path: 'ccpa', element: <PlaceholderPage title="CCPA Disclosure" /> },
      { path: 'about-us/history', element: <HistoryPage /> },
      { path: 'personal/checking', element: <PlaceholderPage title="Interest Checking" /> },
      { path: 'personal/mortgage', element: <PlaceholderPage title="Mortgage Loans" /> },
      { path: 'business/solutions', element: <PlaceholderPage title="Business Solutions" /> },
      { path: 'personal/debit-card', element: <PlaceholderPage title="Debit Card" /> },
      { path: 'personal/school-cards', element: <PlaceholderPage title="School Debit Cards" /> },
      { path: 'personal/zelle', element: <PlaceholderPage title="Zelle" /> },
    ],
  },

  // ----- Authenticated user routes (sidebar layout) -----
  {
    element: (
      <ProtectedRoute allowedRoles={['user']}>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'home', element: <Home /> },
      { path: 'accounts', element: <Accounts /> },
      { path: 'transfers', element: <Transfers /> },
      { path: 'payments', element: <Payments /> },
      { path: 'deposits', element: <Deposits /> },
      { path: 'transactions', element: <Transactions /> },
      { path: 'statements', element: <Statements /> },
      { path: 'cards', element: <Cards /> },
      { path: 'loans', element: <Loans /> },
      { path: 'goals', element: <Goals /> },
      { path: 'notifications', element: <Notifications /> },
      { path: 'help', element: <Help /> },
      { path: 'settings', element: <Settings /> },
    ],
  },

  // ----- Admin routes -----
  {
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'admin', element: <AdminDashboard /> },
      { path: 'admin/users', element: <ManageUsers /> },
      { path: 'admin/accounts', element: <ManageAccounts /> },
      { path: 'admin/transfers', element: <ManageTransfers /> },
      { path: 'admin/payments', element: <ManagePayments /> },
      { path: 'admin/deposits', element: <ManageDeposits /> },
      { path: 'admin/transactions', element: <ManageTransactions /> },
      { path: 'admin/statements', element: <ManageStatements /> },
      { path: 'admin/cards', element: <ManageCards /> },
      { path: 'admin/loans', element: <ManageLoans /> },
      { path: 'admin/goals', element: <ManageGoals /> },
      { path: 'admin/notifications', element: <ManageNotifications /> },
      { path: 'admin/settings', element: <AdminSettings /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);