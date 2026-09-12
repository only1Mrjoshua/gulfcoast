// src/pages/admin/AdminDashboard.jsx
import React from 'react';
import { Users, CreditCard, ArrowLeftRight, AlertCircle, TrendingUp } from 'lucide-react';
import { mockAdminStats, mockAdminTransactions } from '../../data/mockAdminData';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Math.abs(amount));
};

const AdminDashboard = () => {
  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Page Header */}
      <div className="mb-8 border-b border-hairline pb-4">
        <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">
          System Overview
        </h1>
        <p className="mt-1 text-sm text-body sm:text-base">
          Monitor platform activity and manage system operations.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <div className="border border-hairline bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Total Users</span>
            <Users className="h-4 w-4 text-primary" strokeWidth={1.75} />
          </div>
          <div className="mt-3 font-serif text-3xl font-bold text-deep-accent">
            {mockAdminStats.totalUsers}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-primary">
            <TrendingUp className="h-3 w-3" /> +12% this month
          </div>
        </div>

        {/* Active Accounts */}
        <div className="border border-hairline bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Active Accounts</span>
            <CreditCard className="h-4 w-4 text-primary" strokeWidth={1.75} />
          </div>
          <div className="mt-3 font-serif text-3xl font-bold text-deep-accent">
            {mockAdminStats.activeAccounts}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-primary">
            <TrendingUp className="h-3 w-3" /> +5% this month
          </div>
        </div>

        {/* Transactions Today */}
        <div className="border border-hairline bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Transactions Today</span>
            <ArrowLeftRight className="h-4 w-4 text-primary" strokeWidth={1.75} />
          </div>
          <div className="mt-3 font-serif text-3xl font-bold text-deep-accent">
            {mockAdminStats.transactionsToday}
          </div>
          <div className="mt-1 text-xs text-muted">Across all accounts</div>
        </div>

        {/* Pending Approvals */}
        <div className="border border-hairline bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Pending Approvals</span>
            <AlertCircle className="h-4 w-4 text-[#d9534f]" strokeWidth={1.75} />
          </div>
          <div className="mt-3 font-serif text-3xl font-bold text-deep-accent">
            {mockAdminStats.pendingApprovals}
          </div>
          <div className="mt-1 text-xs font-semibold text-[#d9534f]">Requires attention</div>
        </div>
      </div>

      {/* Recent System Activity */}
      <section className="mb-10">
        <h2 className="mb-4 font-serif text-lg font-bold text-deep-accent sm:text-xl">
          Recent System Transactions
        </h2>
        <div className="divide-y divide-faint border border-hairline bg-white p-5">
          {mockAdminTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between gap-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-faint text-body">
                  <ArrowLeftRight className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-deep-accent">{tx.description}</div>
                  <div className="truncate text-xs text-muted">{tx.user} • {tx.id}</div>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end">
                <span className={`text-sm font-semibold ${tx.amount >= 0 ? 'text-primary' : 'text-deep-accent'}`}>
                  {tx.amount >= 0 ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
                <span className={`text-xs ${tx.status === 'Flagged' ? 'text-[#d9534f] font-semibold' : 'text-muted'}`}>
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;