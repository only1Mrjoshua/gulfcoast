// scripts/updateEmilyEmail.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const NEW_EMAIL = 'sorochijoshua22@gmail.com';

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  const before = await User.findOne({ username: 'emilydavis' })
    .select('firstName lastName username email')
    .lean();
  if (!before) {
    console.error('❌ User "emilydavis" not found');
    process.exit(1);
  }

  console.log('Before:');
  console.log(`   ${before.firstName} ${before.lastName} (${before.username})`);
  console.log(`   email: ${before.email}\n`);

  await User.updateOne(
    { _id: before._id },
    { $set: { email: NEW_EMAIL } }
  );

  const after = await User.findById(before._id)
    .select('firstName lastName username email')
    .lean();

  console.log('After:');
  console.log(`   ${after.firstName} ${after.lastName} (${after.username})`);
  console.log(`   email: ${after.email}`);

  console.log('\n🎉 Done');
  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});