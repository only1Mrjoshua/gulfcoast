// src/pages/Deposits.jsx
import React, { useState } from 'react';
import {
  mockDepositAccounts,
  mockRecentDeposits,
  depositLimits,
  depositAvailability,
} from '../data/mockDepositsData';
import styles from './Deposits.module.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const Deposits = () => {
  // State
  const [currentStep, setCurrentStep] = useState('overview'); // 'overview' | 'form' | 'review' | 'success'
  const [selectedAccountId, setSelectedAccountId] = useState('chk1');
  const [amount, setAmount] = useState('');
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [confirmationNumber, setConfirmationNumber] = useState('DEP-482193');

  // Handlers
  const handleStartDeposit = () => {
    setCurrentStep('form');
  };

  const handleAccountChange = (e) => {
    setSelectedAccountId(e.target.value);
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleImageUpload = (side) => (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (side === 'front') setFrontImage(event.target.result);
        else setBackImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCurrentStep('review');
  };

  const handleConfirm = () => {
    setCurrentStep('success');
  };

  const handleNewDeposit = () => {
    setCurrentStep('overview');
    setAmount('');
    setFrontImage(null);
    setBackImage(null);
    setSelectedAccountId('chk1');
  };

  const getAccount = (id) => mockDepositAccounts.find(a => a.id === id);

  // Filter deposits
  const filteredDeposits = mockRecentDeposits.filter(dep => {
    if (filterType === 'all') return true;
    if (filterType === 'mobile') return dep.type === 'Mobile Check Deposit';
    if (filterType === 'direct') return dep.type === 'Direct Deposit';
    if (filterType === 'other') return !['Mobile Check Deposit', 'Direct Deposit'].includes(dep.type);
    return true;
  }).filter(dep => {
    if (!filterDate) return true;
    return dep.date === filterDate;
  });

  // Summary
  const totalDeposited = mockRecentDeposits
    .filter(d => d.status === 'Completed')
    .reduce((sum, d) => sum + d.amount, 0);

  const pendingDeposits = mockRecentDeposits
    .filter(d => d.status === 'Processing' || d.status === 'Pending')
    .reduce((sum, d) => sum + d.amount, 0);

  const availableDeposits = mockRecentDeposits
    .filter(d => d.status === 'Completed' && new Date(d.date) >= new Date(new Date().setDate(new Date().getDate() - 30)))
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className={styles.depositsPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Deposits</h1>
          <p className={styles.pageSubtitle}>Deposit checks and manage your recent deposits securely.</p>
        </div>
        {currentStep === 'overview' && (
          <button className={styles.primaryAction} onClick={handleStartDeposit}>
            + Deposit a Check
          </button>
        )}
      </div>

      {/* Deposit Overview */}
      {currentStep === 'overview' && (
        <>
          <section className={styles.overviewSection}>
            <div className={styles.overviewCard}>
              <span className={styles.overviewLabel}>Deposited This Month</span>
              <span className={styles.overviewValue}>{formatCurrency(totalDeposited)}</span>
            </div>
            <div className={styles.overviewCard}>
              <span className={styles.overviewLabel}>Pending Deposits</span>
              <span className={styles.overviewValue}>{formatCurrency(pendingDeposits)}</span>
            </div>
            <div className={styles.overviewCard}>
              <span className={styles.overviewLabel}>Available Deposits</span>
              <span className={styles.overviewValue}>{formatCurrency(availableDeposits)}</span>
            </div>
          </section>

          {/* Mobile Check Deposit CTA */}
          <section className={styles.mobileDepositSection}>
            <h2 className={styles.sectionTitle}>Deposit a Check</h2>
            <p className={styles.sectionSubtitle}>
              Deposit a check securely using your mobile device.
            </p>
            <div className={styles.depositSteps}>
              <div className={styles.stepItem}>
                <span className={styles.stepNumber}>1</span>
                <span>Endorse your check</span>
              </div>
              <div className={styles.stepItem}>
                <span className={styles.stepNumber}>2</span>
                <span>Capture the front</span>
              </div>
              <div className={styles.stepItem}>
                <span className={styles.stepNumber}>3</span>
                <span>Capture the back</span>
              </div>
              <div className={styles.stepItem}>
                <span className={styles.stepNumber}>4</span>
                <span>Enter the amount</span>
              </div>
              <div className={styles.stepItem}>
                <span className={styles.stepNumber}>5</span>
                <span>Review and submit</span>
              </div>
            </div>
            <button className={styles.startDepositBtn} onClick={handleStartDeposit}>
              Start Deposit
            </button>
            <p className={styles.securityNote}>
              Make sure your check is properly endorsed and placed on a flat, well-lit surface.
            </p>
          </section>

          {/* Recent Deposits */}
          <section className={styles.recentSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recent Deposits</h2>
              <div className={styles.filterGroup}>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All</option>
                  <option value="mobile">Mobile Check</option>
                  <option value="direct">Direct Deposit</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className={styles.filterDate}
                />
                {filterDate && (
                  <button
                    className={styles.clearFilter}
                    onClick={() => setFilterDate('')}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className={styles.depositList}>
              {filteredDeposits.length === 0 ? (
                <p className={styles.noDeposits}>No deposits found.</p>
              ) : (
                filteredDeposits.map((dep) => (
                  <div key={dep.id} className={styles.depositItem}>
                    <div className={styles.depositInfo}>
                      <span className={styles.depositType}>{dep.type}</span>
                      <span className={styles.depositAccount}>{dep.accountName}</span>
                    </div>
                    <div className={styles.depositRight}>
                      <span className={styles.depositDate}>{dep.date}</span>
                      <span className={styles.depositAmount}>+{formatCurrency(dep.amount)}</span>
                      <span className={`${styles.depositStatus} ${styles[dep.status.toLowerCase()]}`}>
                        {dep.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </>
      )}

      {/* Deposit Form */}
      {currentStep === 'form' && (
        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>Deposit a Check</h2>
          <form onSubmit={handleSubmit} className={styles.depositForm}>
            {/* Step 1: Select Account */}
            <div className={styles.formGroup}>
              <label htmlFor="depositAccount">Deposit to</label>
              <select
                id="depositAccount"
                value={selectedAccountId}
                onChange={handleAccountChange}
                className={styles.select}
              >
                {mockDepositAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} •••• {acc.lastFour} (Available: {formatCurrency(acc.available)})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Enter Amount */}
            <div className={styles.formGroup}>
              <label htmlFor="depositAmount">Check Amount</label>
              <div className={styles.amountInput}>
                <span className={styles.currencySymbol}>$</span>
                <input
                  type="number"
                  id="depositAmount"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  required
                  className={styles.amountField}
                />
              </div>
              <div className={styles.helperText}>Enter the exact amount written on the check.</div>
            </div>

            {/* Step 3: Check Images */}
            <div className={styles.formGroup}>
              <label>Check Images</label>
              <div className={styles.imageUploads}>
                <div className={styles.imageUpload}>
                  <p className={styles.uploadLabel}>Front of Check</p>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload('front')}
                    className={styles.fileInput}
                  />
                  {frontImage && <img src={frontImage} alt="Front of check" className={styles.uploadPreview} />}
                  {!frontImage && <div className={styles.uploadPlaceholder}>Upload / Capture</div>}
                </div>
                <div className={styles.imageUpload}>
                  <p className={styles.uploadLabel}>Back of Check</p>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload('back')}
                    className={styles.fileInput}
                  />
                  {backImage && <img src={backImage} alt="Back of check" className={styles.uploadPreview} />}
                  {!backImage && <div className={styles.uploadPlaceholder}>Upload / Capture</div>}
                </div>
              </div>
              <div className={styles.helperText}>Ensure the entire check is visible and readable.</div>
            </div>

            {/* Review & Submit */}
            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setCurrentStep('overview')}
              >
                Cancel
              </button>
              <button type="submit" className={styles.submitBtn}>
                Review Deposit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Review Step */}
      {currentStep === 'review' && (
        <div className={styles.reviewPanel}>
          <h2 className={styles.reviewTitle}>Review Deposit</h2>
          <div className={styles.reviewDetails}>
            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>Deposit To</span>
              <span className={styles.reviewValue}>
                {getAccount(selectedAccountId)?.name} •••• {getAccount(selectedAccountId)?.lastFour}
              </span>
            </div>
            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>Amount</span>
              <span className={styles.reviewValue}>{formatCurrency(parseFloat(amount) || 0)}</span>
            </div>
            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>Images</span>
              <span className={styles.reviewValue}>
                Front: {frontImage ? '✓' : '✗'}, Back: {backImage ? '✓' : '✗'}
              </span>
            </div>
            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>Estimated Availability</span>
              <span className={styles.reviewValue}>See deposit availability</span>
            </div>
          </div>
          <div className={styles.reviewActions}>
            <button
              className={styles.backBtn}
              onClick={() => setCurrentStep('form')}
            >
              Back
            </button>
            <button className={styles.confirmBtn} onClick={handleConfirm}>
              Submit Deposit
            </button>
          </div>
        </div>
      )}

      {/* Success Step */}
      {currentStep === 'success' && (
        <div className={styles.successPanel}>
          <div className={styles.successIcon}>✓</div>
          <h2 className={styles.successTitle}>Deposit Submitted</h2>
          <p className={styles.successMessage}>
            Your check deposit has been submitted successfully.
          </p>
          <div className={styles.successDetails}>
            <div className={styles.successRow}>
              <span className={styles.successLabel}>Amount</span>
              <span className={styles.successValue}>{formatCurrency(parseFloat(amount) || 0)}</span>
            </div>
            <div className={styles.successRow}>
              <span className={styles.successLabel}>Account</span>
              <span className={styles.successValue}>
                {getAccount(selectedAccountId)?.name} •••• {getAccount(selectedAccountId)?.lastFour}
              </span>
            </div>
            <div className={styles.successRow}>
              <span className={styles.successLabel}>Submitted</span>
              <span className={styles.successValue}>{new Date().toLocaleDateString()}</span>
            </div>
            <div className={styles.successRow}>
              <span className={styles.successLabel}>Status</span>
              <span className={styles.successValue}>Processing</span>
            </div>
            <div className={styles.successRow}>
              <span className={styles.successLabel}>Confirmation Number</span>
              <span className={styles.successValue}>{confirmationNumber}</span>
            </div>
          </div>
          <div className={styles.successActions}>
            <button className={styles.successAction}>View Deposit</button>
            <button className={styles.successActionSecondary} onClick={handleNewDeposit}>
              Make Another Deposit
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Deposits;