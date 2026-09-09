// src/pages/Loans.jsx
import React, { useState } from 'react';
import {
  mockLoans,
  mockLoanPayments,
  mockLoanDocuments,
  mockLoanAlerts,
  exploreLoanOptions,
} from '../data/mockLoansData';
import styles from './Loans.module.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

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
  });
};

const Loans = () => {
  // State
  const [selectedLoanId, setSelectedLoanId] = useState(mockLoans[0]?.id || null);
  const [showPayment, setShowPayment] = useState(false);
  const [showPayoff, setShowPayoff] = useState(false);
  const [showAutopay, setShowAutopay] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [additionalPrincipal, setAdditionalPrincipal] = useState('');
  const [paymentFrom, setPaymentFrom] = useState('chk1');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  const selectedLoan = mockLoans.find(l => l.id === selectedLoanId);
  const loanPayments = mockLoanPayments.filter(p => p.loanId === selectedLoanId);
  const loanDocuments = mockLoanDocuments.filter(d => d.loanId === selectedLoanId);

  // Calculate total loan balance
  const totalBalance = mockLoans.reduce((sum, loan) => sum + loan.currentBalance, 0);
  const nextPayment = mockLoans
    .filter(l => l.status === 'Active')
    .sort((a, b) => new Date(a.nextPaymentDate) - new Date(b.nextPaymentDate))[0];

  // Handle payment submission
  const handleMakePayment = () => {
    setShowPayment(true);
  };

  const closePayment = () => {
    setShowPayment(false);
    setPaymentAmount('');
    setAdditionalPrincipal('');
  };

  const handleSubmitPayment = () => {
    const total = parseFloat(paymentAmount) + parseFloat(additionalPrincipal || 0);
    alert(`Payment of ${formatCurrency(total)} submitted for ${selectedLoan?.name}`);
    closePayment();
  };

  // Handle autopay
  const handleManageAutopay = () => {
    setShowAutopay(true);
  };

  const closeAutopay = () => {
    setShowAutopay(false);
  };

  const toggleAutopay = () => {
    alert(`Autopay ${selectedLoan?.autopayEnabled ? 'disabled' : 'enabled'} for ${selectedLoan?.name}`);
    closeAutopay();
  };

  // Handle payoff
  const handlePayoff = () => {
    setShowPayoff(true);
  };

  const closePayoff = () => {
    setShowPayoff(false);
  };

  // Handle document view/download
  const handleDocumentAction = (doc, action) => {
    alert(`${action} ${doc.name}`);
  };

  // Handle alert toggle
  const toggleAlert = (alertId) => {
    alert(`Toggling alert ${alertId}`);
  };

  // Calculate repayment progress
  const getRepaymentProgress = (loan) => {
    const paid = loan.amountPaidToDate;
    const total = loan.originalAmount;
    return Math.min((paid / total) * 100, 100);
  };

  return (
    <div className={styles.loansPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Loans</h1>
          <p className={styles.pageSubtitle}>
            Manage your loans, view payment details, and stay on top of your repayment schedule.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.primaryAction} onClick={handleMakePayment}>
            Make a Payment
          </button>
          <button className={styles.secondaryAction}>Explore Loan Options</button>
        </div>
      </div>

      {/* Loan Overview */}
      <div className={styles.overviewSection}>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Total Loan Balance</span>
          <span className={styles.overviewValue}>{formatCurrency(totalBalance)}</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Next Payment</span>
          <span className={styles.overviewValue}>
            {nextPayment ? formatCurrency(nextPayment.monthlyPayment) : 'N/A'}
          </span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Due</span>
          <span className={styles.overviewValue}>
            {nextPayment ? formatDate(nextPayment.nextPaymentDate) : 'N/A'}
          </span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Active Loans</span>
          <span className={styles.overviewValue}>
            {mockLoans.filter(l => l.status === 'Active').length}
          </span>
        </div>
      </div>

      {/* My Loans */}
      <section className={styles.loansSection}>
        <h2 className={styles.sectionTitle}>My Loans</h2>
        <div className={styles.loansGrid}>
          {mockLoans.map(loan => (
            <div
              key={loan.id}
              className={`${styles.loanCard} ${selectedLoanId === loan.id ? styles.selected : ''}`}
              onClick={() => setSelectedLoanId(loan.id)}
            >
              <div className={styles.loanHeader}>
                <span className={styles.loanType}>{loan.type}</span>
                <span className={styles.loanStatus}>{loan.status}</span>
              </div>
              <div className={styles.loanName}>{loan.name}</div>
              <div className={styles.loanNumber}>•••• {loan.loanNumber}</div>
              <div className={styles.loanBalance}>
                <span className={styles.balanceLabel}>Current Balance</span>
                <span className={styles.balanceAmount}>{formatCurrency(loan.currentBalance)}</span>
              </div>
              <div className={styles.loanDetails}>
                <span className={styles.detailItem}>
                  <span className={styles.detailLabel}>Monthly Payment</span>
                  <span className={styles.detailValue}>{formatCurrency(loan.monthlyPayment)}</span>
                </span>
                <span className={styles.detailItem}>
                  <span className={styles.detailLabel}>Next Payment</span>
                  <span className={styles.detailValue}>{formatDate(loan.nextPaymentDate)}</span>
                </span>
                <span className={styles.detailItem}>
                  <span className={styles.detailLabel}>Interest Rate</span>
                  <span className={styles.detailValue}>{loan.interestRate}%</span>
                </span>
              </div>
              <button className={styles.viewDetailsBtn}>View Loan Details</button>
            </div>
          ))}
        </div>
      </section>

      {/* Selected Loan Details */}
      {selectedLoan && (
        <section className={styles.detailSection}>
          <h2 className={styles.sectionTitle}>Loan Details</h2>
          <div className={styles.detailPanel}>
            <div className={styles.detailHeader}>
              <div className={styles.detailLoanInfo}>
                <span className={styles.detailLoanName}>{selectedLoan.name}</span>
                <span className={styles.detailLoanType}>{selectedLoan.type}</span>
                <span className={styles.detailLoanNumber}>Loan #•••• {selectedLoan.loanNumber}</span>
              </div>
              <div className={styles.detailActions}>
                <button className={styles.detailActionBtn} onClick={handleMakePayment}>
                  Make Payment
                </button>
                <button className={styles.detailActionBtn} onClick={handleManageAutopay}>
                  Manage Autopay
                </button>
                <button className={styles.detailActionBtn} onClick={handlePayoff}>
                  Payoff Information
                </button>
              </div>
            </div>

            <div className={styles.detailContent}>
              <div className={styles.detailInfo}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Original Amount</span>
                  <span className={styles.detailValue}>{formatCurrency(selectedLoan.originalAmount)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Current Balance</span>
                  <span className={styles.detailValue}>{formatCurrency(selectedLoan.currentBalance)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Interest Rate</span>
                  <span className={styles.detailValue}>{selectedLoan.interestRate}%</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Monthly Payment</span>
                  <span className={styles.detailValue}>{formatCurrency(selectedLoan.monthlyPayment)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Next Payment Due</span>
                  <span className={styles.detailValue}>{formatDateLong(selectedLoan.nextPaymentDate)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Maturity Date</span>
                  <span className={styles.detailValue}>{formatDateLong(selectedLoan.maturityDate)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Amount Paid</span>
                  <span className={styles.detailValue}>{formatCurrency(selectedLoan.amountPaidToDate)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Payment Method</span>
                  <span className={styles.detailValue}>{selectedLoan.paymentMethod}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Status</span>
                  <span className={`${styles.detailValue} ${styles.statusActive}`}>
                    {selectedLoan.status}
                  </span>
                </div>

                {/* Repayment Progress */}
                <div className={styles.progressSection}>
                  <span className={styles.progressLabel}>Repayment Progress</span>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${getRepaymentProgress(selectedLoan)}%` }}
                    />
                  </div>
                  <span className={styles.progressPercent}>
                    {Math.round(getRepaymentProgress(selectedLoan))}%
                  </span>
                </div>
              </div>

              {/* Payment History */}
              <div className={styles.paymentHistory}>
                <h3 className={styles.historyTitle}>Payment History</h3>
                <div className={styles.historyList}>
                  {loanPayments.length === 0 ? (
                    <p className={styles.noHistory}>No payment history available.</p>
                  ) : (
                    loanPayments.slice(0, 5).map(payment => (
                      <div key={payment.id} className={styles.historyItem}>
                        <div className={styles.historyLeft}>
                          <span className={styles.historyDate}>{formatDate(payment.date)}</span>
                          <span className={styles.historyAmount}>-{formatCurrency(payment.amount)}</span>
                        </div>
                        <div className={styles.historyRight}>
                          <span className={styles.historyDetail}>
                            Principal: {formatCurrency(payment.principal)}
                          </span>
                          <span className={styles.historyDetail}>
                            Interest: {formatCurrency(payment.interest)}
                          </span>
                          <span className={styles.historyStatus}>{payment.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {loanPayments.length > 5 && (
                  <button className={styles.viewAllBtn}>View Payment History</button>
                )}
              </div>
            </div>

            {/* Loan Documents */}
            <div className={styles.documentsSection}>
              <h3 className={styles.documentsTitle}>Loan Documents</h3>
              <div className={styles.documentsList}>
                {loanDocuments.length === 0 ? (
                  <p className={styles.noDocuments}>No documents available.</p>
                ) : (
                  loanDocuments.map(doc => (
                    <div key={doc.id} className={styles.documentItem}>
                      <span className={styles.docName}>{doc.name}</span>
                      <span className={styles.docDate}>{formatDate(doc.date)}</span>
                      <span className={styles.docType}>{doc.type}</span>
                      <span className={styles.docSize}>{doc.size}</span>
                      <div className={styles.docActions}>
                        <button
                          className={styles.docActionBtn}
                          onClick={() => handleDocumentAction(doc, 'View')}
                        >
                          View
                        </button>
                        <button
                          className={styles.docActionBtn}
                          onClick={() => handleDocumentAction(doc, 'Download')}
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Loan Alerts */}
      <section className={styles.alertsSection}>
        <h2 className={styles.sectionTitle}>Loan Alerts</h2>
        <div className={styles.alertsList}>
          {mockLoanAlerts.map(alert => (
            <div key={alert.id} className={styles.alertItem}>
              <span className={styles.alertName}>{alert.type}</span>
              <span className={`${styles.alertStatus} ${alert.active ? styles.enabled : styles.disabled}`}>
                {alert.active ? 'ON' : 'OFF'}
              </span>
              <button
                className={styles.alertToggle}
                onClick={() => toggleAlert(alert.id)}
              >
                {alert.active ? 'Turn Off' : 'Turn On'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Explore Loan Options */}
      <section className={styles.exploreSection}>
        <h2 className={styles.sectionTitle}>Explore Loan Options</h2>
        <div className={styles.exploreGrid}>
          {exploreLoanOptions.map(option => (
            <div key={option.id} className={styles.exploreCard}>
              <span className={styles.exploreIcon}>{option.icon}</span>
              <span className={styles.exploreName}>{option.name}</span>
              <span className={styles.exploreDesc}>{option.description}</span>
              <button className={styles.exploreBtn}>Learn More</button>
            </div>
          ))}
        </div>
      </section>


      {/* Payment Modal */}
      {showPayment && selectedLoan && (
        <div className={styles.modalOverlay} onClick={closePayment}>
          <div className={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closePayment}>×</button>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>Make a Payment</h2>
              <p className={styles.modalSubtitle}>Pay your {selectedLoan.name}</p>
              <div className={styles.paymentForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="paymentFrom">Pay From</label>
                  <select
                    id="paymentFrom"
                    value={paymentFrom}
                    onChange={(e) => setPaymentFrom(e.target.value)}
                    className={styles.formSelect}
                  >
                    <option value="chk1">Checking •••• 4821</option>
                    <option value="sav1">Savings •••• 9134</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="paymentAmount">Payment Amount</label>
                  <div className={styles.amountInput}>
                    <span className={styles.currencySymbol}>$</span>
                    <input
                      type="number"
                      id="paymentAmount"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      className={styles.amountField}
                    />
                  </div>
                  <div className={styles.helperText}>
                    Minimum: {formatCurrency(selectedLoan.monthlyPayment)}
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="additionalPrincipal">Additional Principal (optional)</label>
                  <div className={styles.amountInput}>
                    <span className={styles.currencySymbol}>$</span>
                    <input
                      type="number"
                      id="additionalPrincipal"
                      value={additionalPrincipal}
                      onChange={(e) => setAdditionalPrincipal(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={styles.amountField}
                    />
                  </div>
                  <div className={styles.helperText}>
                    Additional principal reduces your loan balance faster.
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="paymentDate">Payment Date</label>
                  <input
                    type="date"
                    id="paymentDate"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.paymentActions}>
                  <button className={styles.cancelBtn} onClick={closePayment}>Cancel</button>
                  <button className={styles.submitBtn} onClick={handleSubmitPayment}>
                    Review Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Autopay Modal */}
      {showAutopay && selectedLoan && (
        <div className={styles.modalOverlay} onClick={closeAutopay}>
          <div className={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeAutopay}>×</button>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>Manage Autopay</h2>
              <p className={styles.modalSubtitle}>Automatic payments for {selectedLoan.name}</p>
              <div className={styles.autopayInfo}>
                <div className={styles.autopayRow}>
                  <span className={styles.autopayLabel}>Current Status</span>
                  <span className={selectedLoan.autopayEnabled ? styles.statusOn : styles.statusOff}>
                    {selectedLoan.autopayEnabled ? 'Enabled ✓' : 'Disabled'}
                  </span>
                </div>
                {selectedLoan.autopayEnabled && (
                  <>
                    <div className={styles.autopayRow}>
                      <span className={styles.autopayLabel}>Payment Account</span>
                      <span className={styles.autopayValue}>{selectedLoan.autopayAccount}</span>
                    </div>
                    <div className={styles.autopayRow}>
                      <span className={styles.autopayLabel}>Payment Amount</span>
                      <span className={styles.autopayValue}>{formatCurrency(selectedLoan.monthlyPayment)}</span>
                    </div>
                    <div className={styles.autopayRow}>
                      <span className={styles.autopayLabel}>Next Payment</span>
                      <span className={styles.autopayValue}>{formatDateLong(selectedLoan.nextPaymentDate)}</span>
                    </div>
                  </>
                )}
                <div className={styles.autopayActions}>
                  <button className={styles.cancelBtn} onClick={closeAutopay}>Cancel</button>
                  <button className={styles.submitBtn} onClick={toggleAutopay}>
                    {selectedLoan.autopayEnabled ? 'Disable Autopay' : 'Enable Autopay'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payoff Modal */}
      {showPayoff && selectedLoan && (
        <div className={styles.modalOverlay} onClick={closePayoff}>
          <div className={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closePayoff}>×</button>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>Payoff Information</h2>
              <p className={styles.modalSubtitle}>Payoff details for {selectedLoan.name}</p>
              <div className={styles.payoffInfo}>
                <div className={styles.payoffRow}>
                  <span className={styles.payoffLabel}>Current Balance</span>
                  <span className={styles.payoffValue}>{formatCurrency(selectedLoan.currentBalance)}</span>
                </div>
                <div className={styles.payoffRow}>
                  <span className={styles.payoffLabel}>Estimated Payoff Amount</span>
                  <span className={styles.payoffValue}>
                    {formatCurrency(selectedLoan.currentBalance * 1.0025)}
                  </span>
                </div>
                <div className={styles.payoffRow}>
                  <span className={styles.payoffLabel}>Payoff Date</span>
                  <span className={styles.payoffValue}>
                    {formatDateLong(new Date().toISOString().split('T')[0])}
                  </span>
                </div>
                <div className={styles.payoffNote}>
                  <span className={styles.noteIcon}>ℹ️</span>
                  <span className={styles.noteText}>
                    The estimated payoff amount includes accrued interest. Actual payoff amount may vary.
                    A formal payoff quote can be requested for accurate figures.
                  </span>
                </div>
                <div className={styles.payoffActions}>
                  <button className={styles.cancelBtn} onClick={closePayoff}>Close</button>
                  <button className={styles.submitBtn}>Request Payoff Quote</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loans;