// src/pages/admin/ManageTransfers.jsx
import React, { useState } from 'react';
import { Search, Filter, Eye, X, Save, ArrowRightLeft, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { mockAdminTransfers } from '../../data/mockAdminData';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const ManageTransfers = () => {
  const [transfers, setTransfers] = useState(mockAdminTransfers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  const filteredTransfers = transfers.filter(t => 
    t.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewClick = (transfer) => {
    setSelectedTransfer({ ...transfer });
    setAdminNote(''); // Reset admin note for the new modal view
    setIsModalOpen(true);
  };

  // Quick status change directly from the table
  const handleQuickStatusChange = (id, newStatus) => {
    setTransfers(transfers.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const handleSaveTransfer = () => {
    // In a real app, you would send the adminNote along with the status change here
    setTransfers(transfers.map(t => t.id === selectedTransfer.id ? selectedTransfer : t));
    setIsModalOpen(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed': return <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary"><CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.25} />Completed</span>;
      case 'Pending': return <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#f0ad4e]"><Clock className="h-3.5 w-3.5" strokeWidth={2.25} />Pending</span>;
      case 'Failed': return <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#d9534f]"><XCircle className="h-3.5 w-3.5" strokeWidth={2.25} />Failed</span>;
      default: return null;
    }
  };

  const getStatusSelectColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-primary';
      case 'Pending': return 'text-[#f0ad4e]';
      case 'Failed': return 'text-[#d9534f]';
      default: return 'text-muted';
    }
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-6 flex flex-col gap-4 border-b border-hairline pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">Manage Transfers</h1>
          <p className="mt-1 text-sm text-body">Monitor and manage all internal and external fund transfers.</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center border border-hairline bg-white px-3 focus-within:border-primary">
          <Search className="h-4 w-4 text-muted" strokeWidth={2} />
          <input type="text" placeholder="Search by user or transfer ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="min-h-[40px] w-full border-none bg-transparent px-3 py-2 text-sm text-deep-accent outline-none placeholder:text-muted/60" />
        </div>
        <button className="inline-flex min-h-[40px] items-center justify-center gap-2 border border-hairline bg-white px-4 py-2 text-sm font-semibold text-deep-accent hover:bg-faint">
          <Filter className="h-4 w-4" strokeWidth={2} /> Filter
        </button>
      </div>

      <div className="overflow-x-auto border border-hairline bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-hairline bg-faint/50 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Transfer ID</th>
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">From</th>
              <th className="px-5 py-3 font-semibold">To</th>
              <th className="px-5 py-3 font-semibold">Amount</th>
              {/* Updated Header to indicate quick change */}
              <th className="px-5 py-3 font-semibold">Status <span className="text-[10px] text-muted normal-case font-normal">(Click to change)</span></th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-faint">
            {filteredTransfers.map((t) => (
              <tr key={t.id} className="transition-colors hover:bg-faint/30">
                <td className="px-5 py-4 font-mono text-xs text-muted">{t.id}</td>
                <td className="px-5 py-4 font-semibold text-deep-accent">{t.user}</td>
                <td className="px-5 py-4 text-body">{t.from}</td>
                <td className="px-5 py-4 text-body">{t.to}</td>
                <td className="px-5 py-4 font-semibold text-deep-accent">{formatCurrency(t.amount)}</td>
                
                {/* Interactive Status Dropdown in Table */}
                <td className="px-5 py-4">
                  <div className="relative inline-flex items-center">
                    <select
                      value={t.status}
                      onChange={(e) => handleQuickStatusChange(t.id, e.target.value)}
                      className={`appearance-none bg-transparent border-none text-xs font-bold uppercase tracking-wide cursor-pointer focus:outline-none ${getStatusSelectColor(t.status)}`}
                    >
                      <option value="Completed" className="text-deep-accent font-normal normal-case">Completed</option>
                      <option value="Pending" className="text-deep-accent font-normal normal-case">Pending</option>
                      <option value="Failed" className="text-deep-accent font-normal normal-case">Failed</option>
                    </select>
                    {/* Small chevron indicator */}
                    <svg className={`ml-1 h-3 w-3 ${getStatusSelectColor(t.status)}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </td>

                <td className="px-5 py-4 text-right">
                  <button onClick={() => handleViewClick(t)} className="inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-primary" title="View Details & Add Notes">
                    <Eye className="h-4 w-4" strokeWidth={2} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTransfers.length === 0 && <div className="p-8 text-center text-muted">No transfers found.</div>}
      </div>

      {/* --- TRANSFER DETAILS MODAL --- */}
      {isModalOpen && selectedTransfer && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="relative max-h-[90vh] w-full max-w-[500px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsModalOpen(false)} className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent">
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>
            <div className="flex items-start gap-3 mb-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                <ArrowRightLeft className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-deep-accent">Transfer Details</h2>
                <p className="mt-1 text-sm text-body">{selectedTransfer.id} • {selectedTransfer.user}</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-5">
              {/* Read-only Details */}
              <div className="grid grid-cols-2 gap-4 border border-hairline bg-faint/30 p-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted">From</div>
                  <div className="mt-1 text-sm font-semibold text-deep-accent">{selectedTransfer.from}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted">To</div>
                  <div className="mt-1 text-sm font-semibold text-deep-accent">{selectedTransfer.to}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted">Amount</div>
                  <div className="mt-1 text-sm font-semibold text-deep-accent">{formatCurrency(selectedTransfer.amount)}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted">Date</div>
                  <div className="mt-1 text-sm font-semibold text-deep-accent">{selectedTransfer.date}</div>
                </div>
              </div>

              {/* Editable Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-deep-accent">Transfer Status</label>
                <select 
                  value={selectedTransfer.status} 
                  onChange={(e) => setSelectedTransfer({...selectedTransfer, status: e.target.value})} 
                  className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                >
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Admin Note */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-deep-accent flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-primary" strokeWidth={2} />
                  Admin Notes (Reason for status change)
                </label>
                <textarea 
                  rows="3"
                  placeholder="e.g. Changed to Pending due to user request..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full border border-hairline bg-white p-3 text-sm text-deep-accent outline-none focus:border-primary placeholder:text-muted/60 resize-none"
                ></textarea>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
                <button onClick={() => setIsModalOpen(false)} className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent hover:bg-faint">Cancel</button>
                <button onClick={handleSaveTransfer} className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-deep">
                  <Save className="h-4 w-4" strokeWidth={2.25} /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTransfers;