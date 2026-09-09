import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import App from './App';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Accounts from './pages/Accounts';
import Transfers from './pages/Transfers';           // ✅ Added
import LandingPage from './pages/LandingPage';
import PlaceholderPage from './pages/PlaceholderPage';
import LocationsPage from './pages/LocationsPage';
import ContactsPage from './pages/ContactsPage';
import HistoryPage from './pages/HistoryPage';
import './index.css';

const router = createBrowserRouter([
  // ----- Public routes (with Navbar + Footer) -----
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

  // ----- Authenticated routes (with sidebar) -----
  {
    element: <AppLayout />,
    children: [
      { path: 'home', element: <Home /> },
      { path: 'accounts', element: <Accounts /> },
      { path: 'transfers', element: <Transfers /> },   // ✅ Live page
      // All other sidebar links – mapped to PlaceholderPage for now
      { path: 'payments', element: <PlaceholderPage title="Payments" /> },
      { path: 'deposits', element: <PlaceholderPage title="Deposits" /> },
      { path: 'transactions', element: <PlaceholderPage title="Transactions" /> },
      { path: 'statements', element: <PlaceholderPage title="Statements" /> },
      { path: 'cards', element: <PlaceholderPage title="Cards" /> },
      { path: 'loans', element: <PlaceholderPage title="Loans" /> },
      { path: 'goals', element: <PlaceholderPage title="Financial Goals" /> },
      { path: 'insights', element: <PlaceholderPage title="Insights" /> },
      { path: 'messages', element: <PlaceholderPage title="Messages" /> },
      { path: 'help', element: <PlaceholderPage title="Help" /> },
      { path: 'settings', element: <PlaceholderPage title="Settings" /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);