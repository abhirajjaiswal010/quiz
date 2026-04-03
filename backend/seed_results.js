const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: 'd:/clubQUiz/backend/.env' });

const Result = require('./models/Result');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Result.deleteMany({});
  
  const sampleResults = [
    { name: 'Alice Smith', roll: '2023CS001', email: 'alice@test.com', department: 'CSE', score: 18, timeTaken: 120 },
    { name: 'Bob Johnson', roll: '2023IT042', email: 'bob@test.com', department: 'IT', score: 15, timeTaken: 150 },
    { name: 'Charlie Dave', roll: '2023EC010', email: 'charlie@test.com', department: 'ECE', score: 18, timeTaken: 110 }, // Higher rank than Alice due to time
    { name: 'Daisy Miller', roll: '2023ME005', email: 'daisy@test.com', department: 'ME', score: 12, timeTaken: 200 },
  ];

  await Result.insertMany(sampleResults);
  console.log('SEEDED 4 SAMPLE RESULTS');
  process.exit(0);
}
seed();
