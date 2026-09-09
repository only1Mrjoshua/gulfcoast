// src/pages/Cards.jsx
import React, { useState } from 'react';
import {
  mockCards,
  mockCardTransactions,
  mockCardAlerts,
} from '../data/mockCardsData';
import styles from './Cards.module.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Math.abs(amount));
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatExpiration = (expStr) => {
  const [year, month] = expStr.split('-');
  return `${month}/${year.slice(2)}`;
};

const Cards = () => {
  // State
  const [selectedCardId, setSelectedCardId] = useState(mockCards[0]?.id || null);
  const [showDetails, setShowDetails] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showReplacement, setShowReplacement] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentFrom, setPaymentFrom] = useState('chk1');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [replacementReason, setReplacementReason] = useState('Damaged');

  const selectedCard = mockCards.find(c => c.id === selectedCardId);
  const cardTransactions = mockCardTransactions.filter(t => t.cardId === selectedCardId);

  // Card status color mapping
  const getStatusColor = (status) => {
    const map = {
      'Active': styles.statusActive,
      'Temporarily Locked': styles.statusLocked,
      'Locked': styles.statusLocked,
      'Expired': styles.statusExpired,
      'Replacement Pending': styles.statusPending,
      'Suspended': styles.statusSuspended,
    };
    return map[status] || styles.statusActive;
  };

  // Handle lock/unlock
  const toggleLock = (cardId) => {
    // In real app, would call API
    alert(`Toggling lock for card ${cardId}`);
  };

  // Handle card view
  const handleViewDetails = () => {
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
  };

  // Handle payment
  const handleMakePayment = () => {
    setShowPayment(true);
  };

  const closePayment = () => {
    setShowPayment(false);
    setPaymentAmount('');
  };

  const handleSubmitPayment = () => {
    alert(`Payment of ${formatCurrency(parseFloat(paymentAmount) || 0)} submitted`);
    closePayment();
  };

  // Handle replacement
  const handleReplaceCard = () => {
    setShowReplacement(true);
  };

  const closeReplacement = () => {
    setShowReplacement(false);
  };

  const handleSubmitReplacement = () => {
    alert(`Replacement requested for ${selectedCard?.name} - Reason: ${replacementReason}`);
    closeReplacement();
  };

  // Handle alert toggle
  const toggleAlert = (alertId) => {
    // In real app, would call API
    alert(`Toggling alert ${alertId}`);
  };

  return (
    <div className={styles.cardsPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Cards</h1>
          <p className={styles.pageSubtitle}>Manage your debit and credit cards, view activity, and control your card settings.</p>
        </div>
        <button className={styles.primaryAction}>+ Manage Cards</button>
      </div>

      {/* Card Overview */}
      <div className={styles.overviewSection}>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Total Cards</span>
          <span className={styles.overviewValue}>{mockCards.length}</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Active Cards</span>
          <span className={styles.overviewValue}>
            {mockCards.filter(c => c.status === 'Active').length}
          </span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Cards With Alerts</span>
          <span className={styles.overviewValue}>
            {mockCardAlerts.filter(a => a.enabled).length}
          </span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Expiring Soon</span>
          <span className={styles.overviewValue}>0</span>
        </div>
      </div>

      {/* My Cards */}
      <section className={styles.cardsSection}>
        <h2 className={styles.sectionTitle}>My Cards</h2>
        <div className={styles.cardGrid}>
          {mockCards.map(card => (
            <div
              key={card.id}
              className={`${styles.cardItem} ${selectedCardId === card.id ? styles.selected : ''}`}
              onClick={() => setSelectedCardId(card.id)}
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardType}>{card.type}</span>
                <span className={`${styles.cardStatus} ${getStatusColor(card.status)}`}>
                  {card.status}
                </span>
              </div>
              <div className={styles.cardName}>{card.name}</div>
              <div className={styles.cardNumber}>•••• {card.lastFour}</div>
              <div className={styles.cardHolder}>{card.cardholderName}</div>
              <div className={styles.cardExpires}>Expires {formatExpiration(card.expirationDate)}</div>
              {card.type === 'Credit' && (
                <div className={styles.cardBalance}>
                  <span className={styles.cardBalanceLabel}>Balance</span>
                  <span className={styles.cardBalanceAmount}>{formatCurrency(card.balance)}</span>
                </div>
              )}
              <div className={styles.cardLinked}>Linked: {card.linkedAccount}</div>
              <div className={styles.cardActions}>
                <button
                  className={styles.cardActionBtn}
                  onClick={(e) => { e.stopPropagation(); toggleLock(card.id); }}
                >
                  {card.controls.locked ? 'Unlock' : 'Lock'} Card
                </button>
                <button
                  className={styles.cardActionBtn}
                  onClick={(e) => { e.stopPropagation(); handleViewDetails(); }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Selected Card Details */}
      {selectedCard && (
        <section className={styles.detailSection}>
          <h2 className={styles.sectionTitle}>Card Details</h2>
          <div className={styles.detailPanel}>
            <div className={styles.detailHeader}>
              <div className={styles.detailCardInfo}>
                <span className={styles.detailCardName}>{selectedCard.name}</span>
                <span className={styles.detailCardNumber}>•••• {selectedCard.lastFour}</span>
              </div>
              <div className={styles.detailActions}>
                <button className={styles.detailActionBtn} onClick={handleViewDetails}>
                  View Full Details
                </button>
                {selectedCard.type === 'Credit' && (
                  <button className={styles.detailActionBtnPrimary} onClick={handleMakePayment}>
                    Make Payment
                  </button>
                )}
                <button className={styles.detailActionBtn} onClick={handleReplaceCard}>
                  Replace Card
                </button>
              </div>
            </div>

            <div className={styles.detailContent}>
              <div className={styles.detailInfo}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Card Type</span>
                  <span className={styles.detailValue}>{selectedCard.type}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Status</span>
                  <span className={`${styles.detailValue} ${getStatusColor(selectedCard.status)}`}>
                    {selectedCard.status}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Linked Account</span>
                  <span className={styles.detailValue}>{selectedCard.linkedAccount}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Cardholder</span>
                  <span className={styles.detailValue}>{selectedCard.cardholderName}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Expires</span>
                  <span className={styles.detailValue}>{formatExpiration(selectedCard.expirationDate)}</span>
                </div>

                {selectedCard.type === 'Credit' && (
                  <>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Current Balance</span>
                      <span className={styles.detailValue}>{formatCurrency(selectedCard.balance)}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Available Credit</span>
                      <span className={styles.detailValue}>{formatCurrency(selectedCard.availableCredit)}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Credit Limit</span>
                      <span className={styles.detailValue}>{formatCurrency(selectedCard.creditLimit)}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Minimum Payment</span>
                      <span className={styles.detailValue}>{formatCurrency(selectedCard.minimumPayment)}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Payment Due</span>
                      <span className={styles.detailValue}>{formatDate(selectedCard.paymentDueDate)}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Next Statement</span>
                      <span className={styles.detailValue}>{formatDate(selectedCard.nextStatementDate)}</span>
                    </div>
                    <div className={styles.creditUtilization}>
                      <span className={styles.utilLabel}>Credit Utilization</span>
                      <div className={styles.utilBar}>
                        <div
                          className={styles.utilFill}
                          style={{
                            width: `${Math.min((selectedCard.balance / selectedCard.creditLimit) * 100, 100)}%`,
                            background: (selectedCard.balance / selectedCard.creditLimit) > 0.8 ? '#d9534f' : '#008296'
                          }}
                        />
                      </div>
                      <span className={styles.utilPercent}>
                        {Math.round((selectedCard.balance / selectedCard.creditLimit) * 100)}%
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Recent Card Activity */}
              <div className={styles.recentActivity}>
                <h3 className={styles.activityTitle}>Recent Activity</h3>
                <div className={styles.activityList}>
                  {cardTransactions.length === 0 ? (
                    <p className={styles.noActivity}>No recent transactions.</p>
                  ) : (
                    cardTransactions.slice(0, 5).map(tx => (
                      <div key={tx.id} className={styles.activityItem}>
                        <div className={styles.activityLeft}>
                          <span className={styles.activityMerchant}>{tx.merchant}</span>
                          <span className={styles.activityCategory}>{tx.category}</span>
                          {tx.status === 'Pending' && (
                            <span className={styles.activityPending}>Pending</span>
                          )}
                        </div>
                        <div className={styles.activityRight}>
                          <span className={styles.activityDate}>{formatDate(tx.date)}</span>
                          <span className={tx.amount < 0 ? styles.activityNegative : styles.activityPositive}>
                            {tx.amount < 0 ? '-' : '+'}{formatCurrency(tx.amount)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <button className={styles.viewAllBtn}>View All Transactions</button>
              </div>
            </div>

            {/* Card Controls */}
            <div className={styles.controlsSection}>
              <h3 className={styles.controlsTitle}>Card Controls</h3>
              <div className={styles.controlsGrid}>
                <div className={styles.controlItem}>
                  <span className={styles.controlLabel}>Lock Card</span>
                  <span className={styles.controlStatus}>
                    {selectedCard.controls.locked ? 'Locked' : 'Unlocked'}
                  </span>
                  <button
                    className={styles.controlToggle}
                    onClick={() => toggleLock(selectedCard.id)}
                  >
                    {selectedCard.controls.locked ? 'Unlock' : 'Lock'}
                  </button>
                </div>
                <div className={styles.controlItem}>
                  <span className={styles.controlLabel}>Contactless Payments</span>
                  <span className={styles.controlStatus}>
                    {selectedCard.controls.contactless ? 'On' : 'Off'}
                  </span>
                  <button className={styles.controlToggle}>
                    {selectedCard.controls.contactless ? 'Turn Off' : 'Turn On'}
                  </button>
                </div>
                <div className={styles.controlItem}>
                  <span className={styles.controlLabel}>Online Purchases</span>
                  <span className={styles.controlStatus}>
                    {selectedCard.controls.onlinePurchases ? 'On' : 'Off'}
                  </span>
                  <button className={styles.controlToggle}>
                    {selectedCard.controls.onlinePurchases ? 'Turn Off' : 'Turn On'}
                  </button>
                </div>
                <div className={styles.controlItem}>
                  <span className={styles.controlLabel}>International Purchases</span>
                  <span className={styles.controlStatus}>
                    {selectedCard.controls.internationalPurchases ? 'On' : 'Off'}
                  </span>
                  <button className={styles.controlToggle}>
                    {selectedCard.controls.internationalPurchases ? 'Turn Off' : 'Turn On'}
                  </button>
                </div>
                <div className={styles.controlItem}>
                  <span className={styles.controlLabel}>ATM Withdrawals</span>
                  <span className={styles.controlStatus}>
                    {selectedCard.controls.atmWithdrawals ? 'On' : 'Off'}
                  </span>
                  <button className={styles.controlToggle}>
                    {selectedCard.controls.atmWithdrawals ? 'Turn Off' : 'Turn On'}
                  </button>
                </div>
                <div className={styles.controlItem}>
                  <span className={styles.controlLabel}>Card Notifications</span>
                  <span className={styles.controlStatus}>
                    {selectedCard.controls.notifications ? 'On' : 'Off'}
                  </span>
                  <button className={styles.controlToggle}>
                    {selectedCard.controls.notifications ? 'Turn Off' : 'Turn On'}
                  </button>
                </div>
              </div>
            </div>

            {/* Card Statements Link */}
            <div className={styles.statementsLink}>
              <span>View your card statements</span>
              <a href="/statements">Go to Statements</a>
            </div>
          </div>
        </section>
      )}

      {/* Card Alerts */}
      <section className={styles.alertsSection}>
        <h2 className={styles.sectionTitle}>Card Alerts</h2>
        <div className={styles.alertsList}>
          {mockCardAlerts.map(alert => (
            <div key={alert.id} className={styles.alertItem}>
              <span className={styles.alertName}>{alert.name}</span>
              <span className={`${styles.alertStatus} ${alert.enabled ? styles.enabled : styles.disabled}`}>
                {alert.enabled ? 'ON' : 'OFF'}
              </span>
              <button
                className={styles.alertToggle}
                onClick={() => toggleAlert(alert.id)}
              >
                {alert.enabled ? 'Turn Off' : 'Turn On'}
              </button>
            </div>
          ))}
        </div>
      </section>



      {/* Detail Modal */}
      {showDetails && selectedCard && (
        <div className={styles.modalOverlay} onClick={closeDetails}>
          <div className={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeDetails}>×</button>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>Card Details</h2>
              <div className={styles.modalCardPreview}>
                <div className={styles.modalCardType}>{selectedCard.type}</div>
                <div className={styles.modalCardName}>{selectedCard.name}</div>
                <div className={styles.modalCardNumber}>•••• •••• •••• {selectedCard.lastFour}</div>
                <div className={styles.modalCardMeta}>
                  <span>Cardholder: {selectedCard.cardholderName}</span>
                  <span>Expires: {formatExpiration(selectedCard.expirationDate)}</span>
                </div>
                <div className={styles.modalCardStatus}>
                  Status: <span className={getStatusColor(selectedCard.status)}>{selectedCard.status}</span>
                </div>
              </div>
              <div className={styles.modalActions}>
                <button className={styles.modalAction}>Show Full Number</button>
                <button className={styles.modalAction}>View CVV</button>
                <button className={styles.modalActionClose} onClick={closeDetails}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && selectedCard && selectedCard.type === 'Credit' && (
        <div className={styles.modalOverlay} onClick={closePayment}>
          <div className={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closePayment}>×</button>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>Make a Payment</h2>
              <p className={styles.modalSubtitle}>Pay your {selectedCard.name}</p>
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
                    Minimum: {formatCurrency(selectedCard.minimumPayment)} |
                    Statement Balance: {formatCurrency(selectedCard.balance)}
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

      {/* Replacement Modal */}
      {showReplacement && selectedCard && (
        <div className={styles.modalOverlay} onClick={closeReplacement}>
          <div className={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeReplacement}>×</button>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>Replace Card</h2>
              <p className={styles.modalSubtitle}>Request a replacement for {selectedCard.name}</p>
              <div className={styles.replacementForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="replacementReason">Reason for replacement</label>
                  <select
                    id="replacementReason"
                    value={replacementReason}
                    onChange={(e) => setReplacementReason(e.target.value)}
                    className={styles.formSelect}
                  >
                    <option value="Damaged">Damaged</option>
                    <option value="Lost">Lost</option>
                    <option value="Stolen">Stolen</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
                <div className={styles.replacementInfo}>
                  <span className={styles.infoIcon}>ℹ️</span>
                  <span className={styles.infoText}>
                    {replacementReason === 'Stolen' || replacementReason === 'Lost'
                      ? 'Your card will be immediately deactivated. A new card will be issued and sent to your address on file.'
                      : 'A new card will be issued and sent to your address on file. Your current card will remain active until you activate the new card.'
                    }
                  </span>
                </div>
                <div className={styles.paymentActions}>
                  <button className={styles.cancelBtn} onClick={closeReplacement}>Cancel</button>
                  <button className={styles.submitBtn} onClick={handleSubmitReplacement}>
                    Request Replacement
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cards;