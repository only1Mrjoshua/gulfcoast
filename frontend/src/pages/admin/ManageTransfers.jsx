// src/pages/admin/ManageTransfers.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  ChevronDown,
  ArrowRightLeft,
} from 'lucide-react';
import { apiFetch } from '../../utils/api';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount ?? 0);
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
          <Clock className="h-3.5 w-3.5" strokeWidth={2.25} />
          Pending
        </span>
      );
    case 'Failed':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#d9534f]">
          <XCircle className="h-3.5 w-3.5" strokeWidth={2.25} />
          Failed
        </span>
      );
    default:
      return null;
  }
};

const getStatusSelectColor = (status) => {
  switch (status) {
    case 'Completed':
      return 'text-primary';
    case 'Pending':
      return 'text-[#f0ad4e]';
    case 'Failed':
      return 'text-[#d9534f]';
    default:
      return 'text-muted';
  }
};

// ── Table row ─────────────────────────────────────────────────
const TransferRow = ({ transfer, onStatusChange, changingId }) => {
  const isChanging = changingId === transfer.id;
  const isWire = transfer.type === 'wire';
  const showFeeNote = isWire && (transfer.wireFee || 0) > 0;

  return (
    <tr className="transition-colors hover:bg-faint/30">
      <td className="px-5 py-4 font-mono text-xs text-muted">
        {String(transfer.id).slice(-8).toUpperCase()}
      </td>
      <td className="px-5 py-4 font-semibold text-deep-accent">{transfer.user}</td>
      <td className="px-5 py-4 text-body">{transfer.from || '—'}</td>
      <td className="px-5 py-4 text-body">{transfer.to || '—'}</td>
      <td className="px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-deep-accent">
            {formatCurrency(transfer.totalDebit ?? transfer.amount)}
          </span>
          {showFeeNote && (
            <span className="text-[11px] text-muted">
              {formatCurrency(transfer.amount)} + {formatCurrency(transfer.wireFee)} fee
            </span>
          )}
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="relative inline-flex items-center">
          <select
            value={transfer.status}
            autoComplete="off"
            disabled={isChanging || transfer.status === 'Completed'}
            onChange={(e) => onStatusChange(transfer.id, e.target.value)}
            className={`appearance-none bg-transparent border-none text-xs font-bold uppercase tracking-wide cursor-pointer focus:outline-none disabled:cursor-not-allowed ${getStatusSelectColor(
              transfer.status
            )}`}
          >
            <option value="Completed" className="text-deep-accent font-normal normal-case">
              Completed
            </option>
            <option value="Pending" className="text-deep-accent font-normal normal-case">
              Pending
            </option>
            <option value="Failed" className="text-deep-accent font-normal normal-case">
              Failed
            </option>
          </select>
          {isChanging ? (
            <Loader2 className="ml-1 h-3 w-3 animate-spin text-primary" strokeWidth={2} />
          ) : (
            <ChevronDown
              className={`ml-1 h-3 w-3 ${getStatusSelectColor(transfer.status)}`}
              strokeWidth={2}
            />
          )}
        </div>
      </td>
    </tr>
  );
};

const TransferTable = ({ children }) => (
  <div className="overflow-x-auto border border-hairline bg-white">
    <table className="w-full text-left text-sm">
      <thead className="border-b border-hairline bg-faint/50 text-xs uppercase tracking-wide text-muted">
        <tr>
          <th className="px-5 py-3 font-semibold">Transfer ID</th>
          <th className="px-5 py-3 font-semibold">User</th>
          <th className="px-5 py-3 font-semibold">From</th>
          <th className="px-5 py-3 font-semibold">To</th>
          <th className="px-5 py-3 font-semibold">Amount</th>
          <th className="px-5 py-3 font-semibold">
            Status{' '}
            <span className="text-[10px] text-muted normal-case font-normal">
              (Click to change)
            </span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-faint">{children}</tbody>
    </table>
  </div>
);

const SectionHeading = ({ title, count }) => (
  <div className="mb-3 flex items-center justify-between gap-3 border-b border-hairline pb-2">
    <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
      {title}
    </h2>
    <span className="text-xs font-semibold uppercase tracking-wide text-muted">
      {count} {count === 1 ? 'transfer' : 'transfers'}
    </span>
  </div>
);

