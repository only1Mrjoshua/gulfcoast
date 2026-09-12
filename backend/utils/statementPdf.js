// utils/statementPdf.js
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const LOGO_PATH  = path.join(__dirname, '..', 'assets', 'logo.png');

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
    .format(Number(n) || 0);

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};

const toAscii = (s) =>
  String(s || '')
    .replace(/→/g, 'to')
    .replace(/[–—]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\x00-\x7F]/g, '');

export function generateStatementPdf({
  statement,
  user,
}, stream) {
  const doc = new PDFDocument({ size: 'LETTER', margin: 50, bufferPages: true });
  doc.pipe(stream);

  // ── Header with logo ─────────────────────────────────
  if (fs.existsSync(LOGO_PATH)) {
    try {
      doc.image(LOGO_PATH, 50, 40, { width: 140 });
    } catch { /* ignore */ }
  }

  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor('#0b1b2b')
    .text('Gulf Coast Bank and Trust Company', 200, 55, { align: 'right' })
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#666')
    .text('Account Statement', 200, 72, { align: 'right' });

  doc.moveDown(3);
  doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor('#cccccc').stroke();
  doc.moveDown(1);

  // ── Statement header ─────────────────────────────────
  doc
    .font('Helvetica-Bold')
    .fontSize(14)
    .fillColor('#0b1b2b')
    .text(statement.monthLabel || 'Account Statement');

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#666')
    .text(
      [
        user?.name ? `Account Holder: ${toAscii(user.name)}` : null,
        statement.accountLabel ? `Account: ${toAscii(statement.accountLabel)}` : null,
        `Generated: ${formatDate(statement.generatedAt)}`,
      ]
        .filter(Boolean)
        .join('   ·   ')
    );

  doc.moveDown(1.5);

  // ── Summary boxes ────────────────────────────────────
  const s = statement.summary || {};
  const summaryY = doc.y;
  drawSummaryBox(doc, 50,  summaryY, 'Money In',  `+${formatCurrency(s.totalIn)}`);
  drawSummaryBox(doc, 180, summaryY, 'Money Out', `-${formatCurrency(s.totalOut)}`);
  drawSummaryBox(doc, 310, summaryY, 'Net', `${s.net >= 0 ? '+' : ''}${formatCurrency(s.net)}`);
  drawSummaryBox(doc, 440, summaryY, 'Transactions', String(s.count ?? 0));
  doc.y = summaryY + 52;
  doc.moveDown(0.5);

  // ── Table ────────────────────────────────────────────
  drawTableHeader(doc);

  const txs = statement.transactions || [];
  if (txs.length === 0) {
    doc
      .font('Helvetica-Oblique')
      .fontSize(10)
      .fillColor('#888')
      .text('No transactions in this statement period.', 50, doc.y + 12, { align: 'center' });
  } else {
    txs.forEach((tx) => {
      if (doc.y > 720) {
        doc.addPage();
        drawTableHeader(doc);
      }
      drawTableRow(doc, tx);
    });
  }

  // ── Footer ───────────────────────────────────────────
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);

    const savedY = doc.y;

    doc
      .font('Helvetica-Oblique')
      .fontSize(8)
      .fillColor('#888')
      .text(
        `Page ${i + 1} of ${pages.count}   -   This statement is for informational purposes only.`,
        50,
        728,
        {
          align: 'center',
          width: 512,
          lineBreak: false,
        }
      );

    doc.y = savedY;
  }

  doc.end();
}

function drawSummaryBox(doc, x, y, label, value) {
  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#888')
    .text(label.toUpperCase(), x, y, { width: 120 });
  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor('#0b1b2b')
    .text(toAscii(value), x, y + 12, { width: 120 });
}

function drawTableHeader(doc) {
  const y = doc.y;
  doc.rect(50, y, 512, 20).fill('#f8f9fa');
  doc.fillColor('#0b1b2b').font('Helvetica-Bold').fontSize(8);

  doc.text('DATE',        56,  y + 6, { width: 70 });
  doc.text('DESCRIPTION', 130, y + 6, { width: 200 });
  doc.text('CATEGORY',    335, y + 6, { width: 90 });
  doc.text('AMOUNT',      430, y + 6, { width: 65, align: 'right' });
  doc.text('BALANCE',     500, y + 6, { width: 60, align: 'right' });

  doc.y = y + 24;
}

function drawTableRow(doc, tx) {
  const y = doc.y;
  const isPositive = tx.amount >= 0;

  doc.font('Helvetica').fontSize(9).fillColor('#333');
  doc.text(formatDate(tx.date), 56, y, { width: 70 });

  doc.fillColor('#0b1b2b').text(
    toAscii((tx.description || '').slice(0, 42)),
    130, y, { width: 200 }
  );

  doc.font('Helvetica').fillColor('#666').text(
    toAscii((tx.category || '-').slice(0, 18)),
    335, y, { width: 90 }
  );

  doc
    .font('Helvetica-Bold')
    .fillColor(isPositive ? '#2a7f8f' : '#d9534f')
    .text(
      `${isPositive ? '+' : '-'}${formatCurrency(Math.abs(tx.amount))}`,
      430, y, { width: 65, align: 'right' }
    );

  doc
    .font('Helvetica')
    .fillColor('#666')
    .text(formatCurrency(tx.balance ?? 0), 500, y, { width: 60, align: 'right' });

  doc.moveTo(50, y + 13).lineTo(562, y + 13).strokeColor('#eeeeee').stroke();
  doc.y = y + 18;
}