// src/pages/Messages.jsx
import React, { useState, useMemo } from 'react';
import {
  Plus,
  Mail,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  Send,
  Archive,
  Trash2,
  Paperclip,
  FileText,
  ChevronRight,
  Inbox,
  ShieldCheck,
} from 'lucide-react';
import {
  mockMessages,
  mockMessageCategories,
  mockMessageTopics,
} from '../data/mockMessagesData';

const formatDate = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatDateLong = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const Messages = () => {
  // State
  const [selectedCategory, setSelectedCategory] = useState('All Messages');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [newMessageForm, setNewMessageForm] = useState({
    topic: 'General Question',
    relatedAccount: 'chk1',
    message: '',
  });

  // Filter messages
  const filteredMessages = useMemo(() => {
    let filtered = mockMessages;

    if (selectedCategory === 'Unread') {
      filtered = filtered.filter((m) => !m.read);
    } else if (selectedCategory !== 'All Messages') {
      filtered = filtered.filter((m) => m.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (m) =>
          m.subject.toLowerCase().includes(query) ||
          m.sender.toLowerCase().includes(query) ||
          m.preview.toLowerCase().includes(query) ||
          m.fullMessage.toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    return filtered;
  }, [selectedCategory, searchQuery]);

  // Selected message
  const selectedMessage = mockMessages.find((m) => m.id === selectedMessageId);

  // Conversation thread (same as original placeholder logic)
  const getConversation = (message) => {
    if (!message) return [];
    return mockMessages
      .filter(
        (m) =>
          m.subject === message.subject ||
          m.sender === message.sender ||
          m.category === message.category
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const conversation = selectedMessage ? getConversation(selectedMessage) : [];
  // Note: `conversation` is derived but not rendered (matches original behavior)

  // Handlers
  const handleOpenMessage = (id) => {
    setSelectedMessageId(id);
    // Mark as read — original behavior preserved (direct mutation)
    const msg = mockMessages.find((m) => m.id === id);
    if (msg && !msg.read) {
      msg.read = true;
    }
  };

  const handleCloseMessage = () => {
    setSelectedMessageId(null);
    setReplyText('');
  };

  const handleReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    alert(`Reply sent: "${replyText}"`);
    setReplyText('');
    handleCloseMessage();
  };

  const handleNewMessageSubmit = (e) => {
    e.preventDefault();
    if (!newMessageForm.message.trim()) return;
    alert(`New message sent: "${newMessageForm.message}"`);
    setShowNewMessage(false);
    setNewMessageForm({
      topic: 'General Question',
      relatedAccount: 'chk1',
      message: '',
    });
  };

  const handleNewMessageChange = (e) => {
    const { name, value } = e.target;
    setNewMessageForm((prev) => ({ ...prev, [name]: value }));
  };

  // Overview stats
  const unreadCount = mockMessages.filter((m) => !m.read).length;
  const openCount = mockMessages.filter((m) => !m.read || !m.isBank).length;
  const resolvedCount = mockMessages.filter((m) => m.read && m.isBank).length;
  const importantNotices = mockMessages.filter(
    (m) => m.priority === 'high' && !m.read
  ).length;

  const overviewCards = [
    { label: 'Unread Messages', value: unreadCount, icon: Mail },
    { label: 'Open Conversations', value: openCount, icon: MessageCircle },
    { label: 'Resolved Conversations', value: resolvedCount, icon: CheckCircle2 },
    { label: 'Important Notices', value: importantNotices, icon: AlertCircle },
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 border-b border-hairline pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">
            Messages
          </h1>
          <p className="mt-1 text-sm text-body sm:text-base">
            Securely communicate with us and manage your banking conversations.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowNewMessage(true)}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <Plus className="h-4 w-4" strokeWidth={2.25} />
          New Message
        </button>
      </div>

      {/* Overview */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {overviewCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="border border-hairline bg-faint px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted sm:text-xs">
                {label}
              </span>
              <Icon className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
            </div>
            <div className="mt-1 font-serif text-xl font-bold text-deep-accent sm:text-2xl">
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 border border-hairline bg-faint p-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
        <div className="flex flex-col gap-1.5 sm:min-w-[200px]">
          <label
            htmlFor="categorySelect"
            className="text-xs font-semibold text-deep-accent"
          >
            Filter
          </label>
          <select
            id="categorySelect"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
          >
            {mockMessageCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <label
            htmlFor="searchInput"
            className="text-xs font-semibold text-deep-accent"
          >
            Search
          </label>
          <div className="flex items-center border border-hairline bg-white focus-within:border-primary">
            <Search className="ml-3 h-4 w-4 shrink-0 text-muted" strokeWidth={2} />
            <input
              type="text"
              id="searchInput"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-h-[38px] w-full border-none bg-transparent px-2 py-1.5 text-sm text-deep-accent outline-none placeholder:text-muted/70"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mr-2 inline-flex h-6 w-6 items-center justify-center text-muted hover:text-deep-accent"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.25} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Message Container */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.8fr] lg:min-h-[400px]">
        {/* List */}
        <div className="max-h-[340px] overflow-y-auto border border-hairline bg-white lg:max-h-[600px]">
          {filteredMessages.length === 0 ? (
            <div className="py-12 text-center">
              <Inbox className="mx-auto h-8 w-8 text-muted" strokeWidth={1.5} />
              <p className="mt-3 text-sm font-semibold text-deep-accent">
                You&rsquo;re all caught up
              </p>
              <p className="mx-auto mt-1 max-w-xs px-4 text-xs text-muted">
                New messages and important account notifications will appear here.
              </p>
              <button
                type="button"
                onClick={() => setShowNewMessage(true)}
                className="mt-5 inline-flex min-h-[38px] items-center gap-1.5 bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
                New Message
              </button>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isSelected = selectedMessageId === msg.id;
              return (
                <button
                  key={msg.id}
                  type="button"
                  onClick={() => handleOpenMessage(msg.id)}
                  className={`flex w-full flex-col gap-1 border-b border-faint px-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 ${
                    isSelected
                      ? 'border-l-[3px] border-l-primary bg-[#e8f0f2] pl-[13px]'
                      : 'border-l-[3px] border-l-transparent hover:bg-faint'
                  } ${!msg.read ? 'bg-[#f4f8fa]' : 'bg-white'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-xs font-semibold text-deep-accent sm:text-sm">
                      {msg.sender}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted sm:text-xs">
                      {formatDate(msg.date)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!msg.read && (
                      <span
                        className="h-2 w-2 shrink-0 bg-primary"
                        aria-hidden="true"
                      />
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                      {msg.subject}
                    </span>
                    {msg.priority === 'high' && (
                      <span className="shrink-0 bg-[#d9534f] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        Important
                      </span>
                    )}
                  </div>

                  <div className="truncate text-xs text-body sm:text-sm">
                    {msg.preview}
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-block bg-faint px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-body">
                      {msg.category}
                    </span>
                    {!msg.read && (
                      <span className="inline-block bg-[#e7f3f5] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                        Unread
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Detail View */}
        {selectedMessage ? (
          <div className="relative max-h-[600px] overflow-y-auto border border-hairline bg-white p-5 sm:p-6">
            <button
              type="button"
              onClick={handleCloseMessage}
              aria-label="Close"
              className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>

            <div className="flex flex-col gap-4 pr-8">
              {/* Header */}
              <div className="border-b border-hairline pb-3">
                <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
                  {selectedMessage.subject}
                </h2>
                <div className="mt-2 flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-semibold text-deep-accent">
                    {selectedMessage.sender}
                  </span>
                  <span className="text-xs text-muted sm:text-sm">
                    {formatDateLong(selectedMessage.date)}
                  </span>
                </div>
                {selectedMessage.priority === 'high' && (
                  <span className="mt-2 inline-block bg-[#d9534f] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Important
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="text-sm leading-relaxed text-ink sm:text-base">
                {selectedMessage.fullMessage.split('\n').map((line, idx) => (
                  <p key={idx} className="mb-2 last:mb-0">
                    {line}
                  </p>
                ))}
              </div>

              {/* Attachments */}
              {selectedMessage.attachments &&
                selectedMessage.attachments.length > 0 && (
                  <div className="border-t border-hairline pt-3">
                    <div className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-deep-accent">
                      <Paperclip className="h-3.5 w-3.5" strokeWidth={2} />
                      Attachments:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedMessage.attachments.map((att, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 bg-faint px-3 py-1 text-xs text-body"
                        >
                          <FileText
                            className="h-3.5 w-3.5 text-primary"
                            strokeWidth={1.75}
                          />
                          {att}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 border-t border-hairline pt-3">
                <button
                  type="button"
                  onClick={() => alert('Message archived')}
                  className="inline-flex min-h-[36px] items-center gap-1.5 border border-hairline bg-white px-4 py-1.5 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:text-sm"
                >
                  <Archive className="h-3.5 w-3.5" strokeWidth={2} />
                  Archive
                </button>
                <button
                  type="button"
                  onClick={() => alert('Message deleted')}
                  className="inline-flex min-h-[36px] items-center gap-1.5 border border-hairline bg-white px-4 py-1.5 text-xs font-semibold text-[#d9534f] transition-colors hover:border-[#d9534f] hover:bg-[#fdf2f2] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d9534f]/40 sm:text-sm"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                  Delete
                </button>
              </div>

              {/* Reply form */}
              <form
                onSubmit={handleReply}
                className="mt-1 border-t border-hairline pt-3"
              >
                <textarea
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-[80px] w-full resize-y border border-hairline bg-white p-3 text-sm text-deep-accent placeholder:text-muted/70 focus:border-primary focus:outline-none"
                />
                <button
                  type="submit"
                  className="mt-3 inline-flex min-h-[40px] items-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <Send className="h-3.5 w-3.5" strokeWidth={2.25} />
                  Send Message
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex max-h-[200px] flex-col items-center justify-center border border-hairline bg-white p-8 text-center lg:max-h-[600px]">
            <Mail className="h-8 w-8 text-muted" strokeWidth={1.5} />
            <p className="mt-3 text-sm text-body">
              Select a message to read it.
            </p>
          </div>
        )}
      </div>

      {/* Security notice */}
      <div className="flex items-start gap-3 border border-hairline bg-faint px-4 py-3">
        <ShieldCheck
          className="mt-0.5 h-4 w-4 shrink-0 text-primary"
          strokeWidth={1.75}
        />
        <p className="text-xs text-body sm:text-sm">
          Messages are secured with bank-grade encryption. We will never ask for
          your password, PIN, or full account number by message.
        </p>
      </div>

      {/* New Message Modal */}
      {showNewMessage && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowNewMessage(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-[550px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowNewMessage(false)}
              aria-label="Close"
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>

            <h2 className="font-serif text-xl font-bold text-deep-accent sm:text-2xl">
              New Message
            </h2>
            <p className="mt-1 text-sm text-body">
              Send a secure message to Gulf Coast Bank &amp; Trust.
            </p>

            <form
              onSubmit={handleNewMessageSubmit}
              className="mt-6 flex flex-col gap-5"
            >
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="topicSelect"
                  className="text-sm font-semibold text-deep-accent"
                >
                  Topic
                </label>
                <select
                  id="topicSelect"
                  name="topic"
                  value={newMessageForm.topic}
                  onChange={handleNewMessageChange}
                  className="min-h-[40px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
                >
                  {mockMessageTopics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="relatedAccount"
                  className="text-sm font-semibold text-deep-accent"
                >
                  Related Account{' '}
                  <span className="font-normal text-muted">(optional)</span>
                </label>
                <select
                  id="relatedAccount"
                  name="relatedAccount"
                  value={newMessageForm.relatedAccount}
                  onChange={handleNewMessageChange}
                  className="min-h-[40px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
                >
                  <option value="chk1">Checking •••• 4821</option>
                  <option value="sav1">Savings •••• 9134</option>
                  <option value="cc1">Rewards Visa •••• 2208</option>
                  <option value="loan1">Auto Loan •••• 3812</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="messageText"
                  className="text-sm font-semibold text-deep-accent"
                >
                  Message
                </label>
                <textarea
                  id="messageText"
                  name="message"
                  value={newMessageForm.message}
                  onChange={handleNewMessageChange}
                  placeholder="Write your message here..."
                  required
                  className="min-h-[120px] w-full resize-y border border-hairline bg-white p-3 text-sm text-deep-accent placeholder:text-muted/70 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="inline-flex items-center gap-1.5 text-sm font-semibold text-deep-accent">
                  <Paperclip className="h-3.5 w-3.5" strokeWidth={2} />
                  Attach Document{' '}
                  <span className="font-normal text-muted">(optional)</span>
                </label>
                <input
                  type="file"
                  className="block w-full cursor-pointer border border-hairline bg-white text-sm text-body file:mr-3 file:cursor-pointer file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                />
                <p className="text-xs text-muted">
                  Supported: PDF, JPG, PNG (max 5MB)
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowNewMessage(false)}
                  className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <Send className="h-4 w-4" strokeWidth={2.25} />
                  Send Secure Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;