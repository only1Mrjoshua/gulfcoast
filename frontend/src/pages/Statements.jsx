// src/pages/Statements.jsx
import React, { useState, useMemo } from 'react';
import {
  mockStatementAccounts,
  mockStatements,
  mockTaxDocuments,
  mockPaperlessStatus,
} from '../data/mockStatementsData';
import styles from './Statements.module.css';

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

const Statements = () => {
  // State
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [statementType, setStatementType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatement, setSelectedStatement] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [expandedYears, setExpandedYears] = useState({});
  const [paperlessEnrolled, setPaperlessEnrolled] = useState(mockPaperlessStatus.enrolled);
  const [emailNotifications, setEmailNotifications] = useState(mockPaperlessStatus.emailNotifications);
  const [statementNotifications, setStatementNotifications] = useState(mockPaperlessStatus.statementNotifications);

  // Get available years from statements
  const availableYears = useMemo(() => {
    const years = new Set(mockStatements.map(s => s.year));
    return ['all', ...Array.from(years).sort((a, b) => b - a)];
  }, []);

  // Filter statements
  const filteredStatements = useMemo(() => {
    let filtered = mockStatements;

    // Account filter
    if (selectedAccount !== 'all') {
      filtered = filtered.filter(s => s.accountId === selectedAccount);
    }

    // Year filter
    if (selectedYear !== 'all') {
      filtered = filtered.filter(s => s.year === parseInt(selectedYear));
    }

    // Type filter
    if (statementType !== 'all') {
      filtered = filtered.filter(s => s.type === statementType);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(s =>
        s.month.toLowerCase().includes(q) ||
        s.accountName.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q)
      );
    }

    return filtered.sort((a, b) => new Date(b.statementDate) - new Date(a.statementDate));
  }, [selectedAccount, selectedYear, statementType, searchQuery]);

  // Group by year
  const groupedByYear = useMemo(() => {
    const groups = {};
    filteredStatements.forEach(s => {
      if (!groups[s.year]) groups[s.year] = [];
      groups[s.year].push(s);
    });
    // Sort years descending
    const sortedYears = Object.keys(groups).sort((a, b) => parseInt(b) - parseInt(a));
    return sortedYears.map(year => ({
      year: parseInt(year),
      statements: groups[year],
    }));
  }, [filteredStatements]);

  // Toggle year expansion
  const toggleYear = (year) => {
    setExpandedYears(prev => ({
      ...prev,
      [year]: !prev[year],
    }));
  };

  // Handle view statement
  const handleView = (statement) => {
    setSelectedStatement(statement);
    setViewModalOpen(true);
  };

  const closeModal = () => {
    setViewModalOpen(false);
    setSelectedStatement(null);
  };

  // Handle download
  const handleDownload = (statement) => {
    // Simulate download
    alert(`Downloading ${statement.month} statement for ${statement.accountName} (${statement.fileType})`);
    // In real app: trigger file download
  };

  // Handle paperless toggle
  const togglePaperless = () => {
    setPaperlessEnrolled(!paperlessEnrolled);
  };

  // Calculate summary
  const totalStatements = filteredStatements.length;
  const latestStatement = filteredStatements.length > 0 ? filteredStatements[0] : null;
  const accountsWithStatements = new Set(filteredStatements.map(s => s.accountId)).size;

  return (
    <div className={styles.statementsPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Statements</h1>
          <p className={styles.pageSubtitle}>View, download, and manage your account statements and important financial documents.</p>
        </div>
        <button className={styles.primaryAction}>Download Statement</button>
      </div>

      {/* Statement Overview */}
      <div className={styles.overviewSection}>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Available Statements</span>
          <span className={styles.overviewValue}>{totalStatements}</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Latest Statement</span>
          <span className={styles.overviewValue}>
            {latestStatement ? latestStatement.month : 'N/A'}
          </span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Accounts With Statements</span>
          <span className={styles.overviewValue}>{accountsWithStatements}</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Documents Available</span>
          <span className={styles.overviewValue}>{mockTaxDocuments.length}</span>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersBar}>
        <div className={styles.filterGroup}>
          <label htmlFor="accountSelect">Account</label>
          <select
            id="accountSelect"
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className={styles.filterSelect}
          >
            {mockStatementAccounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="yearSelect">Year</label>
          <select
            id="yearSelect"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className={styles.filterSelect}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year === 'all' ? 'All Years' : year}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="typeSelect">Statement Type</label>
          <select
            id="typeSelect"
            value={statementType}
            onChange={(e) => setStatementType(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Types</option>
            <option value="Monthly Statement">Monthly Statement</option>
            <option value="Credit Card Statement">Credit Card Statement</option>
            <option value="Loan Statement">Loan Statement</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="searchInput">Search</label>
          <input
            type="text"
            id="searchInput"
            placeholder="Search statements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.filterInput}
          />
        </div>
      </div>

      {/* Statement List */}
      <div className={styles.statementListContainer}>
        {groupedByYear.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No statements available</p>
            <p className={styles.emptySub}>Statements for this account will appear here when they become available.</p>
            <button className={styles.emptyAction}>View Accounts</button>
          </div>
        ) : (
          groupedByYear.map(({ year, statements }) => (
            <div key={year} className={styles.yearGroup}>
              <button
                className={styles.yearHeader}
                onClick={() => toggleYear(year)}
              >
                <span className={styles.yearTitle}>{year}</span>
                <span className={styles.yearCount}>{statements.length} statements</span>
                <span className={styles.yearToggle}>
                  {expandedYears[year] ? '▾' : '▸'}
                </span>
              </button>
              {expandedYears[year] !== false && (
                <div className={styles.statementTable}>
                  <div className={styles.tableHeader}>
                    <span>Statement Date</span>
                    <span>Account</span>
                    <span>Period</span>
                    <span>Type</span>
                    <span>Available</span>
                    <span className={styles.actionsHeader}>Actions</span>
                  </div>
                  {statements.map(statement => (
                    <div key={statement.id} className={styles.tableRow}>
                      <span className={styles.rowDate}>{statement.month}</span>
                      <span className={styles.rowAccount}>{statement.accountName}</span>
                      <span className={styles.rowPeriod}>
                        {formatDate(statement.periodStart)} – {formatDate(statement.periodEnd)}
                      </span>
                      <span className={styles.rowType}>{statement.type}</span>
                      <span className={styles.rowAvailable}>{formatDate(statement.availableDate)}</span>
                      <span className={styles.rowActions}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => handleView(statement)}
                          aria-label="View"
                        >
                          View
                        </button>
                        <button
                          className={styles.actionBtn}
                          onClick={() => handleDownload(statement)}
                          aria-label="Download"
                        >
                          Download
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>


      {/* Statement View Modal */}
      {viewModalOpen && selectedStatement && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeModal}>×</button>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>{selectedStatement.month} Statement</h2>
                <p className={styles.modalSubtitle}>{selectedStatement.accountName}</p>
              </div>
              <div className={styles.modalDetails}>
                <div className={styles.modalRow}>
                  <span className={styles.modalLabel}>Account</span>
                  <span className={styles.modalValue}>{selectedStatement.accountName}</span>
                </div>
                <div className={styles.modalRow}>
                  <span className={styles.modalLabel}>Statement Period</span>
                  <span className={styles.modalValue}>
                    {formatDateLong(selectedStatement.periodStart)} – {formatDateLong(selectedStatement.periodEnd)}
                  </span>
                </div>
                <div className={styles.modalRow}>
                  <span className={styles.modalLabel}>Type</span>
                  <span className={styles.modalValue}>{selectedStatement.type}</span>
                </div>
                <div className={styles.modalRow}>
                  <span className={styles.modalLabel}>Available Since</span>
                  <span className={styles.modalValue}>{formatDateLong(selectedStatement.availableDate)}</span>
                </div>
                <div className={styles.modalRow}>
                  <span className={styles.modalLabel}>File Type</span>
                  <span className={styles.modalValue}>{selectedStatement.fileType}</span>
                </div>
                <div className={styles.modalRow}>
                  <span className={styles.modalLabel}>Size</span>
                  <span className={styles.modalValue}>{selectedStatement.size}</span>
                </div>
              </div>
              <div className={styles.modalActions}>
                <button className={styles.modalAction}>Download</button>
                <button className={styles.modalAction}>Print</button>
                <button className={styles.modalActionClose} onClick={closeModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statements;