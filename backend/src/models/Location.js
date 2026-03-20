const mongoose = require('mongoose');

/**
 * Location Schema
 * Stores the most recent GPS location for each patient.
 * Only one document per patient (upserted on each update).
 */
const locationSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required'],
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required'],
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-update the timestamp on every save
locationSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Location', locationSchema);
