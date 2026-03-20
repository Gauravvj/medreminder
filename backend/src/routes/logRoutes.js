const express = require('express');
const router = express.Router();
const { createLog, getLogsByPatient, getStats } = require('../controllers/logController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createLog);
router.get('/stats/:patientId', protect, getStats);
router.get('/:patientId', protect, getLogsByPatient);

module.exports = router;
