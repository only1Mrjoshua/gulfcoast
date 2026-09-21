// scripts/createDaveBeckerAccounts.js
//
// Creates the full banking profile for Dave Brennaman Becker.
//
// ── IMPORTANT NOTES ─────────────────────────────────────────────────────
// • password + transferPin are bcrypt-hashed HERE in the script, because
//   the User model does not do it automatically.
// • If you later add a pre('save') hash hook to User.js, remove the
//   hashing block below or credentials will be double-hashed.
// • Titan Blockchain Capital activity lives entirely in the Transaction
//   ledger. No separate Investment document.
// ────────────────────────────────────────────────────────────────────────

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

const USERNAME = 'dbbecker01';
const EMAIL    = 'Davebrennamanbecker@gmail.com';
const PLAIN_PASSWORD = 'dave2001bren';
const PLAIN_PIN      = '1949';

// Timeline
const OPENING_DATE  = new Date('2024-02-01T09:00:00');
const TX_START      = new Date('2024-02-05T00:00:00');
const PHASE2_START  = new Date('2025-10-01T00:00:00');
const TODAY         = new Date();
const CONTRACT_DATE = new Date(TODAY); CONTRACT_DATE.setHours(15, 0, 0, 0);

// Money
const OPENING_BALANCE      = 120_000;

// Pre-contract running balance is $1,874,210; the $198,000 STC Bahrain
// wire lands on top of that, so the FINAL checking balance is:
const PRE_CONTRACT_BALANCE = 1_874_210;
const STC_BAHRAIN_CREDIT   = 198_000;
const TARGET_CHECKING_END  = PRE_CONTRACT_BALANCE + STC_BAHRAIN_CREDIT; // 2,072,210

const SAVINGS_MONTHLY      = 5_000;

const ACCENTURE_WEEKLY     = 3_088;
const CAREGIVER_WEEKLY     = 750;
const RENT_MONTHLY         = 4_500;

const TITAN_PHASE1      = [50_000, 100_000];
const TITAN_PHASE2      = [100_000, 300_000];
const TITAN_MARGIN      = [1.10, 1.25];

const CHECKING_NUMBER   = '4021887634';
const SAVINGS_NUMBER    = '7719203488';
const ROUTING_NUMBER    = '082000549';
const DEBIT_CARD_LAST4  = '4412';
const CREDIT_CARD_LAST4 = '8801';
const CREDIT_LIMIT      = 500_000;

const TX_TYPE = { CREDIT: 'deposit', DEBIT: 'withdrawal' };

const AUTOPAYS = [
  { name: 'Apple TV+',            amount:    9.99, day: 2,  category: 'Entertainment' },
  { name: 'Apple Music',          amount:   10.99, day: 3,  category: 'Entertainment' },
  { name: 'Apple TV',             amount:    9.99, day: 4,  category: 'Entertainment' },
  { name: 'Amazon Prime',         amount:   14.99, day: 5,  category: 'Shopping'      },
  { name: 'Netflix',              amount:   22.99, day: 6,  category: 'Entertainment' },
  { name: 'Apple Card Recharge',  amount: 1500.00, day: 12, category: 'Credit Card'   },
];

const CAREGIVER = {
  name:          'Maria Santos',
  bank:          'Chase Bank',
  accountNumber: '•••• 4821',
  routingNumber: '021000021',
};

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
const sameMonth = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

/** Strip every " — " (em dash surrounded by spaces) from a description. */
const clean = (s) => String(s).replace(/\s*—\s*/g, ' ').replace(/\s+/g, ' ').trim();

async function loadBcrypt() {
  try { return (await import('bcrypt')).default; } catch {}
  try { return (await import('bcryptjs')).default; } catch {}
  return null;
}

// ═════════════════════════════════════════════════════════════════════════
//  Ledger builder
// ═════════════════════════════════════════════════════════════════════════

const ledger = [];

function push(date, description, amount, meta = {}) {
  const isCredit = amount >= 0;
  ledger.push({
    date,
    description: clean(description),
    amount: round2(Math.abs(amount)),
    direction: isCredit ? 'credit' : 'debit',
    type: isCredit ? TX_TYPE.CREDIT : TX_TYPE.DEBIT,
    status: 'Completed',
    ...meta,
  });
}

