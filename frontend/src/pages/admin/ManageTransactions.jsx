// src/pages/admin/ManageTransactions.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Download, Loader2 } from 'lucide-react';
import { apiFetch } from '../../utils/api';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Math.abs(amount ?? 0));

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const ManageTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ────────────────────────────────────────────────────────
  // Load all transactions
  // ────────────────────────────────────────────────────────
  const loadTransactions = useCallback(async () => {
    const res = await apiFetch('/admin/transactions');
    const d = res?.data ?? res;
    setTransactions(d.transactions ?? []);
  }, []);

  useEffect(() => {
    const boot = async () => {
      try {
        setLoading(true);
        setError('');
        await loadTransactions();
      } catch (err) {
        console.error('❌ Failed to load transactions:', err);
        setError(err.message || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, [loadTransactions]);

  // ────────────────────────────────────────────────────────
  // Filtering (client-side)
  // ────────────────────────────────────────────────────────
  const filteredTransactions = transactions.filter((tx) => {
    const q = searchTerm.toLowerCase();
    return (
      String(tx.id || '').toLowerCase().includes(q) ||
      (tx.user || '').toLowerCase().includes(q) ||
      (tx.description || '').toLowerCase().includes(q)
    );
  });

  // ────────────────────────────────────────────────────────
  // CSV export of the currently visible rows
  // ────────────────────────────────────────────────────────
  const handleExportCsv = () => {
    const rows = [
      ['Transaction ID', 'User', 'Description', 'Date', 'Amount'],
      ...filteredTransactions.map((tx) => [
        tx.id,
        tx.user || '',
        tx.description || '',
        formatDate(tx.date),
        tx.amount ?? 0,
      ]),
    ];

    const csv = rows
      .map((r) =>
        r
          .map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ────────────────────────────────────────────────────────
  // Full-page loading / error
  // ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" strokeWidth={1.75} />
        <p className="text-sm text-muted">Loading transactions…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4">
        <p className="font-serif text-xl font-bold text-deep-accent">
          We couldn&rsquo;t load transactions
        </p>
        <p className="max-w-md text-center text-sm text-muted">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-primary-deep"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 border-b border-hairline pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">
            Manage Transactions
          </h1>
          <p className="mt-1 text-sm text-body">
            View every transaction across all user accounts.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          disabled={filteredTransactions.length === 0}
          className="inline-flex min-h-[40px] items-center justify-center gap-2 border border-hairline bg-white px-4 py-2 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Download className="h-4 w-4" strokeWidth={2} />
          Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center border border-hairline bg-white px-3 focus-within:border-primary">
          <Search className="h-4 w-4 text-muted" strokeWidth={2} />
          <input
            type="text"
            autoComplete="off"
            placeholder="Search by ID, user, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="min-h-[40px] w-full border-none bg-transparent px-3 py-2 text-sm text-deep-accent outline-none placeholder:text-muted/60"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {filteredTransactions.length}{' '}
          {filteredTransactions.length === 1 ? 'Transaction' : 'Transactions'} Found
          {searchTerm && transactions.length !== filteredTransactions.length && (
            <span className="ml-1 normal-case font-normal text-muted/80">
              (of {transactions.length})
            </span>
          )}
        </p>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto border border-hairline bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-hairline bg-faint/50 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Transaction ID</th>
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Description</th>
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-5 py-3 font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-faint">
            {filteredTransactions.map((tx) => (
              <tr key={tx.id} className="transition-colors hover:bg-faint/30">
                <td className="px-5 py-4 font-mono text-xs text-muted">
                  {String(tx.id).slice(-10).toUpperCase()}
                </td>
                <td className="px-5 py-4 font-semibold text-deep-accent">
                  {tx.user || '—'}
                </td>
                <td className="px-5 py-4 text-body">{tx.description || '—'}</td>
                <td className="px-5 py-4 text-muted">{formatDate(tx.date)}</td>
                <td
                  className={`px-5 py-4 font-semibold ${
                    (tx.amount ?? 0) >= 0 ? 'text-primary' : 'text-[#d9534f]'
                  }`}
                >
                  {(tx.amount ?? 0) >= 0 ? '+' : '-'}
                  {formatCurrency(tx.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTransactions.length === 0 && (
          <div className="p-8 text-center text-muted">
            No transactions found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTransactions;