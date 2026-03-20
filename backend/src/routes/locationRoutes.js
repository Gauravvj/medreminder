const express = require('express');
const router = express.Router();
const { updateLocation, getPatientLocations } = require('../controllers/locationController');
const { protect, authorize } = require('../middleware/auth');

// Patient pushes their GPS location
router.put('/update', protect, authorize('patient'), updateLocation);

// Caregiver fetches all linked patients' locations
router.get('/patients', protect, authorize('caregiver'), getPatientLocations);

module.exports = router;
