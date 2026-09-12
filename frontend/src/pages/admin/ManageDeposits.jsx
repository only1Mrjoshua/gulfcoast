// src/pages/admin/ManageDeposits.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Banknote,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { apiFetch } from '../../utils/api';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    amount ?? 0
  );

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

const getStatusBadge = (status) => {
  switch (status) {
    case 'Completed':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary">
          <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.25} />
          Completed
        </span>
      );
    case 'Pending':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#f0ad4e]">
          <AlertCircle className="h-3.5 w-3.5" strokeWidth={2.25} />
          Pending
        </span>
      );
    case 'Rejected':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#d9534f]">
          <XCircle className="h-3.5 w-3.5" strokeWidth={2.25} />
          Rejected
        </span>
      );
    default:
      return null;
  }
};

const ManageDeposits = () => {
  const [deposits, setDeposits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showChequesOnly, setShowChequesOnly] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [rowError, setRowError] = useState({ id: null, message: '' });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // ────────────────────────────────────────────────────────
  // Load deposits
  // ────────────────────────────────────────────────────────
  const loadDeposits = useCallback(async () => {
    const res = await apiFetch('/admin/deposits');
    const d = res?.data ?? res;
    setDeposits(d.deposits ?? []);
  }, []);

  useEffect(() => {
    const boot = async () => {
      try {
        setLoading(true);
        setError('');
        await loadDeposits();
      } catch (err) {
        console.error('❌ Failed to load deposits:', err);
        setError(err.message || 'Failed to load deposits');
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, [loadDeposits]);

  // ────────────────────────────────────────────────────────
  // Filtering
  // ────────────────────────────────────────────────────────
  const filteredDeposits = deposits.filter((d) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (d.user || '').toLowerCase().includes(q) ||
      (d.id || '').toLowerCase().includes(q);
    const matchesCheque = showChequesOnly ? d.method === 'Cheque' : true;
    return matchesSearch && matchesCheque;
  });

  // ────────────────────────────────────────────────────────
  // Status change
  // ────────────────────────────────────────────────────────
  const handleStatusChange = async (depositId, newStatus) => {
    const current = deposits.find((d) => d.id === depositId);
    if (!current || current.status === newStatus) return;

    const previousStatus = current.status;
    setUpdatingId(depositId);
    setRowError({ id: null, message: '' });

    // Optimistic update
    setDeposits((prev) =>
      prev.map((d) => (d.id === depositId ? { ...d, status: newStatus } : d))
    );

    try {
      const res = await apiFetch(`/admin/deposits/${depositId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      const d = res?.data ?? res;

      if (d?.deposit) {
        setDeposits((prev) =>
          prev.map((x) => (x.id === depositId ? { ...x, ...d.deposit } : x))
        );
      }

      showToast(`Deposit marked as ${newStatus}.`);
    } catch (err) {
      console.error('❌ Failed to update deposit status:', err);

      // Roll back on failure
      setDeposits((prev) =>
        prev.map((x) =>
          x.id === depositId ? { ...x, status: previousStatus } : x
        )
      );
      setRowError({
        id: depositId,
        message: err.message || 'Failed to update deposit status',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // ────────────────────────────────────────────────────────
  // Full-page loading / error
  // ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" strokeWidth={1.75} />
        <p className="text-sm text-muted">Loading deposits…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4">
        <p className="font-serif text-xl font-bold text-deep-accent">
          We couldn&rsquo;t load deposits
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
      <div className="mb-6 flex flex-col gap-4 border-b border-hairline pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">
            Manage Deposits
          </h1>
          <p className="mt-1 text-sm text-body">
            Review incoming deposits and update their status.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center border border-hairline bg-white px-3 focus-within:border-primary">
          <Search className="h-4 w-4 text-muted" strokeWidth={2} />
          <input
            type="text"
            autoComplete="off"
            placeholder="Search by user or deposit ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="min-h-[40px] w-full border-none bg-transparent px-3 py-2 text-sm text-deep-accent outline-none placeholder:text-muted/60"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowChequesOnly((v) => !v)}
          className={`inline-flex min-h-[40px] items-center justify-center gap-2 border px-4 py-2 text-sm font-semibold transition-colors ${
            showChequesOnly
              ? 'border-primary bg-primary text-white'
              : 'border-hairline bg-white text-deep-accent hover:bg-faint'
          }`}
        >
          <Banknote className="h-4 w-4" strokeWidth={2} />
          {showChequesOnly ? 'Showing Cheques Only' : 'Filter Cheques'}
        </button>
      </div>

      {/* Deposits Table */}
      <div className="overflow-x-auto border border-hairline bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-hairline bg-faint/50 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Deposit ID</th>
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Amount</th>
              <th className="px-5 py-3 font-semibold">Method</th>
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-faint">
            {filteredDeposits.map((d) => {
              const isCompleted = d.status === 'Completed';
              const isUpdating = updatingId === d.id;
              const thisRowError = rowError.id === d.id ? rowError.message : '';

              return (
                <React.Fragment key={d.id}>
                  <tr className="transition-colors hover:bg-faint/30">
                    <td className="px-5 py-4 font-mono text-xs text-muted">
                      {String(d.id).slice(-10).toUpperCase()}
                    </td>
                    <td className="px-5 py-4 font-semibold text-deep-accent">
                      {d.user || '—'}
                    </td>
                    <td className="px-5 py-4 font-semibold text-deep-accent">
                      {formatCurrency(d.amount)}
                    </td>
                    <td className="px-5 py-4 text-body">
                      {d.method}
                      {d.method === 'Cheque' && (
                        <span className="ml-2 inline-flex items-center bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                          Cheque
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {formatDate(d.submittedAt)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <select
                          value={d.status}
                          disabled={isUpdating || isCompleted}
                          onChange={(e) =>
                            handleStatusChange(d.id, e.target.value)
                          }
                          className="min-h-[34px] border border-hairline bg-white px-2 py-1 text-xs font-semibold text-deep-accent focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:bg-faint disabled:text-muted"
                          title={
                            isCompleted
                              ? 'Completed deposits cannot be changed'
                              : 'Change status'
                          }
                        >
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Rejected">Rejected</option>
                        </select>

                        {isUpdating ? (
                          <Loader2
                            className="h-4 w-4 animate-spin text-muted"
                            strokeWidth={2}
                          />
                        ) : (
                          getStatusBadge(d.status)
                        )}
                      </div>
                    </td>
                  </tr>

                  {thisRowError && (
                    <tr>
                      <td
                        colSpan={6}
                        className="border-t border-[#f5c6cb] bg-[#f8d7da] px-5 py-2 text-xs text-[#721c24]"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <XCircle
                            className="h-3.5 w-3.5 shrink-0"
                            strokeWidth={2}
                          />
                          {thisRowError}
                        </span>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {filteredDeposits.length === 0 && (
          <div className="p-8 text-center text-muted">
            No deposits found matching your criteria.
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed right-4 top-4 z-[10001] flex items-start gap-3 border border-hairline bg-white p-4 shadow-lg">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.25} />
          <p className="text-sm font-semibold text-deep-accent">{toast}</p>
        </div>
      )}
    </div>
  );
};

export default ManageDeposits;