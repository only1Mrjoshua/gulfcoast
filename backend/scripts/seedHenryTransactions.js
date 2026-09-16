// scripts/seedHenryTransactions.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// ---------------------------------------------------------
//  Configuration
// ---------------------------------------------------------
const USERNAME        = 'mrhenrydorian';
const TARGET_NET      = 1921752.00;
const MONTHLY_MIN_IN  = 500000;
const MONTHLY_MIN_OUT = 500000;

const START_YEAR = 2023;
const START_MONTH = 0;
const START_DAY = 3;

// End date is dynamic: today.
const TODAY = new Date();
const END_YEAR  = TODAY.getFullYear();
const END_MONTH = TODAY.getMonth();
const END_DAY   = TODAY.getDate();

const WIRE_FEE = 25;
const OPENING_DEPOSIT = 100000;
const SYNC_ACCOUNT_BALANCE = true;

// Every month must have more than 100 and no more than 150 transactions.
const MIN_TX_PER_MONTH = 100;
const MAX_TX_PER_MONTH = 150;

// Hard cap on any single generated credit or debit chunk.
const MAX_CHUNK = 48000;

// ---------------------------------------------------------
//  Recurring income schedules
// ---------------------------------------------------------
// Datalare weekly check deposits (Wednesdays).
// Only $4,050/week starting July 1, 2025.
const DATALARE_WEEKLY_AMOUNT = 4050;
const DATALARE_START = new Date(2025, 6, 1); // Jul 1, 2025

// Titan Blockchain Capital profit earnings.
// $9,850 weekly on Fridays, starting Oct 3, 2025.
const TITAN_WEEKLY_AMOUNT = 9850;
const TITAN_START         = new Date(2025, 9, 3); // Fri Oct 3, 2025

// ---------------------------------------------------------
//  One-off transactions
// ---------------------------------------------------------
// $15,000 card debit to Binance, placed just before the Titan payouts begin.
const BINANCE_CARD_DEBIT = {
  amount: 15000,
  date: new Date(2025, 8, 28, 11, 0, 0), // Sep 28, 2025
};

// Two wire debits to Francis Dorian at Chase Bank: $9,600 each,
// one last year and one this year.
const FRANCIS_WIRES = [
  { amount: 9600, date: new Date(END_YEAR - 1, 10, 20, 11, 0, 0) }, // last year (Nov 20)
  { amount: 9600, date: new Date(END_YEAR, 4, 20, 11, 0, 0) },      // this year (May 20)
];

// ---------------------------------------------------------
//  Merchant pools
// ---------------------------------------------------------
const GROCERY_STORES = [
  'Walmart', 'Kroger', 'Whole Foods Market', 'Trader Joes', 'Publix',
  'Safeway', 'Albertsons', 'H-E-B', 'Wegmans', 'Sprouts Farmers Market',
  'Aldi', 'Lidl', 'Food Lion', 'Meijer', 'Hy-Vee', 'Giant Food',
  'Stop and Shop', 'Harris Teeter', 'Piggly Wiggly', 'WinCo Foods',
  'Fresh Market', 'ShopRite', 'Giant Eagle', 'Ralphs', 'Vons',
  'Fred Meyer', 'King Soopers', 'Smiths', 'Jewel-Osco', 'Central Market',
];

const COFFEE_SHOPS = [
  'Starbucks', 'Dunkin', 'Peets Coffee', 'Dutch Bros', 'Caribou Coffee',
  'The Coffee Bean and Tea Leaf', 'Tim Hortons', 'Philz Coffee',
  'Blue Bottle Coffee', 'Intelligentsia Coffee', 'Stumptown Coffee Roasters',
  'La Colombe', 'Gregorys Coffee', 'Joe Coffee Company', 'Blank Street Coffee',
  'Equator Coffees', 'Biggby Coffee', 'Scooters Coffee', '7 Brew Coffee',
  'Qahwah House',
];

const RESTAURANTS = [
  'Cheesecake Factory', 'Texas Roadhouse', 'Olive Garden',
  'Ruths Chris Steak House', 'Applebee', 'Chilis', 'Outback Steakhouse',
  'Yard House', 'P.F. Changs', 'Red Lobster', 'Cracker Barrel',
  'Seasons 52', 'Bonefish Grill', 'Carrabbas Italian Grill',
  'Maggianos Little Italy', 'Flemings Prime Steakhouse',
  'The Capital Grille', 'Eddie Vs', 'Del Friscos', 'Mortons',
];

const STEAKHOUSES = [
  'COTE', 'Peter Luger Steak House', 'Keens Steakhouse',
  'Wolfgangs Steakhouse', 'Smith and Wollensky', 'The Capital Grille',
  'Ruths Chris Steak House', 'Mortons The Steakhouse',
  'Del Friscos Double Eagle Steakhouse', 'STK Steakhouse',
  'Mastros Steakhouse', 'Flemings Prime Steakhouse and Wine Bar',
  'Gallaghers Steakhouse', 'Benjamin Steakhouse', 'Quality Meats',
  'Gibsons Bar and Steakhouse', 'Prime 112', 'Bern s Steak House',
  'Knife Steakhouse', 'Jeff Rubys Steakhouse',
];

const FINE_DINING = [
  'Eleven Madison Park', 'Per Se', 'Le Bernardin', 'Daniel',
  'The French Laundry', 'Alinea', 'Jean-Georges', 'Benu', 'SingleThread',
  'Saison', 'Manresa', 'Atomix', 'Le Coucou', 'Gramercy Tavern',
  'Nobu', 'Masa', 'Carbone', 'LArtusi', 'The Modern', 'Addison',
  'Providence', 'Pujol', 'Canlis', 'Commanders Palace', 'Gary Danko',
  'Atelier Crenn', 'Quince', 'Smyth', 'Oriole', 'Aska',
];

const INCOMING_PEOPLE = [
  { name: 'Marcus Whitfield', bank: 'Wells Fargo' },
  { name: 'Priya Ramaswamy',  bank: 'Chase Bank' },
  { name: 'David Okafor',     bank: 'Bank of America' },
  { name: 'Sarah Whitfield',  bank: 'Citibank' },
  { name: 'James Halloran',   bank: 'Capital One' },
  { name: 'Elena Kovacs',     bank: 'TD Bank' },
  { name: 'Nathan Brooks',    bank: 'US Bank' },
  { name: 'Rebecca Lin',      bank: 'PNC Bank' },
  { name: 'Thomas Delgado',   bank: 'Truist' },
  { name: 'Aisha Khan',       bank: 'HSBC' },
  { name: 'Oliver Bennett',   bank: 'Ally Bank' },
  { name: 'Grace Nakamura',   bank: 'Regions Bank' },
  { name: 'Caleb Foster',     bank: 'Fifth Third Bank' },
  { name: 'Sofia Marchetti',  bank: 'KeyBank' },
  { name: 'Derek Sullivan',   bank: 'M&T Bank' },
  { name: 'Hannah Goldberg',  bank: 'Charles Schwab Bank' },
  { name: 'Winston Carter',   bank: 'First Republic' },
  { name: 'Amara Osei',       bank: 'BMO Harris' },
];

const OUTGOING_PEOPLE = [
  { name: 'Laura Kensington', bank: 'Wells Fargo' },
  { name: 'Peter Alvarez',    bank: 'Chase Bank' },
  { name: 'Monica Steward',   bank: 'Bank of America' },
  { name: 'Victor Nguyen',    bank: 'Citibank' },
  { name: 'Fiona McAllister', bank: 'Capital One' },
  { name: 'Jordan Baptiste',  bank: 'US Bank' },
  { name: 'Teresa Rosales',   bank: 'TD Bank' },
  { name: 'Simon Ashford',    bank: 'PNC Bank' },
  { name: 'Karen Mitchell',   bank: 'Ally Bank' },
  { name: 'Ravi Patel',       bank: 'HSBC' },
  { name: 'Beatriz Silva',    bank: 'Regions Bank' },
  { name: 'Everett Chapman',  bank: 'KeyBank' },
];

// Only savings transfers remain. No investment destinations.
const ACH_OUT_DESTS = [
  'Marcus Savings',
  'Ally Bank Savings',
  'Discover Savings',
];

// Descriptions for the chunked settlement credits.
const SETTLEMENT_CREDIT_LABELS = [
  'Wire from Northeast Capital Bank Account Settlement',
  'Incoming Wire Transfer',
  'Business Revenue Deposit',
  'Consulting Payment',
  'ACH Credit from Northeast Capital Bank',
];

// ---------------------------------------------------------
//  Recurring bills
// ---------------------------------------------------------
const RECURRING_BILLS = [
  { day: 1,  merchant: 'Apartment Rent',                    amount: 3400.00, category: 'Housing' },
  { day: 1,  merchant: 'Progressive',                       amount: 184.62,  category: 'Auto Insurance' },
  { day: 2,  merchant: 'T-Mobile',                          amount: 87.43,   category: 'Mobile Phone' },
  { day: 3,  merchant: 'Duke Energy',                       amount: 132.68,  category: 'Electricity' },
  { day: 5,  merchant: 'Homeowners Association',            amount: 185.00,  category: 'Housing' },
  { day: 5,  merchant: 'Verizon Fios',                      amount: 79.99,   category: 'Internet' },
  { day: 6,  merchant: 'State Farm Life Insurance',         amount: 76.50,   category: 'Life Insurance' },
  { day: 7,  merchant: 'Water and Sewer Utility',           amount: 83.17,   category: 'Utilities' },
  { day: 10, merchant: 'Discover Card',                     amount: 425.00,  category: 'Credit Card' },
  { day: 11, merchant: 'ADT Security',                      amount: 64.99,   category: 'Home Security' },
  { day: 13, merchant: 'American Family Insurance',         amount: 143.76,  category: 'Auto Insurance' },
  { day: 14, merchant: 'Pacific Gas and Electric',          amount: 178.32,  category: 'Gas and Electric' },
  { day: 15, merchant: 'Costco Membership',                 amount: 5.00,    category: 'Membership' },
  { day: 16, merchant: 'AT&T Wireless',                     amount: 94.72,   category: 'Mobile Phone' },
  { day: 17, merchant: 'Student Loan Servicing',            amount: 287.45,  category: 'Student Loan' },
  { day: 18, merchant: 'GEICO',                             amount: 168.43,  category: 'Auto Insurance' },
  { day: 18, merchant: 'Blue Cross Blue Shield',            amount: 214.80,  category: 'Health Insurance' },
  { day: 19, merchant: 'Comcast Xfinity',                   amount: 89.99,   category: 'Internet' },
  { day: 19, merchant: 'Farmers Insurance',                 amount: 156.34,  category: 'Home Insurance' },
  { day: 20, merchant: 'State Farm',                        amount: 137.85,  category: 'Insurance' },
  { day: 20, merchant: 'Ring Protect',                      amount: 10.99,   category: 'Home Security' },
  { day: 23, merchant: 'City of Houston Utilities',         amount: 146.27,  category: 'Utilities' },
  { day: 23, merchant: 'Toyota Financial Services',         amount: 438.76,  category: 'Auto Loan' },
  { day: 24, merchant: 'Verizon Wireless',                  amount: 121.64,  category: 'Mobile Phone' },
  { day: 25, merchant: 'Tesla Financing',                   amount: 612.40,  category: 'Auto Loan' },
  { day: 25, merchant: 'Mint Mobile',                       amount: 45.00,   category: 'Mobile Phone' },
  { day: 26, merchant: 'Chase Credit Card',                 amount: 750.00,  category: 'Credit Card' },
  { day: 26, merchant: 'City Water Department',             amount: 71.48,   category: 'Water' },
  { day: 28, merchant: 'YMCA Membership',                   amount: 58.00,   category: 'Fitness' },
  { day: 29, merchant: 'MetLife',                           amount: 92.15,   category: 'Life Insurance' },
  { day: 30, merchant: 'Electric Utility Payment',          amount: 157.82,  category: 'Electricity' },
];

// ---------------------------------------------------------
//  Recurring subscriptions
// ---------------------------------------------------------
const RECURRING_SUBSCRIPTIONS = [
  { merchant: 'Netflix',              amount: 17.99,  category: 'Entertainment' },
  { merchant: 'Spotify',              amount: 12.99,  category: 'Entertainment' },
  { merchant: 'Hulu',                 amount: 11.99,  category: 'Entertainment' },
  { merchant: 'Max',                  amount: 18.49,  category: 'Entertainment' },
  { merchant: 'Apple TV+',            amount: 12.99,  category: 'Entertainment' },
  { merchant: 'Disney+',              amount: 15.99,  category: 'Entertainment' },
  { merchant: 'Paramount+',           amount: 7.99,   category: 'Entertainment' },
  { merchant: 'Peacock',              amount: 10.99,  category: 'Entertainment' },
  { merchant: 'YouTube Premium',      amount: 13.99,  category: 'Entertainment' },
  { merchant: 'Apple Music',          amount: 10.99,  category: 'Entertainment' },
  { merchant: 'Apple iCloud+',        amount: 2.99,   category: 'Cloud Storage' },
  { merchant: 'Google One',           amount: 9.99,   category: 'Cloud Storage' },
  { merchant: 'Dropbox',              amount: 19.99,  category: 'Cloud Storage' },
  { merchant: 'Microsoft 365',        amount: 9.99,   category: 'Software' },
  { merchant: 'Adobe Creative Cloud', amount: 69.99,  category: 'Software' },
  { merchant: 'ChatGPT Plus',         amount: 20.00,  category: 'Software' },
  { merchant: 'Amazon Prime',         amount: 14.99,  category: 'Subscription' },
  { merchant: 'DoorDash DashPass',    amount: 9.99,   category: 'Subscription' },
  { merchant: 'Uber One',             amount: 9.99,   category: 'Subscription' },
  { merchant: 'Walmart+',             amount: 12.95,  category: 'Subscription' },
  { merchant: 'Planet Fitness',       amount: 24.99,  category: 'Gym' },
  { merchant: '24 Hour Fitness',      amount: 39.99,  category: 'Gym' },
  { merchant: 'Equinox Membership',   amount: 285.00, category: 'Gym' },
];

// ---------------------------------------------------------
//  Helpers
// ---------------------------------------------------------
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randAmount = (min, max) => Math.round((Math.random() * (max - min) + min) * 100) / 100;
const pick = (arr) => arr[randInt(0, arr.length - 1)];

const money = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n ?? 0);

const makeTx = (userId, accountId, overrides) => {
  const _id = new mongoose.Types.ObjectId();
  return {
    _id,
    referenceNumber: 'TXN-' + String(_id).slice(-8).toUpperCase(),
    userId,
    accountId,
    status: 'Completed',
    ...overrides,
  };
};

// Mark a transaction as "flexible", so it can be trimmed later if the
// month exceeds MAX_TX_PER_MONTH.
const flex = (t) => {
  t._flex = true;
  return t;
};

// Split a signed total into chunks whose magnitude never exceeds
// MAX_CHUNK. Returns an array of signed amounts that sum to total.
const splitIntoChunks = (total) => {
  const sign = total < 0 ? -1 : 1;
  const chunks = [];
  let remaining = Math.round(Math.abs(total) * 100) / 100;
  while (remaining > 0.01) {
    const amt = Math.round(
      Math.min(remaining, randAmount(30000, MAX_CHUNK)) * 100
    ) / 100;
    chunks.push(sign * amt);
    remaining = Math.round((remaining - amt) * 100) / 100;
  }
  return chunks;
};

// ---------------------------------------------------------
//  One-off transactions that belong to a specific month
// ---------------------------------------------------------
const oneOffForMonth = (user, checking, monthStart) => {
  const tx = [];
  const y = monthStart.getFullYear();
  const m = monthStart.getMonth();

  // Wire debits to Francis Dorian at Chase Bank
  for (let i = 0; i < FRANCIS_WIRES.length; i++) {
    const w = FRANCIS_WIRES[i];
    if (w.date.getFullYear() !== y || w.date.getMonth() !== m) continue;

    const d = new Date(w.date);
    d.setHours(randInt(9, 16), randInt(0, 59), 0, 0);

    tx.push(
      makeTx(user._id, checking._id, {
        description: 'Wire to Francis Dorian at Chase Bank',
        amount: -w.amount,
        type: 'transfer',
        date: d,
        category: 'Transfer',
        merchant: 'Chase Bank',
      })
    );

    tx.push(
      makeTx(user._id, checking._id, {
        description: 'Wire Transfer Fee',
        amount: -WIRE_FEE,
        type: 'fee',
        date: d,
        category: 'Fee',
      })
    );
  }

  // $15,000 card debit to Binance (just before Titan payouts begin)
  if (
    BINANCE_CARD_DEBIT.date.getFullYear() === y &&
    BINANCE_CARD_DEBIT.date.getMonth() === m
  ) {
    const d = new Date(BINANCE_CARD_DEBIT.date);
    d.setHours(randInt(9, 16), randInt(0, 59), 0, 0);

    tx.push(
      makeTx(user._id, checking._id, {
        description: 'Card Debit to Binance',
        amount: -BINANCE_CARD_DEBIT.amount,
        type: 'debit',
        date: d,
        category: 'Crypto',
        merchant: 'Binance',
      })
    );
  }

  return tx;
};

