const express = require('express');
const router = express.Router();
const {
  createMedicine,
  getMedicinesByPatient,
  updateMedicine,
  deleteMedicine,
} = require('../controllers/medicineController');
const { protect } = require('../middleware/auth');

// All medicine routes require authentication
router.post('/', protect, createMedicine);
router.get('/:patientId', protect, getMedicinesByPatient);
router.put('/:id', protect, updateMedicine);
router.delete('/:id', protect, deleteMedicine);

module.exports = router;
