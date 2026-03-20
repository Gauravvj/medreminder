const mongoose = require('mongoose');

/**
 * CognitiveResult Schema
 * Stores results of cognitive mini-games played by patients.
 * Helps caregivers track cognitive health trends over time.
 */
const cognitiveResultSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gameType: {
    type: String,
    enum: ['pattern_memory', 'number_recall'],
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  maxScore: {
    type: Number,
    default: 100,
  },
  playedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('CognitiveResult', cognitiveResultSchema);
