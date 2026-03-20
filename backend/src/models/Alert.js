const mongoose = require('mongoose');

/**
 * Alert Schema
 * Created when a patient misses a medicine or a notable event occurs.
 * Linked to both patient and caregiver for easy retrieval.
 */
const alertSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  caregiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['missed_dose', 'double_dose_attempt', 'low_cognitive_score', 'general'],
    default: 'missed_dose',
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Alert', alertSchema);
