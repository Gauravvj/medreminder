const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Location = require('../models/Location');
const User = require('../models/User');

/**
 * POST /api/location/update
 * Patient sends their current GPS coordinates.
 * Updates User.lastLocation and creates a Location history record.
 */
router.post('/update', protect, authorize('patient'), async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude == null || longitude == null) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    // Update user's last known location
    await User.findByIdAndUpdate(req.user._id, {
      lastLocation: {
        lat: latitude,
        lng: longitude,
        updatedAt: new Date(),
      },
    });

    // Save location history record
    await Location.create({
      userId: req.user._id,
      latitude,
      longitude,
    });

    res.json({ message: 'Location updated successfully' });
  } catch (err) {
    console.error('Location update error:', err);
    res.status(500).json({ message: 'Failed to update location' });
  }
});

/**
 * GET /api/location/patients
 * Caregiver fetches live locations for all their linked patients.
 */
router.get('/patients', protect, authorize('caregiver'), async (req, res) => {
  try {
    // Get the caregiver's linked patients with their last location
    const caregiver = await User.findById(req.user._id).populate({
      path: 'linkedPatients',
      select: 'name email lastLocation',
    });

    if (!caregiver) {
      return res.status(404).json({ message: 'Caregiver not found' });
    }

    const patientLocations = (caregiver.linkedPatients || []).map((p) => ({
      _id: p._id,
      name: p.name,
      email: p.email,
      lastLocation: p.lastLocation || null,
    }));

    res.json(patientLocations);
  } catch (err) {
    console.error('Fetch patient locations error:', err);
    res.status(500).json({ message: 'Failed to fetch patient locations' });
  }
});

/**
 * GET /api/location/history/:patientId
 * Caregiver fetches location history for a specific patient (last 50 entries).
 */
router.get('/history/:patientId', protect, authorize('caregiver'), async (req, res) => {
  try {
    const locations = await Location.find({ userId: req.params.patientId })
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    res.json(locations);
  } catch (err) {
    console.error('Location history error:', err);
    res.status(500).json({ message: 'Failed to fetch location history' });
  }
});

module.exports = router;
