require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndexes() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected');

  const db = mongoose.connection.db;

  // Fix participants collection
  try {
    await db.collection('participants').dropIndex('email_1');
    console.log('✅ Dropped stale email_1 index from participants');
  } catch (e) {
    console.log('ℹ️  email_1 index not found (already clean):', e.message);
  }

  // Also drop old unique roll_1 index from participants (replaced by compound roll+quizId)
  try {
    await db.collection('participants').dropIndex('roll_1');
    console.log('✅ Dropped stale roll_1 index from participants');
  } catch (e) {
    console.log('ℹ️  roll_1 index not found (already clean):', e.message);
  }

  // Fix results collection - drop stale single-field unique indexes
  try {
    await db.collection('results').dropIndex('email_1');
    console.log('✅ Dropped stale email_1 index from results');
  } catch (e) {
    console.log('ℹ️  email_1 index not found on results:', e.message);
  }

  try {
    await db.collection('results').dropIndex('roll_1');
    console.log('✅ Dropped stale roll_1 index from results');
  } catch (e) {
    console.log('ℹ️  roll_1 index not found on results:', e.message);
  }

  console.log('\n✅ Index cleanup complete. Server is ready.');
  process.exit(0);
}

fixIndexes().catch(err => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
