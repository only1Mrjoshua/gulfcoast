// scripts/dumpHenryCards.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Card from '../models/Card.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  const henry = await User.findOne({ username: 'mrhenrydorian' }).lean();
  const cards = await Card.find({ userId: henry._id }).lean();
  console.log(JSON.stringify(cards, null, 2));
  await mongoose.disconnect();
};
run();