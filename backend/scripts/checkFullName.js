// scripts/checkFullName.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const USERNAME = 'dbbecker01';

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  // 1. Raw document from Mongo (no virtuals by default)
  const raw = await User.findOne({ username: USERNAME }).lean();
  console.log('── Raw Mongo document ─────────────────────────────');
  console.log('  firstName  :', JSON.stringify(raw?.firstName));
  console.log('  middleName :', JSON.stringify(raw?.middleName));
  console.log('  lastName   :', JSON.stringify(raw?.lastName));
  console.log('  fullName   :', JSON.stringify(raw?.fullName), '(missing if .lean())');
  console.log('');

  // 2. Mongoose document (virtuals on)
  const doc = await User.findOne({ username: USERNAME });
  console.log('── Mongoose document (virtuals active) ────────────');
  console.log('  firstName  :', JSON.stringify(doc?.firstName));
  console.log('  middleName :', JSON.stringify(doc?.middleName));
  console.log('  lastName   :', JSON.stringify(doc?.lastName));
  console.log('  fullName   :', JSON.stringify(doc?.fullName));
  console.log('');

  // 3. What the API response would look like
  console.log('── toJSON() (what /settings should return) ────────');
  console.log('  ', JSON.stringify(doc?.toJSON?.(), null, 2).split('\n').slice(0, 30).join('\n  '));
  console.log('');

  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => { console.error(err); process.exit(1); });