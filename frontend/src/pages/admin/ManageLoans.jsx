// src/pages/admin/ManageLoans.jsx
import React, { useState } from 'react';
import { 
  Search, Filter, Edit, X, Save, Landmark, 
  CheckCircle2, XCircle, AlertCircle, FileText 
} from 'lucide-react';
import { mockAdminLoans } from '../../data/mockAdminData';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};

const ManageLoans = () => {
  const [users, setUsers] = useState(mockAdminLoans);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredUsers = users.filter(u => 
    u.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleManageClick = (user) => {
    setSelectedUser(JSON.parse(JSON.stringify(user))); // Deep clone
    setIsModalOpen(true);
  };

  const handleSaveUser = () => {
    setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
    setIsModalOpen(false);
  };

  // Handle approving/rejecting a specific loan application inside the modal
  const handleUpdateApplicationStatus = (appId, newStatus) => {
    setSelectedUser({
      ...selectedUser,
      applications: selectedUser.applications.map(app => 
        app.id === appId ? { ...app, status: newStatus } : app
      )
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary"><span className="h-1.5 w-1.5 bg-primary" />Active</span>;
      case 'Approved': return <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary"><span className="h-1.5 w-1.5 bg-primary" />Approved</span>;
      case 'Pending': return <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#f0ad4e]"><span className="h-1.5 w-1.5 bg-[#f0ad4e]" />Pending</span>;
      case 'Rejected': return <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#d9534f]"><span className="h-1.5 w-1.5 bg-[#d9534f]" />Rejected</span>;
      default: return null;
    }
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-6 flex flex-col gap-4 border-b border-hairline pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">Manage Loans</h1>
          <p className="mt-1 text-sm text-body">Manage user loan summaries and review applications.</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center border border-hairline bg-white px-3 focus-within:border-primary">
          <Search className="h-4 w-4 text-muted" strokeWidth={2} />
          <input type="text" placeholder="Search by user name or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="min-h-[40px] w-full border-none bg-transparent px-3 py-2 text-sm text-deep-accent outline-none placeholder:text-muted/60" />
        </div>
        <button className="inline-flex min-h-[40px] items-center justify-center gap-2 border border-hairline bg-white px-4 py-2 text-sm font-semibold text-deep-accent hover:bg-faint">
          <Filter className="h-4 w-4" strokeWidth={2} /> Filter
        </button>
      </div>

      {/* User Loan Summary Table */}
      <div className="overflow-x-auto border border-hairline bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-hairline bg-faint/50 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Total Loan Balance</th>
              <th className="px-5 py-3 font-semibold">Next Payment</th>
              <th className="px-5 py-3 font-semibold">Due Date</th>
              <th className="px-5 py-3 font-semibold">Active Loans</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-faint">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="transition-colors hover:bg-faint/30">
                <td className="px-5 py-4">
                  <div className="font-semibold text-deep-accent">{u.user}</div>
                  <div className="text-xs text-muted">{u.id}</div>
                </td>
                <td className="px-5 py-4 font-semibold text-deep-accent">{formatCurrency(u.totalLoanBalance)}</td>
                <td className="px-5 py-4 text-body">{formatCurrency(u.nextPayment)}</td>
                <td className="px-5 py-4 text-muted">{u.dueDate || 'N/A'}</td>
                <td className="px-5 py-4 text-body">{u.activeLoans}</td>
                <td className="px-5 py-4 text-right">
                  <button onClick={() => handleManageClick(u)} className="inline-flex h-8 items-center gap-2 border border-hairline bg-white px-3 py-1 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint">
                    <Edit className="h-3.5 w-3.5" strokeWidth={2} /> Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && <div className="p-8 text-center text-muted">No users found.</div>}
      </div>

      {/* --- MANAGE USER LOANS MODAL --- */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="relative max-h-[90vh] w-full max-w-[800px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent">
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>
            
            <div className="flex items-start gap-3 mb-6 border-b border-hairline pb-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                <Landmark className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-deep-accent">Manage Loans</h2>
                <p className="mt-1 text-sm text-body">{selectedUser.user} • {selectedUser.id}</p>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              
              {/* SECTION 1: LOAN SUMMARY */}
              <div>
                <h3 className="mb-3 font-serif text-lg font-bold text-deep-accent">Loan Summary</h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-deep-accent">Total Balance</label>
                    <input type="number" step="0.01" value={selectedUser.totalLoanBalance} onChange={(e) => setSelectedUser({...selectedUser, totalLoanBalance: parseFloat(e.target.value) || 0})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-deep-accent">Next Payment</label>
                    <input type="number" step="0.01" value={selectedUser.nextPayment} onChange={(e) => setSelectedUser({...selectedUser, nextPayment: parseFloat(e.target.value) || 0})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-deep-accent">Due Date</label>
                    <input type="date" value={selectedUser.dueDate} onChange={(e) => setSelectedUser({...selectedUser, dueDate: e.target.value})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-deep-accent">Active Loans</label>
                    <input type="number" value={selectedUser.activeLoans} onChange={(e) => setSelectedUser({...selectedUser, activeLoans: parseInt(e.target.value) || 0})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* SECTION 2: LOAN APPLICATIONS */}
              <div>
                <div className="mb-3 flex items-center gap-2 border-b border-hairline pb-2">
                  <FileText className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  <h3 className="font-serif text-lg font-bold text-deep-accent">Loan Applications</h3>
                </div>
                
                {selectedUser.applications.length === 0 && (
                  <div className="text-sm text-muted py-4 text-center border border-dashed border-hairline">No applications on file.</div>
                )}

                <div className="flex flex-col gap-3">
                  {selectedUser.applications.map((app) => (
                    <div key={app.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-hairline bg-faint/30 p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-deep-accent">{app.type}</span>
                          <span className="font-mono text-xs text-muted">{app.id}</span>
                        </div>
                        <div className="text-sm text-body">Amount: {formatCurrency(app.amount)}</div>
                        <div className="text-xs text-muted">Applied: {app.date}</div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {getStatusBadge(app.status)}
                        
                        {/* Show Approve/Reject buttons only for Pending applications */}
                        {app.status === 'Pending' && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleUpdateApplicationStatus(app.id, 'Rejected')}
                              className="inline-flex h-8 items-center justify-center gap-1.5 border border-[#d9534f] bg-white px-3 text-xs font-semibold text-[#d9534f] hover:bg-[#fdf2f2] transition-colors"
                            >
                              <XCircle className="h-3.5 w-3.5" strokeWidth={2} /> Reject
                            </button>
                            <button 
                              onClick={() => handleUpdateApplicationStatus(app.id, 'Approved')}
                              className="inline-flex h-8 items-center justify-center gap-1.5 bg-primary px-3 text-xs font-semibold text-white hover:bg-primary-deep transition-colors"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} /> Approve
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* MODAL ACTIONS */}
              <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
                <button onClick={() => setIsModalOpen(false)} className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent hover:bg-faint">Cancel</button>
                <button onClick={handleSaveUser} className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-deep">
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

export default ManageLoans;