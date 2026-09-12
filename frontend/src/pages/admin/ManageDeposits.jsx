// src/pages/admin/ManageDeposits.jsx
import React, { useState } from 'react';
import { 
  Search, Filter, Eye, X, CheckCircle2, XCircle, 
  FileText, AlertCircle, Banknote 
} from 'lucide-react';
import { mockAdminDeposits } from '../../data/mockAdminData';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const ManageDeposits = () => {
  const [deposits, setDeposits] = useState(mockAdminDeposits);
  const [searchTerm, setSearchTerm] = useState('');
  const [showChequesOnly, setShowChequesOnly] = useState(false);
  
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Filter Logic: Search + Cheque Toggle
  const filteredDeposits = deposits.filter(d => {
    const matchesSearch = d.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCheque = showChequesOnly ? d.method === 'Cheque' : true;
    return matchesSearch && matchesCheque;
  });

  const handleReviewClick = (deposit) => {
    setSelectedDeposit({ ...deposit });
    setAdminNote('');
    setSaveSuccess(false);
    setIsModalOpen(true);
  };

  const handleSaveDeposit = () => {
    // Update the deposit status in the local state
    setDeposits(deposits.map(d => 
      d.id === selectedDeposit.id ? { ...d, status: selectedDeposit.status } : d
    ));

    // Show success message inside the modal
    setSaveSuccess(true);

    // In a real application, if selectedDeposit.status === 'Completed', 
    // you would make an API call here to increase the user's account balance.
    if (selectedDeposit.status === 'Completed') {
      console.log(`Simulating balance increase for ${selectedDeposit.user} of ${selectedDeposit.amount}`);
    }

    // Close the modal after a short delay so the user sees the success message
    setTimeout(() => {
      setIsModalOpen(false);
    }, 1500);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed': return <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary"><CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.25} />Completed</span>;
      case 'Pending': return <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#f0ad4e]"><AlertCircle className="h-3.5 w-3.5" strokeWidth={2.25} />Pending</span>;
      case 'Rejected': return <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#d9534f]"><XCircle className="h-3.5 w-3.5" strokeWidth={2.25} />Rejected</span>;
      default: return null;
    }
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-6 flex flex-col gap-4 border-b border-hairline pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">Manage Deposits</h1>
          <p className="mt-1 text-sm text-body">Review and approve incoming user deposits.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center border border-hairline bg-white px-3 focus-within:border-primary">
          <Search className="h-4 w-4 text-muted" strokeWidth={2} />
          <input 
            type="text" 
            placeholder="Search by user or deposit ID..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="min-h-[40px] w-full border-none bg-transparent px-3 py-2 text-sm text-deep-accent outline-none placeholder:text-muted/60" 
          />
        </div>
        
        {/* Cheque Filter Toggle */}
        <button 
          onClick={() => setShowChequesOnly(!showChequesOnly)}
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
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-faint">
            {filteredDeposits.map((d) => (
              <tr key={d.id} className="transition-colors hover:bg-faint/30">
                <td className="px-5 py-4 font-mono text-xs text-muted">{d.id}</td>
                <td className="px-5 py-4 font-semibold text-deep-accent">{d.user}</td>
                <td className="px-5 py-4 font-semibold text-deep-accent">{formatCurrency(d.amount)}</td>
                <td className="px-5 py-4 text-body">
                  {d.method}
                  {d.method === 'Cheque' && <span className="ml-2 inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-primary/10 text-primary">Cheque</span>}
                </td>
                <td className="px-5 py-4 text-muted">{d.date}</td>
                <td className="px-5 py-4">{getStatusBadge(d.status)}</td>
                <td className="px-5 py-4 text-right">
                  <button onClick={() => handleReviewClick(d)} className="inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-primary" title="Review Deposit">
                    <Eye className="h-4 w-4" strokeWidth={2} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredDeposits.length === 0 && <div className="p-8 text-center text-muted">No deposits found matching your criteria.</div>}
      </div>

      {/* Review Deposit Modal */}
      {isModalOpen && selectedDeposit && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="relative max-h-[90vh] w-full max-w-[500px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsModalOpen(false)} className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent">
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>
            
            <div className="flex items-start gap-3 mb-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                <FileText className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-deep-accent">Review Deposit</h2>
                <p className="mt-1 text-sm text-body">{selectedDeposit.id} • {selectedDeposit.user}</p>
              </div>
            </div>

            {saveSuccess ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center bg-[#e7f3f5] text-primary rounded-full">
                  <CheckCircle2 className="h-8 w-8" strokeWidth={2} />
                </div>
                <h3 className="font-serif text-lg font-bold text-deep-accent">Deposit Updated</h3>
                <p className="mt-1 text-sm text-body">
                  {selectedDeposit.status === 'Completed' 
                    ? `User's balance has been increased by ${formatCurrency(selectedDeposit.amount)}.`
                    : `Deposit status changed to ${selectedDeposit.status}.`}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4 border border-hairline bg-faint/30 p-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted">Amount</div>
                    <div className="mt-1 text-sm font-semibold text-deep-accent">{formatCurrency(selectedDeposit.amount)}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted">Method</div>
                    <div className="mt-1 text-sm font-semibold text-deep-accent">{selectedDeposit.method}</div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-deep-accent">Deposit Status</label>
                  <select 
                    value={selectedDeposit.status} 
                    onChange={(e) => setSelectedDeposit({...selectedDeposit, status: e.target.value})} 
                    className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {/* Balance Update Warning/Info */}
                {selectedDeposit.status === 'Completed' && (
                  <div className="flex items-start gap-2 border border-[#c3e6cb] bg-[#d4edda] px-4 py-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#155724]" strokeWidth={2} />
                    <span className="text-sm text-[#155724]">
                      Saving this will automatically increase <strong>{selectedDeposit.user}</strong>&rsquo;s available balance by <strong>{formatCurrency(selectedDeposit.amount)}</strong>.
                    </span>
                  </div>
                )}
                {selectedDeposit.status === 'Rejected' && (
                  <div className="flex items-start gap-2 border border-[#f5c6cb] bg-[#f8d7da] px-4 py-2.5">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#721c24]" strokeWidth={2} />
                    <span className="text-sm text-[#721c24]">
                      This deposit will be rejected and the funds will not be added to the user's account.
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-deep-accent">Admin Notes</label>
                  <textarea 
                    rows="3" 
                    placeholder="Add notes regarding this deposit decision..." 
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full border border-hairline bg-white p-3 text-sm text-deep-accent outline-none focus:border-primary placeholder:text-muted/60 resize-none"
                  ></textarea>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
                  <button onClick={() => setIsModalOpen(false)} className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent hover:bg-faint">Cancel</button>
                  <button onClick={handleSaveDeposit} className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-deep">
                    <CheckCircle2 className="h-4 w-4" strokeWidth={2.25} /> Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDeposits;