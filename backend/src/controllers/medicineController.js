const Medicine = require('../models/Medicine');

/**
 * Create a new medicine for a patient.
 * POST /api/medicines
 */
const createMedicine = async (req, res) => {
  try {
    const { patientId, medicineName, dosage, scheduleTimes, instructions } = req.body;

    const medicine = await Medicine.create({
      patientId,
      medicineName,
      dosage,
      scheduleTimes,
      instructions,
    });

    res.status(201).json(medicine);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create medicine', error: error.message });
  }
};

/**
 * Get all medicines for a specific patient.
 * GET /api/medicines/:patientId
 */
const getMedicinesByPatient = async (req, res) => {
  try {
    const medicines = await Medicine.find({
      patientId: req.params.patientId,
      active: true,
    }).sort({ createdAt: -1 });

    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get medicines', error: error.message });
  }
};

/**
 * Update a medicine by ID.
 * PUT /api/medicines/:id
 */
const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update medicine', error: error.message });
  }
};

/**
 * Soft-delete a medicine (set active to false).
 * DELETE /api/medicines/:id
 */
const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json({ message: 'Medicine deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete medicine', error: error.message });
  }
};

module.exports = { createMedicine, getMedicinesByPatient, updateMedicine, deleteMedicine };
