// src/pages/admin/ManageTransactions.jsx
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Download,
  X,
  Save,
  ArrowLeftRight
} from 'lucide-react';
import { mockAdminTransactions } from '../../data/mockAdminData';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Math.abs(amount));
};

const ManageTransactions = () => {
  const [transactions, setTransactions] = useState(mockAdminTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter logic
  const filteredTransactions = transactions.filter(tx => 
    tx.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tx.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewClick = (tx) => {
    setSelectedTx({ ...tx });
    setIsModalOpen(true);
  };

  const handleSaveTransaction = () => {
    setTransactions(transactions.map(tx => tx.id === selectedTx.id ? selectedTx : tx));
    setIsModalOpen(false);
  };

  // Status badge helper
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
      case 'Flagged':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#d9534f]">
            <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.25} />
            Flagged
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 border-b border-hairline pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">
            Manage Transactions
          </h1>
          <p className="mt-1 text-sm text-body">Monitor and manage all system-wide transactions.</p>
        </div>
        <button className="inline-flex min-h-[40px] items-center justify-center gap-2 border border-hairline bg-white px-4 py-2 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
          <Download className="h-4 w-4" strokeWidth={2} />
          Export CSV
        </button>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center border border-hairline bg-white px-3 focus-within:border-primary">
          <Search className="h-4 w-4 text-muted" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search by ID, user, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="min-h-[40px] w-full border-none bg-transparent px-3 py-2 text-sm text-deep-accent outline-none placeholder:text-muted/60"
          />
        </div>
        <button className="inline-flex min-h-[40px] items-center justify-center gap-2 border border-hairline bg-white px-4 py-2 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint">
          <Filter className="h-4 w-4" strokeWidth={2} />
          Filter
        </button>
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
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-faint">
            {filteredTransactions.map((tx) => (
              <tr key={tx.id} className="transition-colors hover:bg-faint/30">
                <td className="px-5 py-4 font-mono text-xs text-muted">{tx.id}</td>
                <td className="px-5 py-4 font-semibold text-deep-accent">{tx.user}</td>
                <td className="px-5 py-4 text-body">{tx.description}</td>
                <td className="px-5 py-4 text-muted">{tx.date}</td>
                <td className={`px-5 py-4 font-semibold ${tx.amount >= 0 ? 'text-primary' : 'text-deep-accent'}`}>
                  {tx.amount >= 0 ? '+' : '-'}{formatCurrency(tx.amount)}
                </td>
                <td className="px-5 py-4">
                  {getStatusBadge(tx.status)}
                </td>
                <td className="px-5 py-4 text-right">
                  <button 
                    onClick={() => handleViewClick(tx)} 
                    className="inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-primary"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" strokeWidth={2} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTransactions.length === 0 && (
          <div className="p-8 text-center text-muted">No transactions found matching your search.</div>
        )}
      </div>

      {/* View/Edit Transaction Modal */}
      {isModalOpen && selectedTx && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="relative max-h-[90vh] w-full max-w-[500px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>

            <div className="flex items-start gap-3 mb-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                <ArrowLeftRight className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-deep-accent">Transaction Details</h2>
                <p className="mt-1 text-sm text-body">ID: {selectedTx.id}</p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              {/* Read-only Details */}
              <div className="grid grid-cols-2 gap-4 border border-hairline bg-faint/30 p-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted">User</div>
                  <div className="mt-1 text-sm font-semibold text-deep-accent">{selectedTx.user}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted">Date</div>
                  <div className="mt-1 text-sm font-semibold text-deep-accent">{selectedTx.date}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted">Description</div>
                  <div className="mt-1 text-sm font-semibold text-deep-accent">{selectedTx.description}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted">Amount</div>
                  <div className={`mt-1 text-sm font-semibold ${selectedTx.amount >= 0 ? 'text-primary' : 'text-deep-accent'}`}>
                    {selectedTx.amount >= 0 ? '+' : '-'}{formatCurrency(selectedTx.amount)}
                  </div>
                </div>
              </div>

              {/* Editable Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-deep-accent">Transaction Status</label>
                <select 
                  value={selectedTx.status} 
                  onChange={(e) => setSelectedTx({...selectedTx, status: e.target.value})} 
                  className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                >
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Flagged">Flagged</option>
                </select>
              </div>

              {/* Admin Note */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-deep-accent">Admin Note (Optional)</label>
                <textarea 
                  rows="3"
                  placeholder="Add an internal note about this transaction..."
                  className="w-full border border-hairline bg-white p-3 text-sm text-deep-accent outline-none focus:border-primary placeholder:text-muted/60 resize-none"
                ></textarea>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveTransaction} 
                  className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep"
                >
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

export default ManageTransactions;