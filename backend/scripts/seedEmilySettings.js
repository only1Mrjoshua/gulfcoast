// scripts/seedEmilySettings.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Account from '../models/Account.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// ─────────────────────────────────────────────────────────
//  Configuration
// ─────────────────────────────────────────────────────────
const PHONE           = '(251) 555-0148';
const MAILING_ADDRESS = '1420 Bienville Blvd, Mobile, AL 36604';
const DATE_OF_BIRTH   = '1990-04-22';

const LINKED_ACCOUNTS = [
  {
    institution:   'Regions Bank',
    subType:       'Checking',
    accountNumber: '2013447742',
    routingNumber: '062005690',
    status:        'Active',
  },
  {
    institution:   'Chase',
    subType:       'Savings',
    accountNumber: '8842111109',
    routingNumber: '021000021',
    status:        'Active',
  },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  // ── Emily ─────────────────────────────────────────────
  const emily = await User.findOne({ username: 'emilydavis' })
    .select('_id firstName lastName email')
    .lean();

  if (!emily) {
    console.error('❌ User "emilydavis" not found');
    process.exit(1);
  }
  console.log(`🎯 User: ${emily.firstName} ${emily.lastName} (${emily._id})\n`);

  // ── Profile fields ────────────────────────────────────
  const updated = await User.findByIdAndUpdate(
    emily._id,
    {
      $set: {
        phone: PHONE,
        mailingAddress: MAILING_ADDRESS,
        dateOfBirth: DATE_OF_BIRTH,
      },
    },
    { new: true, lean: true }
  ).select('firstName lastName email phone mailingAddress dateOfBirth');

  console.log('── Profile updated ──');
  console.log(`   Full Name       : ${updated.firstName} ${updated.lastName}`);
  console.log(`   Email           : ${updated.email}`);
  console.log(`   Phone           : ${updated.phone}`);
  console.log(`   Mailing Address : ${updated.mailingAddress}`);
  console.log(`   Date of Birth   : ${updated.dateOfBirth}`);

  // ── Clear existing external accounts ──────────────────
  const removed = await Account.deleteMany({
    userId: emily._id,
    type: 'External',
  });
  if (removed.deletedCount > 0) {
    console.log(
      `\n🧹 Removed ${removed.deletedCount} existing external account(s)`
    );
  }

  // ── Create linked (External) accounts ─────────────────
  const created = await Account.create(
    LINKED_ACCOUNTS.map((la) => ({
      userId: emily._id,
      type: 'External',
      subType: la.subType,
      accountNumber: la.accountNumber,
      routingNumber: la.routingNumber,
      institution: la.institution,
      totalBalance: 0,
      availableBalance: 0,
      status: la.status,
      isPrimary: false,
    }))
  );

  console.log('\n── Linked Accounts created ──');
  created.forEach((acc) => {
    const last4 = String(acc.accountNumber).slice(-4);
    console.log(
      `   ${acc.institution.padEnd(16)} ${(acc.subType + ' •••• ' + last4).padEnd(
        24
      )} ${acc.status}`
    );
  });

  console.log('\n🎉 Done — reload /settings in the browser.');
  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});