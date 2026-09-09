// src/pages/Messages.jsx
import React, { useState, useMemo } from 'react';
import {
  mockMessages,
  mockMessageCategories,
  mockMessageTopics,
  mockSupportOptions,
} from '../data/mockMessagesData';
import styles from './Messages.module.css';

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

    // Category filter
    if (selectedCategory === 'Unread') {
      filtered = filtered.filter(m => !m.read);
    } else if (selectedCategory !== 'All Messages') {
      filtered = filtered.filter(m => m.category === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(m =>
        m.subject.toLowerCase().includes(query) ||
        m.sender.toLowerCase().includes(query) ||
        m.preview.toLowerCase().includes(query) ||
        m.fullMessage.toLowerCase().includes(query)
      );
    }

    // Sort by date descending (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    return filtered;
  }, [selectedCategory, searchQuery]);

  // Get selected message
  const selectedMessage = mockMessages.find(m => m.id === selectedMessageId);

  // Get conversation thread (messages from the same category or subject)
  const getConversation = (message) => {
    if (!message) return [];
    // For simplicity, show messages with same subject or that are replies
    // This is a placeholder – in a real app, you'd have conversation threading
    return mockMessages.filter(m =>
      m.subject === message.subject ||
      m.sender === message.sender ||
      m.category === message.category
    ).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const conversation = selectedMessage ? getConversation(selectedMessage) : [];

  // Handlers
  const handleOpenMessage = (id) => {
    setSelectedMessageId(id);
    // Mark as read
    const msg = mockMessages.find(m => m.id === id);
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
    setNewMessageForm({ topic: 'General Question', relatedAccount: 'chk1', message: '' });
  };

  const handleNewMessageChange = (e) => {
    const { name, value } = e.target;
    setNewMessageForm(prev => ({ ...prev, [name]: value }));
  };

  // Calculate overview stats
  const unreadCount = mockMessages.filter(m => !m.read).length;
  const openCount = mockMessages.filter(m => !m.read || !m.isBank).length;
  const resolvedCount = mockMessages.filter(m => m.read && m.isBank).length;
  const importantNotices = mockMessages.filter(m => m.priority === 'high' && !m.read).length;

  return (
    <div className={styles.messagesPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Messages</h1>
          <p className={styles.pageSubtitle}>
            Securely communicate with us and manage your banking conversations.
          </p>
        </div>
        <button className={styles.primaryAction} onClick={() => setShowNewMessage(true)}>
          + New Message
        </button>
      </div>

      {/* Message Overview */}
      <div className={styles.overviewSection}>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Unread Messages</span>
          <span className={styles.overviewValue}>{unreadCount}</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Open Conversations</span>
          <span className={styles.overviewValue}>{openCount}</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Resolved Conversations</span>
          <span className={styles.overviewValue}>{resolvedCount}</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Important Notices</span>
          <span className={styles.overviewValue}>{importantNotices}</span>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersBar}>
        <div className={styles.filterGroup}>
          <label htmlFor="categorySelect">Filter</label>
          <select
            id="categorySelect"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.filterSelect}
          >
            {mockMessageCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="searchInput">Search</label>
          <input
            type="text"
            id="searchInput"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.filterInput}
          />
        </div>
      </div>

      {/* Message List & Detail View */}
      <div className={styles.messageContainer}>
        {/* List */}
        <div className={styles.messageList}>
          {filteredMessages.length === 0 ? (
            <div className={styles.emptyState}>
              <p>You're all caught up</p>
              <p className={styles.emptySub}>New messages and important account notifications will appear here.</p>
              <button className={styles.emptyAction} onClick={() => setShowNewMessage(true)}>
                + New Message
              </button>
            </div>
          ) : (
            filteredMessages.map(msg => (
              <div
                key={msg.id}
                className={`${styles.messageItem} ${!msg.read ? styles.unread : ''} ${selectedMessageId === msg.id ? styles.selected : ''}`}
                onClick={() => handleOpenMessage(msg.id)}
              >
                <div className={styles.messageHeader}>
                  <span className={styles.messageSender}>{msg.sender}</span>
                  <span className={styles.messageDate}>{formatDate(msg.date)}</span>
                </div>
                <div className={styles.messageSubject}>
                  {!msg.read && <span className={styles.unreadDot}></span>}
                  <span>{msg.subject}</span>
                  {msg.priority === 'high' && <span className={styles.priorityBadge}>Important</span>}
                </div>
                <div className={styles.messagePreview}>{msg.preview}</div>
                <div className={styles.messageMeta}>
                  <span className={styles.messageCategory}>{msg.category}</span>
                  {!msg.read && <span className={styles.unreadBadge}>Unread</span>}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail View */}
        {selectedMessage ? (
          <div className={styles.messageDetail}>
            <button className={styles.detailClose} onClick={handleCloseMessage}>×</button>
            <div className={styles.detailContent}>
              <div className={styles.detailHeader}>
                <h2 className={styles.detailSubject}>{selectedMessage.subject}</h2>
                <div className={styles.detailMeta}>
                  <span className={styles.detailSender}>{selectedMessage.sender}</span>
                  <span className={styles.detailDate}>{formatDateLong(selectedMessage.date)}</span>
                </div>
                {selectedMessage.priority === 'high' && (
                  <span className={styles.detailPriority}>Important</span>
                )}
              </div>
              <div className={styles.detailBody}>
                {selectedMessage.fullMessage.split('\n').map((line, idx) => (
                  <p key={idx} className={styles.detailParagraph}>{line}</p>
                ))}
              </div>
              {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                <div className={styles.detailAttachments}>
                  <span className={styles.attachmentLabel}>Attachments:</span>
                  {selectedMessage.attachments.map((att, idx) => (
                    <span key={idx} className={styles.attachmentItem}>{att}</span>
                  ))}
                </div>
              )}
              <div className={styles.detailActions}>
                <button className={styles.detailActionBtn} onClick={() => alert('Message archived')}>
                  Archive
                </button>
                <button className={styles.detailActionBtn} onClick={() => alert('Message deleted')}>
                  Delete
                </button>
              </div>
              {/* Reply form */}
              <form onSubmit={handleReply} className={styles.replyForm}>
                <textarea
                  className={styles.replyTextarea}
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <button type="submit" className={styles.sendReplyBtn}>Send Message</button>
              </form>
            </div>
          </div>
        ) : (
          <div className={styles.detailPlaceholder}>
            <p>Select a message to read it.</p>
          </div>
        )}
      </div>


      {/* New Message Modal */}
      {showNewMessage && (
        <div className={styles.modalOverlay} onClick={() => setShowNewMessage(false)}>
          <div className={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowNewMessage(false)}>×</button>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>New Message</h2>
              <p className={styles.modalSubtitle}>Send a secure message to Gulf Coast Bank & Trust.</p>

              <form onSubmit={handleNewMessageSubmit} className={styles.messageForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="topicSelect">Topic</label>
                  <select
                    id="topicSelect"
                    name="topic"
                    value={newMessageForm.topic}
                    onChange={handleNewMessageChange}
                    className={styles.formSelect}
                  >
                    {mockMessageTopics.map(topic => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="relatedAccount">Related Account (optional)</label>
                  <select
                    id="relatedAccount"
                    name="relatedAccount"
                    value={newMessageForm.relatedAccount}
                    onChange={handleNewMessageChange}
                    className={styles.formSelect}
                  >
                    <option value="chk1">Checking •••• 4821</option>
                    <option value="sav1">Savings •••• 9134</option>
                    <option value="cc1">Rewards Visa •••• 2208</option>
                    <option value="loan1">Auto Loan •••• 3812</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="messageText">Message</label>
                  <textarea
                    id="messageText"
                    name="message"
                    value={newMessageForm.message}
                    onChange={handleNewMessageChange}
                    placeholder="Write your message here..."
                    className={styles.formTextarea}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.attachmentLabel}>Attach Document (optional)</label>
                  <input type="file" className={styles.fileInput} />
                  <div className={styles.fileHelp}>
                    Supported: PDF, JPG, PNG (max 5MB)
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowNewMessage(false)}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitBtn}>
                    Send Secure Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;