const GROCERY = [
  ['Walmart Supercenter', 65, 320],
  ['Kroger',              55, 240],
  ['Harps Foods',         40, 185],
  ["Brookshire's",        45, 200],
];
const GAS = [
  ['Shell',      38, 84],
  ['Exxon',      40, 88],
  ['Murphy USA', 32, 78],
  ['Valero',     35, 80],
];
const COFFEE = [
  ['Starbucks',          6, 24],
  ['Starbucks Reserve',  9, 28],
];
const DINING = [
  ['Chick-fil-A',      12,  34],
  ['Olive Garden',     42, 118],
  ['Texas Roadhouse',  38,  95],
  ['Whataburger',      10,  28],
  ['Local Diner',      18,  52],
];
const PHARMACY = [
  ['CVS Pharmacy', 28, 240],
  ['Walgreens',    25, 180],
];
const MEDICAL = [
  ['Crossett Health Center',        150, 1800],
  ['Ashley County Medical Center',  200, 2400],
];
const SHOPPING = [
  ['Amazon',        25,  620],
  ['Zara',          80,  460],
  ['Ralph Lauren', 120,  940],
  ['Chrome Hearts',420, 3600],
  ['Suitsupply',   520, 2300],
  ['Tom Ford',     320, 2600],
  ['Nordstrom',     90,  780],
];
const ESSENTIALS = [
  ['Foot Locker',   90,  360],
  ['Nike',          85,  340],
  ['Watch Station',180, 2400],
  ["Macy's",        60,  420],
  ['Best Buy',      80,  900],
];

