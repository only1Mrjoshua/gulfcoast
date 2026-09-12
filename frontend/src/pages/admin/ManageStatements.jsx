// src/pages/admin/ManageStatements.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, Download, Eye, X, FileSpreadsheet, 
  Sparkles, Calendar, CheckCircle2, Loader2, RefreshCw 
} from 'lucide-react';
import { apiFetch } from '../../utils/api';

const GENERATION_STEPS = [
  'Collecting account activity',
  'Compiling monthly transactions',
  'Rendering PDF statement',
];

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const buildFileName = (user, month) =>
  `${user.toLowerCase().replace(/\s+/g, '_')}_statement_${month}.pdf`;

const ManageStatements = () => {
  // Data
  const [statements, setStatements] = useState([]);
  const [users, setUsers] = useState([]);

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  // View Modal State
  const [selectedStatement, setSelectedStatement] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Generate Modal State
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generateData, setGenerateData] = useState({ userId: '', month: '' });
  const [formError, setFormError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);

  // Toast
  const [toast, setToast] = useState('');

  // ────────────────────────────────────────────────────────
  // Loaders
  // ────────────────────────────────────────────────────────
  const loadStatements = useCallback(async () => {
    const res = await apiFetch('/admin/statements');
    const data = res?.data ?? res;
    setStatements(data.statements ?? []);
  }, []);

  const loadUsers = useCallback(async () => {
    const res = await apiFetch('/admin/statements/users');
    const data = res?.data ?? res;
    setUsers(data.users ?? []);
  }, []);

  useEffect(() => {
    const boot = async () => {
      try {
        setLoading(true);
        setError('');
        await Promise.all([loadStatements(), loadUsers()]);
      } catch (err) {
        console.error('❌ Failed to load statements:', err);
        setError(err.message || 'Failed to load statements');
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, [loadStatements, loadUsers]);

  // ────────────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────────────
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3500);
  };

  const formatMonthLabel = (monthKey) => {
    if (!monthKey) return '';
    const [year, month] = monthKey.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getUserName = (userId) => {
    const u = users.find((x) => String(x.id) === String(userId));
    return u ? u.name : '—';
  };

  const selectedUser = users.find((u) => String(u.id) === String(generateData.userId));

  const filteredStatements = statements.filter((s) => {
    const q = searchTerm.toLowerCase();
    const fileName = s.user && s.month ? buildFileName(s.user, s.month) : '';
    return (
      (s.user || '').toLowerCase().includes(q) ||
      (s.month || '').toLowerCase().includes(q) ||
      fileName.toLowerCase().includes(q)
    );
  });

  const duplicateExists =
    generateData.userId &&
    generateData.month &&
    statements.some(
      (s) =>
        String(s.userId) === String(generateData.userId) &&
        s.month === generateData.month &&
        s.status === 'Available'
    );

  // ────────────────────────────────────────────────────────
  // PDF download (fetch blob)
  // ────────────────────────────────────────────────────────
  const downloadPdf = async (statement) => {
    try {
      setDownloadingId(statement.id);
      const API_URL =
        import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_URL}/admin/statements/${statement.id}/download`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeUser = (statement.user || 'user').replace(/\s+/g, '-').toLowerCase();
      a.download = `statement-${safeUser}-${statement.month}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('❌ Download failed:', err);
      showToast('Could not download the statement. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  // ────────────────────────────────────────────────────────
  // View handlers
  // ────────────────────────────────────────────────────────
  const handleViewClick = (statement) => {
    setSelectedStatement({ ...statement });
    setIsViewModalOpen(true);
  };

  const handleRegenerate = async () => {
    if (!selectedStatement) return;
    setIsRegenerating(true);

    try {
      await apiFetch('/admin/statements', {
        method: 'POST',
        body: JSON.stringify({
          userId: selectedStatement.userId,
          month: selectedStatement.month,
          accountId: selectedStatement.accountId || null,
        }),
      });
      await loadStatements();
      showToast(`Statement for ${selectedStatement.monthLabel} regenerated.`);
      setIsViewModalOpen(false);
    } catch (err) {
      console.error('❌ Regenerate failed:', err);
      showToast(err.message || 'Failed to regenerate statement');
    } finally {
      setIsRegenerating(false);
    }
  };

  // ────────────────────────────────────────────────────────
  // Generate handlers
  // ────────────────────────────────────────────────────────
  const handleGenerateClick = () => {
    setGenerateData({ userId: '', month: '' });
    setFormError('');
    setGenStep(0);
    setIsGenerating(false);
    setIsGenerateModalOpen(true);
  };

  const handleGenerateSubmit = async () => {
    if (!generateData.userId || !generateData.month) {
      setFormError('Please select a user and a statement period.');
      return;
    }

    setFormError('');
    setIsGenerating(true);
    setGenStep(0);

    // Walk the UI through the steps while the request is in flight
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step < GENERATION_STEPS.length) setGenStep(step);
    }, 450);

    try {
      await apiFetch('/admin/statements', {
        method: 'POST',
        body: JSON.stringify({
          userId: generateData.userId,
          month: generateData.month,
          accountId: null, // All accounts
        }),
      });

      clearInterval(interval);
      setGenStep(GENERATION_STEPS.length - 1);

      await loadStatements();

      setTimeout(() => {
        setIsGenerating(false);
        setIsGenerateModalOpen(false);
        showToast(
          duplicateExists
            ? `Statement regenerated for ${selectedUser?.name || 'user'}.`
            : `Statement generated for ${selectedUser?.name || 'user'}.`
        );
      }, 600);
    } catch (err) {
      clearInterval(interval);
      console.error('❌ Generate failed:', err);
      setIsGenerating(false);
      setFormError(err.message || 'Failed to generate statement');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available': return <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary"><CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.25} />Available</span>;
      case 'Revoked':   return <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted"><span className="h-1.5 w-1.5 bg-muted" />Revoked</span>;
      default: return null;
    }
  };

  // ────────────────────────────────────────────────────────
  // Full-page loading / error
  // ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" strokeWidth={1.75} />
        <p className="text-sm text-muted">Loading statements…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4">
        <p className="font-serif text-xl font-bold text-deep-accent">
          We couldn&rsquo;t load statements
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
          <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">Manage Statements</h1>
          <p className="mt-1 text-sm text-body">Generate monthly account statements and make them available to users instantly.</p>
        </div>
        <button 
          onClick={handleGenerateClick}
          className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-deep transition-colors"
        >
          <Sparkles className="h-4 w-4" strokeWidth={2} /> Generate Statement
        </button>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center border border-hairline bg-white px-3 focus-within:border-primary">
          <Search className="h-4 w-4 text-muted" strokeWidth={2} />
          <input 
            type="text" 
            placeholder="Search by user, ID, or file name..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="min-h-[40px] w-full border-none bg-transparent px-3 py-2 text-sm text-deep-accent outline-none placeholder:text-muted/60" 
          />
        </div>
        <button className="inline-flex min-h-[40px] items-center justify-center gap-2 border border-hairline bg-white px-4 py-2 text-sm font-semibold text-deep-accent hover:bg-faint">
          <Filter className="h-4 w-4" strokeWidth={2} /> Filter
        </button>
      </div>

      {/* Statements Table */}
      <div className="overflow-x-auto border border-hairline bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-hairline bg-faint/50 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Statement ID</th>
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Period</th>
              <th className="px-5 py-3 font-semibold">Generated Date</th>
              <th className="px-5 py-3 font-semibold">File Name</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-faint">
            {filteredStatements.map((s) => (
              <tr key={s.id} className="transition-colors hover:bg-faint/30">
                <td className="px-5 py-4 font-mono text-xs text-muted">
                  {String(s.id).slice(-8).toUpperCase()}
                </td>
                <td className="px-5 py-4 font-semibold text-deep-accent">{s.user}</td>
                <td className="px-5 py-4 text-body">{s.monthLabel || formatMonthLabel(s.month)}</td>
                <td className="px-5 py-4 text-muted">{formatDate(s.generatedAt)}</td>
                <td className="px-5 py-4 text-xs text-muted max-w-[150px] truncate" title={buildFileName(s.user, s.month)}>
                  {buildFileName(s.user, s.month)}
                </td>
                <td className="px-5 py-4">{getStatusBadge(s.status)}</td>
                <td className="px-5 py-4 text-right">
                  <button onClick={() => handleViewClick(s)} className="inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-primary" title="View Details">
                    <Eye className="h-4 w-4" strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => downloadPdf(s)}
                    disabled={downloadingId === s.id}
                    className="ml-2 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-primary disabled:opacity-50"
                    title="Download PDF"
                  >
                    {downloadingId === s.id
                      ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                      : <Download className="h-4 w-4" strokeWidth={2} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStatements.length === 0 && <div className="p-8 text-center text-muted">No statements found.</div>}
      </div>

      {/* --- VIEW STATEMENT MODAL --- */}
      {isViewModalOpen && selectedStatement && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4" onClick={() => setIsViewModalOpen(false)}>
          <div className="relative w-full max-w-[480px] border border-hairline bg-white p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsViewModalOpen(false)} className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent">
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>
            <div className="flex items-start gap-3 mb-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                <FileSpreadsheet className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-deep-accent">Statement Details</h2>
                <p className="mt-1 text-sm text-body">
                  {String(selectedStatement.id).slice(-8).toUpperCase()} • {selectedStatement.user}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4 border border-hairline bg-faint/30 p-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted">Period</div>
                  <div className="mt-1 text-sm font-semibold text-deep-accent">
                    {selectedStatement.monthLabel || formatMonthLabel(selectedStatement.month)}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted">Generated</div>
                  <div className="mt-1 text-sm font-semibold text-deep-accent">
                    {formatDate(selectedStatement.generatedAt)}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted">File Name</div>
                  <div className="mt-1 text-sm font-semibold text-deep-accent truncate">
                    {buildFileName(selectedStatement.user, selectedStatement.month)}
                  </div>
                </div>
              </div>

              <p className="flex items-start gap-2 text-xs text-muted">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={2.25} />
                This statement is live on the user&rsquo;s Statements page and can be downloaded at any time.
              </p>

              <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
                <button onClick={() => setIsViewModalOpen(false)} className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent hover:bg-faint">Close</button>
                <button 
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="inline-flex min-h-[40px] items-center justify-center gap-2 border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent hover:bg-faint disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRegenerating
                    ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                    : <RefreshCw className="h-4 w-4" strokeWidth={2.25} />}
                  {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                </button>
                <button
                  onClick={() => downloadPdf(selectedStatement)}
                  disabled={downloadingId === selectedStatement.id}
                  className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-deep disabled:opacity-70"
                >
                  {downloadingId === selectedStatement.id
                    ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                    : <Download className="h-4 w-4" strokeWidth={2.25} />}
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- GENERATE STATEMENT MODAL --- */}
      {isGenerateModalOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
          onClick={() => { if (!isGenerating) setIsGenerateModalOpen(false); }}
        >
          <div className="relative max-h-[90vh] w-full max-w-[500px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => { if (!isGenerating) setIsGenerateModalOpen(false); }}
              disabled={isGenerating}
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>
            
            <div className="flex items-start gap-3 mb-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                <Sparkles className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-deep-accent">Generate Statement</h2>
                <p className="mt-1 text-sm text-body">
                  Create a monthly statement for a user. Once generated, it is immediately available on their Statements page.
                </p>
              </div>
            </div>

            {isGenerating ? (
              /* --- Generation progress --- */
              <div className="flex flex-col gap-5">
                <div className="border border-hairline bg-faint/30 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted">Generating for</div>
                  <div className="mt-1 text-sm font-semibold text-deep-accent">
                    {selectedUser?.name || '—'} — {formatMonthLabel(generateData.month)}
                  </div>
                </div>

                <ul className="flex flex-col gap-3">
                  {GENERATION_STEPS.map((step, i) => (
                    <li key={step} className="flex items-center gap-3">
                      {i < genStep ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" strokeWidth={2.25} />
                      ) : i === genStep ? (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" strokeWidth={2.25} />
                      ) : (
                        <span className="h-4 w-4 shrink-0 border border-hairline" />
                      )}
                      <span className={`text-sm ${i <= genStep ? 'text-deep-accent font-semibold' : 'text-muted'}`}>
                        {step}
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="text-xs text-muted">This usually takes a few seconds. Please keep this window open.</p>
              </div>
            ) : (
              /* --- Generation form --- */
              <div className="flex flex-col gap-5">
                {/* User Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-deep-accent">Select User</label>
                  <select 
                    value={generateData.userId} 
                    onChange={(e) => { setGenerateData({ ...generateData, userId: e.target.value }); setFormError(''); }} 
                    className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                  >
                    <option value="">-- Select a user --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                {/* Period Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-deep-accent flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" strokeWidth={2} />
                    Statement Period (Month)
                  </label>
                  <input 
                    type="month" 
                    value={generateData.month} 
                    onChange={(e) => { setGenerateData({ ...generateData, month: e.target.value }); setFormError(''); }} 
                    className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                  />
                </div>

                {/* What will be generated */}
                {selectedUser && generateData.month && (
                  <div className="border border-hairline bg-faint/30 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted">Output File</div>
                    <div className="mt-1 truncate text-sm font-semibold text-deep-accent">
                      {buildFileName(selectedUser.name, generateData.month)}
                    </div>
                    <div className="mt-1 text-xs text-muted">
                      {formatMonthLabel(generateData.month)} • PDF
                    </div>
                  </div>
                )}

                {/* Duplicate warning — informational, does not block */}
                {duplicateExists && !formError && (
                  <p className="border border-hairline bg-faint/40 p-3 text-xs text-[#8a6d3b]">
                    A statement for {selectedUser?.name} — {formatMonthLabel(generateData.month)} already exists. Generating again will replace it with the latest data.
                  </p>
                )}
                {formError && <p className="text-xs text-[#d9534f]">{formError}</p>}

                {/* Actions */}
                <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
                  <button onClick={() => setIsGenerateModalOpen(false)} className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent hover:bg-faint">Cancel</button>
                  <button 
                    onClick={handleGenerateSubmit} 
                    disabled={!generateData.userId || !generateData.month}
                    className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-deep disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="h-4 w-4" strokeWidth={2.25} /> Generate Statement
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TOAST --- */}
      {toast && (
        <div className="fixed right-4 top-4 z-[10001] flex items-start gap-3 border border-hairline bg-white p-4 shadow-lg">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.25} />
          <p className="text-sm font-semibold text-deep-accent">{toast}</p>
        </div>
      )}
    </div>
  );
};

export default ManageStatements;