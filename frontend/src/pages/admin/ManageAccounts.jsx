// src/pages/admin/ManageAccounts.jsx
import React, { useState } from 'react';
import { Search, Filter, Edit, X, Save, Wallet, Plus } from 'lucide-react';
import { mockAdminAccounts } from '../../data/mockAdminData';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const ManageAccounts = () => {
  const [accounts, setAccounts] = useState(mockAdminAccounts);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit Modal State
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    user: '',
    accountNumber: '',
    type: 'Checking',
    subType: null,
    totalBalance: 0,
    availableBalance: 0,
    pendingBalance: 0,
    interestRate: '',
    status: 'Active'
  });

  const filteredAccounts = accounts.filter(acc => 
    acc.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    acc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.accountNumber.includes(searchTerm)
  );

  // --- Edit Handlers ---
  const handleEditClick = (acc) => {
    setSelectedAccount({ ...acc });
    setIsEditModalOpen(true);
  };

  const handleSaveAccount = () => {
    setAccounts(accounts.map(a => a.id === selectedAccount.id ? selectedAccount : a));
    setIsEditModalOpen(false);
  };

  // --- Create Handlers ---
  const handleCreateClick = () => {
    setNewAccount({
      user: '',
      accountNumber: '',
      type: 'Checking',
      subType: null,
      totalBalance: 0,
      availableBalance: 0,
      pendingBalance: 0,
      interestRate: '',
      status: 'Active'
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateAccount = () => {
    const newId = `ACC-${String(accounts.length + 1).padStart(3, '0')}`;
    
    const accountToAdd = {
      ...newAccount,
      id: newId,
      accountNumber: newAccount.accountNumber || '0000',
      subType: newAccount.type === 'Savings' ? (newAccount.subType || 'Standard') : null,
      totalBalance: parseFloat(newAccount.totalBalance) || 0,
      availableBalance: parseFloat(newAccount.availableBalance) || 0,
      pendingBalance: parseFloat(newAccount.pendingBalance) || 0,
      interestRate: newAccount.type === 'Savings' ? (parseFloat(newAccount.interestRate) || 0) : null,
    };

    setAccounts([accountToAdd, ...accounts]);
    setIsCreateModalOpen(false);
  };

  // Helper to get status badge classes
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return 'text-primary bg-primary/10';
      case 'Suspended': return 'text-[#f0ad4e] bg-[#f0ad4e]/10';
      case 'Closed': return 'text-[#d9534f] bg-[#d9534f]/10';
      default: return 'text-muted bg-faint';
    }
  };

  // Helper to format the account type display
  const formatAccountType = (acc) => {
    if (acc.type === 'Savings' && acc.subType) {
      return `${acc.type} (${acc.subType})`;
    }
    return acc.type;
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 border-b border-hairline pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">Manage Accounts</h1>
          <p className="mt-1 text-sm text-body">View, edit, and create user bank accounts.</p>
        </div>
        <button 
          onClick={handleCreateClick}
          className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-deep transition-colors"
        >
          <Plus className="h-4 w-4" strokeWidth={2} /> Create Account
        </button>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center border border-hairline bg-white px-3 focus-within:border-primary">
          <Search className="h-4 w-4 text-muted" strokeWidth={2} />
          <input 
            type="text" 
            placeholder="Search by user, account ID, or number..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="min-h-[40px] w-full border-none bg-transparent px-3 py-2 text-sm text-deep-accent outline-none placeholder:text-muted/60" 
          />
        </div>
        <button className="inline-flex min-h-[40px] items-center justify-center gap-2 border border-hairline bg-white px-4 py-2 text-sm font-semibold text-deep-accent hover:bg-faint">
          <Filter className="h-4 w-4" strokeWidth={2} /> Filter
        </button>
      </div>

      {/* Accounts Table */}
      <div className="overflow-x-auto border border-hairline bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-hairline bg-faint/50 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Account ID</th>
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Acct No.</th>
              <th className="px-5 py-3 font-semibold">Type</th>
              <th className="px-5 py-3 font-semibold">Balances (Total / Avail / Pend)</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-faint">
            {filteredAccounts.map((acc) => (
              <tr key={acc.id} className="transition-colors hover:bg-faint/30">
                <td className="px-5 py-4 font-mono text-xs text-muted">{acc.id}</td>
                <td className="px-5 py-4 font-semibold text-deep-accent">{acc.user}</td>
                <td className="px-5 py-4 text-muted">•••• {acc.accountNumber}</td>
                <td className="px-5 py-4 text-body">
                  {formatAccountType(acc)}
                  {acc.interestRate !== null && acc.type === 'Savings' && (
                    <span className="ml-1 text-xs text-primary font-semibold">({acc.interestRate}%)</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-0.5 text-xs">
                    <span className="font-semibold text-deep-accent">Total: {formatCurrency(acc.totalBalance)}</span>
                    <span className="text-primary">Avail: {formatCurrency(acc.availableBalance)}</span>
                    <span className="text-muted">Pend: {formatCurrency(acc.pendingBalance)}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${getStatusBadge(acc.status)}`}>
                    {acc.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button onClick={() => handleEditClick(acc)} className="inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-primary">
                    <Edit className="h-4 w-4" strokeWidth={2} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAccounts.length === 0 && <div className="p-8 text-center text-muted">No accounts found.</div>}
      </div>

      {/* --- EDIT ACCOUNT MODAL --- */}
      {isEditModalOpen && selectedAccount && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4" onClick={() => setIsEditModalOpen(false)}>
          <div className="relative max-h-[90vh] w-full max-w-[500px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsEditModalOpen(false)} className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent">
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>
            <div className="flex items-start gap-3 mb-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                <Wallet className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-deep-accent">Edit Account</h2>
                <p className="mt-1 text-sm text-body">{selectedAccount.id} • {selectedAccount.user}</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-deep-accent">Account Number</label>
                  <input type="text" value={selectedAccount.accountNumber} onChange={(e) => setSelectedAccount({...selectedAccount, accountNumber: e.target.value})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-deep-accent">Account Type</label>
                  <select value={selectedAccount.type} onChange={(e) => setSelectedAccount({...selectedAccount, type: e.target.value})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none">
                    <option value="Checking">Checking</option>
                    <option value="Savings">Savings</option>
                  </select>
                </div>
              </div>

              {selectedAccount.type === 'Savings' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-deep-accent">Savings Type</label>
                    <select value={selectedAccount.subType || 'Standard'} onChange={(e) => setSelectedAccount({...selectedAccount, subType: e.target.value})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none">
                      <option value="Standard">Standard Savings</option>
                      <option value="High Yield">High Yield Savings</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-deep-accent">Interest Rate (%)</label>
                    <input type="number" step="0.01" value={selectedAccount.interestRate || ''} onChange={(e) => setSelectedAccount({...selectedAccount, interestRate: e.target.value})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 border-t border-hairline pt-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-accent">Total Balance</label>
                  <input type="number" step="0.01" value={selectedAccount.totalBalance} onChange={(e) => setSelectedAccount({...selectedAccount, totalBalance: parseFloat(e.target.value) || 0})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-accent">Available Balance</label>
                  <input type="number" step="0.01" value={selectedAccount.availableBalance} onChange={(e) => setSelectedAccount({...selectedAccount, availableBalance: parseFloat(e.target.value) || 0})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-accent">Pending Balance</label>
                  <input type="number" step="0.01" value={selectedAccount.pendingBalance} onChange={(e) => setSelectedAccount({...selectedAccount, pendingBalance: parseFloat(e.target.value) || 0})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 border-t border-hairline pt-4">
                <label className="text-sm font-semibold text-deep-accent">Account Status</label>
                <select value={selectedAccount.status} onChange={(e) => setSelectedAccount({...selectedAccount, status: e.target.value})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none">
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
                <button onClick={() => setIsEditModalOpen(false)} className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent hover:bg-faint">Cancel</button>
                <button onClick={handleSaveAccount} className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-deep">
                  <Save className="h-4 w-4" strokeWidth={2.25} /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CREATE ACCOUNT MODAL --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4" onClick={() => setIsCreateModalOpen(false)}>
          <div className="relative max-h-[90vh] w-full max-w-[500px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsCreateModalOpen(false)} className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent">
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>
            <div className="flex items-start gap-3 mb-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                <Plus className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-deep-accent">Create New Account</h2>
                <p className="mt-1 text-sm text-body">Open a new account for a user.</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-deep-accent">User Name</label>
                  <input type="text" placeholder="e.g. John Doe" value={newAccount.user} onChange={(e) => setNewAccount({...newAccount, user: e.target.value})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-deep-accent">Account Number</label>
                  <input type="text" placeholder="e.g. 1234" value={newAccount.accountNumber} onChange={(e) => setNewAccount({...newAccount, accountNumber: e.target.value})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-deep-accent">Account Type</label>
                  <select value={newAccount.type} onChange={(e) => setNewAccount({...newAccount, type: e.target.value})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none">
                    <option value="Checking">Checking</option>
                    <option value="Savings">Savings</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-deep-accent">Status</label>
                  <select value={newAccount.status} onChange={(e) => setNewAccount({...newAccount, status: e.target.value})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none">
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {newAccount.type === 'Savings' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-deep-accent">Savings Type</label>
                    <select value={newAccount.subType || 'Standard'} onChange={(e) => setNewAccount({...newAccount, subType: e.target.value})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none">
                      <option value="Standard">Standard Savings</option>
                      <option value="High Yield">High Yield Savings</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-deep-accent">Interest Rate (%)</label>
                    <input type="number" step="0.01" placeholder="e.g. 4.5" value={newAccount.interestRate} onChange={(e) => setNewAccount({...newAccount, interestRate: e.target.value})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 border-t border-hairline pt-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-accent">Total Balance</label>
                  <input type="number" step="0.01" value={newAccount.totalBalance} onChange={(e) => setNewAccount({...newAccount, totalBalance: e.target.value})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-accent">Available Balance</label>
                  <input type="number" step="0.01" value={newAccount.availableBalance} onChange={(e) => setNewAccount({...newAccount, availableBalance: e.target.value})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-accent">Pending Balance</label>
                  <input type="number" step="0.01" value={newAccount.pendingBalance} onChange={(e) => setNewAccount({...newAccount, pendingBalance: e.target.value})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none" />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
                <button onClick={() => setIsCreateModalOpen(false)} className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent hover:bg-faint">Cancel</button>
                <button onClick={handleCreateAccount} className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-deep">
                  <Save className="h-4 w-4" strokeWidth={2.25} /> Create Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAccounts;