// scripts/updateHenryTransactions.js
//
// Inspects (or rebuilds) Henry Dorian's transaction history so it runs
// all the way to YESTERDAY, with a combined checking + savings balance
// of exactly $524,000.00.
//
// ── USAGE ───────────────────────────────────────────────────────────────
//   node scripts/updateHenryTransactions.js              → inspect only
//   node scripts/updateHenryTransactions.js --apply      → wipe & rebuild
//   node scripts/updateHenryTransactions.js --apply --target 600000
//                                                       → custom target
// ────────────────────────────────────────────────────────────────

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import Card from '../models/Card.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// ═════════════════════════════════════════════════════════════════════════
//  CONFIG
// ═════════════════════════════════════════════════════════════════════════

const USERNAME = 'Henrydorian1';
const EMAIL    = 'sorochijoshua2021@gmail.com';

// Parse CLI args
const args          = process.argv.slice(2);
const APPLY         = args.includes('--apply');
const TARGET_IDX    = args.indexOf('--target');
const TARGET_TOTAL  = TARGET_IDX !== -1 ? parseFloat(args[TARGET_IDX + 1]) : 524_000;

// How far back to rebuild if the account has no `openedAt`.
const DEFAULT_START = new Date('2024-02-01T09:00:00');

// Yesterday, end of day — the newest transaction we generate.
const YESTERDAY_END = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(23, 59, 59, 999);
  return d;
})();

const YESTERDAY_START = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(0, 0, 0, 0);
  return d;
})();

const MIN_TX_PER_MONTH = 60;

// Recurring amounts (Henry's pattern)
const PAYROLL_WEEKLY        = 3_088;
const RENT_MONTHLY          = 4_500;
const SAVINGS_MONTHLY       = 5_000;

const AUTOPAYS = [
  { name: 'Netflix',              amount:   22.99, day: 4,  category: 'Entertainment' },
  { name: 'Apple Music',          amount:   10.99, day: 8,  category: 'Entertainment' },
  { name: 'Amazon Prime',         amount:   14.99, day: 11, category: 'Shopping'      },
  { name: 'Apple TV+',            amount:    9.99, day: 15, category: 'Entertainment' },
  { name: 'Apple Card Recharge',  amount: 1500.00, day: 20, category: 'Credit Card'   },
];

// For the ledger we need account labels that don't depend on knowing
// Henry's specific account numbers ahead of time. We read them from DB.

// ═════════════════════════════════════════════════════════════════════════
//  Helpers
// ═════════════════════════════════════════════════════════════════════════

const rand      = (a, b) => Math.random() * (b - a) + a;
const randInt   = (a, b) => Math.floor(rand(a, b + 1));
const pick      = (arr) => arr[Math.floor(Math.random() * arr.length)];
const round2    = (n) => Math.round(n * 100) / 100;
const money     = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2,
  }).format(n ?? 0);
const at = (d, h, m = 0) => { const x = new Date(d); x.setHours(h, m, 0, 0); return x; };
const monthKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const clean = (s) => String(s).replace(/\s*—\s*/g, ' ').replace(/\s+/g, ' ').trim();

const GROCERY   = [['Walmart Supercenter',65,320],['Kroger',55,240],['Harps Foods',40,185],["Brookshire's",45,200]];
const GAS       = [['Shell',38,84],['Exxon',40,88],['Murphy USA',32,78],['Valero',35,80]];
const COFFEE    = [['Starbucks',6,24],['Starbucks Reserve',9,28]];
const DINING    = [['Chick-fil-A',12,34],['Olive Garden',42,118],['Texas Roadhouse',38,95],['Whataburger',10,28],['Local Diner',18,52]];
const PHARMACY  = [['CVS Pharmacy',28,240],['Walgreens',25,180]];
const MEDICAL   = [['Crossett Health Center',150,1800],['Ashley County Medical Center',200,2400]];
const SHOPPING  = [['Amazon',25,620],['Zara',80,460],['Ralph Lauren',120,940],['Chrome Hearts',420,3600],['Suitsupply',520,2300],['Tom Ford',320,2600],['Nordstrom',90,780]];
const ESSENTIALS= [['Foot Locker',90,360],['Nike',85,340],['Watch Station',180,2400],["Macy's",60,420],['Best Buy',80,900]];

