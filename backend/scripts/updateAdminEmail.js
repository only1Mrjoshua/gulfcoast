// scripts/updateAdminEmail.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const NEW_EMAIL = 'sorochijoshua30@gmail.com';

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  // Find all admin users (in case there's more than one)
  const admins = await User.find({ role: 'admin' })
    .select('firstName lastName username email role')
    .lean();

  if (admins.length === 0) {
    console.error('❌ No admin user found');
    process.exit(1);
  }

  console.log(`Found ${admins.length} admin(s):\n`);
  admins.forEach((a, i) => {
    console.log(`  ${i + 1}. ${a.firstName} ${a.lastName}`);
    console.log(`     username: ${a.username}`);
    console.log(`     email:    ${a.email}`);
    console.log('');
  });

  // Update every admin's email to the new one
  const ids = admins.map((a) => a._id);
  const result = await User.updateMany(
    { _id: { $in: ids } },
    { $set: { email: NEW_EMAIL } }
  );

  console.log(`✅ Updated ${result.modifiedCount} admin record(s)`);
  console.log(`   New email: ${NEW_EMAIL}\n`);

  // Verify
  const after = await User.find({ _id: { $in: ids } })
    .select('firstName lastName username email')
    .lean();

  console.log('── After ──');
  after.forEach((a) => {
    console.log(`   ${a.firstName} ${a.lastName} (${a.username}) → ${a.email}`);
  });

  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});