const mongoose = require('mongoose');

/**
 * Location Schema
 * Stores GPS coordinates for each patient.
 * TTL index auto-deletes records older than 24 hours.
 */
const locationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    expires: 86400, // auto-delete after 24 hours
  },
});

locationSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('Location', locationSchema);
