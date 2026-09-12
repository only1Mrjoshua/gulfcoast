// src/pages/admin/ManageUsers.jsx
import React, { useState } from 'react';
import { Search, Filter, Edit, Trash2, X, Save, TrendingUp } from 'lucide-react';
import { mockAdminUsers } from '../../data/mockAdminData';

const ManageUsers = () => {
  const [users, setUsers] = useState(mockAdminUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (user) => {
    setSelectedUser(JSON.parse(JSON.stringify(user))); // Deep clone to safely edit nested creditScore
    setIsModalOpen(true);
  };

  const handleSaveUser = () => {
    setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
    setIsModalOpen(false);
  };

  // Helper to safely update nested credit score fields
  const handleCreditScoreChange = (field, value) => {
    setSelectedUser({
      ...selectedUser,
      creditScore: {
        ...selectedUser.creditScore,
        [field]: value,
      },
    });
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 border-b border-hairline pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">
            Manage Users
          </h1>
          <p className="mt-1 text-sm text-body">View and manage all user accounts.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center border border-hairline bg-white px-3 focus-within:border-primary">
          <Search className="h-4 w-4 text-muted" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search by name or email..."
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

      {/* Users Table */}
      <div className="overflow-x-auto border border-hairline bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-hairline bg-faint/50 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Role</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Credit Score</th>
              <th className="px-5 py-3 font-semibold">Joined</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-faint">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-faint/30">
                <td className="px-5 py-4">
                  <div className="font-semibold text-deep-accent">{user.name}</div>
                  <div className="text-xs text-muted">{user.email}</div>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-faint text-body'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${user.status === 'Active' ? 'text-primary' : 'text-[#d9534f]'}`}>
                    <span className={`h-1.5 w-1.5 ${user.status === 'Active' ? 'bg-primary' : 'bg-[#d9534f]'}`} />
                    {user.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {user.creditScore ? (
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-deep-accent">{user.creditScore.score}</span>
                      <span className={`text-xs ${user.creditScore.change >= 0 ? 'text-primary' : 'text-[#d9534f]'}`}>
                        {user.creditScore.change >= 0 ? '+' : ''}{user.creditScore.change} this month
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted">N/A</span>
                  )}
                </td>
                <td className="px-5 py-4 text-muted">{user.joined}</td>
                <td className="px-5 py-4 text-right">
                  <button onClick={() => handleEditClick(user)} className="inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-primary">
                    <Edit className="h-4 w-4" strokeWidth={2} />
                  </button>
                  <button className="ml-2 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-[#d9534f]">
                    <Trash2 className="h-4 w-4" strokeWidth={2} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-muted">No users found matching your search.</div>
        )}
      </div>

      {/* Edit User Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="relative max-h-[90vh] w-full max-w-[520px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsModalOpen(false)} className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent">
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>

            <div className="flex items-start gap-3 mb-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                <Edit className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-deep-accent">Edit User</h2>
                <p className="mt-1 text-sm text-body">Update account and credit details for {selectedUser.name}.</p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-deep-accent">Full Name</label>
                <input type="text" value={selectedUser.name} onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none" />
              </div>

              {/* Role */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-deep-accent">Role</label>
                <select value={selectedUser.role} onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-deep-accent">Status</label>
                <select value={selectedUser.status} onChange={(e) => setSelectedUser({...selectedUser, status: e.target.value})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none">
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              {/* Credit Score Section */}
              <div className="border-t border-hairline pt-5">
                <div className="mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  <h3 className="font-serif text-base font-bold text-deep-accent">Credit Score</h3>
                </div>

                {selectedUser.creditScore ? (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Credit Score */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-deep-accent">Score</label>
                        <input
                          type="number"
                          min="300"
                          max="850"
                          value={selectedUser.creditScore.score}
                          onChange={(e) => handleCreditScoreChange('score', parseInt(e.target.value) || 0)}
                          className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                        />
                      </div>

                      {/* Change This Month */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-deep-accent">Change This Month</label>
                        <input
                          type="number"
                          value={selectedUser.creditScore.change}
                          onChange={(e) => handleCreditScoreChange('change', parseInt(e.target.value) || 0)}
                          className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Last Updated */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-deep-accent">Last Updated</label>
                      <input
                        type="date"
                        value={selectedUser.creditScore.lastUpdated}
                        onChange={(e) => handleCreditScoreChange('lastUpdated', e.target.value)}
                        className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-muted text-center py-3 border border-dashed border-hairline">
                    No credit score data available for this user.
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
                <button onClick={() => setIsModalOpen(false)} className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint">Cancel</button>
                <button onClick={handleSaveUser} className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep">
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

export default ManageUsers;