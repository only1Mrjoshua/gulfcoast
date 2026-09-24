// scripts/seedRecipients.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Recipient from '../models/Recipient.js';

dotenv.config();

// Windows / local-dev DNS fix — mirrors server.js so that
// mongodb+srv:// lookups resolve properly.
if (!process.env.VERCEL) {
  try {
    dns.setDefaultResultOrder('ipv4first');
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch {
    // ignore
  }
}

const recipients = [
  {
    accountNumber: '4728103956',
    fullName: 'James Anderson',
    bankName: 'Bank of America',
    routingNumber: '026009593',
    accountType: 'checking',
    bankAddress: '100 N Tryon St, Charlotte, NC 28202',
  },
  {
    accountNumber: '9083172456',
    fullName: 'Maria Rodriguez',
    bankName: 'Chase Bank',
    routingNumber: '021000021',
    accountType: 'savings',
    bankAddress: '270 Park Ave, New York, NY 10017',
  },
  {
    accountNumber: '5619024837',
    fullName: 'Yousif Al Ansari',
    bankName: 'Wells Fargo',
    routingNumber: '121000248',
    accountType: 'checking',
    bankAddress: '420 Montgomery St, San Francisco, CA 94104',
  },
  {
    accountNumber: '7230648915',
    fullName: 'Sarah Williams',
    bankName: 'Citibank',
    routingNumber: '021000089',
    accountType: 'checking',
    bankAddress: '388 Greenwich St, New York, NY 10013',
  },
  {
    accountNumber: '3185476209',
    fullName: 'Keith Hollister',
    bankName: 'Capital One',
    routingNumber: '051405515',
    accountType: 'savings',
    bankAddress: '1680 Capital One Dr, McLean, VA 22102',
  },
];

async function seed() {
  if (!process.env.MONGO_URL) {
    throw new Error('MONGO_URL is not set in your .env file');
  }

  await mongoose.connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 15000,
  });
  console.log('✅ Connected to MongoDB');

  for (const r of recipients) {
    await Recipient.updateOne(
      { accountNumber: r.accountNumber },
      { $set: r },
      { upsert: true }
    );
    console.log(`  ↳ upserted ${r.accountNumber} (${r.fullName})`);
  }

  console.log(`\n✅ Seeded ${recipients.length} recipients`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});