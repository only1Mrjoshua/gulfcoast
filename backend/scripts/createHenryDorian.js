// scripts/createHenryDorian.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// ─────────────────────────────────────────────────────────
//  Configuration
// ─────────────────────────────────────────────────────────
const FIRST_NAME      = 'Henry';
const LAST_NAME       = 'Dorian';
const USERNAME        = 'mrhenrydorian';
const EMAIL           = 'henrydorian998@gmail.com';
const PASSWORD        = 'henrydorian998';
const PHONE           = '+1 (812) 686-7764';
const MAILING_ADDRESS = '1450 N Logan St, Denver, CO 80203, USA';
const DATE_OF_BIRTH   = '1965-03-06'; // MM/DD/YYYY → 03/06/1965

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  // ── Check if the user already exists ────────────────────
  const existing = await User.findOne({
    $or: [{ email: EMAIL }, { username: USERNAME }],
  }).lean();

  if (existing) {
    console.log('⚠️  A user with this email or username already exists:');
    console.log(`   ${existing.firstName} ${existing.lastName} (${existing.username})`);
    console.log(`   email: ${existing.email}`);
    console.log(`   id:    ${existing._id}`);
    console.log('\nNothing to do.');
    await mongoose.disconnect();
    process.exit();
  }

  // ── Hash the password (matches the pattern in authController) ──
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(PASSWORD, salt);

  // ── Create the user ─────────────────────────────────────
  const user = await User.create({
    firstName: FIRST_NAME,
    lastName: LAST_NAME,
    username: USERNAME,
    email: EMAIL,
    password: hashedPassword,
    phone: PHONE,
    mailingAddress: MAILING_ADDRESS,
    dateOfBirth: DATE_OF_BIRTH,
    // Everything else uses the schema defaults:
    //   role: 'user'
    //   status: 'Active'
    //   creditScore: all zeroes
    //   alertPreferences: all true
    //   cardAlertPreferences: all true
    //   loanAlertPreferences: all true
    //   notificationPreferences: all true
    //   twoStepVerification: false
    //   accountPreferences: empty strings
  });

  console.log('✅ User created:');
  console.log(`   Name     : ${user.firstName} ${user.lastName}`);
  console.log(`   Username : ${user.username}`);
  console.log(`   Email    : ${user.email}`);
  console.log(`   Phone    : ${user.phone}`);
  console.log(`   Address  : ${user.mailingAddress}`);
  console.log(`   DOB      : ${user.dateOfBirth}`);
  console.log(`   Role     : ${user.role}`);
  console.log(`   Status   : ${user.status}`);
  console.log(`   ID       : ${user._id}`);
  console.log(`   Password : ${PASSWORD}`);

  console.log('\n🎉 Done — log in with the credentials above.');
  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});