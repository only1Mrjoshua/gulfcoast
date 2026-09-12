// utils/pdfReceipt.js
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOGO_PATH = path.join(__dirname, '..', 'assets', 'logo.png');

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
    .format(Number(n) || 0);

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};

const formatTime = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
};

export function generateTransferReceiptPdf(transfer, stream) {
  const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
  doc.pipe(stream);

  // ── Header / Logo ─────────────────────────────────────────
  if (fs.existsSync(LOGO_PATH)) {
    try {
      doc.image(LOGO_PATH, 50, 40, { width: 140 });
    } catch (e) {
      // If image fails, skip silently
    }
  }
  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor('#0b1b2b')
    .text('Gulf Coast Bank and Trust Company', 200, 55, { align: 'right' })
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#666')
    .text('Official Transfer Receipt', 200, 72, { align: 'right' });

  doc.moveDown(3);
  doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor('#cccccc').stroke();
  doc.moveDown(1.2);

  // ── Title ────────────────────────────────────────────────
  doc
    .font('Helvetica-Bold')
    .fontSize(16)
    .fillColor('#0b1b2b')
    .text('TRANSFER RECEIPT', { align: 'center' });
  doc.moveDown(1.5);

  // ── Meta info ────────────────────────────────────────────
  const meta = [
    ['Transaction Number', transfer.transactionNumber],
    ['Date',              formatDate(transfer.createdAt || transfer.transferDate)],
    ['Time',              formatTime(transfer.createdAt || transfer.transferDate)],
    ['Status',            transfer.status],
    ['Transfer Type',     capitalize(transfer.type)],
  ];
  drawTable(doc, meta);

  doc.moveDown(1);
  drawSection(doc, 'SENDER', [
    ['Name',    transfer.senderName || '—'],
    ['Account', `${transfer.fromAccountName || ''} •••• ${transfer.fromLastFour || ''}`],
  ]);

  if (transfer.type === 'external' || transfer.type === 'wire') {
    drawSection(doc, 'RECIPIENT', [
      ['Name',          transfer.recipient?.fullName || '—'],
      ['Bank',          transfer.recipient?.bankName || '—'],
      ['Account No.',   maskAccount(transfer.recipient?.accountNumber)],
      ['Account Type',  capitalize(transfer.recipient?.accountType || '')],
      ...(transfer.type === 'wire' && transfer.recipient?.bankAddress
        ? [['Bank Address', transfer.recipient.bankAddress]]
        : []),
    ]);
  } else {
    drawSection(doc, 'RECIPIENT', [
      ['Name',    transfer.toAccountName || '—'],
      ['Account', `${transfer.toAccountName || ''} •••• ${transfer.toLastFour || ''}`],
    ]);
  }

  const details = [
    ['Amount', formatCurrency(transfer.amount)],
  ];
  if (transfer.wireFee > 0) {
    details.push(['Wire Fee', formatCurrency(transfer.wireFee)]);
    details.push(['Total Debited', formatCurrency(transfer.totalDebit)]);
  }
  if (transfer.memo) details.push(['Memo', transfer.memo]);
  details.push(['Expected Arrival', transfer.expectedArrival || '—']);

  drawSection(doc, 'DETAILS', details);

  // ── Footer ───────────────────────────────────────────────
  doc.moveDown(2);
  doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor('#cccccc').stroke();
  doc.moveDown(1);
  doc
    .font('Helvetica-Oblique')
    .fontSize(9)
    .fillColor('#888')
    .text('Thank you for banking with us.', { align: 'center' })
    .text('This receipt is for your records only.', { align: 'center' });

  doc.end();
}

function drawTable(doc, rows) {
  doc.font('Helvetica').fontSize(10);
  rows.forEach(([k, v]) => {
    doc.fillColor('#666').text(k, 50, doc.y, { continued: false, width: 200 });
    const y = doc.y - 12;
    doc.fillColor('#0b1b2b').font('Helvetica-Bold').text(v, 260, y, { width: 300 });
    doc.font('Helvetica').moveDown(0.4);
  });
}

function drawSection(doc, title, rows) {
  doc.moveDown(1);
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor('#2a7f8f')
    .text(title, 50, doc.y);
  doc.moveDown(0.4);
  doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor('#eeeeee').stroke();
  doc.moveDown(0.4);

  rows.forEach(([k, v]) => {
    const y = doc.y;
    doc.font('Helvetica').fontSize(10).fillColor('#666').text(k, 50, y, { width: 180 });
    doc.font('Helvetica-Bold').fillColor('#0b1b2b').text(String(v ?? '—'), 240, y, { width: 320 });
    doc.moveDown(0.3);
  });
}

function maskAccount(num) {
  if (!num) return '—';
  const s = String(num);
  return s.length > 4 ? `•••• ${s.slice(-4)}` : s;
}

function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}