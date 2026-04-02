/**
 * One-time migration: reset quizScore and attempts on all lessonProgress
 * subdocuments across every Progress record.
 *
 * Background: the old frontend incorrectly sent quizScore: 100 on every
 * lesson completion, even when no quiz was taken. This script nullifies
 * those fake scores so only real quiz submissions are counted going forward.
 *
 * Run once:
 *   node scripts/resetQuizScores.js
 *
 * Safe to re-run (idempotent).
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');

async function run() {
  await connectDB();

  const result = await mongoose.connection.collection('progresses').updateMany(
    {},
    {
      $set: {
        'lessonProgress.$[].quizScore': null,
        'lessonProgress.$[].attempts': 0,
      },
    }
  );

  console.log(`Migration complete.`);
  console.log(`  Matched : ${result.matchedCount} progress documents`);
  console.log(`  Modified: ${result.modifiedCount} progress documents`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
