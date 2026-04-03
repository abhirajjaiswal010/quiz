const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: 'd:/clubQUiz/backend/.env' });

const ResultSchema = new mongoose.Schema({ roll: String, score: Number });
const Result = mongoose.model('Result', ResultSchema);

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const count = await Result.countDocuments();
  console.log('TOTAL RESULTS IN DB:', count);
  const samples = await Result.find().limit(2);
  console.log('SAMPLES:', samples);
  process.exit(0);
}
check();
