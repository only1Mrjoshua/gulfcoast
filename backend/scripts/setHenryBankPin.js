// scripts/setHenryBankPin.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Change this to whatever you want to type during testing
const PIN = '1965';

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('[OK] Connected\n');

  const henry = await User.findOne({ username: 'mrhenrydorian' }).select('+bankPin');
  if (!henry) {
    console.error('[ERR] Henry not found');
    process.exit(1);
  }

  const hash = await bcrypt.hash(PIN, 10);
  henry.bankPin = hash;
  await henry.save();

  console.log('User: ' + henry.firstName + ' ' + henry.lastName);
  console.log('Bank PIN set to: ' + PIN);
  console.log('(hashed in DB, will be required on every transfer)');

  console.log('\n[DONE]');

  await mongoose.disconnect();
  process.exit();
};

run().catch(function (err) {
  console.error('[ERR] Failed:', err);
  process.exit(1);
});