// scripts/checkTransfers.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();

  console.log('── Collections in DB ──');
  for (const c of collections) {
    const count = await db.collection(c.name).countDocuments();
    console.log(`  ${c.name.padEnd(20)} → ${count} docs`);
  }

  console.log('\n── Sample from transfers ──');
  const transfers = await db.collection('transfers').find({}).limit(5).toArray();
  console.log(transfers);

  process.exit();
};

run();