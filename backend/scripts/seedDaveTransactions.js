// scripts/seedDaveTransactions.js
//
// Dave Brennaman Becker — full transaction history.
//
// RECONCILIATION TARGET:
//   Checking + Savings = $2,072,210.00   ← what the dashboard header shows
//
// Latest activity on the 19th:
//   15:00  STC Bahrain Contract Settlement  +$198,000
//   17:45  Flight Ticket Booking            -$1,300
//
// Titan Blockchain Capital deposit schedule:
//   • Feb 2024              → $5,000
//   • Mar 2024              → $15,000
//   • Apr 2024 – Sep 2025   → $5,000 / month
//   • Oct 2025 – present    → $20,000 – $50,000 / month
//
// Minimum 74 transactions per calendar month.
//
// ── RUN ORDER ──────────────────────────────────────────────────────────
//   1.  node scripts/clearAllTransactions.js --user dbbecker01
//   2.  node scripts/seedDaveTransactions.js
//   3.  node scripts/fixDaveCards.js
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

const OPENING_DATE  = new Date('2024-02-01T09:00:00');
const TX_START      = new Date('2024-02-05T00:00:00');
const PHASE2_START  = new Date('2025-10-01T00:00:00');
const TODAY         = new Date();

const MIN_TX_PER_MONTH = 74;

const STC_DATE = (() => {
  const d = new Date(TODAY);
  d.setDate(19);
  d.setHours(15, 0, 0, 0);
  if (d > TODAY) d.setMonth(d.getMonth() - 1);
  return d;
})();

// Flight ticket — same day as STC, later in the afternoon
const FLIGHT_DATE = (() => {
  const d = new Date(STC_DATE);
  d.setHours(17, 45, 0, 0);
  return d;
})();

const TARGET_TOTAL_BALANCE = 2_072_210;

const OPENING_BALANCE    = 120_000;
const STC_BAHRAIN_CREDIT = 198_000;
const FLIGHT_DEBIT       = 1_300;

const SAVINGS_MONTHLY    = 5_000;
const ACCENTURE_WEEKLY   = 3_088;
const CAREGIVER_WEEKLY   = 750;
const RENT_MONTHLY       = 4_500;

const TITAN_DEBIT_FIRST  = 5_000;
const TITAN_DEBIT_SECOND = 15_000;
const TITAN_DEBIT_BASE   = 5_000;
const TITAN_DEBIT_PHASE2 = [20_000, 50_000];

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
const monthKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const clean = (s) => String(s).replace(/\s*—\s*/g, ' ').replace(/\s+/g, ' ').trim();

// ═════════════════════════════════════════════════════════════════════════
//  Merchant pools
// ═════════════════════════════════════════════════════════════════════════

const GROCERY    = [['Walmart Supercenter',65,320],['Kroger',55,240],['Harps Foods',40,185],["Brookshire's",45,200]];
const GAS        = [['Shell',38,84],['Exxon',40,88],['Murphy USA',32,78],['Valero',35,80]];
const COFFEE     = [['Starbucks',6,24],['Starbucks Reserve',9,28]];
const DINING     = [['Chick-fil-A',12,34],['Olive Garden',42,118],['Texas Roadhouse',38,95],['Whataburger',10,28],['Local Diner',18,52]];
const PHARMACY   = [['CVS Pharmacy',28,240],['Walgreens',25,180]];
const MEDICAL    = [['Crossett Health Center',150,1800],['Ashley County Medical Center',200,2400]];
const SHOPPING   = [['Amazon',25,620],['Zara',80,460],['Ralph Lauren',120,940],['Chrome Hearts',420,3600],['Suitsupply',520,2300],['Tom Ford',320,2600],['Nordstrom',90,780]];
const ESSENTIALS = [['Foot Locker',90,360],['Nike',85,340],['Watch Station',180,2400],["Macy's",60,420],['Best Buy',80,900]];

// ═════════════════════════════════════════════════════════════════════════
//  Ledger
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

function randomSpend(date, hour) {
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
}

