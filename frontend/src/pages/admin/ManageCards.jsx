// src/pages/admin/ManageCards.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, Edit, X, Save, CreditCard,
  Plus, Trash2, Building2, Loader2, CheckCircle2
} from 'lucide-react';
import { apiFetch } from '../../utils/api';

const emptyCard = () => ({
  userId: '',
  user: '',
  cardName: '',
  type: 'Debit',
  fullNumber: '',
  cvv: '',
  expiryMonth: '',
  expiryYear: '',
  linkedAccountId: '',
  linkedAccount: '',
  status: 'Active',
  activity: [],
});

const ManageCards = () => {
  // Data
  const [cards, setCards] = useState([]);
  const [users, setUsers] = useState([]);
  const [userAccounts, setUserAccounts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');

  // Edit Modal State
  const [selectedCard, setSelectedCard] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCard, setNewCard] = useState(emptyCard());

  // Toast
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // ──────────────────────────────────────────────
  // Loaders
  // ──────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    const [cardsRes, usersRes] = await Promise.all([
      apiFetch('/admin/cards'),
      apiFetch('/admin/cards/users'),
    ]);
    const cardsData = cardsRes?.data ?? cardsRes;
    const usersData = usersRes?.data ?? usersRes;
    setCards(cardsData.cards ?? []);
    setUsers(usersData.users ?? []);
  }, []);

  const loadUserAccounts = useCallback(async (userId) => {
    if (!userId) {
      setUserAccounts([]);
      return;
    }
    try {
      const res = await apiFetch(`/admin/cards/users/${userId}/accounts`);
      const data = res?.data ?? res;
      setUserAccounts(data.accounts ?? []);
    } catch (err) {
      console.error('❌ Failed to load accounts:', err);
      setUserAccounts([]);
    }
  }, []);

  useEffect(() => {
    const boot = async () => {
      try {
        setLoading(true);
        setError('');
        await loadAll();
      } catch (err) {
        console.error('❌ Failed to load cards:', err);
        setError(err.message || 'Failed to load cards');
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, [loadAll]);

  // ──────────────────────────────────────────────
  // Filter
  // ──────────────────────────────────────────────
  const filteredCards = cards.filter((card) =>
    (card.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (card.cardName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (card.fullNumber || '').includes(searchTerm)
  );

  // ──────────────────────────────────────────────
  // Edit handlers
  // ──────────────────────────────────────────────
  const handleEditClick = async (card) => {
    const mapped = {
      id: card.id,
      userId: card.userId,
      user: card.user,
      cardName: card.cardName,
      type: card.type,
      fullNumber: card.fullNumber,
      cvv: card.cvv || '',
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      linkedAccountId: card.linkedAccountId || '',
      linkedAccount: card.linkedAccount || '',
      status: card.status,
      activity: (card.activity || []).map((a) => ({
        id: a.id,
        company: a.company || '',
        description: a.description || '',
        amount: a.amount || 0,
        date: a.date ? String(a.date).slice(0, 10) : '',
      })),
    };
    setSelectedCard(mapped);
    setIsEditModalOpen(true);
    await loadUserAccounts(card.userId);
  };

  const handleSaveCard = async () => {
    if (!selectedCard) return;
    setSaving(true);
    try {
      const payload = {
        cardName: selectedCard.cardName,
        type: selectedCard.type,
        fullNumber: selectedCard.fullNumber,
        cvv: selectedCard.cvv,
        expiryMonth: selectedCard.expiryMonth,
        expiryYear: selectedCard.expiryYear,
        status: selectedCard.status,
        linkedAccountId: selectedCard.linkedAccountId || null,
        activity: (selectedCard.activity || []).map((a) => ({
          id: a.id, // ⬅️ round-trips so backend preserves transactionId
          company: a.company,
          description: a.description,
          amount: parseFloat(a.amount) || 0,
          date: a.date ? new Date(a.date) : new Date(),
        })),
      };

      await apiFetch(`/admin/cards/${selectedCard.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      await loadAll();
      setIsEditModalOpen(false);
      showToast('Card updated successfully.');
    } catch (err) {
      console.error('❌ Save card failed:', err);
      showToast(err.message || 'Failed to save card');
    } finally {
      setSaving(false);
    }
  };

  // ──────────────────────────────────────────────
  // Create handlers
  // ──────────────────────────────────────────────
  const handleCreateClick = () => {
    setNewCard(emptyCard());
    setUserAccounts([]);
    setIsCreateModalOpen(true);
  };

  const handleCreateCard = async () => {
    if (
      !newCard.userId ||
      !newCard.cardName ||
      !newCard.fullNumber ||
      !newCard.expiryMonth ||
      !newCard.expiryYear
    ) {
      showToast('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        userId: newCard.userId,
        cardName: newCard.cardName,
        type: newCard.type,
        linkedAccountId: newCard.linkedAccountId || null,
        fullNumber: newCard.fullNumber,
        cvv: newCard.cvv,
        expiryMonth: newCard.expiryMonth,
        expiryYear: newCard.expiryYear,
        status: newCard.status,
        activity: (newCard.activity || []).map((a) => ({
          id: a.id, // ⬅️ sent even though it's "act-…" placeholder
          company: a.company,
          description: a.description,
          amount: parseFloat(a.amount) || 0,
          date: a.date ? new Date(a.date) : new Date(),
        })),
      };

      await apiFetch('/admin/cards', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      await loadAll();
      setIsCreateModalOpen(false);
      showToast('Card created successfully.');
    } catch (err) {
      console.error('❌ Create card failed:', err);
      showToast(err.message || 'Failed to create card');
    } finally {
      setSaving(false);
    }
  };

  // ──────────────────────────────────────────────
  // Activity handlers
  // ──────────────────────────────────────────────
  const handleAddActivity = (isEditing) => {
    const newActivity = {
      id: `act-${Date.now()}`,
      company: '',
      description: '',
      amount: 0,
      date: '',
    };
    if (isEditing) {
      setSelectedCard({
        ...selectedCard,
        activity: [...selectedCard.activity, newActivity],
      });
    } else {
      setNewCard({ ...newCard, activity: [...newCard.activity, newActivity] });
    }
  };

  const handleRemoveActivity = (id, isEditing) => {
    if (isEditing) {
      setSelectedCard({
        ...selectedCard,
        activity: selectedCard.activity.filter((a) => a.id !== id),
      });
    } else {
      setNewCard({
        ...newCard,
        activity: newCard.activity.filter((a) => a.id !== id),
      });
    }
  };

  const handleActivityChange = (id, field, value, isEditing) => {
    const updateFn = (cardData) => ({
      ...cardData,
      activity: cardData.activity.map((a) =>
        a.id === id ? { ...a, [field]: value } : a
      ),
    });
    if (isEditing) {
      setSelectedCard(updateFn(selectedCard));
    } else {
      setNewCard(updateFn(newCard));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary">
            <span className="h-1.5 w-1.5 bg-primary" />Active
          </span>
        );
      case 'Temporary Locked':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#f0ad4e]">
            <span className="h-1.5 w-1.5 bg-[#f0ad4e]" />Temp Locked
          </span>
        );
      case 'Locked':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#d9534f]">
            <span className="h-1.5 w-1.5 bg-[#d9534f]" />Locked
          </span>
        );
      default:
        return null;
    }
  };

  // ──────────────────────────────────────────────
  // Reusable Form (shared by Edit + Create)
  // ──────────────────────────────────────────────
  const CardForm = ({ data, setData, isEditing }) => (
    <div className="flex flex-col gap-5">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-deep-accent">User Name</label>
          <select
            value={data.userId || ''}
            autoComplete="off"
            onChange={(e) => {
              const uid = e.target.value;
              const u = users.find((x) => String(x.id) === uid);
              setData({
                ...data,
                userId: uid,
                user: u?.name || '',
                linkedAccountId: '',
                linkedAccount: '',
              });
              loadUserAccounts(uid);
            }}
            className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
          >
            <option value="" disabled>Select a user</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-deep-accent">Card Name</label>
          <input
            type="text"
            autoComplete="new-password"
            name="card_name_no_autofill"
            placeholder="e.g. Platinum Debit"
            value={data.cardName}
            onChange={(e) => setData({ ...data, cardName: e.target.value })}
            className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-deep-accent">Card Type</label>
          <select
            value={data.type}
            autoComplete="off"
            onChange={(e) => setData({ ...data, type: e.target.value })}
            className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
          >
            <option value="Debit">Debit</option>
            <option value="Credit">Credit</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-deep-accent">Linked Account</label>
          <select
            value={data.linkedAccountId || ''}
            autoComplete="off"
            onChange={(e) => {
              const aid = e.target.value;
              const acc = userAccounts.find((a) => String(a.id) === aid);
              setData({
                ...data,
                linkedAccountId: aid,
                linkedAccount: acc?.label || '',
              });
            }}
            disabled={!data.userId}
            className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:bg-faint disabled:text-muted"
          >
            {!data.userId ? (
              <option value="">Select user first</option>
            ) : userAccounts.length === 0 ? (
              <option value="">No accounts available</option>
            ) : (
              <>
                <option value="">Select account</option>
                {userAccounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </>
            )}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 border-t border-hairline pt-4">
        <div className="col-span-2 flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-deep-accent">Card Number</label>
          <input
            type="text"
            autoComplete="off"
            name="card_number_no_autofill"
            placeholder="16 Digits"
            maxLength="16"
            value={data.fullNumber}
            onChange={(e) =>
              setData({ ...data, fullNumber: e.target.value.replace(/\D/g, '') })
            }
            className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm font-mono text-deep-accent focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-deep-accent">Exp. Month</label>
          <input
            type="text"
            autoComplete="off"
            name="card_exp_month_no_autofill"
            placeholder="MM"
            maxLength="2"
            value={data.expiryMonth}
            onChange={(e) => setData({ ...data, expiryMonth: e.target.value })}
            className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-deep-accent">Exp. Year</label>
          <input
            type="text"
            autoComplete="off"
            name="card_exp_year_no_autofill"
            placeholder="YYYY"
            maxLength="4"
            value={data.expiryYear}
            onChange={(e) => setData({ ...data, expiryYear: e.target.value })}
            className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 border-t border-hairline pt-4">
        <label className="text-sm font-semibold text-deep-accent">Card Status</label>
        <select
          value={data.status}
          autoComplete="off"
          onChange={(e) => setData({ ...data, status: e.target.value })}
          className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
        >
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
          <button
            onClick={() => handleAddActivity(isEditing)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <Plus className="h-3 w-3" /> Add Activity
          </button>
        </div>

        {data.activity.length === 0 && (
          <div className="text-xs text-muted text-center py-2 border border-dashed border-hairline">
            No activity logged.
          </div>
        )}

        <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
          {data.activity.map((act) => (
            <div
              key={act.id}
              className="flex flex-wrap items-center gap-2 border border-hairline bg-faint/30 p-2"
            >
              <input
                type="text"
                autoComplete="off"
                placeholder="Company (e.g. Amazon)"
                value={act.company}
                onChange={(e) =>
                  handleActivityChange(act.id, 'company', e.target.value, isEditing)
                }
                className="min-h-[32px] flex-1 min-w-[120px] border border-hairline bg-white px-2 py-1 text-xs text-deep-accent focus:border-primary focus:outline-none"
              />
              <input
                type="text"
                autoComplete="off"
                placeholder="Description (e.g. Shopping)"
                value={act.description}
                onChange={(e) =>
                  handleActivityChange(act.id, 'description', e.target.value, isEditing)
                }
                className="min-h-[32px] flex-1 min-w-[120px] border border-hairline bg-white px-2 py-1 text-xs text-deep-accent focus:border-primary focus:outline-none"
              />
              <input
                type="number"
                autoComplete="off"
                step="0.01"
                placeholder="-$500"
                value={act.amount}
                onChange={(e) =>
                  handleActivityChange(
                    act.id,
                    'amount',
                    parseFloat(e.target.value) || 0,
                    isEditing
                  )
                }
                className="min-h-[32px] w-24 border border-hairline bg-white px-2 py-1 text-xs text-deep-accent focus:border-primary focus:outline-none"
              />
              <input
                type="date"
                autoComplete="off"
                value={act.date}
                onChange={(e) =>
                  handleActivityChange(act.id, 'date', e.target.value, isEditing)
                }
                className="min-h-[32px] w-32 border border-hairline bg-white px-2 py-1 text-xs text-deep-accent focus:border-primary focus:outline-none"
              />
              <button
                onClick={() => handleRemoveActivity(act.id, isEditing)}
                className="inline-flex h-7 w-7 items-center justify-center text-muted hover:text-[#d9534f] transition-colors shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ──────────────────────────────────────────────
  // Full-page loading / error
  // ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" strokeWidth={1.75} />
        <p className="text-sm text-muted">Loading cards…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4">
        <p className="font-serif text-xl font-bold text-deep-accent">
          We couldn&rsquo;t load cards
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
          <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">
            Manage Cards
          </h1>
          <p className="mt-1 text-sm text-body">
            View, edit, and create user debit and credit cards.
          </p>
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
            autoComplete="off"
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
                <td className="px-5 py-4 font-mono text-xs text-muted">
                  {String(card.id).slice(-8).toUpperCase()}
                </td>
                <td className="px-5 py-4 font-semibold text-deep-accent">{card.user}</td>
                <td className="px-5 py-4 text-body">{card.cardName}</td>
                <td className="px-5 py-4 text-body">{card.type}</td>
                <td className="px-5 py-4 text-body">{card.linkedAccount || '—'}</td>
                <td className="px-5 py-4 font-mono text-sm text-body">
                  •••• {card.fullNumber ? card.fullNumber.slice(-4) : '••••'}
                </td>
                <td className="px-5 py-4">{getStatusBadge(card.status)}</td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => handleEditClick(card)}
                    className="inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-primary"
                  >
                    <Edit className="h-4 w-4" strokeWidth={2} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCards.length === 0 && (
          <div className="p-8 text-center text-muted">No cards found.</div>
        )}
      </div>

      {/* --- EDIT CARD MODAL --- */}
      {isEditModalOpen && selectedCard && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-[650px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>
            <div className="flex items-start gap-3 mb-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                <CreditCard className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-deep-accent">Edit Card</h2>
                <p className="mt-1 text-sm text-body">
                  {String(selectedCard.id).slice(-8).toUpperCase()} • {selectedCard.user}
                </p>
              </div>
            </div>

            <CardForm data={selectedCard} setData={setSelectedCard} isEditing={true} />

            <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 mt-6 sm:flex-row sm:justify-end">
              <button
                onClick={() => setIsEditModalOpen(false)}
                disabled={saving}
                className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent hover:bg-faint disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCard}
                disabled={saving}
                className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-deep disabled:opacity-70"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                ) : (
                  <Save className="h-4 w-4" strokeWidth={2.25} />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CREATE CARD MODAL --- */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-[650px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent"
            >
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
              <button
                onClick={() => setIsCreateModalOpen(false)}
                disabled={saving}
                className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent hover:bg-faint disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCard}
                disabled={saving}
                className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-deep disabled:opacity-70"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                ) : (
                  <Save className="h-4 w-4" strokeWidth={2.25} />
                )}
                Create Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed right-4 top-4 z-[10001] flex items-start gap-3 border border-hairline bg-white p-4 shadow-lg">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.25} />
          <p className="text-sm font-semibold text-deep-accent">{toast}</p>
        </div>
      )}
    </div>
  );
};

export default ManageCards;