// ═════════════════════════════════════════════════════════════════════════
//  Ledger
// ═════════════════════════════════════════════════════════════════════════

let ledger = [];

const push = (date, description, amount, meta = {}) => {
  const isCredit = amount >= 0;
  ledger.push({
    date,
    description: clean(description),
    amount: round2(Math.abs(amount)),
    direction: isCredit ? 'credit' : 'debit',
    type: isCredit ? 'deposit' : 'withdrawal',
    status: 'Completed',
    ...meta,
  });
};

const randomSpend = (date, hour) => {
  const roll = Math.random();
  let desc, lo, hi, cat;
  if      (roll < 0.30) { [desc, lo, hi] = pick(GROCERY);   cat = 'Groceries';  }
  else if (roll < 0.55) { [desc, lo, hi] = pick(COFFEE);    cat = 'Dining';     }
  else if (roll < 0.70) { [desc, lo, hi] = pick(GAS);       cat = 'Gas';        }
  else if (roll < 0.82) { [desc, lo, hi] = pick(DINING);    cat = 'Dining';     }
  else if (roll < 0.90) { [desc, lo, hi] = pick(PHARMACY);  cat = 'Healthcare'; }
  else if (roll < 0.97) { [desc, lo, hi] = pick(SHOPPING);  cat = 'Shopping';   }
  else                  { [desc, lo, hi] = pick(ESSENTIALS); cat = 'Shopping';  }
  push(at(date, hour, randInt(0, 59)), desc, -rand(lo, hi), {
    category: cat, merchant: desc, method: 'Card',
  });
};

// ═════════════════════════════════════════════════════════════════════════
//  Build
// ═════════════════════════════════════════════════════════════════════════

