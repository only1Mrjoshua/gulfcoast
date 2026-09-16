// scripts/updateHenryCredentials.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// ---------------------------------------------------------
//  How to find the existing user
// ---------------------------------------------------------
const LOOKUP_USERNAME = 'mrhenrydorian';

// ---------------------------------------------------------
//  New credentials
// ---------------------------------------------------------
const NEW_USERNAME = 'Henrydorian1';
const NEW_PASSWORD = 'henry1965dorian';
const NEW_PIN      = '4473';

const BCRYPT_ROUNDS = 10;

// ---------------------------------------------------------
//  Main
// ---------------------------------------------------------
const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('[OK] Connected\n');

  // Pull bankPin explicitly because the schema has select: false on it.
  const henry = await User.findOne({ username: LOOKUP_USERNAME }).select('+bankPin');
  if (!henry) {
    console.error('[ERR] User not found: ' + LOOKUP_USERNAME);
    process.exit(1);
  }

  console.log('Found user:');
  console.log('   _id      : ' + henry._id);
  console.log('   name     : ' + (henry.firstName || '') + ' ' + (henry.lastName || ''));
  console.log('   email    : ' + (henry.email || ''));
  console.log('   username : ' + henry.username);
  console.log('   bankPin  : ' + (henry.bankPin ? '(set, ' + henry.bankPin.length + ' chars)' : '(none)') + '\n');

  // Hash both secrets the same way setHenryBankPin.js hashes the pin.
  const hashedPassword = await bcrypt.hash(NEW_PASSWORD, BCRYPT_ROUNDS);
  const hashedPin      = await bcrypt.hash(NEW_PIN, BCRYPT_ROUNDS);

  // Assign on the document and .save(), so any pre-save hooks on the
  // User model run (and so we do not accidentally double-hash).
  henry.username = NEW_USERNAME;
  henry.password = hashedPassword;
  henry.bankPin  = hashedPin;

  await henry.save();
  console.log('[OK] Saved\n');

  // Re-read, again pulling +bankPin.
  const fresh = await User.findById(henry._id).select('+bankPin').lean();

  console.log('-- After update --');
  console.log('   _id      : ' + fresh._id);
  console.log('   username : ' + fresh.username);
  console.log('   bankPin  : ' + (fresh.bankPin ? '(bcrypt, ' + fresh.bankPin.length + ' chars)' : '(none)'));

  // Verify both hashes match the plaintexts we wrote.
  const pwOk  = await bcrypt.compare(NEW_PASSWORD, fresh.password);
  const pinOk = fresh.bankPin ? await bcrypt.compare(NEW_PIN, fresh.bankPin) : false;

  console.log('   password verify : ' + (pwOk  ? 'OK' : 'FAILED'));
  console.log('   pin verify      : ' + (pinOk ? 'OK' : 'FAILED'));

  console.log('\n[DONE]');
  await mongoose.disconnect();
  process.exit();
};

run().catch(function (err) {
  console.error('[ERR] Failed:', err);
  process.exit(1);
});