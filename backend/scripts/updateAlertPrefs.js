// scripts/updateAlertPrefs.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';

dotenv.config();

// ✅ Fix DNS SRV resolution issues on Windows/VPN setups
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const updateAlertPrefs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    const username = 'emilydavis';

    const updated = await User.findOneAndUpdate(
      { username },
      {
        $set: {
          'alertPreferences.lowBalance':       true,
          'alertPreferences.largeTransaction': true,
          'alertPreferences.deposit':          false,   // ⬅️ OFF — to test the disabled UI state
          'alertPreferences.paymentReminder':  true,
          'alertPreferences.monthlyStatement': true,
        },
      },
      { new: true, select: 'username alertPreferences' }
    );

    if (!updated) {
      console.error('❌ User not found:', username);
      process.exit(1);
    }

    console.log('✅ Alert preferences updated for', updated.username);
    console.log('   →', JSON.stringify(updated.alertPreferences, null, 2));

    process.exit();
  } catch (error) {
    console.error('❌ Update error:', error);
    process.exit(1);
  }
};

updateAlertPrefs();