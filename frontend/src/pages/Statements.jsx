// src/pages/Statements.jsx
import React, { useState, useMemo } from 'react';
import {
  Download,
  Search,
  ChevronRight,
  ChevronDown,
  X,
  Eye,
  Printer,
  FileText,
  Calendar,
  FolderOpen,
  AlertCircle,
  Building2,
  Hash,
  Clock,
  Layers,
  HardDrive,
} from 'lucide-react';
import {
  mockStatementAccounts,
  mockStatements,
  mockTaxDocuments,
  mockPaperlessStatus,
} from '../data/mockStatementsData';

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

  // Note: paperless state kept for parity with original data — not rendered
  const [paperlessEnrolled] = useState(mockPaperlessStatus.enrolled);
  const [emailNotifications] = useState(mockPaperlessStatus.emailNotifications);
  const [statementNotifications] = useState(mockPaperlessStatus.statementNotifications);

  // Get available years from statements
  const availableYears = useMemo(() => {
    const years = new Set(mockStatements.map((s) => s.year));
    return ['all', ...Array.from(years).sort((a, b) => b - a)];
  }, []);

  // Filter statements
  const filteredStatements = useMemo(() => {
    let filtered = mockStatements;

    if (selectedAccount !== 'all') {
      filtered = filtered.filter((s) => s.accountId === selectedAccount);
    }

    if (selectedYear !== 'all') {
      filtered = filtered.filter((s) => s.year === parseInt(selectedYear));
    }

    if (statementType !== 'all') {
      filtered = filtered.filter((s) => s.type === statementType);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (s) =>
          s.month.toLowerCase().includes(q) ||
          s.accountName.toLowerCase().includes(q) ||
          s.type.toLowerCase().includes(q)
      );
    }

    return filtered.sort(
      (a, b) => new Date(b.statementDate) - new Date(a.statementDate)
    );
  }, [selectedAccount, selectedYear, statementType, searchQuery]);

  // Group by year
  const groupedByYear = useMemo(() => {
    const groups = {};
    filteredStatements.forEach((s) => {
      if (!groups[s.year]) groups[s.year] = [];
      groups[s.year].push(s);
    });
    const sortedYears = Object.keys(groups).sort((a, b) => parseInt(b) - parseInt(a));
    return sortedYears.map((year) => ({
      year: parseInt(year),
      statements: groups[year],
    }));
  }, [filteredStatements]);

  // Toggle year expansion — note: undefined = expanded (preserves original behavior)
  const toggleYear = (year) => {
    setExpandedYears((prev) => ({
      ...prev,
      [year]: !prev[year],
    }));
  };

  const handleView = (statement) => {
    setSelectedStatement(statement);
    setViewModalOpen(true);
  };

  const closeModal = () => {
    setViewModalOpen(false);
    setSelectedStatement(null);
  };

  const handleDownload = (statement) => {
    alert(
      `Downloading ${statement.month} statement for ${statement.accountName} (${statement.fileType})`
    );
  };

  // Summary
  const totalStatements = filteredStatements.length;
  const latestStatement = filteredStatements.length > 0 ? filteredStatements[0] : null;
  const accountsWithStatements = new Set(
    filteredStatements.map((s) => s.accountId)
  ).size;

  const overviewCards = [
    {
      label: 'Available Statements',
      value: totalStatements,
      icon: FileText,
    },
    {
      label: 'Latest Statement',
      value: latestStatement ? latestStatement.month : 'N/A',
      icon: Calendar,
    },
    {
      label: 'Accounts With Statements',
      value: accountsWithStatements,
      icon: Building2,
    },
    {
      label: 'Documents Available',
      value: mockTaxDocuments.length,
      icon: FolderOpen,
    },
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 border-b border-hairline pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">
            Statements
          </h1>
          <p className="mt-1 text-sm text-body sm:text-base">
            View, download, and manage your account statements and important financial
            documents.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex min-h-[44px] items-center justify-center gap-2 bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <Download className="h-4 w-4" strokeWidth={2.25} />
          Download Statement
        </button>
      </div>

      {/* Statement Overview */}
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
      <div className="mb-6 flex flex-col gap-3 border border-hairline bg-faint p-4 sm:p-5 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="flex flex-col gap-1.5 lg:min-w-[180px]">
          <label
            htmlFor="accountSelect"
            className="text-xs font-semibold text-deep-accent"
          >
            Account
          </label>
          <select
            id="accountSelect"
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
          >
            {mockStatementAccounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 lg:min-w-[140px]">
          <label
            htmlFor="yearSelect"
            className="text-xs font-semibold text-deep-accent"
          >
            Year
          </label>
          <select
            id="yearSelect"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year === 'all' ? 'All Years' : year}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 lg:min-w-[200px]">
          <label
            htmlFor="typeSelect"
            className="text-xs font-semibold text-deep-accent"
          >
            Statement Type
          </label>
          <select
            id="typeSelect"
            value={statementType}
            onChange={(e) => setStatementType(e.target.value)}
            className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="Monthly Statement">Monthly Statement</option>
            <option value="Credit Card Statement">Credit Card Statement</option>
            <option value="Loan Statement">Loan Statement</option>
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
              placeholder="Search statements..."
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

      {/* Statement List */}
      <div className="mb-6">
        {groupedByYear.length === 0 ? (
          <div className="border border-hairline bg-faint py-12 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-muted" strokeWidth={1.5} />
            <p className="mt-3 text-sm font-semibold text-deep-accent">
              No statements available
            </p>
            <p className="mx-auto mt-1 max-w-md text-xs text-muted">
              Statements for this account will appear here when they become available.
            </p>
            <button
              type="button"
              className="mt-5 inline-flex min-h-[40px] items-center gap-1.5 bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <Building2 className="h-3.5 w-3.5" strokeWidth={2.25} />
              View Accounts
            </button>
          </div>
        ) : (
          groupedByYear.map(({ year, statements }) => {
            // undefined === expanded (preserves original behavior)
            const isExpanded = expandedYears[year] !== false;
            return (
              <div key={year} className="mb-3 border-b border-hairline">
                <button
                  type="button"
                  onClick={() => toggleYear(year)}
                  aria-expanded={isExpanded}
                  className="flex w-full items-center gap-3 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <span className="text-muted">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" strokeWidth={2.25} />
                    ) : (
                      <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
                    )}
                  </span>
                  <span className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
                    {year}
                  </span>
                  <span className="text-xs text-muted sm:text-sm">
                    {statements.length}{' '}
                    {statements.length === 1 ? 'statement' : 'statements'}
                  </span>
                </button>

                {isExpanded && (
                  <div className="mb-3">
                    {/* Desktop / tablet table */}
                    <div className="hidden sm:block">
                      {/* Table header */}
                      <div className="grid grid-cols-[1.2fr_1.5fr_2fr_1.2fr_1.2fr_1fr] gap-3 border-y border-hairline bg-faint px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-deep-accent lg:grid-cols-[1.2fr_1.5fr_2fr_1.2fr_1.2fr_1fr] md:grid-cols-[1.2fr_1.5fr_1.5fr_1fr]">
                        <span>Statement</span>
                        <span>Account</span>
                        <span className="hidden lg:block">Period</span>
                        <span className="hidden lg:block">Type</span>
                        <span className="hidden lg:block">Available</span>
                        <span className="text-right">Actions</span>
                      </div>

                      {statements.map((statement) => (
                        <div
                          key={statement.id}
                          className="grid grid-cols-[1.2fr_1.5fr_1.5fr_1fr] items-center gap-3 border-b border-faint px-3 py-3 text-sm lg:grid-cols-[1.2fr_1.5fr_2fr_1.2fr_1.2fr_1fr]"
                        >
                          <span className="font-semibold text-deep-accent">
                            {statement.month}
                          </span>
                          <span className="truncate text-body">
                            {statement.accountName}
                          </span>
                          <span className="hidden text-xs text-muted lg:block">
                            {formatDate(statement.periodStart)} –{' '}
                            {formatDate(statement.periodEnd)}
                          </span>
                          <span className="hidden text-body lg:block">
                            {statement.type}
                          </span>
                          <span className="hidden text-xs text-muted lg:block">
                            {formatDate(statement.availableDate)}
                          </span>
                          <div className="flex items-center justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => handleView(statement)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline sm:text-sm"
                            >
                              <Eye className="h-3.5 w-3.5" strokeWidth={2} />
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownload(statement)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline sm:text-sm"
                            >
                              <Download className="h-3.5 w-3.5" strokeWidth={2} />
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Mobile card layout */}
                    <div className="flex flex-col sm:hidden">
                      {statements.map((statement) => (
                        <div
                          key={statement.id}
                          className="flex flex-col gap-2 border-b border-faint py-3"
                        >
                          <div className="flex items-start gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                              <FileText className="h-4 w-4" strokeWidth={1.75} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-deep-accent">
                                {statement.month}
                              </div>
                              <div className="truncate text-xs text-muted">
                                {statement.accountName}
                              </div>
                              <div className="mt-1 inline-block bg-faint px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-body">
                                {statement.type}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-end gap-4 pt-1">
                            <button
                              type="button"
                              onClick={() => handleView(statement)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            >
                              <Eye className="h-3.5 w-3.5" strokeWidth={2} />
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownload(statement)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            >
                              <Download className="h-3.5 w-3.5" strokeWidth={2} />
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Statement View Modal */}
      {viewModalOpen && selectedStatement && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
          onClick={closeModal}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-[700px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close"
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>

            {/* Modal header */}
            <div className="mb-5 border-b border-hairline pb-4 pr-8">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                  <FileText className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <h2 className="font-serif text-xl font-bold text-deep-accent sm:text-2xl">
                    {selectedStatement.month} Statement
                  </h2>
                  <p className="mt-0.5 truncate text-sm text-body">
                    {selectedStatement.accountName}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal rows */}
            <div className="mb-6 flex flex-col divide-y divide-faint">
              <ModalRow
                icon={Building2}
                label="Account"
                value={selectedStatement.accountName}
              />
              <ModalRow
                icon={Calendar}
                label="Statement Period"
                value={`${formatDateLong(
                  selectedStatement.periodStart
                )} – ${formatDateLong(selectedStatement.periodEnd)}`}
              />
              <ModalRow
                icon={Layers}
                label="Type"
                value={selectedStatement.type}
              />
              <ModalRow
                icon={Clock}
                label="Available Since"
                value={formatDateLong(selectedStatement.availableDate)}
              />
              <ModalRow
                icon={Hash}
                label="File Type"
                value={selectedStatement.fileType}
              />
              <ModalRow
                icon={HardDrive}
                label="Size"
                value={selectedStatement.size}
              />
            </div>

            {/* Modal actions */}
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => handleDownload(selectedStatement)}
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={2.25} />
                Download
              </button>
              <button
                type="button"
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 border border-hairline bg-white px-4 py-2 text-sm font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <Printer className="h-3.5 w-3.5" strokeWidth={2.25} />
                Print
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 border border-hairline bg-white px-4 py-2 text-sm font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable modal row
const ModalRow = ({ icon: Icon, label, value }) => (
  <div className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
    <span className="inline-flex items-center gap-1.5 text-xs text-muted sm:text-sm">
      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
      {label}
    </span>
    <span className="text-sm font-semibold text-ink sm:text-right">{value}</span>
  </div>
);

export default Statements;