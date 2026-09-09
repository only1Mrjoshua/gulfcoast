// src/pages/Transfers.jsx
import React, { useState } from 'react';
import {
  mockTransferAccounts,
  mockScheduledTransfers,
  mockTransferHistory,
  transferLimits,
} from '../data/mockTransfersData';
import styles from './Transfers.module.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Helper to get account by ID
const getAccountById = (id) => {
  return mockTransferAccounts.find(acc => acc.id === id);
};

const Transfers = () => {
  // UI state
  const [currentStep, setCurrentStep] = useState('type'); // 'type' | 'form' | 'review' | 'success'
  const [selectedType, setSelectedType] = useState(null); // 'internal' | 'external' | 'recurring'

  // Form state
  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    frequency: 'One time',
    memo: '',
    isRecurring: false,
  });

  const [confirmationNumber, setConfirmationNumber] = useState('TRX-482193');

  // Handlers
  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setCurrentStep('form');
    // Reset form fields for new transfer
    setFormData({
      fromAccountId: '',
      toAccountId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      frequency: 'One time',
      memo: '',
      isRecurring: type === 'recurring',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCurrentStep('review');
  };

  const handleConfirm = () => {
    // In real app, would call API
    setCurrentStep('success');
  };

  const handleNewTransfer = () => {
    setCurrentStep('type');
    setSelectedType(null);
    setFormData({
      fromAccountId: '',
      toAccountId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      frequency: 'One time',
      memo: '',
      isRecurring: false,
    });
  };

  const getFromAccount = () => getAccountById(formData.fromAccountId);
  const getToAccount = () => getAccountById(formData.toAccountId);

  // Helper to get frequency label
  const getFrequencyLabel = (freq) => {
    if (freq === 'One time') return 'One time';
    return freq;
  };

  return (
    <div className={styles.transfersPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Transfers</h1>
          <p className={styles.pageSubtitle}>Move money securely between your accounts or to another bank.</p>
        </div>
        {currentStep !== 'type' && (
          <button className={styles.primaryAction} onClick={handleNewTransfer}>
            + New Transfer
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className={styles.transferContainer}>
        {currentStep === 'type' && (
          <TransferTypeSelection onSelect={handleTypeSelect} />
        )}

        {currentStep === 'form' && (
          <TransferForm
            formData={formData}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            accounts={mockTransferAccounts}
            selectedType={selectedType}
            onCancel={() => setCurrentStep('type')}
          />
        )}

        {currentStep === 'review' && (
          <TransferReview
            formData={formData}
            fromAccount={getFromAccount()}
            toAccount={getToAccount()}
            onConfirm={handleConfirm}
            onBack={() => setCurrentStep('form')}
          />
        )}

        {currentStep === 'success' && (
          <TransferSuccess
            confirmationNumber={confirmationNumber}
            formData={formData}
            fromAccount={getFromAccount()}
            toAccount={getToAccount()}
            onNewTransfer={handleNewTransfer}
          />
        )}
      </div>

      {/* Upcoming / Scheduled Transfers */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Upcoming Transfers</h2>
        <div className={styles.scheduledList}>
          {mockScheduledTransfers.map((t) => (
            <div key={t.id} className={styles.scheduledItem}>
              <div className={styles.schedInfo}>
                <span className={styles.schedDetail}>
                  {t.from} → {t.to}
                </span>
                <span className={styles.schedAmount}>{formatCurrency(t.amount)}</span>
                <span className={styles.schedDate}>{t.date}</span>
                <span className={styles.schedFrequency}>{t.frequency}</span>
              </div>
              <div className={styles.schedActions}>
                <button className={styles.schedAction}>Edit</button>
                <button className={styles.schedAction}>Cancel</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Transfer History */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Transfer History</h2>
        <div className={styles.historyList}>
          <div className={styles.historyHeader}>
            <span>Date</span>
            <span>From → To</span>
            <span>Amount</span>
            <span>Status</span>
          </div>
          {mockTransferHistory.map((t) => (
            <div key={t.id} className={styles.historyItem}>
              <span className={styles.historyDate}>{t.date}</span>
              <span className={styles.historyRoute}>
                {t.from} → {t.to}
              </span>
              <span className={styles.historyAmount}>{formatCurrency(t.amount)}</span>
              <span className={`${styles.historyStatus} ${styles[t.status.toLowerCase()]}`}>
                {t.status}
              </span>
            </div>
          ))}
        </div>
      </section>


      {/* Help */}
      <section className={styles.supportSection}>
        <h3 className={styles.supportTitle}>Need help?</h3>
        <div className={styles.supportOptions}>
          <button>Message Us</button>
          <button>Call Us</button>
          <button>Help Center</button>
        </div>
      </section>
    </div>
  );
};

// ----- Subcomponents -----

const TransferTypeSelection = ({ onSelect }) => {
  return (
    <div className={styles.typeSelection}>
      <h2 className={styles.typeTitle}>Choose transfer type</h2>
      <div className={styles.typeOptions}>
        <button className={styles.typeOption} onClick={() => onSelect('internal')}>
          <span className={styles.typeIcon}>↔</span>
          <span className={styles.typeLabel}>Between My Accounts</span>
          <span className={styles.typeDesc}>Move money between your checking and savings accounts.</span>
        </button>
        <button className={styles.typeOption} onClick={() => onSelect('external')}>
          <span className={styles.typeIcon}>🏦</span>
          <span className={styles.typeLabel}>To Another Bank</span>
          <span className={styles.typeDesc}>Send money to an external bank account.</span>
        </button>
        <button className={styles.typeOption} onClick={() => onSelect('recurring')}>
          <span className={styles.typeIcon}>🔄</span>
          <span className={styles.typeLabel}>Recurring Transfer</span>
          <span className={styles.typeDesc}>Automatically move money on a schedule.</span>
        </button>
      </div>
    </div>
  );
};

const TransferForm = ({ formData, onChange, onSubmit, accounts, selectedType, onCancel }) => {
  const fromAccount = accounts.find(a => a.id === formData.fromAccountId);
  const toAccount = accounts.find(a => a.id === formData.toAccountId);

  // Filter "to" accounts: exclude the selected "from" account
  const availableToAccounts = accounts.filter(a => a.id !== formData.fromAccountId);

  return (
    <form className={styles.transferForm} onSubmit={onSubmit}>
      <h2 className={styles.formTitle}>New Transfer</h2>

      <div className={styles.formGroup}>
        <label htmlFor="fromAccountId">From</label>
        <select
          id="fromAccountId"
          name="fromAccountId"
          value={formData.fromAccountId}
          onChange={onChange}
          required
          className={styles.select}
        >
          <option value="">Select account</option>
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>
              {acc.name} •••• {acc.lastFour} {acc.available !== null ? `(Available: ${formatCurrency(acc.available)})` : ''}
            </option>
          ))}
        </select>
        {fromAccount && fromAccount.available !== null && (
          <div className={styles.helperText}>Available: {formatCurrency(fromAccount.available)}</div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="toAccountId">To</label>
        <select
          id="toAccountId"
          name="toAccountId"
          value={formData.toAccountId}
          onChange={onChange}
          required
          className={styles.select}
          disabled={!formData.fromAccountId}
        >
          <option value="">Select account</option>
          {availableToAccounts.map(acc => (
            <option key={acc.id} value={acc.id}>
              {acc.name} •••• {acc.lastFour}
            </option>
          ))}
        </select>
        {selectedType === 'external' && (
          <button className={styles.addExternalBtn}>+ Add External Account</button>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="amount">Amount</label>
        <div className={styles.amountInput}>
          <span className={styles.currencySymbol}>$</span>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={onChange}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            required
            className={styles.amountField}
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="date">Transfer Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={onChange}
            required
            className={styles.input}
          />
        </div>
        {selectedType === 'recurring' && (
          <div className={styles.formGroup}>
            <label htmlFor="frequency">Frequency</label>
            <select
              id="frequency"
              name="frequency"
              value={formData.frequency}
              onChange={onChange}
              className={styles.select}
            >
              <option value="One time">One time</option>
              <option value="Weekly">Weekly</option>
              <option value="Every 2 weeks">Every 2 weeks</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="memo">Memo (optional)</label>
        <input
          type="text"
          id="memo"
          name="memo"
          value={formData.memo}
          onChange={onChange}
          placeholder="e.g. Transfer to savings"
          className={styles.input}
        />
      </div>

      <div className={styles.formActions}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
        <button type="submit" className={styles.submitBtn}>Review Transfer</button>
      </div>
    </form>
  );
};

const TransferReview = ({ formData, fromAccount, toAccount, onConfirm, onBack }) => {
  return (
    <div className={styles.reviewPanel}>
      <h2 className={styles.reviewTitle}>Review Transfer</h2>
      <div className={styles.reviewDetails}>
        <div className={styles.reviewRow}>
          <span className={styles.reviewLabel}>From</span>
          <span className={styles.reviewValue}>
            {fromAccount ? `${fromAccount.name} •••• ${fromAccount.lastFour}` : '—'}
          </span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewLabel}>To</span>
          <span className={styles.reviewValue}>
            {toAccount ? `${toAccount.name} •••• ${toAccount.lastFour}` : '—'}
          </span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewLabel}>Amount</span>
          <span className={styles.reviewValue}>{formatCurrency(parseFloat(formData.amount) || 0)}</span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewLabel}>Date</span>
          <span className={styles.reviewValue}>{formData.date}</span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewLabel}>Frequency</span>
          <span className={styles.reviewValue}>{formData.frequency}</span>
        </div>
        {formData.memo && (
          <div className={styles.reviewRow}>
            <span className={styles.reviewLabel}>Memo</span>
            <span className={styles.reviewValue}>{formData.memo}</span>
          </div>
        )}
      </div>

      <div className={styles.reviewActions}>
        <button className={styles.backBtn} onClick={onBack}>Back</button>
        <button className={styles.confirmBtn} onClick={onConfirm}>Confirm Transfer</button>
      </div>
    </div>
  );
};

const TransferSuccess = ({ confirmationNumber, formData, fromAccount, toAccount, onNewTransfer }) => {
  return (
    <div className={styles.successPanel}>
      <div className={styles.successIcon}>✓</div>
      <h2 className={styles.successTitle}>Transfer Scheduled</h2>
      <p className={styles.successMessage}>
        Your {formatCurrency(parseFloat(formData.amount) || 0)} transfer from {fromAccount?.name} to {toAccount?.name} has been scheduled.
      </p>
      <div className={styles.successDetails}>
        <div className={styles.successRow}>
          <span className={styles.successLabel}>Transfer Date</span>
          <span className={styles.successValue}>{formData.date}</span>
        </div>
        <div className={styles.successRow}>
          <span className={styles.successLabel}>Confirmation Number</span>
          <span className={styles.successValue}>{confirmationNumber}</span>
        </div>
      </div>
      <div className={styles.successActions}>
        <button className={styles.successAction}>View Transfer</button>
        <button className={styles.successActionSecondary} onClick={onNewTransfer}>Make Another Transfer</button>
      </div>
    </div>
  );
};

export default Transfers;