function buildBaseLedger() {
  const titanDebitsByMonth = new Map();
  const titanCreditSlots   = [];
  let titanDebitCount = 0;

  const cursor = new Date(TX_START);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(TODAY);
  end.setHours(23, 59, 59, 999);

  while (cursor <= end) {
    const d      = new Date(cursor);
    const dom    = d.getDate();
    const dow    = d.getDay();
    const month  = monthKey(d);
    const thisMo = d.getFullYear() === TODAY.getFullYear() &&
                   d.getMonth()    === TODAY.getMonth();

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

    // Titan DEBIT — day 6
    if (dom === 6) {
      titanDebitCount++;
      let debit;
      if (titanDebitCount === 1)      debit = TITAN_DEBIT_FIRST;
      else if (titanDebitCount === 2) debit = TITAN_DEBIT_SECOND;
      else if (d >= PHASE2_START)     debit = round2(rand(...TITAN_DEBIT_PHASE2));
      else                            debit = TITAN_DEBIT_BASE;

      titanDebitsByMonth.set(month, debit);

      push(at(d, 10, 0),
        'Titan Blockchain Capital Investment Debit',
        -debit, {
          kind: 'titan-debit', category: 'Investment', method: 'Wire',
          merchant: 'Titan Blockchain Capital',
          reference: 'TBC-DEP-' + month,
        });
    }

    // Titan CREDIT slot — day 18 (amount filled in later)
    if (dom === 18) {
      const deposit = titanDebitsByMonth.get(month);
      if (deposit) {
        titanCreditSlots.push({ date: at(d, 14, 0), month, deposit });
      }
    }

    if (thisMo) {
      if (dom === 8) push(at(d, 13, 20),
        "Crossett Health Center Grandma's Medication & Treatment",
        -rand(950, 2400), {
          kind: 'medical', category: 'Healthcare', method: 'Card',
          merchant: 'Crossett Health Center',
        });
      if (dom === 11) push(at(d, 16, 45),
        "CVS Pharmacy Grandma's Prescriptions",
        -rand(120, 380), {
          kind: 'pharmacy', category: 'Healthcare', method: 'Card',
          merchant: 'CVS Pharmacy',
        });
      if (dom === 14) push(at(d, 18, 10),
        "CVS Pharmacy Grandma's Medicine Refill",
        -rand(90, 320), {
          kind: 'pharmacy', category: 'Healthcare', method: 'Card',
          merchant: 'CVS Pharmacy',
        });
    }

    const isStcDay =
      d.getFullYear() === STC_DATE.getFullYear() &&
      d.getMonth()    === STC_DATE.getMonth()    &&
      d.getDate()     === STC_DATE.getDate();

    const count = randInt(4, 6);
    for (let i = 0; i < count; i++) {
      randomSpend(d, isStcDay ? randInt(6, 14) : randInt(6, 22));
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  // ── STC Bahrain Contract Settlement — 19th @ 15:00 ────────────────
  push(STC_DATE, 'STC Bahrain Contract Settlement', STC_BAHRAIN_CREDIT, {
    kind: 'stc-bahrain', category: 'Income', method: 'Wire',
    merchant: 'STC Bahrain',
    reference: 'STC-BH-' + STC_DATE.toISOString().slice(0, 10),
  });

  // ── Flight Ticket — 19th @ 17:45 (AFTER the STC wire) ─────────────
  push(FLIGHT_DATE, 'Flight Ticket Booking', -FLIGHT_DEBIT, {
    kind: 'flight', category: 'Travel', method: 'Card',
    merchant: 'American Airlines',
    reference: 'AA-' + FLIGHT_DATE.toISOString().slice(0, 10),
  });

  // ── Pad any month below 74 ─────────────────────────────────────────
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
      const isStcDay =
        d.getFullYear() === STC_DATE.getFullYear() &&
        d.getMonth()    === STC_DATE.getMonth()    &&
        d.getDate()     === STC_DATE.getDate();
      randomSpend(d, isStcDay ? randInt(6, 14) : randInt(6, 22));
      padded++;
    }
  }

  return { titanCreditSlots, padded };
}

