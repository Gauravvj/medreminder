const MedicationLog = require('../models/MedicationLog');
const Medicine = require('../models/Medicine');
const Alert = require('../models/Alert');
const User = require('../models/User');

/**
 * DOUBLE DOSE PREVENTION HELPER
 * Checks if the same medicine was already logged within a 2-hour window.
 * Returns true if a duplicate exists (i.e., should block).
 */
const isDuplicateDose = async (patientId, medicineId) => {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  const recentLog = await MedicationLog.findOne({
    patientId,
    medicineId,
    status: 'taken',
    takenTime: { $gte: twoHoursAgo },
  });

  return !!recentLog;
};

/**
 * Create a medication log (patient took their medicine).
 * Includes double-dose prevention — rejects if same medicine was
 * logged within the last 2 hours.
 * POST /api/logs
 */
const createLog = async (req, res) => {
  try {
    const { patientId, medicineId, confirmationMethod, scheduledTime } = req.body;

    // DOUBLE DOSE PREVENTION: check for recent log of same medicine
    const duplicate = await isDuplicateDose(patientId, medicineId);
    if (duplicate) {
      // Also alert caregivers about the double-dose attempt
      const caregivers = await User.find({
        role: 'caregiver',
        linkedPatients: patientId,
      });

      const medicine = await Medicine.findById(medicineId);

      for (const cg of caregivers) {
        await Alert.create({
          patientId,
          caregiverId: cg._id,
          type: 'double_dose_attempt',
          message: `Double dose attempt detected for ${medicine?.medicineName || 'unknown medicine'}`,
        });
      }

      return res.status(409).json({
        message: '⚠️ Warning: This medicine was already taken recently. Duplicate dose blocked.',
        isDuplicate: true,
      });
    }

    // Create the medication log
    const log = await MedicationLog.create({
      patientId,
      medicineId,
      confirmationMethod: confirmationMethod || 'manual',
      scheduledTime: scheduledTime || '',
      status: 'taken',
      takenTime: new Date(),
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create log', error: error.message });
  }
};

/**
 * Get all medication logs for a specific patient.
 * Supports optional date filtering via query params: ?from=...&to=...
 * GET /api/logs/:patientId
 */
const getLogsByPatient = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = { patientId: req.params.patientId };

    // Optional date range filter
    if (from || to) {
      filter.takenTime = {};
      if (from) filter.takenTime.$gte = new Date(from);
      if (to) filter.takenTime.$lte = new Date(to);
    }

    const logs = await MedicationLog.find(filter)
      .populate('medicineId', 'medicineName dosage')
      .sort({ takenTime: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get logs', error: error.message });
  }
};

/**
 * Get adherence statistics for a patient.
 * Returns counts of taken vs missed doses.
 * GET /api/logs/stats/:patientId
 */
const getStats = async (req, res) => {
  try {
    const patientId = req.params.patientId;

    const totalLogs = await MedicationLog.countDocuments({ patientId });
    const takenCount = await MedicationLog.countDocuments({ patientId, status: 'taken' });
    const missedCount = await MedicationLog.countDocuments({ patientId, status: 'missed' });

    const adherenceRate = totalLogs > 0 ? Math.round((takenCount / totalLogs) * 100) : 0;

    res.json({
      totalLogs,
      takenCount,
      missedCount,
      adherenceRate,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get stats', error: error.message });
  }
};

module.exports = { createLog, getLogsByPatient, getStats };
