const Alert = require('../models/Alert');

/**
 * Get all alerts for a caregiver.
 * GET /api/alerts/:caregiverId
 */
const getAlertsByCaregiverId = async (req, res) => {
  try {
    const alerts = await Alert.find({ caregiverId: req.params.caregiverId })
      .populate('patientId', 'name email')
      .sort({ createdAt: -1 });

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get alerts', error: error.message });
  }
};

/**
 * Mark an alert as read.
 * PUT /api/alerts/:id/read
 */
const markAlertAsRead = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update alert', error: error.message });
  }
};

/**
 * Get unread alert count for a caregiver.
 * GET /api/alerts/unread/:caregiverId
 */
const getUnreadCount = async (req, res) => {
  try {
    const count = await Alert.countDocuments({
      caregiverId: req.params.caregiverId,
      read: false,
    });

    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get unread count', error: error.message });
  }
};

module.exports = { getAlertsByCaregiverId, markAlertAsRead, getUnreadCount };