function buildLedger() {
  const titanDeposits = new Map();

  const cursor = new Date(TX_START);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(TODAY);
  end.setHours(23, 59, 59, 999);

  while (cursor <= end) {
    const d      = new Date(cursor);
    const dom    = d.getDate();
    const dow    = d.getDay();
    const month  = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const ph2    = d >= PHASE2_START;
    const thisMo = sameMonth(d, TODAY);

    if (dow === 1) {
      push(at(d, 9, 0), 'Accenture Weekly Payroll Direct Deposit',
        ACCENTURE_WEEKLY, {
          kind: 'payroll', category: 'Income', method: 'ACH',
          merchant: 'Accenture', reference: 'ACC-PAY-' + month,
        });
    }

    if (dow === 5) {
      push(at(d, 11, 30), `Weekly Transfer ${CAREGIVER.name} (Caregiver)`,
        -CAREGIVER_WEEKLY, {
          kind: 'caregiver', category: 'Transfer', method: 'ACH',
          merchant: CAREGIVER.name, counterparty: CAREGIVER,
        });
    }

    if (dom === 1) {
      push(at(d, 8, 0), 'Monthly Rent 304 Main St, Crossett AR',
        -RENT_MONTHLY, {
          kind: 'rent', category: 'Housing', method: 'ACH',
          merchant: 'Crossett Property Management', isAutomatic: true,
        });
    }

    if (dom === 2) {
      push(at(d, 8, 30), `Transfer to Savings •••• ${SAVINGS_NUMBER.slice(-4)}`,
        -SAVINGS_MONTHLY, {
          kind: 'savings-transfer', category: 'Transfer', method: 'Internal',
        });
    }

    for (const sub of AUTOPAYS) {
      if (dom === sub.day) {
        push(at(d, 7, sub.day), `${sub.name} Subscription (AutoPay)`,
          -sub.amount, {
            kind: 'subscription', category: sub.category,
            merchant: sub.name, method: 'Card', isAutomatic: true,
          });
      }
    }

    if (dom === 4) {
      const amt = ph2 ? rand(...TITAN_PHASE2) : rand(...TITAN_PHASE1);
      titanDeposits.set(month, amt);
      push(at(d, 10, 0), 'Titan Blockchain Capital Deposit',
        -round2(amt), {
          kind: 'titan-debit', category: 'Investment', method: 'Wire',
          merchant: 'Titan Blockchain Capital',
        });
    }

    if (dom === 18) {
      const base = titanDeposits.get(month)
        ?? (ph2 ? rand(...TITAN_PHASE2) : rand(...TITAN_PHASE1));
      const profit = base * rand(...TITAN_MARGIN);
      push(at(d, 14, 0), 'Titan Blockchain Capital Profit Payout',
        round2(profit), {
          kind: 'titan-credit', category: 'Investment', method: 'Wire',
          merchant: 'Titan Blockchain Capital',
        });
    }

    if (dom === 27 && Math.random() < 0.45) {
      const amt = ph2 ? rand(20_000, 90_000) : rand(8_000, 40_000);
      push(at(d, 16, 15), 'Titan Blockchain Capital Profit Payout',
        round2(amt), {
          kind: 'titan-credit', category: 'Investment', method: 'Wire',
          merchant: 'Titan Blockchain Capital',
        });
    }

    if (thisMo) {
      if (dom === 8) {
        push(at(d, 13, 20),
          "Crossett Health Center Grandma's Medication & Treatment",
          -rand(950, 2400), {
            kind: 'medical', category: 'Healthcare', method: 'Card',
            merchant: 'Crossett Health Center',
          });
      }
      if (dom === 11) {
        push(at(d, 16, 45), "CVS Pharmacy Grandma's Prescriptions",
          -rand(120, 380), {
            kind: 'pharmacy', category: 'Healthcare', method: 'Card',
            merchant: 'CVS Pharmacy',
          });
      }
      if (dom === 14) {
        push(at(d, 18, 10), "CVS Pharmacy Grandma's Medicine Refill",
          -rand(90, 320), {
            kind: 'pharmacy', category: 'Healthcare', method: 'Card',
            merchant: 'CVS Pharmacy',
          });
      }
    }

    const isContractDay =
      d.getFullYear() === TODAY.getFullYear() &&
      d.getMonth()    === TODAY.getMonth()    &&
      d.getDate()     === TODAY.getDate();

    const spendHour = (lo, hi) =>
      isContractDay ? randInt(lo, Math.min(hi, 14)) : randInt(lo, hi);

    if (Math.random() < 0.28) {
      const [n, a, b] = pick(GROCERY);
      push(at(d, spendHour(9, 20), randInt(0, 59)), `${n} Groceries`,
        -rand(a, b), { category: 'Groceries', merchant: n, method: 'Card' });
    }
    if (Math.random() < 0.26) {
      const [n, a, b] = pick(GAS);
      push(at(d, spendHour(7, 21), randInt(0, 59)), `${n} Fuel`,
        -rand(a, b), { category: 'Gas', merchant: n, method: 'Card' });
    }
    if (Math.random() < 0.42) {
      const [n, a, b] = pick(COFFEE);
      push(at(d, spendHour(6, 10), randInt(0, 59)), `${n}`,
        -rand(a, b), { category: 'Dining', merchant: n, method: 'Card' });
    }
    if (Math.random() < 0.20) {
      const [n, a, b] = pick(DINING);
      push(at(d, spendHour(12, 21), randInt(0, 59)), `${n}`,
        -rand(a, b), { category: 'Dining', merchant: n, method: 'Card' });
    }
    if (Math.random() < 0.16) {
      const [n, a, b] = pick(PHARMACY);
      push(at(d, spendHour(9, 19), randInt(0, 59)),
        `${n} Grandma's Medication`, -rand(a, b),
        { category: 'Healthcare', merchant: n, method: 'Card' });
    }
    if (Math.random() < 0.09) {
      const [n, a, b] = pick(MEDICAL);
      push(at(d, spendHour(9, 17), randInt(0, 59)), `${n} Medical Bill`,
        -rand(a, b), { category: 'Healthcare', merchant: n, method: 'Card' });
    }
    if (Math.random() < 0.30) {
      const [n, a, b] = pick(SHOPPING);
      push(at(d, spendHour(10, 22), randInt(0, 59)), `${n} Purchase`,
        -rand(a, b), { category: 'Shopping', merchant: n, method: 'Card' });
    }
    if (Math.random() < 0.10) {
      const [n, a, b] = pick(ESSENTIALS);
      push(at(d, spendHour(10, 21), randInt(0, 59)), `${n} Everyday Essentials`,
        -rand(a, b), { category: 'Shopping', merchant: n, method: 'Card' });
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  // ── STC Bahrain settlement — TODAY at 15:00 (final entry) ──────────
  push(CONTRACT_DATE, 'STC Bahrain', STC_BAHRAIN_CREDIT, {
    kind: 'stc-bahrain', category: 'Income', method: 'Wire',
    merchant: 'STC Bahrain', reference: 'STC-BH-' + TODAY.toISOString().slice(0, 10),
  });

  return ledger;
}

// ═════════════════════════════════════════════════════════════════════════
//  Main
// ═════════════════════════════════════════════════════════════════════════

const run = async () => {
  const bcrypt = await loadBcrypt();
  if (!bcrypt) {
    console.error('❌ Neither "bcrypt" nor "bcryptjs" is installed.');
    console.error('   Run:  npm install bcryptjs');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  // ── Wipe any previous Dave Becker data ─────────────────────────────
  const existing = await User.findOne({
    $or: [{ username: USERNAME }, { email: EMAIL }],
  }).select('_id').lean();

  if (existing) {
    const accs = await Account.find({ userId: existing._id }).select('_id').lean();
    const ids = accs.map((a) => a._id);
    await Transaction.deleteMany({ accountId: { $in: ids } });
    await Card.deleteMany({ userId: existing._id });
    await Account.deleteMany({ _id: { $in: ids } });
    await User.deleteOne({ _id: existing._id });
    console.log('🧹 Removed previous Dave Becker user + linked data\n');
  }

  // ── Hash credentials ───────────────────────────────────────────────
  const SALT_ROUNDS = 10;
  const passwordHash    = await bcrypt.hash(PLAIN_PASSWORD, SALT_ROUNDS);
  const transferPinHash = await bcrypt.hash(PLAIN_PIN, SALT_ROUNDS);

  // ── Create the user ────────────────────────────────────────────────
  const user = await User.create({
    firstName: 'Dave',
    middleName: 'Brennaman',
    lastName: 'Becker',
    fullName: 'Dave Brennaman Becker',
    email: EMAIL,
    phone: '+18182780024',
    username: USERNAME,

    password:    passwordHash,
    transferPin: transferPinHash,

    dateOfBirth: new Date('2001-02-11T00:00:00Z'),
    address: {
      street: '304 Main St',
      city: 'Crossett',
      state: 'AR',
      zip: '71635',
      postalCode: '71635',
      country: 'United States',
    },
    country: 'United States',

    creditScore: 736,
    creditScoreChange: 2,
    creditScoreUpdatedAt: TODAY,
    creditScoreHistory: [
      { score: 734, date: new Date(TODAY.getFullYear(), TODAY.getMonth() - 1, 15) },
      { score: 736, date: TODAY },
    ],

    status: 'Active',
    role: 'user',
    emailVerified: true,
    kycVerified: true,
  });

  console.log(`🎯 User created: ${user.fullName ?? 'Dave Brennaman Becker'}`);
  console.log(`   ${EMAIL} (${user._id})`);
  console.log(`   Username: ${USERNAME}`);
  console.log(`   Password: bcrypt-hashed ✓`);
  console.log(`   Transfer PIN: bcrypt-hashed ✓`);
  console.log(`   Credit score: 736 (+2 this month)\n`);

  // ── Build ledger + enforce "STC Bahrain is the last entry" ─────────
  console.log('⏳ Building transaction history…');
  const raw = buildLedger();
  raw.sort((a, b) => a.date - b.date);

  const contractTime = CONTRACT_DATE.getTime();
  const trimmed = raw.filter(
    (t) => t.kind === 'stc-bahrain' || t.date.getTime() <= contractTime,
  );

  // ── Safety pass: never let the balance go negative ─────────────────
  let running = OPENING_BALANCE;
  const kept = [];
  for (const t of trimmed) {
    if (t.direction === 'debit') {
      const allowed = running - 1000;
      if (allowed <= 0) continue;
      if (t.amount > allowed) t.amount = round2(allowed);
      running -= t.amount;
    } else {
      running += t.amount;
    }
    kept.push(t);
  }

  // ── Balance the books so pre-contract running balance = 1,874,210 ──
  const titanCredits = kept.filter((t) => t.kind === 'titan-credit');
  const titanTotal   = titanCredits.reduce((s, t) => s + t.amount, 0);

  if (titanCredits.length && titanTotal > 0) {
    const diff  = PRE_CONTRACT_BALANCE - (running - STC_BAHRAIN_CREDIT);
    const scale = (titanTotal + diff) / titanTotal;

    if (scale < 0.4 || scale > 2.5) {
      console.warn(`⚠️  Titan payout scale is ${scale.toFixed(3)} — target balance is far from generated total.`);
    }
    titanCredits.forEach((t) => {
      t.amount = Math.max(1, Math.round(t.amount * scale));
    });
  }

  // Recompute + absorb any rounding residual into the last Titan payout
  let finalBalance = OPENING_BALANCE;
  for (const t of kept) {
    finalBalance += t.direction === 'credit' ? t.amount : -t.amount;
  }
  const residual = round2(TARGET_CHECKING_END - finalBalance);
  if (Math.abs(residual) >= 0.01 && titanCredits.length) {
    const last = titanCredits[titanCredits.length - 1];
    last.amount = round2(last.amount + residual);
  }

  // ── Walking balance for each entry ─────────────────────────────────
  let bal = OPENING_BALANCE;
  for (const t of kept) {
    bal = round2(bal + (t.direction === 'credit' ? t.amount : -t.amount));
    t.balanceAfter = bal;
  }
  finalBalance = bal;

  // ── Create accounts ────────────────────────────────────────────────
  const savingsTotal = kept
    .filter((t) => t.kind === 'savings-transfer')
    .reduce((s, t) => s + t.amount, 0);

  const checking = await Account.create({
    userId: user._id,
    type: 'Checking',
    subType: null,
    accountNumber: CHECKING_NUMBER,
    routingNumber: ROUTING_NUMBER,
    nickname: 'Everyday Checking',
    currency: 'USD',
    totalBalance: finalBalance,
    availableBalance: finalBalance,
    pendingBalance: 0,
    interestRate: 0.01,
    status: 'Active',
    isPrimary: true,
    openedAt: OPENING_DATE,
  });

  const savings = await Account.create({
    userId: user._id,
    type: 'Savings',
    subType: 'High Yield',
    accountNumber: SAVINGS_NUMBER,
    routingNumber: ROUTING_NUMBER,
    nickname: 'High-Yield Savings',
    currency: 'USD',
    totalBalance: round2(savingsTotal),
    availableBalance: round2(savingsTotal),
    pendingBalance: 0,
    interestRate: 4.25,
    status: 'Active',
    isPrimary: false,
    openedAt: OPENING_DATE,
  });

  // ── Create cards ───────────────────────────────────────────────────
  const debitExpiry  = { month: '09', year: '2029' };
  const creditExpiry = { month: '03', year: '2030' };
  const DEBIT_FULL   = `441288011234${DEBIT_CARD_LAST4}`;
  const CREDIT_FULL  = `441288019876${CREDIT_CARD_LAST4}`;
  const checkingLabel = `Checking •••• ${CHECKING_NUMBER.slice(-4)}`;

  await Card.create([
    {
      userId: user._id,
      cardName: 'Dave B. Becker',
      cardholderName: 'DAVE B. BECKER',
      type: 'Debit',
      fullNumber: DEBIT_FULL,
      cvv: '412',
      expiryMonth: debitExpiry.month,
      expiryYear:  debitExpiry.year,

      linkedAccountId:    checking._id,
      linkedAccountType:  'Checking',
      linkedAccountLabel: checkingLabel,

      balance:         finalBalance,
      availableCredit: 0,
      creditLimit:     0,
      minimumPayment:  0,

      status: 'Active',
      controls: {
        locked: false, contactless: true, onlinePurchases: true,
        internationalPurchases: true, atmWithdrawals: true, notifications: true,
      },
      activity: [],
    },
    {
      userId: user._id,
      cardName: 'Dave B. Becker',
      cardholderName: 'DAVE B. BECKER',
      type: 'Credit',
      fullNumber: CREDIT_FULL,
      cvv: '889',
      expiryMonth: creditExpiry.month,
      expiryYear:  creditExpiry.year,

      linkedAccountId:    checking._id,
      linkedAccountType:  'Checking',
      linkedAccountLabel: checkingLabel,

      balance:         0,
      availableCredit: CREDIT_LIMIT,
      creditLimit:     CREDIT_LIMIT,
      minimumPayment:  0,
      paymentDueDate:  null,
      nextStatementDate: null,

      status: 'Active',
      controls: {
        locked: false, contactless: true, onlinePurchases: true,
        internationalPurchases: true, atmWithdrawals: false, notifications: true,
      },
      activity: [],
    },
  ]);

  // ── Insert transactions ────────────────────────────────────────────
  const docFor = (accountId, t) => ({
    userId: user._id,
    accountId,
    description: clean(t.description),
    amount: t.amount,
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
    counterparty: t.counterparty,
  });

  const checkingDocs = [
    {
      userId: user._id,
      accountId: checking._id,
      description: 'Opening Deposit',
      amount: OPENING_BALANCE,
      type: TX_TYPE.CREDIT,
      status: 'Completed',
      date: OPENING_DATE,
      balanceAfter: OPENING_BALANCE,
      direction: 'credit',
      category: 'Income',
      method: 'Branch',
    },
    ...kept.map((t) => docFor(checking._id, t)),
  ];

  const savingsDocs = kept
    .filter((t) => t.kind === 'savings-transfer')
    .map((t) => ({
      userId: user._id,
      accountId: savings._id,
      description: `Transfer from Checking •••• ${CHECKING_NUMBER.slice(-4)}`,
      amount: t.amount,
      type: TX_TYPE.CREDIT,
      status: 'Completed',
      date: t.date,
      direction: 'credit',
      category: 'Transfer',
      method: 'Internal',
    }));

  console.log(`⏳ Inserting ${checkingDocs.length + savingsDocs.length} transactions…\n`);
  await Transaction.insertMany(checkingDocs, { ordered: false });
  if (savingsDocs.length) {
    await Transaction.insertMany(savingsDocs, { ordered: false });
  }

  // ── Summary ────────────────────────────────────────────────────────
  const totalBalance = finalBalance + savingsTotal;

  console.log('════════════════════════════════════════════');
  console.log('  ACCOUNTS');
  console.log('════════════════════════════════════════════');
  console.log(`  Checking •••• ${CHECKING_NUMBER.slice(-4)}   ${money(finalBalance)}`);
  console.log(`     └ Debit card  •••• ${DEBIT_CARD_LAST4} (linked to checking)`);
  console.log(`     └ Credit card •••• ${CREDIT_CARD_LAST4} (limit ${money(CREDIT_LIMIT)}, unused)`);
  console.log(`  Savings  •••• ${SAVINGS_NUMBER.slice(-4)}   ${money(savingsTotal)}  @ 4.25% APY`);
  console.log('────────────────────────────────────────────');
  console.log(`  TOTAL                          ${money(totalBalance)}`);
  console.log('════════════════════════════════════════════\n');

  console.log('  Automatic payments:');
  for (const a of AUTOPAYS) {
    console.log(`   • ${a.name.padEnd(22)} ${money(a.amount).padStart(10)}  on the ${a.day}${ordinal(a.day)}`);
  }

  console.log('\n  History:');
  console.log(`   • ${new Date('2024-02-01').toDateString()} → opening deposit ${money(OPENING_BALANCE)}`);
  console.log(`   • ${new Date('2024-02-05').toDateString()} → daily activity begins`);
  console.log(`   • ${PHASE2_START.toDateString()} → Titan deposits increase to $100k–$300k`);
  console.log(`   • Pre-contract balance target: ${money(PRE_CONTRACT_BALANCE)}`);
  console.log(`   • ${CONTRACT_DATE.toDateString()} 15:00 → STC Bahrain ${money(STC_BAHRAIN_CREDIT)} (FINAL)`);
  console.log(`   • Final checking balance: ${money(finalBalance)}`);
  console.log(`   • ${checkingDocs.length + savingsDocs.length} transactions generated`);

  console.log('\n🎉 Done — log in as Dave Brennaman Becker.');
  console.log(`   Username: ${USERNAME}`);
  console.log(`   Password: ${PLAIN_PASSWORD}`);
  console.log(`   Transfer PIN: ${PLAIN_PIN}\n`);

  await mongoose.disconnect();
  process.exit();
};

function ordinal(n) {
  if (n > 3 && n < 21) return 'th';
  switch (n % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

run().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});