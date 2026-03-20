const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Location = require('../models/Location');
const User = require('../models/User');
const Alert = require('../models/Alert');

// ── Haversine formula — distance between two GPS points in km ──
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// In-memory throttle map: patientId -> last alert timestamp
const geofenceAlertThrottle = new Map();
const THROTTLE_MS = 30 * 60 * 1000; // 30 minutes
const GEOFENCE_RADIUS_KM = 5;

/**
 * POST /api/location/update
 * Patient sends their current GPS coordinates.
 * Also checks for geofence breach and alerts caregivers.
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

    // ── Geofence breach detection ──────────────────────
    const patient = await User.findById(req.user._id).lean();
    const gc = patient.geofenceCenter;

    if (gc && gc.lat != null && gc.lng != null) {
      const distance = haversineKm(latitude, longitude, gc.lat, gc.lng);

      if (distance > GEOFENCE_RADIUS_KM) {
        // Throttle: only alert once every 30 minutes per patient
        const lastAlert = geofenceAlertThrottle.get(req.user._id.toString());
        const now = Date.now();

        if (!lastAlert || now - lastAlert > THROTTLE_MS) {
          geofenceAlertThrottle.set(req.user._id.toString(), now);

          // Find all caregivers linked to this patient
          const caregivers = await User.find({
            role: 'caregiver',
            linkedPatients: req.user._id,
          }).lean();

          // Create a geofence breach alert for each caregiver
          const alertPromises = caregivers.map((cg) =>
            Alert.create({
              patientId: req.user._id,
              caregiverId: cg._id,
              type: 'geofence_breach',
              message: `🚨 ${patient.name} has moved ${distance.toFixed(1)}km away from their safe zone! Please check on them immediately.`,
            })
          );
          await Promise.all(alertPromises);

          console.log(`⚠️ Geofence breach: ${patient.name} is ${distance.toFixed(1)}km from safe zone`);
        }
      }
    }

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
    const caregiver = await User.findById(req.user._id).populate({
      path: 'linkedPatients',
      select: 'name email lastLocation geofenceCenter',
    });

    if (!caregiver) {
      return res.status(404).json({ message: 'Caregiver not found' });
    }

    const patientLocations = (caregiver.linkedPatients || []).map((p) => ({
      _id: p._id,
      name: p.name,
      email: p.email,
      lastLocation: p.lastLocation || null,
      geofenceCenter: p.geofenceCenter || null,
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

/**
 * POST /api/location/geofence
 * Caregiver sets / updates a patient's geofence center (safe zone).
 */
router.post('/geofence', protect, authorize('caregiver'), async (req, res) => {
  try {
    const { patientId, latitude, longitude } = req.body;

    if (!patientId || latitude == null || longitude == null) {
      return res.status(400).json({ message: 'patientId, latitude, and longitude are required' });
    }

    // Verify this caregiver is linked to the patient
    const caregiver = await User.findById(req.user._id).lean();
    if (!caregiver.linkedPatients?.some((id) => id.toString() === patientId)) {
      return res.status(403).json({ message: 'You are not linked to this patient' });
    }

    await User.findByIdAndUpdate(patientId, {
      geofenceCenter: { lat: latitude, lng: longitude },
    });

    res.json({ message: 'Geofence center updated successfully' });
  } catch (err) {
    console.error('Set geofence error:', err);
    res.status(500).json({ message: 'Failed to set geofence' });
  }
});

/**
 * GET /api/location/geofence/:patientId
 * Get a patient's current geofence center.
 */
router.get('/geofence/:patientId', protect, authorize('caregiver'), async (req, res) => {
  try {
    const patient = await User.findById(req.params.patientId).select('geofenceCenter').lean();

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(patient.geofenceCenter || { lat: null, lng: null });
  } catch (err) {
    console.error('Get geofence error:', err);
    res.status(500).json({ message: 'Failed to get geofence' });
  }
});

module.exports = router;

