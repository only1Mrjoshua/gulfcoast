// src/pages/admin/ManageMessages.jsx
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import {
  Search, MessageSquare, Send, ArrowLeft, CheckCheck,
  Check, Inbox, Loader2, Clock,
} from 'lucide-react';
import { apiFetch } from '../../utils/api';
import { usePolling } from '../../hooks/usePolling';

const formatRelative = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return d.toLocaleDateString('en-US', { weekday: 'short' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatTime = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const getInitials = (name) =>
  (name || '')
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

const ManageMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [draft, setDraft] = useState('');

  const threadEndRef = useRef(null);
  const lastRealIdRef = useRef(null);

  // ────────────────────────────────────────────────────────
  // Initial load — conversation list
  // ────────────────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    const res = await apiFetch('/admin/messages');
    const d = res?.data ?? res;
    setConversations(d.conversations || []);
  }, []);

  useEffect(() => {
    const boot = async () => {
      try {
        setLoading(true);
        setError('');
        await loadConversations();
      } catch (err) {
        console.error('❌ Failed to load conversations:', err);
        setError(err.message || 'Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, [loadConversations]);

  // ────────────────────────────────────────────────────────
  // Poll: the conversation LIST (always, every 5s)
  // ────────────────────────────────────────────────────────
  const pollList = useCallback(async () => {
    try {
      const res = await apiFetch('/admin/messages');
      const d = res?.data ?? res;
      setConversations(d.conversations || []);
    } catch (err) {
      console.warn('list poll failed:', err?.message);
    }
  }, []);

  usePolling(pollList, { intervalMs: 5000, enabled: !loading && !error });

  // ────────────────────────────────────────────────────────
  // Poll: the OPEN THREAD (every 3s, only when one is selected)
  // ────────────────────────────────────────────────────────
  const pollThread = useCallback(async () => {
    if (!selectedUserId || !lastRealIdRef.current) return;
    try {
      const res = await apiFetch(
        `/admin/messages/${selectedUserId}?since=${lastRealIdRef.current}`
      );
      const d = res?.data ?? res;

      const incoming = d.messages || [];
      const statuses = d.statusUpdates || [];

      setMessages((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        const toAdd = incoming.filter((m) => !seen.has(m.id));

        // Apply status updates to existing messages
        const withStatus = prev.map((m) => {
          const upd = statuses.find((s) => s.id === m.id);
          return upd ? { ...m, status: upd.status } : m;
        });

        return [...withStatus, ...toAdd];
      });

      // Advance the cursor
      const lastNew = incoming[incoming.length - 1];
      if (lastNew) lastRealIdRef.current = lastNew.id;
    } catch (err) {
      console.warn('thread poll failed:', err?.message);
    }
  }, [selectedUserId]);

  const { pollNow: pollThreadNow } = usePolling(pollThread, {
    intervalMs: 3000,
    enabled: !!selectedUserId && !threadLoading,
  });

  // ────────────────────────────────────────────────────────
  // Auto-scroll
  // ────────────────────────────────────────────────────────
  useEffect(() => {
    if (threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedUserId]);

  // ────────────────────────────────────────────────────────
  // Open a conversation
  // ────────────────────────────────────────────────────────
  const handleSelectConversation = async (userId) => {
    setSelectedUserId(userId);
    setMessages([]);
    setSelectedUser(null);
    lastRealIdRef.current = null;
    setThreadLoading(true);

    try {
      const res = await apiFetch(`/admin/messages/${userId}`);
      const d = res?.data ?? res;
      setSelectedUser(d.user || null);

      const msgs = d.messages || [];
      setMessages(msgs);
      if (msgs.length > 0) {
        lastRealIdRef.current = msgs[msgs.length - 1].id;
      }

      // Clear unread badge locally
      setConversations((prev) =>
        prev.map((c) =>
          c.userId === userId ? { ...c, unreadByAdmin: 0 } : c
        )
      );
    } catch (err) {
      console.error('❌ Failed to load thread:', err);
    } finally {
      setThreadLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedUserId(null);
    setSelectedUser(null);
    setMessages([]);
    lastRealIdRef.current = null;
  };

  // ────────────────────────────────────────────────────────
  // Send (optimistic)
  // ────────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !selectedUserId) return;

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      senderRole: 'admin',
      text,
      status: 'sending',
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);
    setDraft('');

    try {
      const res = await apiFetch(`/admin/messages/${selectedUserId}`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      const d = res?.data ?? res;
      const real = d.message;

      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? real : m))
      );
      lastRealIdRef.current = real.id;

      // Refresh list to update preview
      pollList();
      // Immediate thread poll in case they replied super-fast
      pollThreadNow();
    } catch (err) {
      console.error('❌ Send failed:', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, status: 'failed' } : m
        )
      );
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ────────────────────────────────────────────────────────
  const filteredConversations = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.user.toLowerCase().includes(q) ||
        c.userEmail.toLowerCase().includes(q) ||
        (c.lastMessageText || '').toLowerCase().includes(q)
    );
  }, [conversations, searchTerm]);

  const totalUnread = conversations.reduce(
    (s, c) => s + (c.unreadByAdmin || 0),
    0
  );

  const renderTicks = (status) => {
    if (status === 'sending') {
      return <Clock className="h-3 w-3" strokeWidth={2.25} />;
    }
    if (status === 'failed') {
      return (
        <span className="text-[10px] font-bold text-[#d9534f]">Failed</span>
      );
    }
    if (status === 'read') {
      return <CheckCheck className="h-3 w-3 text-primary" strokeWidth={2.25} />;
    }
    return <Check className="h-3 w-3" strokeWidth={2.25} />;
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" strokeWidth={1.75} />
        <p className="text-sm text-muted">Loading messages…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4">
        <p className="font-serif text-xl font-bold text-deep-accent">
          We couldn&rsquo;t load messages
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
      <div className="mb-6 flex flex-col gap-4 border-b border-hairline pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">
            Manage Messages
          </h1>
          <p className="mt-1 text-sm text-body">Reply to users in real time.</p>
        </div>
        {totalUnread > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#d9534f]">
            <span className="h-1.5 w-1.5 bg-[#d9534f]" />
            {totalUnread} unread
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_1fr] lg:h-[calc(100vh-260px)] lg:min-h-[560px]">
        {/* Conversation list */}
        <div
          className={`flex flex-col overflow-hidden border border-hairline bg-white ${
            selectedUserId ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="border-b border-hairline p-3">
            <div className="flex items-center border border-hairline bg-white px-3 focus-within:border-primary">
              <Search className="h-4 w-4 text-muted" strokeWidth={2} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="min-h-[36px] w-full border-none bg-transparent px-2 py-1.5 text-sm text-deep-accent outline-none placeholder:text-muted/60"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                <Inbox className="h-8 w-8 text-muted" strokeWidth={1.5} />
                <p className="mt-3 text-sm font-semibold text-deep-accent">
                  No conversations yet
                </p>
                <p className="mt-1 text-xs text-muted">
                  User messages will appear here.
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.userId === selectedUserId;
                const hasUnread = conv.unreadByAdmin > 0;
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => handleSelectConversation(conv.userId)}
                    className={`flex w-full gap-3 border-b border-faint px-4 py-3 text-left transition-colors ${
                      isSelected
                        ? 'bg-[#e8f0f2] border-l-[3px] border-l-primary pl-[13px]'
                        : 'border-l-[3px] border-l-transparent hover:bg-faint'
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center font-serif text-sm font-bold ${
                        hasUnread ? 'bg-primary text-white' : 'bg-faint text-primary'
                      }`}
                    >
                      {getInitials(conv.user)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`truncate text-sm ${
                            hasUnread
                              ? 'font-bold text-deep-accent'
                              : 'font-semibold text-deep-accent'
                          }`}
                        >
                          {conv.user}
                        </span>
                        <span className="shrink-0 text-[11px] text-muted">
                          {formatRelative(conv.lastMessageAt)}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2">
                        {conv.lastMessageFrom === 'admin' && (
                          <CheckCheck
                            className="h-3 w-3 shrink-0 text-primary"
                            strokeWidth={2.25}
                          />
                        )}
                        <span
                          className={`truncate text-xs ${
                            hasUnread ? 'font-medium text-body' : 'text-muted'
                          }`}
                        >
                          {conv.lastMessageText || 'No messages yet'}
                        </span>
                        {hasUnread && (
                          <span className="ml-auto flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-[#d9534f] px-1.5 text-[10px] font-bold text-white">
                            {conv.unreadByAdmin}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Thread */}
        <div
          className={`flex flex-col overflow-hidden border border-hairline bg-white ${
            selectedUserId ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {selectedUser ? (
            <>
              <div className="flex shrink-0 items-center gap-3 border-b border-hairline px-4 py-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-deep-accent lg:hidden"
                  aria-label="Back"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
                </button>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-faint font-serif text-sm font-bold text-primary">
                  {getInitials(selectedUser.user)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-deep-accent">
                    {selectedUser.user}
                  </div>
                  <div className="truncate text-xs text-muted">
                    {selectedUser.userEmail}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-[#fafbfc] px-4 py-5">
                {threadLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2
                      className="h-6 w-6 animate-spin text-muted"
                      strokeWidth={1.75}
                    />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <MessageSquare
                      className="h-8 w-8 text-muted"
                      strokeWidth={1.5}
                    />
                    <p className="mt-3 text-sm text-body">No messages yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {messages.map((msg) => {
                      const isAdmin = msg.senderRole === 'admin';
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${
                            isAdmin ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`flex max-w-[78%] flex-col gap-1 ${
                              isAdmin ? 'items-end' : 'items-start'
                            }`}
                          >
                            <div
                              className={`whitespace-pre-wrap break-words px-3.5 py-2.5 text-sm leading-relaxed ${
                                isAdmin
                                  ? 'bg-primary text-white'
                                  : 'border border-hairline bg-white text-deep-accent'
                              } ${msg.status === 'failed' ? 'opacity-60' : ''}`}
                            >
                              {msg.text}
                            </div>
                            <div className="flex items-center gap-1.5 px-1 text-[10px] text-muted">
                              <span>{formatTime(msg.createdAt)}</span>
                              {isAdmin && renderTicks(msg.status)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={threadEndRef} />
                  </div>
                )}
              </div>

              <div className="shrink-0 border-t border-hairline bg-white p-3">
                <div className="flex items-end gap-2">
                  <textarea
                    rows={1}
                    placeholder="Type a message… (Enter to send)"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="min-h-[42px] max-h-[120px] flex-1 resize-none border border-hairline bg-white px-3 py-2.5 text-sm text-deep-accent outline-none focus:border-primary placeholder:text-muted/60"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!draft.trim()}
                    className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center bg-primary text-white transition-colors hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Send"
                  >
                    <Send className="h-4 w-4" strokeWidth={2.25} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <span className="flex h-12 w-12 items-center justify-center bg-faint text-primary">
                <MessageSquare className="h-6 w-6" strokeWidth={1.5} />
              </span>
              <p className="mt-4 font-serif text-base font-bold text-deep-accent sm:text-lg">
                Select a conversation
              </p>
              <p className="mt-1 max-w-xs text-xs text-muted sm:text-sm">
                Choose a user from the list on the left to read and reply.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageMessages;