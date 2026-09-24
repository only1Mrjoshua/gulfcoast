// scripts/diagnoseTimezones.js
//
// Shows exactly how each transaction's stored time renders across
// different timezones. Run this, then compare with what you actually
// see in the browser — that tells you which timezone the browser is
// using, and therefore why the displayed time differs from what you
// pinned.
//
// ── USAGE ───────────────────────────────────────────────────────────────
//   node scripts/diagnoseTimezones.js
//   node scripts/diagnoseTimezones.js "Conrad"
//   node scripts/diagnoseTimezones.js --user dbbecker01
// ────────────────────────────────────────────────────────────────

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// ── Parse args ─────────────────────────────────────────────────────────
const args = process.argv.slice(2);
let MATCH = null;
let USERNAME = 'dbbecker01';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--user') {
    USERNAME = args[i + 1];
    i++;
  } else if (!args[i].startsWith('--')) {
    MATCH = args[i];
  }
}

// ── All timezones we want to compare ───────────────────────────────────
const ZONES = [
  { label: 'UTC',                 tz: 'UTC',               code: 'UTC'        },
  { label: 'US/Central (AR)',     tz: 'America/Chicago',   code: 'CST/CDT'    },
  { label: 'US/Eastern (ET)',     tz: 'America/New_York',  code: 'EST/EDT'    },
  { label: 'US/Pacific (PT)',     tz: 'America/Los_Angeles', code: 'PST/PDT'  },
  { label: 'Africa/Lagos',        tz: 'Africa/Lagos',      code: 'WAT  UTC+1' },
  { label: 'Europe/London',       tz: 'Europe/London',     code: 'GMT/BST'    },
  { label: 'Asia/Bahrain',        tz: 'Asia/Bahrain',      code: 'AST  UTC+3' },
  { label: 'Asia/Dubai',          tz: 'Asia/Dubai',        code: 'GST  UTC+4' },
];

const fmt = (date, tz) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
      hour12: true,
    }).format(new Date(date));
  } catch {
    return '(invalid)';
  }
};

const pad = (s, n) => String(s).padEnd(n);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  // ═════════════════════════════════════════════════════════════════════
  //  1. Environment
  // ═════════════════════════════════════════════════════════════════════
  const nodeTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tzOffsetMin = new Date().getTimezoneOffset();
  const tzOffsetHrs = -tzOffsetMin / 60;

  console.log('════════════════════════════════════════════');
  console.log('  SERVER ENVIRONMENT');
  console.log('════════════════════════════════════════════');
  console.log(`  process.env.TZ           : ${process.env.TZ ?? '(unset → uses OS timezone)'}`);
  console.log(`  Node.js resolved timezone: ${nodeTZ}`);
  console.log(`  Node.js UTC offset       : ${tzOffsetHrs >= 0 ? '+' : ''}${tzOffsetHrs}h`);
  console.log(`  Server "now" (UTC)       : ${new Date().toISOString()}`);
  console.log('');

  // ═════════════════════════════════════════════════════════════════════
  //  2. Find user
  // ═════════════════════════════════════════════════════════════════════
  const user = await User.findOne({ username: USERNAME })
    .select('_id firstName lastName username address')
    .lean();

  if (!user) {
    console.error(`❌ User "${USERNAME}" not found`);
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`🎯 User: ${user.firstName} ${user.lastName} (${user._id})`);
  if (user.address?.state) {
    console.log(`   Address state: ${user.address.state}, ${user.address.country ?? ''}`);
  }
  console.log('');

  // ═════════════════════════════════════════════════════════════════════
  //  3. Fetch transactions
  // ═════════════════════════════════════════════════════════════════════
  const filter = { userId: user._id };
  if (MATCH) filter.description = { $regex: MATCH, $options: 'i' };

  const txs = await Transaction.find(filter)
    .sort({ date: -1, _id: -1 })
    .limit(15)
    .lean();

  if (!txs.length) {
    console.error(`❌ No transactions found${MATCH ? ` matching "${MATCH}"` : ''}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log('════════════════════════════════════════════');
  console.log(`  ${txs.length} TRANSACTION(S) — same instant, viewed per timezone`);
  console.log('════════════════════════════════════════════\n');

  for (const t of txs) {
    const d = new Date(t.date);
    console.log(`─────────────────────────────────────────────`);
    console.log(`  ${t.description}`);
    console.log(`  amount  : ${t.amount >= 0 ? '+' : ''}${t.amount}`);
    console.log(`  stored  : ${d.toISOString()}    (raw UTC byte value)`);
    console.log('');
    for (const z of ZONES) {
      console.log(`    ${pad(z.label, 20)} ${pad(z.code, 14)} ${fmt(d, z.tz)}`);
    }
    console.log('');
  }

  // ═════════════════════════════════════════════════════════════════════
  //  4. "What the browser shows" — an educated guess
  // ═════════════════════════════════════════════════════════════════════
  console.log('════════════════════════════════════════════');
  console.log('  WHAT THE BROWSER PROBABLY SHOWS');
  console.log('════════════════════════════════════════════');
  console.log('');
  console.log('  The frontend calls toLocaleTimeString() WITHOUT a timezone,');
  console.log('  so the browser uses the OS timezone of whoever is viewing.');
  console.log('');
  console.log('  If you\'re viewing from Nigeria   → times appear in WAT (UTC+1)');
  console.log('  If you\'re viewing from Arkansas  → times appear in CST/CDT');
  console.log('  If you\'re viewing from the UAE   → times appear in GST (UTC+4)');
  console.log('');
  console.log('  EXAMPLE: "Titan Blockchain Capital Profit Credit" was pinned to');
  console.log('  4:38 PM US/Central. Here\'s what each viewer sees:');

  const sampleCentral = new Date('2026-09-19T21:38:00Z'); // 4:38 PM CDT
  for (const z of ZONES) {
    console.log(`    ${pad(z.label, 20)} → ${fmt(sampleCentral, z.tz)}`);
  }
  console.log('');

  // ═════════════════════════════════════════════════════════════════════
  //  5. The three fixes
  // ═════════════════════════════════════════════════════════════════════
  console.log('════════════════════════════════════════════');
  console.log('  THE FIX — PICK ONE');
  console.log('════════════════════════════════════════════');
  console.log('');
  console.log('  Fix A (recommended): Pin the timezone in the frontend.');
  console.log('    Every formatTime() call adds `timeZone: \'America/Chicago\'`.');
  console.log('    All viewers see US/Central times, no matter where they are.');
  console.log('');
  console.log('  Fix B: Have the backend send a pre-formatted `time` string.');
  console.log('    `date.toLocaleTimeString(\'en-US\', { timeZone: \'America/Chicago\' })`');
  console.log('    The frontend then displays it verbatim.');
  console.log('');
  console.log('  Fix C: Store times as strings instead of Dates.');
  console.log('    Loses timezone info entirely, but is stable for display.');
  console.log('    Not recommended — breaks date math.');
  console.log('');

  console.log('🎉 Done.\n');

  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});