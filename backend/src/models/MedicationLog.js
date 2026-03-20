const mongoose = require('mongoose');

/**
 * MedicationLog Schema
 * Records each time a patient takes (or misses) a medicine.
 * confirmationMethod tracks HOW the patient confirmed the dose:
 *   - 'manual'  = clicked a button
 *   - 'voice'   = used voice confirmation
 *   - 'camera'  = used camera pill verification
 */
const medicationLogSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true,
  },
  scheduledTime: {
    type: String, // "HH:MM" format — the scheduled slot this log corresponds to
    default: '',
  },
  takenTime: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['taken', 'missed'],
    default: 'taken',
  },
  confirmationMethod: {
    type: String,
    enum: ['manual', 'voice', 'camera'],
    default: 'manual',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('MedicationLog', medicationLogSchema);