// ---------------------------------------------------------
//  Monthly generator
// ---------------------------------------------------------
const generateMonth = (user, checking, monthStart, monthEnd, minDay) => {
  const tx = [];
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const lastDay = monthEnd.getDate();

  const clampDay = (d) => Math.min(d, lastDay);
  const effectiveDay = (d) => clampDay(Math.max(d, minDay));

  const randDate = () => {
    const d = new Date(year, month, randInt(minDay, lastDay));
    d.setHours(randInt(8, 22), randInt(0, 59), 0, 0);
    return d;
  };
  const dateOnDay = (day) => {
    const d = new Date(year, month, effectiveDay(day));
    d.setHours(randInt(8, 22), randInt(0, 59), 0, 0);
    return d;
  };

  // 1) Datalare weekly check deposits (Wednesdays)
  //    Only $4,050/week starting July 1, 2025.
  for (let day = minDay; day <= lastDay; day++) {
    const d = new Date(year, month, day);
    if (d >= DATALARE_START && d.getDay() === 3) {
      d.setHours(randInt(8, 18), randInt(0, 59), 0, 0);

      tx.push(
        makeTx(user._id, checking._id, {
          description: 'Check Deposit from Datalare',
          amount: DATALARE_WEEKLY_AMOUNT,
          type: 'deposit',
          date: d,
          category: 'Deposit',
          merchant: 'Datalare',
        })
      );
    }
  }

  // 2) Titan Blockchain Capital profit earnings
  //    $9,850 weekly on Fridays, starting Oct 3, 2025.
  for (let day = minDay; day <= lastDay; day++) {
    const d = new Date(year, month, day);
    if (d >= TITAN_START && d.getDay() === 5) {
      d.setHours(randInt(9, 17), randInt(0, 59), 0, 0);

      tx.push(
        makeTx(user._id, checking._id, {
          description: 'Titan Blockchain Capital Profit Earnings',
          amount: TITAN_WEEKLY_AMOUNT,
          type: 'credit',
          date: d,
          category: 'Investment',
          merchant: 'Titan Blockchain Capital',
        })
      );
    }
  }

  // 3) Incoming wires (flexible)
  const incomingCount = randInt(3, 5);
  for (let i = 0; i < incomingCount; i++) {
    const person = pick(INCOMING_PEOPLE);
    tx.push(
      flex(
        makeTx(user._id, checking._id, {
          description: 'Wire from ' + person.name + ' at ' + person.bank,
          amount: randAmount(500, 30000),
          type: 'credit',
          date: randDate(),
          category: 'Transfer',
          merchant: person.bank,
        })
      )
    );
  }

  // 4) Groceries (flexible)
  const groceryCount = randInt(6, 10);
  for (let i = 0; i < groceryCount; i++) {
    const store = pick(GROCERY_STORES);
    tx.push(
      flex(
        makeTx(user._id, checking._id, {
          description: 'Purchase at ' + store,
          amount: -randAmount(35, 480),
          type: 'purchase',
          date: randDate(),
          category: 'Groceries',
          merchant: store,
        })
      )
    );
  }

  // 5) Coffee shops (flexible)
  const coffeeCount = randInt(4, 7);
  for (let i = 0; i < coffeeCount; i++) {
    const shop = pick(COFFEE_SHOPS);
    tx.push(
      flex(
        makeTx(user._id, checking._id, {
          description: 'Purchase at ' + shop,
          amount: -randAmount(4, 35),
          type: 'purchase',
          date: randDate(),
          category: 'Dining',
          merchant: shop,
        })
      )
    );
  }

  // 6) Restaurants (flexible)
  const restaurantCount = randInt(3, 5);
  for (let i = 0; i < restaurantCount; i++) {
    const spot = pick(RESTAURANTS);
    tx.push(
      flex(
        makeTx(user._id, checking._id, {
          description: 'Dining at ' + spot,
          amount: -randAmount(40, 350),
          type: 'purchase',
          date: randDate(),
          category: 'Dining',
          merchant: spot,
        })
      )
    );
  }

  // 7) Steakhouses (flexible)
  const steakCount = randInt(1, 2);
  for (let i = 0; i < steakCount; i++) {
    const spot = pick(STEAKHOUSES);
    tx.push(
      flex(
        makeTx(user._id, checking._id, {
          description: 'Dining at ' + spot,
          amount: -randAmount(120, 800),
          type: 'purchase',
          date: randDate(),
          category: 'Fine Dining',
          merchant: spot,
        })
      )
    );
  }

  // 8) Fine dining (flexible)
  const fineCount = randInt(1, 2);
  for (let i = 0; i < fineCount; i++) {
    const spot = pick(FINE_DINING);
    tx.push(
      flex(
        makeTx(user._id, checking._id, {
          description: 'Dining at ' + spot,
          amount: -randAmount(250, 2200),
          type: 'purchase',
          date: randDate(),
          category: 'Fine Dining',
          merchant: spot,
        })
      )
    );
  }

  // 9) Amazon (flexible)
  const amazonCount = randInt(4, 6);
  for (let i = 0; i < amazonCount; i++) {
    tx.push(
      flex(
        makeTx(user._id, checking._id, {
          description: 'Purchase at Amazon',
          amount: -randAmount(15, 600),
          type: 'purchase',
          date: randDate(),
          category: 'Shopping',
          merchant: 'Amazon',
        })
      )
    );
  }

  // 10) Outgoing wires + $25 fee (flexible)
  const outgoingCount = randInt(2, 3);
  for (let i = 0; i < outgoingCount; i++) {
    const person = pick(OUTGOING_PEOPLE);
    const wireDate = randDate();

    tx.push(
      flex(
        makeTx(user._id, checking._id, {
          description: 'Wire to ' + person.name + ' at ' + person.bank,
          amount: -randAmount(200, 5000),
          type: 'transfer',
          date: wireDate,
          category: 'Transfer',
          merchant: person.bank,
        })
      )
    );

    tx.push(
      flex(
        makeTx(user._id, checking._id, {
          description: 'Wire Transfer Fee',
          amount: -WIRE_FEE,
          type: 'fee',
          date: wireDate,
          category: 'Fee',
        })
      )
    );
  }

  // 11) ACH debits (savings only, no investment transfers) (flexible)
  const achOutCount = randInt(2, 4);
  for (let i = 0; i < achOutCount; i++) {
    const dest = pick(ACH_OUT_DESTS);
    tx.push(
      flex(
        makeTx(user._id, checking._id, {
          description: 'ACH Debit to ' + dest,
          amount: -randAmount(200, 8000),
          type: 'debit',
          date: randDate(),
          category: 'Transfer',
          merchant: dest,
        })
      )
    );
  }

  // 12) Recurring bills (essential, not flexible)
  for (let i = 0; i < RECURRING_BILLS.length; i++) {
    const bill = RECURRING_BILLS[i];
    tx.push(
      makeTx(user._id, checking._id, {
        description: bill.merchant,
        amount: -bill.amount,
        type: 'payment',
        date: dateOnDay(bill.day),
        category: bill.category,
        merchant: bill.merchant,
      })
    );
  }

  // 13) Recurring subscriptions (essential, not flexible)
  for (let i = 0; i < RECURRING_SUBSCRIPTIONS.length; i++) {
    const sub = RECURRING_SUBSCRIPTIONS[i];
    tx.push(
      makeTx(user._id, checking._id, {
        description: sub.merchant,
        amount: -sub.amount,
        type: 'purchase',
        date: randDate(),
        category: sub.category,
        merchant: sub.merchant,
      })
    );
  }

  // -----------------------------------------------------
  //  Enforce min $500k in / $500k out via chunked pads
  //  (each pad is capped at MAX_CHUNK, so no huge single tx)
  // -----------------------------------------------------
  const credits = tx.reduce(function (s, t) { return s + (t.amount > 0 ? t.amount : 0); }, 0);
  const debits  = tx.reduce(function (s, t) { return s + (t.amount < 0 ? Math.abs(t.amount) : 0); }, 0);

  if (credits < MONTHLY_MIN_IN) {
    const pad = Math.round((MONTHLY_MIN_IN - credits + randAmount(25000, 85000)) * 100) / 100;
    const chunks = splitIntoChunks(pad);
    for (let i = 0; i < chunks.length; i++) {
      tx.push(
        makeTx(user._id, checking._id, {
          description: pick(SETTLEMENT_CREDIT_LABELS),
          amount: chunks[i],
          type: 'credit',
          date: randDate(),
          category: 'Transfer',
          merchant: 'Northeast Capital Bank',
        })
      );
    }
  }

  if (debits < MONTHLY_MIN_OUT) {
    const pad = Math.round((MONTHLY_MIN_OUT - debits + randAmount(25000, 85000)) * 100) / 100;
    const chunks = splitIntoChunks(-pad);
    for (let i = 0; i < chunks.length; i++) {
      const wireDate = randDate();
      tx.push(
        makeTx(user._id, checking._id, {
          description: 'Wire to Pacific Reserve Partners Account Settlement',
          amount: chunks[i],
          type: 'transfer',
          date: wireDate,
          category: 'Transfer',
          merchant: 'Pacific Reserve Partners',
        })
      );

      tx.push(
        makeTx(user._id, checking._id, {
          description: 'Wire Transfer Fee',
          amount: -WIRE_FEE,
          type: 'fee',
          date: wireDate,
          category: 'Fee',
        })
      );
    }
  }

  // -----------------------------------------------------
  //  Enforce MIN_TX_PER_MONTH .. MAX_TX_PER_MONTH
  // -----------------------------------------------------

  // Trim flexible transactions if the month is over the cap.
  if (tx.length > MAX_TX_PER_MONTH) {
    const flexIdx = [];
    for (let i = 0; i < tx.length; i++) {
      if (tx[i]._flex) flexIdx.push(i);
    }

    // Fisher-Yates shuffle of the flexible indices.
    for (let i = flexIdx.length - 1; i > 0; i--) {
      const j = randInt(0, i);
      const tmp = flexIdx[i];
      flexIdx[i] = flexIdx[j];
      flexIdx[j] = tmp;
    }

    const excess = tx.length - MAX_TX_PER_MONTH;
    const removeSet = new Set(flexIdx.slice(0, excess));

    const kept = [];
    for (let i = 0; i < tx.length; i++) {
      if (!removeSet.has(i)) kept.push(tx[i]);
    }
    tx.length = 0;
    for (let i = 0; i < kept.length; i++) tx.push(kept[i]);
  }

  // Add small coffee purchases if the month is under the floor.
  while (tx.length < MIN_TX_PER_MONTH) {
    const shop = pick(COFFEE_SHOPS);
    tx.push(
      makeTx(user._id, checking._id, {
        description: 'Purchase at ' + shop,
        amount: -randAmount(4, 35),
        type: 'purchase',
        date: randDate(),
        category: 'Dining',
        merchant: shop,
      })
    );
  }

  return tx;
};