function buildLedger(startDate) {
  ledger = [];
  const businessIncomeSlots = []; // { date, month } — filled in later

  const cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(YESTERDAY_END);

  while (cursor <= end) {
    const d      = new Date(cursor);
    const dom    = d.getDate();
    const dow    = d.getDay();
    const month  = monthKey(d);

    // ── Weekly payroll — every Monday ─────────────────────────────
    if (dow === 1) {
      push(at(d, 9, 0), 'Payroll Direct Deposit',
        PAYROLL_WEEKLY, {
          kind: 'payroll', category: 'Income', method: 'ACH',
          merchant: 'Employer', reference: 'PAY-' + month,
        });
    }

    // ── Monthly rent (1st) ────────────────────────────────────────
    if (dom === 1) {
      push(at(d, 8, 0), 'Monthly Rent',
        -RENT_MONTHLY, {
          kind: 'rent', category: 'Housing', method: 'ACH',
          merchant: 'Property Management', isAutomatic: true,
        });
    }

    // ── Monthly savings transfer (2nd) ────────────────────────────
    if (dom === 2) {
      push(at(d, 8, 30), 'Transfer to Savings',
        -SAVINGS_MONTHLY, {
          kind: 'savings-transfer', category: 'Transfer', method: 'Internal',
        });
    }

    // ── Autopays ─────────────────────────────────────────────────
    for (const sub of AUTOPAYS) {
      if (dom === sub.day) {
        push(at(d, 7, sub.day), `${sub.name} Subscription (AutoPay)`,
          -sub.amount, {
            kind: 'subscription', category: sub.category,
            merchant: sub.name, method: 'Card', isAutomatic: true,
          });
      }
    }

    // ── Business income slot (mid-month, amount filled in later) ──
    if (dom === 17) {
      businessIncomeSlots.push({ date: at(d, 14, 0), month });
    }

    // ── Random daily spend (4–6 per day) ──────────────────────────
    const count = randInt(4, 6);
    for (let i = 0; i < count; i++) {
      randomSpend(d, randInt(6, 22));
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  // ── Pad any month below MIN_TX_PER_MONTH ────────────────────────
  const byMonth = new Map();
  for (const t of ledger) {
    const k = monthKey(t.date);
    if (!byMonth.has(k)) byMonth.set(k, []);
    byMonth.get(k).push(t);
  }

  let padded = 0;
  for (const [key, list] of byMonth) {
    const need = MIN_TX_PER_MONTH - list.length;
    if (need <= 0) continue;

    const [y, m] = key.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();

    for (let i = 0; i < need; i++) {
      const day = randInt(1, daysInMonth);
      const d   = new Date(y, m - 1, day);
      // Don't pad past yesterday if this is the current month
      if (d > YESTERDAY_END) continue;
      randomSpend(d, randInt(6, 22));
      padded++;
    }
  }

  return { businessIncomeSlots, padded };
}

// ═════════════════════════════════════════════════════════════════════════
//  Main
// ═════════════════════════════════════════════════════════════════════════

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  // ── Find Henry ──────────────────────────────────────────────────────
  const henry = await User.findOne({
    $or: [{ username: USERNAME }, { email: EMAIL }],
  }).select('_id firstName lastName username email').lean();

  if (!henry) {
    console.error(`❌ User "${USERNAME}" not found`);
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`🎯 ${henry.firstName} ${henry.lastName}  (${henry._id})`);
  console.log(`   ${henry.email}\n`);

  // ── Accounts ────────────────────────────────────────────────────────
  let checking = await Account.findOne({ userId: henry._id, type: 'Checking' }).lean();
  let savings  = await Account.findOne({ userId: henry._id, type: 'Savings'  }).lean();

  if (!checking && !savings) {
    console.error('❌ No Checking or Savings account found for Henry');
    await mongoose.disconnect();
    process.exit(1);
  }

  if (checking) {
    console.log(`💳 Checking •••• ${String(checking.accountNumber).slice(-4)}   ${money(checking.totalBalance)}`);
  }
  if (savings) {
    console.log(`💳 Savings  •••• ${String(savings.accountNumber).slice(-4)}   ${money(savings.totalBalance)}`);
  }
  const currentCombined = (checking?.totalBalance ?? 0) + (savings?.totalBalance ?? 0);
  console.log(`   ─────────────────────────────`);
  console.log(`   Combined: ${money(currentCombined)}\n`);

  // ── Current transactions snapshot ───────────────────────────────────
  const txCount = await Transaction.countDocuments({ userId: henry._id });
  const latest  = await Transaction.findOne({ userId: henry._id })
    .sort({ date: -1 }).select('date description').lean();
  const earliest = await Transaction.findOne({ userId: henry._id })
    .sort({ date: 1 }).select('date description').lean();

  console.log('════════════════════════════════════════════');
  console.log('  CURRENT TRANSACTIONS');
  console.log('════════════════════════════════════════════');
  console.log(`  Total count : ${txCount}`);
  console.log(`  Earliest    : ${earliest ? new Date(earliest.date).toDateString() : '—'}`);
  console.log(`  Latest      : ${latest ? new Date(latest.date).toDateString() : '—'}`);
  console.log(`  Yesterday   : ${YESTERDAY_END.toDateString()}`);
  console.log('════════════════════════════════════════════\n');

  if (!APPLY) {
    console.log('ℹ️  Dry-run mode. Nothing was changed.');
    console.log('   Re-run with --apply to rebuild the ledger to reach yesterday.\n');
    await mongoose.disconnect();
    process.exit();
  }

  // ═══════════════════════════════════════════════════════════════════
  //  APPLY — wipe & rebuild
  // ═══════════════════════════════════════════════════════════════════
  console.log('🧹 Wiping existing transactions…');
  const del = await Transaction.deleteMany({ userId: henry._id });
  console.log(`   Deleted ${del.deletedCount} transaction(s)\n`);

  const startDate = checking?.openedAt ? new Date(checking.openedAt) : DEFAULT_START;
  console.log(`⏳ Building ledger from ${startDate.toDateString()} → ${YESTERDAY_END.toDateString()}…`);
  const { businessIncomeSlots, padded } = buildLedger(startDate);
  if (padded) console.log(`   Padded ${padded} transaction(s) to reach ${MIN_TX_PER_MONTH}/month`);
  console.log('');

  // ── Compute the amount that Business Income must fill ──────────────
  //
  // Combined total = opening + all credits − non-transfer debits
  // (savings transfers cancel out at the combined level)
  //
  const OPENING_BALANCE = 120_000;
  let sumCreditsExBiz = 0;
  let sumDebitsTotal  = 0;
  let savingsTransferTotal = 0;

  for (const t of ledger) {
    if (t.direction === 'credit') {
      sumCreditsExBiz += t.amount;
    } else {
      sumDebitsTotal += t.amount;
      if (t.kind === 'savings-transfer') savingsTransferTotal += t.amount;
    }
  }

  const nonTransferDebits = sumDebitsTotal - savingsTransferTotal;
  const totalWithoutBiz   = OPENING_BALANCE + sumCreditsExBiz - nonTransferDebits;
  const businessIncomeTotal = TARGET_TOTAL - totalWithoutBiz;

  if (businessIncomeTotal <= 0) {
    console.error('❌ Business income would be negative. Lower the target or extend the period.');
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`   Business income to distribute: ${money(businessIncomeTotal)} across ${businessIncomeSlots.length} months`);
  console.log(`   Average: ${money(businessIncomeTotal / businessIncomeSlots.length)}/month\n`);

  // Distribute evenly; slight jitter for realism
  const perMonthBase = businessIncomeTotal / businessIncomeSlots.length;
  for (const slot of businessIncomeSlots) {
    const jitter = rand(-0.03, 0.03); // ±3%
    const amount = round2(perMonthBase * (1 + jitter));
    push(slot.date, 'Business Consulting Income', amount, {
      kind: 'business-income',
      category: 'Income', method: 'Wire',
      merchant: 'Consulting Client',
      reference: 'BCI-' + slot.month,
    });
  }

  // ── Absorb residual into the last business-income payment ─────────
  ledger.sort((a, b) => a.date - b.date);

  let running = OPENING_BALANCE;
  for (const t of ledger) {
    running += t.direction === 'credit' ? t.amount : -t.amount;
  }
  const combinedNow = round2(running + savingsTransferTotal);
  const residual    = round2(TARGET_TOTAL - combinedNow);

  if (Math.abs(residual) >= 0.01) {
    const bizCredits = ledger.filter((t) => t.kind === 'business-income');
    if (bizCredits.length) {
      const last = bizCredits[bizCredits.length - 1];
      last.amount = round2(last.amount + residual);
    }
  }

  // ── Walking balance for checking side ─────────────────────────────
  let runningChecking = OPENING_BALANCE;
  for (const t of ledger) {
    runningChecking = round2(runningChecking + (t.direction === 'credit' ? t.amount : -t.amount));
    t.balanceAfter = runningChecking;
  }
  const finalCheckingBalance = runningChecking;
  const finalSavingsBalance  = round2(savingsTransferTotal);
  const finalCombined        = round2(finalCheckingBalance + finalSavingsBalance);

  if (Math.abs(finalCombined - TARGET_TOTAL) > 0.01) {
    console.error(`❌ Reconciliation failed: ${money(finalCombined)} vs target ${money(TARGET_TOTAL)}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  // ── Insert ────────────────────────────────────────────────────────
  const docFor = (accountId, t) => ({
    userId: henry._id,
    accountId,
    description: clean(t.description),
    amount: t.direction === 'credit' ? t.amount : -t.amount,
    type: t.type,
    status: 'Completed',
    date: t.date,
    balanceAfter: t.balanceAfter,
    direction: t.direction,
    category: t.category,
    merchant: t.merchant,
    method: t.method,
    isAutomatic: !!t.isAutomatic,
    reference: t.reference,
  });

  // Ensure Henry has accounts (create if missing)
  if (!checking) {
    checking = (await Account.create({
      userId: henry._id, type: 'Checking', subType: null,
      nickname: 'Everyday Checking', currency: 'USD',
      totalBalance: 0, availableBalance: 0, pendingBalance: 0,
      interestRate: 0.01, status: 'Active', isPrimary: true,
      openedAt: OPENING_DATE,
    })).toObject();
    console.log('🆕 Created Checking account');
  }
  if (!savings) {
    savings = (await Account.create({
      userId: henry._id, type: 'Savings', subType: 'High Yield',
      nickname: 'High-Yield Savings', currency: 'USD',
      totalBalance: 0, availableBalance: 0, pendingBalance: 0,
      interestRate: 4.25, status: 'Active', isPrimary: false,
      openedAt: OPENING_DATE,
    })).toObject();
    console.log('🆕 Created Savings account');
  }

  const openingTx = {
    userId: henry._id,
    accountId: checking._id,
    description: 'Opening Deposit',
    amount: OPENING_BALANCE,
    type: 'deposit',
    status: 'Completed',
    date: startDate,
    balanceAfter: OPENING_BALANCE,
    direction: 'credit',
    category: 'Income',
    method: 'Branch',
  };

  const checkingDocs = [openingTx, ...ledger.map((t) => docFor(checking._id, t))];

  const savingsDocs = ledger
    .filter((t) => t.kind === 'savings-transfer')
    .map((t) => ({
      userId: henry._id,
      accountId: savings._id,
      description: 'Transfer from Checking',
      amount: t.amount,
      type: 'deposit',
      status: 'Completed',
      date: t.date,
      direction: 'credit',
      category: 'Transfer',
      method: 'Internal',
    }));

  console.log(`⏳ Inserting ${checkingDocs.length + savingsDocs.length} transaction(s)…\n`);
  await Transaction.insertMany(checkingDocs, { ordered: false });
  if (savingsDocs.length) {
    await Transaction.insertMany(savingsDocs, { ordered: false });
  }

  // ── Sync accounts + debit card ────────────────────────────────────
  await Account.updateOne({ _id: checking._id }, { $set: {
    totalBalance: finalCheckingBalance,
    availableBalance: finalCheckingBalance,
    pendingBalance: 0,
  } });
  await Account.updateOne({ _id: savings._id }, { $set: {
    totalBalance: finalSavingsBalance,
    availableBalance: finalSavingsBalance,
    pendingBalance: 0,
  } });
  await Card.updateMany({ userId: henry._id, type: 'Debit' }, { $set: {
    balance: finalCheckingBalance,
  } });

  // ── Summary ───────────────────────────────────────────────────────
  const newest = await Transaction.find({
    userId: henry._id, accountId: checking._id,
  })
    .sort({ date: -1, _id: -1 })
    .limit(6)
    .select('date description amount direction category')
    .lean();

  console.log('════════════════════════════════════════════');
  console.log('  MOST RECENT TRANSACTIONS (newest → oldest)');
  console.log('════════════════════════════════════════════');
  for (const t of newest) {
    const sign = t.direction === 'credit' ? '+' : '-';
    const dt = new Date(t.date);
    const stamp =
      `${dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ` +
      `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
    console.log(
      `  ${stamp.padEnd(18)}  ${sign}${money(Math.abs(t.amount)).padStart(14)}  ` +
      `${(t.category ?? '').padEnd(16)}  ${t.description}`,
    );
  }
  console.log('════════════════════════════════════════════\n');

  console.log('  Final balances:');
  console.log(`   Checking  •••• ${String(checking.accountNumber || '').slice(-4).padStart(4, '•')}   ${money(finalCheckingBalance)}`);
  console.log(`   Savings   •••• ${String(savings.accountNumber  || '').slice(-4).padStart(4, '•')}   ${money(finalSavingsBalance)}`);
  console.log('  ─────────────────────────────────────────────');
  console.log(`   COMBINED                        ${money(finalCombined)}`);
  console.log('');

  console.log(`🎉 Done — transactions now run to ${YESTERDAY_END.toDateString()}.\n`);

  await mongoose.disconnect();
  process.exit();
};

// Referenced above but defined here for readability
const OPENING_DATE = new Date('2024-02-01T09:00:00');

run().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});