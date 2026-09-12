// src/pages/admin/ManageGoals.jsx
import React, { useState } from 'react';
import { 
  Search, Filter, Edit, X, Save, Target, 
  TrendingUp, Calendar, CheckCircle2 
} from 'lucide-react';
import { mockAdminGoals } from '../../data/mockAdminData';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};

const ManageGoals = () => {
  const [users, setUsers] = useState(mockAdminGoals);
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary"><span className="h-1.5 w-1.5 bg-primary" />Active</span>;
      case 'Completed': return <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary"><CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.25} />Completed</span>;
      case 'Paused': return <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#f0ad4e]"><span className="h-1.5 w-1.5 bg-[#f0ad4e]" />Paused</span>;
      default: return null;
    }
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-6 flex flex-col gap-4 border-b border-hairline pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">Manage Financial Goals</h1>
          <p className="mt-1 text-sm text-body">Manage user savings summaries and individual goals.</p>
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

      {/* User Goals Summary Table */}
      <div className="overflow-x-auto border border-hairline bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-hairline bg-faint/50 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Total Saved</th>
              <th className="px-5 py-3 font-semibold">Active Goals</th>
              <th className="px-5 py-3 font-semibold">On Track</th>
              <th className="px-5 py-3 font-semibold">Next Target Date</th>
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
                <td className="px-5 py-4 font-semibold text-deep-accent">{formatCurrency(u.totalSavedBalance)}</td>
                <td className="px-5 py-4 text-body">{u.activeGoals}</td>
                <td className="px-5 py-4">
                  <span className={`font-semibold ${u.onTrack > 0 ? 'text-primary' : 'text-[#f0ad4e]'}`}>
                    {u.onTrack} / {u.activeGoals}
                  </span>
                </td>
                <td className="px-5 py-4 text-muted">{u.upcomingTargetDate || 'N/A'}</td>
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

      {/* --- MANAGE USER GOALS MODAL --- */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="relative max-h-[90vh] w-full max-w-[700px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent">
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>
            
            <div className="flex items-start gap-3 mb-6 border-b border-hairline pb-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                <Target className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-deep-accent">Manage Goals</h2>
                <p className="mt-1 text-sm text-body">{selectedUser.user} • {selectedUser.id}</p>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              
              {/* SECTION 1: GOAL SUMMARY */}
              <div>
                <h3 className="mb-3 font-serif text-lg font-bold text-deep-accent flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Summary Overview
                </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-deep-accent">Total Saved</label>
                    <input type="number" step="0.01" value={selectedUser.totalSavedBalance} onChange={(e) => setSelectedUser({...selectedUser, totalSavedBalance: parseFloat(e.target.value) || 0})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-deep-accent">Active Goals</label>
                    <input type="number" value={selectedUser.activeGoals} onChange={(e) => setSelectedUser({...selectedUser, activeGoals: parseInt(e.target.value) || 0})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-deep-accent">On Track</label>
                    <input type="number" value={selectedUser.onTrack} onChange={(e) => setSelectedUser({...selectedUser, onTrack: parseInt(e.target.value) || 0})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-deep-accent">Next Target Date</label>
                    <input type="date" value={selectedUser.upcomingTargetDate} onChange={(e) => setSelectedUser({...selectedUser, upcomingTargetDate: e.target.value})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* SECTION 2: INDIVIDUAL GOALS LIST */}
              <div>
                <div className="mb-3 flex items-center gap-2 border-b border-hairline pb-2">
                  <Calendar className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  <h3 className="font-serif text-lg font-bold text-deep-accent">Individual Goals</h3>
                </div>
                
                {selectedUser.goals.length === 0 && (
                  <div className="text-sm text-muted py-4 text-center border border-dashed border-hairline">No goals on file.</div>
                )}

                <div className="flex flex-col gap-3">
                  {selectedUser.goals.map((goal) => {
                    const progress = Math.min((goal.current / goal.target) * 100, 100);
                    return (
                      <div key={goal.id} className="flex flex-col gap-3 border border-hairline bg-faint/30 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-deep-accent">{goal.name}</span>
                            <span className="font-mono text-xs text-muted">{goal.id}</span>
                          </div>
                          {getStatusBadge(goal.status)}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="h-2 flex-1 bg-hairline">
                            <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-deep-accent w-24 text-right">
                            {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
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

export default ManageGoals;