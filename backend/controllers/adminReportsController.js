// controllers/adminReportsController.js
import Report from '../models/Report.js';

const formatReport = (r) => ({
  id: r._id,
  userId: r.userId,
  user: r.userName || '',
  userEmail: r.userEmail || '',
  transactionId: r.transactionId,
  transactionDescription: r.transactionDescription,
  transactionAmount: r.transactionAmount,
  referenceNumber: r.referenceNumber,
  reason: r.reason,
  status: r.status,
  adminNote: r.adminNote,
  submittedAt: r.submittedAt,
  resolvedAt: r.resolvedAt,
});

// ================================================================
// GET /api/admin/reports?status=Open
// ================================================================
export const adminListReports = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const reports = await Report.find(filter)
      .populate('userId', 'firstName lastName email')
      .sort({ submittedAt: -1 })
      .lean();

    res.json({
      reports: reports.map((r) => {
        const u = r.userId;
        return {
          ...formatReport(r),
          userId: u?._id || r.userId,
          user: u ? `${u.firstName} ${u.lastName}`.trim() : '—',
          userEmail: u?.email || '',
        };
      }),
    });
  } catch (err) {
    console.error('❌ adminListReports:', err);
    res.status(500).json({ error: 'Failed to load reports' });
  }
};

// ================================================================
// PUT /api/admin/reports/:id/status
// Body: { status, adminNote }
// ================================================================
export const adminUpdateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote = '' } = req.body;

    if (!['Open', 'In Review', 'Resolved', 'Closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    report.status = status;
    if (adminNote) report.adminNote = adminNote;
    if (status === 'Resolved' || status === 'Closed') {
      report.resolvedAt = new Date();
    }
    await report.save();

    res.json({ message: `Report marked ${status}`, report: formatReport(report.toObject()) });
  } catch (err) {
    console.error('❌ adminUpdateReportStatus:', err);
    res.status(500).json({ error: 'Failed to update report' });
  }
};