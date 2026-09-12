// src/pages/admin/ManagePayments.jsx
import React, { useState } from 'react';
import { 
  Search, Filter, Edit, X, Save, Receipt, 
  Plus, Trash2, CalendarClock, RefreshCw 
} from 'lucide-react';
import { mockAdminPayments } from '../../data/mockAdminData';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const ManagePayments = () => {
  const [users, setUsers] = useState(mockAdminPayments);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredUsers = users.filter(u => 
    u.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (user) => {
    // Deep clone to prevent direct state mutation
    setSelectedUser(JSON.parse(JSON.stringify(user)));
    setIsModalOpen(true);
  };

  const handleSaveUser = () => {
    setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
    setIsModalOpen(false);
  };

  // --- Upcoming Payments Handlers ---
  const handleAddUpcoming = () => {
    setSelectedUser({
      ...selectedUser,
      upcomingPayments: [
        ...selectedUser.upcomingPayments, 
        { id: `up-${Date.now()}`, name: '', dueDate: '', balance: 0, autopay: false }
      ]
    });
  };

  const handleRemoveUpcoming = (id) => {
    setSelectedUser({
      ...selectedUser,
      upcomingPayments: selectedUser.upcomingPayments.filter(p => p.id !== id)
    });
  };

  const handleUpcomingChange = (id, field, value) => {
    setSelectedUser({
      ...selectedUser,
      upcomingPayments: selectedUser.upcomingPayments.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      )
    });
  };

  // --- Automatic Payments Handlers ---
  const handleAddAutomatic = () => {
    setSelectedUser({
      ...selectedUser,
      automaticPayments: [
        ...selectedUser.automaticPayments, 
        { id: `auto-${Date.now()}`, name: '', frequency: 'Monthly', balance: 0, nextDate: '', autopay: false }
      ]
    });
  };

  const handleRemoveAutomatic = (id) => {
    setSelectedUser({
      ...selectedUser,
      automaticPayments: selectedUser.automaticPayments.filter(p => p.id !== id)
    });
  };

  const handleAutomaticChange = (id, field, value) => {
    setSelectedUser({
      ...selectedUser,
      automaticPayments: selectedUser.automaticPayments.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      )
    });
  };

  // Reusable Autopay Toggle Button
  const AutopayToggle = ({ isOn, onToggle }) => (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wide border transition-colors ${
        isOn 
          ? 'bg-primary/10 border-primary text-primary' 
          : 'bg-faint border-hairline text-muted'
      }`}
    >
      <span className={`h-1.5 w-1.5 ${isOn ? 'bg-primary' : 'bg-muted'}`} />
      Autopay {isOn ? 'ON' : 'OFF'}
    </button>
  );

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-6 flex flex-col gap-4 border-b border-hairline pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">Manage Payments</h1>
          <p className="mt-1 text-sm text-body">Manage user payment summaries, upcoming bills, and automatic payments.</p>
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

      <div className="overflow-x-auto border border-hairline bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-hairline bg-faint/50 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Due Soon</th>
              <th className="px-5 py-3 font-semibold">Scheduled</th>
              <th className="px-5 py-3 font-semibold">Paid This Month</th>
              <th className="px-5 py-3 font-semibold">Upcoming / Auto</th>
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
                <td className="px-5 py-4">
                  <div className="font-semibold text-deep-accent">{formatCurrency(u.dueSoonAmount)}</div>
                  <div className="text-xs text-[#f0ad4e]">Within {u.dueWithinDays} days</div>
                </td>
                <td className="px-5 py-4 font-semibold text-deep-accent">{formatCurrency(u.scheduledAmount)}</td>
                <td className="px-5 py-4 font-semibold text-primary">{formatCurrency(u.paidThisMonth)}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="text-body">Upcoming: {u.upcomingPayments.length}</span>
                    <span className="text-muted">Auto: {u.automaticPayments.length}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <button onClick={() => handleEditClick(u)} className="inline-flex h-8 items-center gap-2 border border-hairline bg-white px-3 py-1 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint">
                    <Edit className="h-3.5 w-3.5" strokeWidth={2} /> Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && <div className="p-8 text-center text-muted">No users found.</div>}
      </div>

      {/* --- MANAGE USER PAYMENTS MODAL --- */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="relative max-h-[90vh] w-full max-w-[800px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent">
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>
            
            <div className="flex items-start gap-3 mb-6 border-b border-hairline pb-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                <Receipt className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-deep-accent">Manage Payments</h2>
                <p className="mt-1 text-sm text-body">{selectedUser.user} • {selectedUser.id}</p>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              
              {/* SECTION 1: SUMMARY */}
              <div>
                <h3 className="mb-3 font-serif text-lg font-bold text-deep-accent">Payment Summary</h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-deep-accent">Due Soon Amount</label>
                    <input type="number" step="0.01" value={selectedUser.dueSoonAmount} onChange={(e) => setSelectedUser({...selectedUser, dueSoonAmount: parseFloat(e.target.value) || 0})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-deep-accent">Due Within (Days)</label>
                    <input type="number" value={selectedUser.dueWithinDays} onChange={(e) => setSelectedUser({...selectedUser, dueWithinDays: parseInt(e.target.value) || 0})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-deep-accent">Scheduled Amount</label>
                    <input type="number" step="0.01" value={selectedUser.scheduledAmount} onChange={(e) => setSelectedUser({...selectedUser, scheduledAmount: parseFloat(e.target.value) || 0})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-deep-accent">Paid This Month</label>
                    <input type="number" step="0.01" value={selectedUser.paidThisMonth} onChange={(e) => setSelectedUser({...selectedUser, paidThisMonth: parseFloat(e.target.value) || 0})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* SECTION 2: UPCOMING PAYMENTS */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold text-deep-accent flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-primary" /> Upcoming Payments
                  </h3>
                  <button onClick={handleAddUpcoming} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                    <Plus className="h-3.5 w-3.5" /> Add Upcoming
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  {selectedUser.upcomingPayments.length === 0 && (
                    <div className="text-sm text-muted py-2 text-center border border-dashed border-hairline">No upcoming payments added.</div>
                  )}
                  {selectedUser.upcomingPayments.map((payment) => (
                    <div key={payment.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 border border-hairline bg-faint/30 p-3">
                      <input type="text" placeholder="Payment Name" value={payment.name} onChange={(e) => handleUpcomingChange(payment.id, 'name', e.target.value)} className="min-h-[36px] flex-1 border border-hairline bg-white px-3 py-1 text-sm text-deep-accent focus:border-primary focus:outline-none" />
                      <input type="date" value={payment.dueDate} onChange={(e) => handleUpcomingChange(payment.id, 'dueDate', e.target.value)} className="min-h-[36px] w-full sm:w-auto border border-hairline bg-white px-3 py-1 text-sm text-deep-accent focus:border-primary focus:outline-none" />
                      <input type="number" step="0.01" placeholder="Balance" value={payment.balance} onChange={(e) => handleUpcomingChange(payment.id, 'balance', parseFloat(e.target.value) || 0)} className="min-h-[36px] w-full sm:w-28 border border-hairline bg-white px-3 py-1 text-sm text-deep-accent focus:border-primary focus:outline-none" />
                      <AutopayToggle isOn={payment.autopay} onToggle={() => handleUpcomingChange(payment.id, 'autopay', !payment.autopay)} />
                      <button onClick={() => handleRemoveUpcoming(payment.id)} className="inline-flex h-8 w-8 items-center justify-center text-muted hover:text-[#d9534f] transition-colors shrink-0">
                        <Trash2 className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 3: AUTOMATIC PAYMENTS */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold text-deep-accent flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-primary" /> Automatic Payments
                  </h3>
                  <button onClick={handleAddAutomatic} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                    <Plus className="h-3.5 w-3.5" /> Add Automatic
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  {selectedUser.automaticPayments.length === 0 && (
                    <div className="text-sm text-muted py-2 text-center border border-dashed border-hairline">No automatic payments set up.</div>
                  )}
                  {selectedUser.automaticPayments.map((payment) => (
                    <div key={payment.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 border border-hairline bg-faint/30 p-3">
                      <input type="text" placeholder="Payment Name" value={payment.name} onChange={(e) => handleAutomaticChange(payment.id, 'name', e.target.value)} className="min-h-[36px] flex-1 border border-hairline bg-white px-3 py-1 text-sm text-deep-accent focus:border-primary focus:outline-none" />
                      <select value={payment.frequency} onChange={(e) => handleAutomaticChange(payment.id, 'frequency', e.target.value)} className="min-h-[36px] w-full sm:w-auto border border-hairline bg-white px-3 py-1 text-sm text-deep-accent focus:border-primary focus:outline-none">
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                      </select>
                      <input type="number" step="0.01" placeholder="Balance" value={payment.balance} onChange={(e) => handleAutomaticChange(payment.id, 'balance', parseFloat(e.target.value) || 0)} className="min-h-[36px] w-full sm:w-28 border border-hairline bg-white px-3 py-1 text-sm text-deep-accent focus:border-primary focus:outline-none" />
                      <input type="date" value={payment.nextDate} onChange={(e) => handleAutomaticChange(payment.id, 'nextDate', e.target.value)} className="min-h-[36px] w-full sm:w-auto border border-hairline bg-white px-3 py-1 text-sm text-deep-accent focus:border-primary focus:outline-none" />
                      <AutopayToggle isOn={payment.autopay} onToggle={() => handleAutomaticChange(payment.id, 'autopay', !payment.autopay)} />
                      <button onClick={() => handleRemoveAutomatic(payment.id)} className="inline-flex h-8 w-8 items-center justify-center text-muted hover:text-[#d9534f] transition-colors shrink-0">
                        <Trash2 className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* MODAL ACTIONS */}
              <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
                <button onClick={() => setIsModalOpen(false)} className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent hover:bg-faint">Cancel</button>
                <button onClick={handleSaveUser} className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-deep">
                  <Save className="h-4 w-4" strokeWidth={2.25} /> Save All Changes
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePayments;