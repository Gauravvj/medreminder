const mongoose = require('mongoose');

/**
 * Medicine Schema
 * Represents a prescribed medicine for a patient.
 * scheduleTimes is an array of time strings (e.g., ["08:00", "14:00", "20:00"])
 * indicating when the medicine should be taken each day.
 */
const medicineSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  medicineName: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true,
  },
  dosage: {
    type: String,
    required: [true, 'Dosage is required'],
    trim: true,
  },
  // Array of time strings in "HH:MM" 24-hour format
  scheduleTimes: [{
    type: String,
    required: true,
  }],
  instructions: {
    type: String,
    default: '',
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Medicine', medicineSchema);
