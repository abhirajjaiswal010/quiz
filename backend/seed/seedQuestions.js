require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/Question');

const questions = require('./questions.json');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Question.deleteMany({});
    console.log('🗑️  Cleared existing questions');

    const inserted = await Question.insertMany(questions);
    console.log(`✅ Seeded ${inserted.length} questions successfully!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seed();
