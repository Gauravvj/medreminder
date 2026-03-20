const express = require('express');
const router = express.Router();
const { register, login, getMe, getPatients, linkPatient, unlinkPatient } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.get('/patients', protect, getPatients);
router.put('/link-patient/:patientId', protect, authorize('caregiver'), linkPatient);
router.put('/unlink-patient/:patientId', protect, authorize('caregiver'), unlinkPatient);

module.exports = router;
