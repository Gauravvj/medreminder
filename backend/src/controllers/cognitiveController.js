const CognitiveResult = require('../models/CognitiveResult');

/**
 * Save a cognitive game result.
 * POST /api/cognitive
 */
const saveResult = async (req, res) => {
  try {
    const { patientId, gameType, score, maxScore } = req.body;

    const result = await CognitiveResult.create({
      patientId,
      gameType,
      score,
      maxScore: maxScore || 100,
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to save result', error: error.message });
  }
};

/**
 * Get cognitive results for a patient.
 * GET /api/cognitive/:patientId
 */
const getResultsByPatient = async (req, res) => {
  try {
    const results = await CognitiveResult.find({ patientId: req.params.patientId })
      .sort({ playedAt: -1 })
      .limit(50);

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get results', error: error.message });
  }
};

module.exports = { saveResult, getResultsByPatient };