// ═════════════════════════════════════════════════════════════════════════
//  Main
// ═════════════════════════════════════════════════════════════════════════

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  const user = await User.findOne({
    $or: [{ username: USERNAME }, { email: EMAIL }],
  }).lean();

  if (!user) {
    console.error(`❌ User not found — create Dave first (username: ${USERNAME})`);
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`🎯 User: ${user.firstName} ${user.lastName}  (${user._id})`);
  console.log(`   ${user.email}\n`);

  let checking = await Account.findOne({ userId: user._id, type: 'Checking' }).lean();
  let savings  = await Account.findOne({ userId: user._id, type: 'Savings'  }).lean();

  if (!checking) {
    checking = (await Account.create({
      userId: user._id, type: 'Checking', subType: null,
      accountNumber: CHECKING_NUMBER, routingNumber: ROUTING_NUMBER,
      nickname: 'Everyday Checking', currency: 'USD',
      totalBalance: 0, availableBalance: 0, pendingBalance: 0,
      interestRate: 0.01, status: 'Active', isPrimary: true,
      openedAt: OPENING_DATE,
    })).toObject();
    console.log('🆕 Created Checking account');
  }
  if (!savings) {
    savings = (await Account.create({
      userId: user._id, type: 'Savings', subType: 'High Yield',
      accountNumber: SAVINGS_NUMBER, routingNumber: ROUTING_NUMBER,
      nickname: 'High-Yield Savings', currency: 'USD',
      totalBalance: 0, availableBalance: 0, pendingBalance: 0,
      interestRate: 4.25, status: 'Active', isPrimary: false,
      openedAt: OPENING_DATE,
    })).toObject();
    console.log('🆕 Created Savings account');
  }

  await Transaction.deleteMany({ userId: user._id });
  console.log('🧹 Cleared existing transactions\n');

  console.log('⏳ Building transaction history…');
  const { titanCreditSlots, padded } = buildBaseLedger();
  if (padded) console.log(`   Padded ${padded} transaction(s) to reach ${MIN_TX_PER_MONTH}/month`);

  // ── Compute Titan credits needed so CHECKING + SAVINGS = TARGET ────
  let sumCreditsWithoutTitan = 0;
  let sumDebitsTotal         = 0;
  let savingsTransferTotal   = 0;

  for (const t of ledger) {
    if (t.kind === 'titan-credit') continue;
    if (t.direction === 'credit') {
      sumCreditsWithoutTitan += t.amount;
    } else {
      sumDebitsTotal += t.amount;
      if (t.kind === 'savings-transfer') savingsTransferTotal += t.amount;
    }
  }

  const nonTransferDebits = sumDebitsTotal - savingsTransferTotal;
  const totalWithoutTitan =
    OPENING_BALANCE + sumCreditsWithoutTitan - nonTransferDebits;
  const titanCreditsTotal = TARGET_TOTAL_BALANCE - totalWithoutTitan;

  if (titanCreditsTotal <= 0) {
    console.error('❌ Titan credits would be negative — check config.');
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`   Titan credits needed: ${money(titanCreditsTotal)} across ${titanCreditSlots.length} payouts`);
  console.log(`   Average Titan payout: ${money(titanCreditsTotal / titanCreditSlots.length)}\n`);

  const totalDeposits = titanCreditSlots.reduce((s, x) => s + x.deposit, 0);
  for (const slot of titanCreditSlots) {
    const weight = slot.deposit / totalDeposits;
    const amount = round2(titanCreditsTotal * weight);
    push(slot.date, 'Titan Blockchain Capital Profit Credit', amount, {
      kind: 'titan-credit', category: 'Investment', method: 'Wire',
      merchant: 'Titan Blockchain Capital',
      reference: 'TBC-PRO-' + slot.month,
    });
  }

  // Fix rounding residual on the LAST Titan credit
  ledger.sort((a, b) => a.date - b.date);
  const titanCreditDocs = ledger.filter((t) => t.kind === 'titan-credit');

  const savingsFinal = round2(savingsTransferTotal);
  let sumRunning = OPENING_BALANCE;
  for (const t of ledger) {
    sumRunning += t.direction === 'credit' ? t.amount : -t.amount;
  }
  const checkingFinal = round2(sumRunning);
  const combinedNow   = round2(checkingFinal + savingsFinal);
  const residual      = round2(TARGET_TOTAL_BALANCE - combinedNow);

  if (Math.abs(residual) >= 0.01 && titanCreditDocs.length) {
    const last = [...titanCreditDocs].sort((a, b) => b.date - a.date)[0];
    last.amount = round2(last.amount + residual);
  }

  // Recompute walking balances
  let running = OPENING_BALANCE;
  for (const t of ledger) {
    running = round2(running + (t.direction === 'credit' ? t.amount : -t.amount));
    t.balanceAfter = running;
  }
  const finalCheckingBalance = running;
  const finalSavingsBalance  = savingsFinal;
  const finalCombined        = round2(finalCheckingBalance + finalSavingsBalance);

  if (Math.abs(finalCombined - TARGET_TOTAL_BALANCE) > 0.01) {
    console.error(`❌ Reconciliation failed: got ${money(finalCombined)}, expected ${money(TARGET_TOTAL_BALANCE)}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  // ── Insert transactions ────────────────────────────────────────────
  const docFor = (accountId, t) => ({
    userId: user._id,
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
    ...ledger.map((t) => docFor(checking._id, t)),
  ];

  const savingsDocs = ledger
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

  console.log(`⏳ Inserting ${checkingDocs.length + savingsDocs.length} transaction(s)…\n`);
  await Transaction.insertMany(checkingDocs, { ordered: false });
  if (savingsDocs.length) {
    await Transaction.insertMany(savingsDocs, { ordered: false });
  }

  // ── Sync account + card balances ───────────────────────────────────
  await Account.updateOne(
    { _id: checking._id },
    { $set: {
      totalBalance: finalCheckingBalance,
      availableBalance: finalCheckingBalance,
      pendingBalance: 0,
    } },
  );
  await Account.updateOne(
    { _id: savings._id },
    { $set: {
      totalBalance: finalSavingsBalance,
      availableBalance: finalSavingsBalance,
      pendingBalance: 0,
    } },
  );
  await Card.updateMany(
    { userId: user._id, type: 'Debit' },
    { $set: { balance: finalCheckingBalance } },
  );
  await Card.updateMany(
    { userId: user._id, type: 'Credit' },
    { $set: { balance: CREDIT_LIMIT, availableCredit: 0, creditLimit: CREDIT_LIMIT } },
  );

  // ── Reconciliation report ──────────────────────────────────────────
  const monthlyCounts = new Map();
  for (const t of ledger) {
    const k = monthKey(t.date);
    monthlyCounts.set(k, (monthlyCounts.get(k) || 0) + 1);
  }
  const belowMin = [...monthlyCounts.entries()].filter(([, n]) => n < MIN_TX_PER_MONTH);

  let payrollTotal = 0, titanDebitsTotal = 0, titanCreditsSum = 0;
  let caregiverTotal = 0, rentTotal = 0, subsTotal = 0;
  for (const t of ledger) {
    if (t.kind === 'payroll') payrollTotal += t.amount;
    if (t.kind === 'titan-debit') titanDebitsTotal += t.amount;
    if (t.kind === 'titan-credit') titanCreditsSum += t.amount;
    if (t.kind === 'caregiver') caregiverTotal += t.amount;
    if (t.kind === 'rent') rentTotal += t.amount;
    if (t.kind === 'subscription') subsTotal += t.amount;
  }
  const everydaySpend = sumDebitsTotal
    - titanDebitsTotal - caregiverTotal - rentTotal - subsTotal
    - savingsTransferTotal - FLIGHT_DEBIT;

  console.log('════════════════════════════════════════════');
  console.log('  RECONCILIATION');
  console.log('════════════════════════════════════════════');
  console.log(`  Opening balance                    ${money(OPENING_BALANCE).padStart(15)}`);
  console.log(`  + Accenture payroll                ${money(payrollTotal).padStart(15)}`);
  console.log(`  + Titan profit credits             ${money(titanCreditsSum).padStart(15)}`);
  console.log(`  + STC Bahrain contract settlement  ${money(STC_BAHRAIN_CREDIT).padStart(15)}`);
  console.log(`  - Titan investment debits         -${money(titanDebitsTotal).padStart(15)}`);
  console.log(`  - Monthly rent                    -${money(rentTotal).padStart(15)}`);
  console.log(`  - Caregiver payments              -${money(caregiverTotal).padStart(15)}`);
  console.log(`  - Subscriptions                   -${money(subsTotal).padStart(15)}`);
  console.log(`  - Everyday spending               -${money(everydaySpend).padStart(15)}`);
  console.log(`  - Flight ticket                    -${money(FLIGHT_DEBIT).padStart(15)}`);
  console.log('  ─────────────────────────────────────────────');
  console.log(`  COMBINED TOTAL                     ${money(finalCombined).padStart(15)}`);
  console.log('════════════════════════════════════════════\n');

  console.log('  Accounts:');
  console.log(`   Checking •••• ${CHECKING_NUMBER.slice(-4)}         ${money(finalCheckingBalance)}`);
  console.log(`   Savings  •••• ${SAVINGS_NUMBER.slice(-4)}         ${money(finalSavingsBalance)}`);
  console.log('');

  console.log('  Latest activity on the 19th:');
  console.log(`   15:00  STC Bahrain Contract Settlement   +${money(STC_BAHRAIN_CREDIT)}`);
  console.log(`   17:45  Flight Ticket Booking             -${money(FLIGHT_DEBIT)}`);
  console.log('');

  console.log(`  Total transactions inserted: ${checkingDocs.length + savingsDocs.length}`);
  console.log(`  Months with ≥ ${MIN_TX_PER_MONTH} transactions: ${monthlyCounts.size - belowMin.length} / ${monthlyCounts.size}`);
  if (belowMin.length) {
    console.log(`  ⚠️  Below minimum: ${belowMin.map(([k, n]) => `${k} (${n})`).join(', ')}`);
  }

  console.log('\n🎉 Done.\n');

  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});