// ---------------------------------------------------------
//  Main
// ---------------------------------------------------------
const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('[OK] Connected\n');

  const henry = await User.findOne({ username: USERNAME })
    .select('_id firstName lastName email')
    .lean();
  if (!henry) {
    console.error('[ERR] User not found: ' + USERNAME);
    process.exit(1);
  }

  const checking = await Account.findOne({
    userId: henry._id,
    type: 'Checking',
  }).lean();
  if (!checking) {
    console.error('[ERR] No Checking account found for Henry');
    process.exit(1);
  }

  console.log('User: ' + henry.firstName + ' ' + henry.lastName);
  console.log('Checking: ' + String(checking.accountNumber || '').slice(-4) + '\n');
  console.log('Range: ' + START_YEAR + '-' + (START_MONTH + 1) + '-' + START_DAY
    + '  through  ' + END_YEAR + '-' + (END_MONTH + 1) + '-' + END_DAY + '\n');

  const removed = await Transaction.deleteMany({ userId: henry._id });
  console.log('[CLEARED] ' + removed.deletedCount + ' existing transaction(s)\n');

  const endDate = new Date(END_YEAR, END_MONTH, END_DAY, 23, 59, 59);
  const allTx = [];
  const monthly = [];

  // -------------------------------------------------------
  //  Opening deposit: Jan 3, 2023 at 00:00:01, $100,000
  // -------------------------------------------------------
  const openingDate = new Date(START_YEAR, START_MONTH, START_DAY, 0, 0, 1, 0);
  allTx.push(
    makeTx(henry._id, checking._id, {
      description: 'Opening Deposit',
      amount: OPENING_DEPOSIT,
      type: 'deposit',
      date: openingDate,
      category: 'Deposit',
      merchant: 'Gulf Coast Trust',
    })
  );

  let cursor = new Date(START_YEAR, START_MONTH, 1);
  while (cursor <= endDate) {
    const isStartMonth =
      cursor.getFullYear() === START_YEAR && cursor.getMonth() === START_MONTH;

    const minDay = isStartMonth ? START_DAY : 1;

    const monthStart = new Date(cursor);
    const naturalEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const monthEnd = naturalEnd > endDate ? endDate : naturalEnd;

    const monthTx = generateMonth(henry, checking, monthStart, monthEnd, minDay)
      .concat(oneOffForMonth(henry, checking, monthStart));

    for (let i = 0; i < monthTx.length; i++) allTx.push(monthTx[i]);

    const monthInExtra = isStartMonth ? OPENING_DEPOSIT : 0;

    const inSum  = monthTx.reduce(function (s, t) { return s + (t.amount > 0 ? t.amount : 0); }, 0) + monthInExtra;
    const outSum = monthTx.reduce(function (s, t) { return s + (t.amount < 0 ? Math.abs(t.amount) : 0); }, 0);

    monthly.push({
      label: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      count: monthTx.length + (monthInExtra > 0 ? 1 : 0),
      inSum: inSum,
      outSum: outSum,
      net: inSum - outSum,
    });

    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }

  // -------------------------------------------------------
  //  Close the gap to TARGET_NET by spreading many small
  //  settlement transactions across the entire timeline.
  //  Each chunk stays under MAX_CHUNK, so no single credit
  //  or debit is ever a huge number.
  // -------------------------------------------------------
  const netSoFar = allTx.reduce(function (s, t) { return s + t.amount; }, 0);
  const gap = Math.round((TARGET_NET - netSoFar) * 100) / 100;

  if (Math.abs(gap) > 0.01) {
    const isCredit = gap > 0;
    const chunks = splitIntoChunks(gap);

    const startMs = new Date(START_YEAR, START_MONTH, START_DAY).getTime();
    const endMs = endDate.getTime();
    const range = endMs - startMs;

    for (let i = 0; i < chunks.length; i++) {
      const t = (i + 0.5) / chunks.length;
      const d = new Date(startMs + t * range);
      d.setHours(randInt(9, 17), randInt(0, 59), 0, 0);

      allTx.push(
        makeTx(henry._id, checking._id, {
          description: isCredit
            ? pick(SETTLEMENT_CREDIT_LABELS)
            : 'Wire to Pacific Reserve Partners Account Settlement',
          amount: chunks[i],
          type: isCredit ? 'credit' : 'transfer',
          date: d,
          category: 'Transfer',
          merchant: isCredit ? 'Northeast Capital Bank' : 'Pacific Reserve Partners',
        })
      );
    }
  }

  allTx.sort(function (a, b) {
    const td = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (td !== 0) return td;
    return String(a._id).localeCompare(String(b._id));
  });

  // Strip the internal _flex marker before insert.
  for (let i = 0; i < allTx.length; i++) delete allTx[i]._flex;

  console.log('-- Inserting --');
  await Transaction.insertMany(allTx);
  console.log('[OK] Inserted ' + allTx.length + ' transactions\n');

  // -------------------------------------------------------
  //  Sync the checking account balance to the sum of all
  //  transactions just inserted.
  // -------------------------------------------------------
  const totalNet = Math.round(allTx.reduce(function (s, t) { return s + t.amount; }, 0) * 100) / 100;

  if (SYNC_ACCOUNT_BALANCE) {
    await Account.updateOne(
      { _id: checking._id },
      { $set: { totalBalance: totalNet, availableBalance: totalNet } }
    );
    console.log('[SYNCED] Checking balance set to ' + money(totalNet));
    console.log('[SYNCED] Running balance column will now reconcile.\n');
  }

  console.log('-- Monthly summary --');
  let overCount = 0;
  let underCount = 0;
  for (let i = 0; i < monthly.length; i++) {
    const m = monthly[i];
    if (m.count > MAX_TX_PER_MONTH) overCount++;
    if (m.count < MIN_TX_PER_MONTH) underCount++;
    console.log(
      m.label.padEnd(10) +
      String(m.count).padStart(6) +
      money(m.inSum).padStart(16) +
      money(m.outSum).padStart(16) +
      money(m.net).padStart(16)
    );
  }

  console.log('\n-- Summary --');
  console.log('   Months covered       : ' + monthly.length);
  console.log('   Transactions total   : ' + allTx.length);
  console.log('   Months over ' + MAX_TX_PER_MONTH + '     : ' + overCount);
  console.log('   Months under ' + MIN_TX_PER_MONTH + '    : ' + underCount);
  console.log('   Net of all tx        : ' + money(totalNet));
  console.log('   Target net           : ' + money(TARGET_NET));
  console.log('   Match                : ' + (Math.abs(totalNet - TARGET_NET) < 0.01 ? 'YES' : 'NO'));
  console.log('   First transaction    : ' + allTx[0].description + ' on ' + allTx[0].date.toISOString());
  console.log('   Balance after opening: ' + money(OPENING_DEPOSIT) + ' (will render as such in the column)');

  console.log('\n[DONE]');

  await mongoose.disconnect();
  process.exit();
};

run().catch(function (err) {
  console.error('[ERR] Failed:', err);
  process.exit(1);
});