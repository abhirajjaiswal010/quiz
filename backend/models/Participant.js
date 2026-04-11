const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  studentId: { type: String, required: true },
  quizId: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now },
});

// Ensure (studentId + quizId) is unique
participantSchema.index({ studentId: 1, quizId: 1 }, { unique: true });

// Auto-delete after 1 hour (TTL Index) 
participantSchema.index({ joinedAt: 1 }, { expireAfterSeconds: 3600 });

module.exports = mongoose.model('Participant', participantSchema);
