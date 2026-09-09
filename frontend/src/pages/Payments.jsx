// src/pages/Payments.jsx
import React, { useState } from 'react';
import {
  mockPayees,
  mockUpcomingPayments,
  mockPaymentHistory,
  mockAutopay,
  mockPaymentReminders,
  paymentOverview,
  paymentAccounts,
} from '../data/mockPaymentsData';
import styles from './Payments.module.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const Payments = () => {
  // UI state
  const [currentStep, setCurrentStep] = useState('overview'); // 'overview' | 'form' | 'review' | 'success'
  const [selectedPayeeId, setSelectedPayeeId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    fromAccountId: 'chk1',
    payeeId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    frequency: 'One time',
    memo: '',
    isRecurring: false,
    endDate: '',
  });

  const [confirmationNumber, setConfirmationNumber] = useState('PAY-729481');

  // Handlers
  const handlePayBill = () => {
    setCurrentStep('form');
    setSelectedPayeeId(null);
    setFormData({
      fromAccountId: 'chk1',
      payeeId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      frequency: 'One time',
      memo: '',
      isRecurring: false,
      endDate: '',
    });
  };

  const handlePayeeSelect = (payeeId) => {
    setSelectedPayeeId(payeeId);
    setFormData(prev => ({ ...prev, payeeId }));
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
    setCurrentStep('success');
  };

  const handleNewPayment = () => {
    setCurrentStep('overview');
    setSelectedPayeeId(null);
    setFormData({
      fromAccountId: 'chk1',
      payeeId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      frequency: 'One time',
      memo: '',
      isRecurring: false,
      endDate: '',
    });
  };

  const getPayee = (id) => mockPayees.find(p => p.id === parseInt(id));
  const getFromAccount = () => paymentAccounts.find(a => a.id === formData.fromAccountId);
  const selectedPayee = getPayee(formData.payeeId);

  return (
    <div className={styles.paymentsPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Payments</h1>
          <p className={styles.pageSubtitle}>Pay your bills, manage scheduled payments, and keep track of your payment activity.</p>
        </div>
        {currentStep === 'overview' && (
          <button className={styles.primaryAction} onClick={handlePayBill}>
            + Pay a Bill
          </button>
        )}
      </div>

      {/* Payment Overview */}
      {currentStep === 'overview' && (
        <section className={styles.overviewSection}>
          <div className={styles.overviewCard}>
            <span className={styles.overviewLabel}>Due Soon</span>
            <span className={styles.overviewValue}>{formatCurrency(paymentOverview.dueSoon)}</span>
            <span className={styles.overviewSub}>Bills due within 7 days</span>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewLabel}>Scheduled</span>
            <span className={styles.overviewValue}>{formatCurrency(paymentOverview.scheduled)}</span>
            <span className={styles.overviewSub}>Upcoming payments scheduled</span>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewLabel}>Paid This Month</span>
            <span className={styles.overviewValue}>{formatCurrency(paymentOverview.paidThisMonth)}</span>
            <span className={styles.overviewSub}>Total payments completed</span>
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className={styles.paymentContainer}>
        {currentStep === 'overview' && (
          <>
            {/* Upcoming Payments */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Upcoming Payments</h2>
              <div className={styles.upcomingList}>
                {mockUpcomingPayments.map((p) => (
                  <div key={p.id} className={styles.upcomingItem}>
                    <div className={styles.upcomingInfo}>
                      <span className={styles.upcomingPayee}>{p.payee}</span>
                      <span className={styles.upcomingDue}>Due {p.dueDate}</span>
                      <span className={styles.upcomingAmount}>{formatCurrency(p.amount)}</span>
                      <span className={`${styles.upcomingStatus} ${p.autopay ? styles.autopayOn : styles.autopayOff}`}>
                        {p.autopay ? 'Autopay ON' : 'Autopay OFF'}
                      </span>
                    </div>
                    <button
                      className={styles.payNowBtn}
                      onClick={() => {
                        handlePayBill();
                        // Pre-fill payee
                        const payee = mockPayees.find(pp => pp.name === p.payee);
                        if (payee) {
                          setFormData(prev => ({ ...prev, payeeId: String(payee.id), amount: String(p.amount) }));
                          setSelectedPayeeId(String(payee.id));
                        }
                      }}
                    >
                      Pay Now
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Saved Payees */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Saved Payees</h2>
              <div className={styles.payeeList}>
                {mockPayees.map((payee) => (
                  <div key={payee.id} className={styles.payeeItem}>
                    <span className={styles.payeeName}>{payee.name}</span>
                    <span className={styles.payeeCategory}>{payee.category}</span>
                    <div className={styles.payeeActions}>
                      <button className={styles.payeeAction} onClick={() => {
                        handlePayBill();
                        setFormData(prev => ({ ...prev, payeeId: String(payee.id) }));
                        setSelectedPayeeId(String(payee.id));
                      }}>Pay</button>
                      <button className={styles.payeeAction}>Edit</button>
                      <button className={styles.payeeAction}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Autopay */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Automatic Payments</h2>
              <div className={styles.autopayList}>
                {mockAutopay.map((a) => (
                  <div key={a.id} className={styles.autopayItem}>
                    <span className={styles.autopayPayee}>{a.payee}</span>
                    <span className={styles.autopayFrequency}>{a.frequency}</span>
                    <span className={styles.autopayAmount}>{formatCurrency(a.nextAmount)}</span>
                    <span className={styles.autopayDate}>Next: {a.nextDate}</span>
                    <button className={styles.autopayManage}>Manage</button>
                  </div>
                ))}
              </div>
            </section>

            {/* Payment History */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Payment History</h2>
              <div className={styles.historyList}>
                <div className={styles.historyHeader}>
                  <span>Date</span>
                  <span>Payee</span>
                  <span>Account</span>
                  <span>Amount</span>
                  <span>Status</span>
                </div>
                {mockPaymentHistory.map((p) => (
                  <div key={p.id} className={styles.historyItem}>
                    <span className={styles.historyDate}>{p.date}</span>
                    <span className={styles.historyPayee}>{p.payee}</span>
                    <span className={styles.historyAccount}>{p.account}</span>
                    <span className={styles.historyAmount}>{formatCurrency(p.amount)}</span>
                    <span className={`${styles.historyStatus} ${styles[p.status.toLowerCase()]}`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>

          </>
        )}

        {currentStep === 'form' && (
          <PaymentForm
            formData={formData}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            payees={mockPayees}
            accounts={paymentAccounts}
            selectedPayeeId={selectedPayeeId}
            onPayeeSelect={handlePayeeSelect}
            onCancel={() => setCurrentStep('overview')}
          />
        )}

        {currentStep === 'review' && (
          <PaymentReview
            formData={formData}
            payee={selectedPayee}
            fromAccount={getFromAccount()}
            onConfirm={handleConfirm}
            onBack={() => setCurrentStep('form')}
          />
        )}

        {currentStep === 'success' && (
          <PaymentSuccess
            confirmationNumber={confirmationNumber}
            formData={formData}
            payee={selectedPayee}
            fromAccount={getFromAccount()}
            onNewPayment={handleNewPayment}
          />
        )}
      </div>

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

const PaymentForm = ({ formData, onChange, onSubmit, payees, accounts, selectedPayeeId, onPayeeSelect, onCancel }) => {
  const fromAccount = accounts.find(a => a.id === formData.fromAccountId);

  return (
    <form className={styles.paymentForm} onSubmit={onSubmit}>
      <h2 className={styles.formTitle}>Pay a Bill</h2>

      <div className={styles.formGroup}>
        <label>Select Payee</label>
        <div className={styles.payeeSelection}>
          {payees.map((payee) => (
            <button
              key={payee.id}
              type="button"
              className={`${styles.payeeOption} ${formData.payeeId === String(payee.id) ? styles.payeeSelected : ''}`}
              onClick={() => onPayeeSelect(String(payee.id))}
            >
              <span className={styles.payeeOptionName}>{payee.name}</span>
              <span className={styles.payeeOptionCategory}>{payee.category}</span>
            </button>
          ))}
        </div>
        <button type="button" className={styles.addPayeeBtn}>+ Add a Payee</button>
      </div>

      {formData.payeeId && (
        <>
          <div className={styles.formGroup}>
            <label htmlFor="fromAccountId">Pay From</label>
            <select
              id="fromAccountId"
              name="fromAccountId"
              value={formData.fromAccountId}
              onChange={onChange}
              className={styles.select}
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} •••• {acc.lastFour} (Available: {formatCurrency(acc.available)})
                </option>
              ))}
            </select>
            {fromAccount && (
              <div className={styles.helperText}>Available: {formatCurrency(fromAccount.available)}</div>
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
              <label htmlFor="date">Payment Date</label>
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
                <option value="Quarterly">Quarterly</option>
              </select>
            </div>
          </div>

          {formData.frequency !== 'One time' && (
            <div className={styles.formGroup}>
              <label htmlFor="endDate">End Date (optional)</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={onChange}
                className={styles.input}
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="memo">Memo (optional)</label>
            <input
              type="text"
              id="memo"
              name="memo"
              value={formData.memo}
              onChange={onChange}
              placeholder="e.g. September payment"
              className={styles.input}
            />
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
            <button type="submit" className={styles.submitBtn}>Review Payment</button>
          </div>
        </>
      )}
    </form>
  );
};

const PaymentReview = ({ formData, payee, fromAccount, onConfirm, onBack }) => {
  return (
    <div className={styles.reviewPanel}>
      <h2 className={styles.reviewTitle}>Review Payment</h2>
      <div className={styles.reviewDetails}>
        <div className={styles.reviewRow}>
          <span className={styles.reviewLabel}>Pay From</span>
          <span className={styles.reviewValue}>
            {fromAccount ? `${fromAccount.name} •••• ${fromAccount.lastFour}` : '—'}
          </span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewLabel}>Payee</span>
          <span className={styles.reviewValue}>{payee ? payee.name : '—'}</span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewLabel}>Amount</span>
          <span className={styles.reviewValue}>{formatCurrency(parseFloat(formData.amount) || 0)}</span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewLabel}>Payment Date</span>
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
        <div className={styles.reviewRow}>
          <span className={styles.reviewLabel}>Processing / Delivery</span>
          <span className={styles.reviewValue}>{formData.date}</span>
        </div>
      </div>

      <div className={styles.reviewActions}>
        <button className={styles.backBtn} onClick={onBack}>Back</button>
        <button className={styles.confirmBtn} onClick={onConfirm}>Confirm Payment</button>
      </div>
    </div>
  );
};

const PaymentSuccess = ({ confirmationNumber, formData, payee, fromAccount, onNewPayment }) => {
  return (
    <div className={styles.successPanel}>
      <div className={styles.successIcon}>✓</div>
      <h2 className={styles.successTitle}>Payment Scheduled</h2>
      <p className={styles.successMessage}>
        Your {formatCurrency(parseFloat(formData.amount) || 0)} payment to {payee?.name} has been scheduled.
      </p>
      <div className={styles.successDetails}>
        <div className={styles.successRow}>
          <span className={styles.successLabel}>Payment Date</span>
          <span className={styles.successValue}>{formData.date}</span>
        </div>
        <div className={styles.successRow}>
          <span className={styles.successLabel}>Confirmation Number</span>
          <span className={styles.successValue}>{confirmationNumber}</span>
        </div>
      </div>
      <div className={styles.successActions}>
        <button className={styles.successAction}>View Payment</button>
        <button className={styles.successActionSecondary} onClick={onNewPayment}>Make Another Payment</button>
      </div>
    </div>
  );
};

export default Payments;