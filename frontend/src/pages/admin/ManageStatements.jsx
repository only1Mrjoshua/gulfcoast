// src/pages/admin/ManageStatements.jsx
import React, { useState } from 'react';
import { 
  Search, Filter, Download, Eye, X, FileSpreadsheet, 
  Upload, FileUp, Calendar, CheckCircle2 
} from 'lucide-react';
import { mockAdminStatements } from '../../data/mockAdminData';

const ManageStatements = () => {
  const [statements, setStatements] = useState(mockAdminStatements);
  const [searchTerm, setSearchTerm] = useState('');
  
  // View Modal State
  const [selectedStatement, setSelectedStatement] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    user: '',
    period: '',
    fileName: '',
    status: 'Available'
  });
  const [fileError, setFileError] = useState('');

  // Mock user list for the dropdown
  const mockUsers = ['Joshua Smith', 'Sarah Jenkins', 'Michael Chen', 'Emily Davis'];

  const filteredStatements = statements.filter(s => 
    s.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- View Handlers ---
  const handleViewClick = (statement) => {
    setSelectedStatement({ ...statement });
    setIsViewModalOpen(true);
  };

  // --- Upload Handlers ---
  const handleUploadClick = () => {
    setUploadData({
      user: '',
      period: '',
      fileName: '',
      status: 'Available'
    });
    setFileError('');
    setIsUploadModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if it's a PDF (optional but good practice)
      if (file.type !== 'application/pdf') {
        setFileError('Please upload a PDF file.');
        return;
      }
      setFileError('');
      setUploadData({ ...uploadData, fileName: file.name });
    }
  };

  const handleUploadSubmit = () => {
    if (!uploadData.user || !uploadData.period || !uploadData.fileName) {
      setFileError('Please fill in all fields and upload a file.');
      return;
    }

    // Create new statement object
    const newStatement = {
      id: `STM-${String(statements.length + 1).padStart(4, '0')}`,
      user: uploadData.user,
      period: uploadData.period, // YYYY-MM format
      generated: new Date().toISOString().split('T')[0], // Today's date
      fileName: uploadData.fileName,
      status: uploadData.status
    };

    setStatements([newStatement, ...statements]);
    setIsUploadModalOpen(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available': return <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary"><CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.25} />Available</span>;
      case 'Archived': return <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted"><span className="h-1.5 w-1.5 bg-muted" />Archived</span>;
      default: return null;
    }
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 border-b border-hairline pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">Manage Statements</h1>
          <p className="mt-1 text-sm text-body">Upload and manage user monthly account statements.</p>
        </div>
        <button 
          onClick={handleUploadClick}
          className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-deep transition-colors"
        >
          <Upload className="h-4 w-4" strokeWidth={2} /> Upload Statement
        </button>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center border border-hairline bg-white px-3 focus-within:border-primary">
          <Search className="h-4 w-4 text-muted" strokeWidth={2} />
          <input 
            type="text" 
            placeholder="Search by user, ID, or file name..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="min-h-[40px] w-full border-none bg-transparent px-3 py-2 text-sm text-deep-accent outline-none placeholder:text-muted/60" 
          />
        </div>
        <button className="inline-flex min-h-[40px] items-center justify-center gap-2 border border-hairline bg-white px-4 py-2 text-sm font-semibold text-deep-accent hover:bg-faint">
          <Filter className="h-4 w-4" strokeWidth={2} /> Filter
        </button>
      </div>

      {/* Statements Table */}
      <div className="overflow-x-auto border border-hairline bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-hairline bg-faint/50 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Statement ID</th>
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Period</th>
              <th className="px-5 py-3 font-semibold">Generated Date</th>
              <th className="px-5 py-3 font-semibold">File Name</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-faint">
            {filteredStatements.map((s) => (
              <tr key={s.id} className="transition-colors hover:bg-faint/30">
                <td className="px-5 py-4 font-mono text-xs text-muted">{s.id}</td>
                <td className="px-5 py-4 font-semibold text-deep-accent">{s.user}</td>
                <td className="px-5 py-4 text-body">{s.period}</td>
                <td className="px-5 py-4 text-muted">{s.generated}</td>
                <td className="px-5 py-4 text-xs text-muted max-w-[150px] truncate" title={s.fileName}>{s.fileName}</td>
                <td className="px-5 py-4">{getStatusBadge(s.status)}</td>
                <td className="px-5 py-4 text-right">
                  <button onClick={() => handleViewClick(s)} className="inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-primary" title="View Details">
                    <Eye className="h-4 w-4" strokeWidth={2} />
                  </button>
                  <button className="ml-2 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-primary" title="Download PDF">
                    <Download className="h-4 w-4" strokeWidth={2} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStatements.length === 0 && <div className="p-8 text-center text-muted">No statements found.</div>}
      </div>

      {/* --- VIEW STATEMENT MODAL --- */}
      {isViewModalOpen && selectedStatement && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4" onClick={() => setIsViewModalOpen(false)}>
          <div className="relative w-full max-w-[480px] border border-hairline bg-white p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsViewModalOpen(false)} className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent">
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>
            <div className="flex items-start gap-3 mb-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                <FileSpreadsheet className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-deep-accent">Statement Details</h2>
                <p className="mt-1 text-sm text-body">{selectedStatement.id} • {selectedStatement.user}</p>
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4 border border-hairline bg-faint/30 p-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted">Period</div>
                  <div className="mt-1 text-sm font-semibold text-deep-accent">{selectedStatement.period}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted">Generated</div>
                  <div className="mt-1 text-sm font-semibold text-deep-accent">{selectedStatement.generated}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted">File Name</div>
                  <div className="mt-1 text-sm font-semibold text-deep-accent truncate">{selectedStatement.fileName}</div>
                </div>
              </div>
              <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
                <button onClick={() => setIsViewModalOpen(false)} className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent hover:bg-faint">Close</button>
                <button className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-deep">
                  <Download className="h-4 w-4" strokeWidth={2.25} /> Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- UPLOAD STATEMENT MODAL --- */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4" onClick={() => setIsUploadModalOpen(false)}>
          <div className="relative max-h-[90vh] w-full max-w-[500px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsUploadModalOpen(false)} className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent">
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>
            
            <div className="flex items-start gap-3 mb-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                <Upload className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-deep-accent">Upload Statement</h2>
                <p className="mt-1 text-sm text-body">Upload a monthly PDF statement for a specific user.</p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              {/* User Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-deep-accent">Select User</label>
                <select 
                  value={uploadData.user} 
                  onChange={(e) => setUploadData({...uploadData, user: e.target.value})} 
                  className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                >
                  <option value="">-- Select a user --</option>
                  {mockUsers.map(user => (
                    <option key={user} value={user}>{user}</option>
                  ))}
                </select>
              </div>

              {/* Period Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-deep-accent flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" strokeWidth={2} />
                  Statement Period (Month)
                </label>
                <input 
                  type="month" 
                  value={uploadData.period} 
                  onChange={(e) => setUploadData({...uploadData, period: e.target.value})} 
                  className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                />
              </div>

              {/* File Upload Dropzone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-deep-accent">Statement File (PDF)</label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-hairline bg-faint/30 hover:bg-faint cursor-pointer transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileUp className="w-8 h-8 mb-2 text-primary" strokeWidth={1.75} />
                      <p className="mb-1 text-sm text-deep-accent font-semibold">
                        {uploadData.fileName ? uploadData.fileName : 'Click to upload PDF'}
                      </p>
                      <p className="text-xs text-muted">PDF files only</p>
                    </div>
                    <input 
                      id="dropzone-file" 
                      type="file" 
                      accept=".pdf" 
                      className="hidden" 
                      onChange={handleFileChange} 
                    />
                  </label>
                </div>
                {fileError && <p className="text-xs text-[#d9534f] mt-1">{fileError}</p>}
              </div>

              {/* Status Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-deep-accent">Status</label>
                <select 
                  value={uploadData.status} 
                  onChange={(e) => setUploadData({...uploadData, status: e.target.value})} 
                  className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                >
                  <option value="Available">Available</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
                <button onClick={() => setIsUploadModalOpen(false)} className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent hover:bg-faint">Cancel</button>
                <button 
                  onClick={handleUploadSubmit} 
                  disabled={!uploadData.user || !uploadData.period || !uploadData.fileName}
                  className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-deep disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="h-4 w-4" strokeWidth={2.25} /> Upload Statement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStatements;