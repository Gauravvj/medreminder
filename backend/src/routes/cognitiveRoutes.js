const express = require('express');
const router = express.Router();
const { saveResult, getResultsByPatient } = require('../controllers/cognitiveController');
const { protect } = require('../middleware/auth');

router.post('/', protect, saveResult);
router.get('/:patientId', protect, getResultsByPatient);

module.exports = router;
