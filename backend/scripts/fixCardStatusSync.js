// scripts/fixCardStatusSync.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Card from '../models/Card.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  const cards = await Card.find({});
  let fixed = 0;

  for (const card of cards) {
    const lockedFromStatus = card.status === 'Locked';
    const lockedFromFlag = card.controls?.locked === true;

    if (lockedFromStatus !== lockedFromFlag) {
      card.controls.locked = lockedFromStatus;
      await card.save();
      fixed++;
      console.log(
        `🔧 ${card.cardName} — status "${card.status}" → controls.locked = ${lockedFromStatus}`
      );
    }
  }

  console.log(`\n🎉 Fixed ${fixed} of ${cards.length} cards`);
  process.exit();
};

run();