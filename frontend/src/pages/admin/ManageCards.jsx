// src/pages/admin/ManageCards.jsx
import React, { useState } from 'react';
import { 
  Search, Filter, Edit, X, Save, CreditCard, 
  Plus, Trash2, Building2 
} from 'lucide-react';
// Import mockAdminUsers alongside mockAdminCards
import { mockAdminCards, mockAdminUsers } from '../../data/mockAdminData';

const ManageCards = () => {
  const [cards, setCards] = useState(mockAdminCards);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit Modal State
  const [selectedCard, setSelectedCard] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCard, setNewCard] = useState({
    user: '',
    cardName: '',
    type: 'Debit',
    fullNumber: '',
    expiryMonth: '',
    expiryYear: '',
    linkedAccount: 'Checking',
    status: 'Active',
    activity: []
  });

  const filteredCards = cards.filter(card => 
    card.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    card.cardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.fullNumber.includes(searchTerm)
  );

  // --- Edit Handlers ---
  const handleEditClick = (card) => {
    setSelectedCard(JSON.parse(JSON.stringify(card))); 
    setIsEditModalOpen(true);
  };

  const handleSaveCard = () => {
    setCards(cards.map(c => c.id === selectedCard.id ? selectedCard : c));
    setIsEditModalOpen(false);
  };

  // --- Create Handlers ---
  const handleCreateClick = () => {
    setNewCard({
      user: '',
      cardName: '',
      type: 'Debit',
      fullNumber: '',
      expiryMonth: '',
      expiryYear: '',
      linkedAccount: 'Checking',
      status: 'Active',
      activity: []
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateCard = () => {
    const newId = `CRD-${String(cards.length + 1).padStart(3, '0')}`;
    const cardToAdd = { ...newCard, id: newId };
    setCards([cardToAdd, ...cards]);
    setIsCreateModalOpen(false);
  };

  // --- Activity Handlers ---
  const handleAddActivity = (isEditing) => {
    const newActivity = { id: `act-${Date.now()}`, company: '', description: '', amount: 0, date: '' };
    if (isEditing) {
      setSelectedCard({ ...selectedCard, activity: [...selectedCard.activity, newActivity] });
    } else {
      setNewCard({ ...newCard, activity: [...newCard.activity, newActivity] });
    }
  };

  const handleRemoveActivity = (id, isEditing) => {
    if (isEditing) {
      setSelectedCard({ ...selectedCard, activity: selectedCard.activity.filter(a => a.id !== id) });
    } else {
      setNewCard({ ...newCard, activity: newCard.activity.filter(a => a.id !== id) });
    }
  };

  const handleActivityChange = (id, field, value, isEditing) => {
    const updateFn = (cardData) => ({
      ...cardData,
      activity: cardData.activity.map(a => a.id === id ? { ...a, [field]: value } : a)
    });
    if (isEditing) { setSelectedCard(updateFn(selectedCard)); } else { setNewCard(updateFn(newCard)); }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary"><span className="h-1.5 w-1.5 bg-primary" />Active</span>;
      case 'Temporary Locked': return <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#f0ad4e]"><span className="h-1.5 w-1.5 bg-[#f0ad4e]" />Temp Locked</span>;
      case 'Locked': return <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#d9534f]"><span className="h-1.5 w-1.5 bg-[#d9534f]" />Locked</span>;
      default: return null;
    }
  };

  // Reusable Form Component for both Modals
  const CardForm = ({ data, setData, isEditing }) => (
    <div className="flex flex-col gap-5">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-deep-accent">User Name</label>
          {/* CHANGED FROM INPUT TO SELECT */}
          <select 
            value={data.user} 
            onChange={(e) => setData({...data, user: e.target.value})} 
            className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
          >
            <option value="" disabled>Select a user</option>
            {mockAdminUsers.map(u => (
              <option key={u.id} value={u.name}>{u.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-deep-accent">Card Name</label>
          <input type="text" placeholder="e.g. Platinum Debit" value={data.cardName} onChange={(e) => setData({...data, cardName: e.target.value})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-deep-accent">Card Type</label>
          <select value={data.type} onChange={(e) => setData({...data, type: e.target.value})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none">
            <option value="Debit">Debit</option>
            <option value="Credit">Credit</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-deep-accent">Linked Account</label>
          <select value={data.linkedAccount} onChange={(e) => setData({...data, linkedAccount: e.target.value})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none">
            <option value="Checking">Checking Account</option>
            <option value="Savings">Savings Account</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 border-t border-hairline pt-4">
        <div className="col-span-2 flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-deep-accent">Card Number</label>
          <input type="text" placeholder="16 Digits" maxLength="16" value={data.fullNumber} onChange={(e) => setData({...data, fullNumber: e.target.value.replace(/\D/g, '')})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm font-mono text-deep-accent focus:border-primary focus:outline-none" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-deep-accent">Exp. Month</label>
          <input type="text" placeholder="MM" maxLength="2" value={data.expiryMonth} onChange={(e) => setData({...data, expiryMonth: e.target.value})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-deep-accent">Exp. Year</label>
          <input type="text" placeholder="YYYY" maxLength="4" value={data.expiryYear} onChange={(e) => setData({...data, expiryYear: e.target.value})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 border-t border-hairline pt-4">
        <label className="text-sm font-semibold text-deep-accent">Card Status</label>
        <select value={data.status} onChange={(e) => setData({...data, status: e.target.value})} className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none">
          <option value="Active">Active</option>
          <option value="Temporary Locked">Temporary Locked</option>
          <option value="Locked">Locked</option>
        </select>
      </div>

      {/* Activity Section */}
      <div className="border-t border-hairline pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-deep-accent flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" /> Recent Card Activity
          </h3>
          <button onClick={() => handleAddActivity(isEditing)} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            <Plus className="h-3 w-3" /> Add Activity
          </button>
        </div>
        
        {data.activity.length === 0 && (
          <div className="text-xs text-muted text-center py-2 border border-dashed border-hairline">No activity logged.</div>
        )}

        <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
          {data.activity.map((act) => (
            <div key={act.id} className="flex flex-wrap items-center gap-2 border border-hairline bg-faint/30 p-2">
              <input type="text" placeholder="Company (e.g. Amazon)" value={act.company} onChange={(e) => handleActivityChange(act.id, 'company', e.target.value, isEditing)} className="min-h-[32px] flex-1 min-w-[120px] border border-hairline bg-white px-2 py-1 text-xs text-deep-accent focus:border-primary focus:outline-none" />
              <input type="text" placeholder="Description (e.g. Shopping)" value={act.description} onChange={(e) => handleActivityChange(act.id, 'description', e.target.value, isEditing)} className="min-h-[32px] flex-1 min-w-[120px] border border-hairline bg-white px-2 py-1 text-xs text-deep-accent focus:border-primary focus:outline-none" />
              <input type="number" step="0.01" placeholder="-$500" value={act.amount} onChange={(e) => handleActivityChange(act.id, 'amount', parseFloat(e.target.value) || 0, isEditing)} className="min-h-[32px] w-24 border border-hairline bg-white px-2 py-1 text-xs text-deep-accent focus:border-primary focus:outline-none" />
              <input type="date" value={act.date} onChange={(e) => handleActivityChange(act.id, 'date', e.target.value, isEditing)} className="min-h-[32px] w-32 border border-hairline bg-white px-2 py-1 text-xs text-deep-accent focus:border-primary focus:outline-none" />
              <button onClick={() => handleRemoveActivity(act.id, isEditing)} className="inline-flex h-7 w-7 items-center justify-center text-muted hover:text-[#d9534f] transition-colors shrink-0">
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 border-b border-hairline pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">Manage Cards</h1>
          <p className="mt-1 text-sm text-body">View, edit, and create user debit and credit cards.</p>
        </div>
        <button 
          onClick={handleCreateClick}
          className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-deep transition-colors"
        >
          <Plus className="h-4 w-4" strokeWidth={2} /> Create Card
        </button>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center border border-hairline bg-white px-3 focus-within:border-primary">
          <Search className="h-4 w-4 text-muted" strokeWidth={2} />
          <input 
            type="text" 
            placeholder="Search by user, card name, or number..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="min-h-[40px] w-full border-none bg-transparent px-3 py-2 text-sm text-deep-accent outline-none placeholder:text-muted/60" 
          />
        </div>
        <button className="inline-flex min-h-[40px] items-center justify-center gap-2 border border-hairline bg-white px-4 py-2 text-sm font-semibold text-deep-accent hover:bg-faint">
          <Filter className="h-4 w-4" strokeWidth={2} /> Filter
        </button>
      </div>

      {/* Cards Table */}
      <div className="overflow-x-auto border border-hairline bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-hairline bg-faint/50 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Card ID</th>
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Card Name</th>
              <th className="px-5 py-3 font-semibold">Type</th>
              <th className="px-5 py-3 font-semibold">Linked To</th>
              <th className="px-5 py-3 font-semibold">Card Number</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-faint">
            {filteredCards.map((card) => (
              <tr key={card.id} className="transition-colors hover:bg-faint/30">
                <td className="px-5 py-4 font-mono text-xs text-muted">{card.id}</td>
                <td className="px-5 py-4 font-semibold text-deep-accent">{card.user}</td>
                <td className="px-5 py-4 text-body">{card.cardName}</td>
                <td className="px-5 py-4 text-body">{card.type}</td>
                <td className="px-5 py-4 text-body">{card.linkedAccount}</td>
                <td className="px-5 py-4 font-mono text-sm text-body">•••• {card.fullNumber.slice(-4)}</td>
                <td className="px-5 py-4">{getStatusBadge(card.status)}</td>
                <td className="px-5 py-4 text-right">
                  <button onClick={() => handleEditClick(card)} className="inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-primary">
                    <Edit className="h-4 w-4" strokeWidth={2} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCards.length === 0 && <div className="p-8 text-center text-muted">No cards found.</div>}
      </div>

      {/* --- EDIT CARD MODAL --- */}
      {isEditModalOpen && selectedCard && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4" onClick={() => setIsEditModalOpen(false)}>
          <div className="relative max-h-[90vh] w-full max-w-[650px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsEditModalOpen(false)} className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent">
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>
            <div className="flex items-start gap-3 mb-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                <CreditCard className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-deep-accent">Edit Card</h2>
                <p className="mt-1 text-sm text-body">{selectedCard.id} • {selectedCard.user}</p>
              </div>
            </div>
            
            <CardForm data={selectedCard} setData={setSelectedCard} isEditing={true} />

            <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 mt-6 sm:flex-row sm:justify-end">
              <button onClick={() => setIsEditModalOpen(false)} className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent hover:bg-faint">Cancel</button>
              <button onClick={handleSaveCard} className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-deep">
                <Save className="h-4 w-4" strokeWidth={2.25} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CREATE CARD MODAL --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4" onClick={() => setIsCreateModalOpen(false)}>
          <div className="relative max-h-[90vh] w-full max-w-[650px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsCreateModalOpen(false)} className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent">
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>
            <div className="flex items-start gap-3 mb-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                <Plus className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-deep-accent">Create New Card</h2>
                <p className="mt-1 text-sm text-body">Issue a new debit or credit card to a user.</p>
              </div>
            </div>
            
            <CardForm data={newCard} setData={setNewCard} isEditing={false} />

            <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 mt-6 sm:flex-row sm:justify-end">
              <button onClick={() => setIsCreateModalOpen(false)} className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent hover:bg-faint">Cancel</button>
              <button onClick={handleCreateCard} className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-deep">
                <Save className="h-4 w-4" strokeWidth={2.25} /> Create Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCards;