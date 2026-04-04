/**
 * promote-admin.js — One-time script to promote a user to admin
 *
 * Usage:
 *   node scripts/promote-admin.js your@email.com
 *
 * Run from backend/:
 *   cd backend && node scripts/promote-admin.js your@email.com
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/modules/users/user.model.js';

const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/promote-admin.js <email>');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);

const user = await User.findOneAndUpdate(
  { email },
  { role: 'admin' },
  { new: true }
);

if (!user) {
  console.error(`❌ No user found with email: ${email}`);
  process.exit(1);
}

console.log(`✅ ${user.name} (${user.email}) is now admin`);
await mongoose.disconnect();
