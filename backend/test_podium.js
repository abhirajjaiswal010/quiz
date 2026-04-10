/**
 * test_podium.js
 * Specialized seed script to visualize the new Leaderboard Podium.
 * Targets the "HACK-24" quiz session.
 */
const mongoose = require('mongoose');
require('dotenv').config();

const Quiz = require('./models/Quiz');
const Result = require('./models/Result');

const MONGO_URI = process.env.MONGO_URI;
const QUIZ_ID = "HACK-24";

async function run() {
  try {
    console.log('🔗 Connecting to database...');
    await mongoose.connect(MONGO_URI);
    
    // 1. Ensure the Quiz exists and is TERMINATED (to show podium)
    console.log(`📝 Setting up Quiz session: ${QUIZ_ID}...`);
    await Quiz.findOneAndUpdate(
      { quizId: QUIZ_ID },
      { 
        isActive: false, 
        duration: 15, 
        startedAt: null,
        createdAt: new Date()
      },
      { upsert: true, new: true }
    );

    // 2. Clear previous results for this quiz
    await Result.deleteMany({ quizId: QUIZ_ID });

    // 3. Insert specific results to create a clear Top 3
    const testResults = [
      {
        name: "Abhiraj Jaiswal",
        roll: "21BCS6548",
        quizId: QUIZ_ID,
        score: (10 * 1000) + 420, // 10 correct + 420s remaining
        correctAnswers: 10,
        wrongAnswers: 0,
        totalQuestions: 10,
        timeTaken: 480,
        remainingTime: 420,
        submittedAt: new Date()
      },
      {
        name: "Elon Musk",
        roll: "X-01",
        quizId: QUIZ_ID,
        score: (9 * 1000) + 120,
        correctAnswers: 9,
        wrongAnswers: 1,
        totalQuestions: 10,
        timeTaken: 780,
        remainingTime: 120,
        submittedAt: new Date()
      },
      {
        name: "Ada Lovelace",
        roll: "ALG-01",
        quizId: QUIZ_ID,
        score: (10 * 1000) + 50,
        correctAnswers: 10,
        wrongAnswers: 0,
        totalQuestions: 10,
        timeTaken: 850,
        remainingTime: 50,
        submittedAt: new Date()
      },
      {
        name: "John Doe",
        roll: "ROLL-004",
        quizId: QUIZ_ID,
        score: (5 * 1000) + 300,
        correctAnswers: 5,
        wrongAnswers: 5,
        totalQuestions: 10,
        timeTaken: 600,
        remainingTime: 300,
        submittedAt: new Date()
      },
      {
        name: "Jane Smith",
        roll: "ROLL-005",
        quizId: QUIZ_ID,
        score: (2 * 1000) + 10,
        correctAnswers: 2,
        wrongAnswers: 8,
        totalQuestions: 10,
        timeTaken: 890,
        remainingTime: 10,
        submittedAt: new Date()
      }
    ];

    await Result.insertMany(testResults);
    console.log('✅ SEEDED 5 RESULTS into HACK-24');
    console.log('🏆 1st: Abhiraj Jaiswal');
    console.log('🥈 2nd: Ada Lovelace');
    console.log('🥉 3rd: Elon Musk');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  }
}

run();