const ManageTransfers = () => {
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [failedTransfers, setFailedTransfers] = useState([]);
  const [completedTransfers, setCompletedTransfers] = useState([]);

  const [completedPage, setCompletedPage] = useState(1);
  const [completedHasMore, setCompletedHasMore] = useState(false);
  const [completedTotal, setCompletedTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [changingId, setChangingId] = useState(null);
  const [toast, setToast] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  const COMPLETED_LIMIT = 10;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadTransfers = useCallback(async (page = 1) => {
    const res = await apiFetch(
      `/admin/transfers?completedPage=${page}&completedLimit=${COMPLETED_LIMIT}`
    );
    const d = res?.data ?? res;

    setPendingTransfers(d.pending ?? []);
    setFailedTransfers(d.failed ?? []);

    const completedData = d.completed ?? { items: [], page: 1, total: 0, hasMore: false };
    setCompletedTransfers(completedData.items ?? []);
    setCompletedPage(completedData.page ?? 1);
    setCompletedHasMore(completedData.hasMore ?? false);
    setCompletedTotal(completedData.total ?? 0);
  }, []);

  useEffect(() => {
    const boot = async () => {
      try {
        setLoading(true);
        setError('');
        await loadTransfers(1);
      } catch (err) {
        console.error('❌ Failed to load transfers:', err);
        setError(err.message || 'Failed to load transfers');
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, [loadTransfers]);

  const handleShowMore = async () => {
    if (!completedHasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = completedPage + 1;
      const res = await apiFetch(
        `/admin/transfers?completedPage=${nextPage}&completedLimit=${COMPLETED_LIMIT}`
      );
      const d = res?.data ?? res;
      const nextCompleted = d.completed?.items ?? [];

      setCompletedTransfers((prev) => [...prev, ...nextCompleted]);
      setCompletedPage(d.completed?.page ?? nextPage);
      setCompletedHasMore(d.completed?.hasMore ?? false);
      setCompletedTotal(d.completed?.total ?? completedTotal);
    } catch (err) {
      console.error('❌ Failed to load more transfers:', err);
      showToast(err.message || 'Failed to load more transfers');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setChangingId(id);
    try {
      const res = await apiFetch(`/admin/transfers/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      const d = res?.data ?? res;
      showToast(d.message || `Transfer marked ${newStatus}`);
      await loadTransfers(1);
    } catch (err) {
      console.error('❌ Failed to change transfer status:', err);
      showToast(err.message || 'Failed to update status');
    } finally {
      setChangingId(null);
    }
  };

  const matchesSearch = (t) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (t.user || '').toLowerCase().includes(q) ||
      (t.id || '').toLowerCase().includes(q) ||
      (t.from || '').toLowerCase().includes(q) ||
      (t.to || '').toLowerCase().includes(q)
    );
  };

  const filteredPending = pendingTransfers.filter(matchesSearch);
  const filteredFailed = failedTransfers.filter(matchesSearch);
  const filteredCompleted = completedTransfers.filter(matchesSearch);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" strokeWidth={1.75} />
        <p className="text-sm text-muted">Loading transfers…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4">
        <p className="font-serif text-xl font-bold text-deep-accent">
          We couldn&rsquo;t load transfers
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
            Manage Transfers
          </h1>
          <p className="mt-1 text-sm text-body">
            Monitor and manage all internal and external fund transfers.
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center border border-hairline bg-white px-3 focus-within:border-primary">
          <Search className="h-4 w-4 text-muted" strokeWidth={2} />
          <input
            type="text"
            autoComplete="off"
            placeholder="Search by user, transfer ID, or account..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="min-h-[40px] w-full border-none bg-transparent px-3 py-2 text-sm text-deep-accent outline-none placeholder:text-muted/60"
          />
        </div>
        <button className="inline-flex min-h-[40px] items-center justify-center gap-2 border border-hairline bg-white px-4 py-2 text-sm font-semibold text-deep-accent hover:bg-faint">
          <Filter className="h-4 w-4" strokeWidth={2} /> Filter
        </button>
      </div>

      {/* PENDING */}
      <section className="mb-10">
        <SectionHeading title="Pending Transfers" count={filteredPending.length} />
        {filteredPending.length === 0 ? (
          <div className="border border-dashed border-hairline bg-faint py-8 text-center text-sm text-muted">
            No pending transfers.
          </div>
        ) : (
          <TransferTable>
            {filteredPending.map((t) => (
              <TransferRow
                key={t.id}
                transfer={t}
                onStatusChange={handleStatusChange}
                changingId={changingId}
              />
            ))}
          </TransferTable>
        )}
      </section>

      {/* FAILED */}
      <section className="mb-10">
        <SectionHeading title="Failed Transfers" count={filteredFailed.length} />
        {filteredFailed.length === 0 ? (
          <div className="border border-dashed border-hairline bg-faint py-8 text-center text-sm text-muted">
            No failed transfers.
          </div>
        ) : (
          <TransferTable>
            {filteredFailed.map((t) => (
              <TransferRow
                key={t.id}
                transfer={t}
                onStatusChange={handleStatusChange}
                changingId={changingId}
              />
            ))}
          </TransferTable>
        )}
      </section>

      {/* COMPLETED */}
      <section className="mb-10">
        <SectionHeading title="Completed Transfers" count={completedTotal} />
        {filteredCompleted.length === 0 ? (
          <div className="border border-dashed border-hairline bg-faint py-8 text-center text-sm text-muted">
            No completed transfers.
          </div>
        ) : (
          <>
            <TransferTable>
              {filteredCompleted.map((t) => (
                <TransferRow
                  key={t.id}
                  transfer={t}
                  onStatusChange={handleStatusChange}
                  changingId={changingId}
                />
              ))}
            </TransferTable>

            {completedHasMore && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={handleShowMore}
                  disabled={loadingMore}
                  className="inline-flex min-h-[44px] w-full max-w-md items-center justify-center gap-2 border border-hairline bg-white px-6 py-3 text-sm font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                      Loading…
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" strokeWidth={2.25} />
                      Show more ({Math.max(0, completedTotal - completedTransfers.length)} remaining)
                    </>
                  )}
                </button>
                <span className="text-xs text-muted">
                  Showing {completedTransfers.length} of {completedTotal}
                </span>
              </div>
            )}

            {!completedHasMore && completedTransfers.length > COMPLETED_LIMIT && (
              <div className="mt-4 text-center text-xs text-muted">
                Showing all {completedTotal} completed transfers
              </div>
            )}
          </>
        )}
      </section>

      {toast && (
        <div className="fixed right-4 top-4 z-[10001] flex items-start gap-3 border border-hairline bg-white p-4 shadow-lg">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.25} />
          <p className="text-sm font-semibold text-deep-accent">{toast}</p>
        </div>
      )}
    </div>
  );
};

export default ManageTransfers;