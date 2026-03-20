const express = require('express');
const router = express.Router();
const { getAlertsByCaregiverId, markAlertAsRead, getUnreadCount } = require('../controllers/alertController');
const { protect } = require('../middleware/auth');

router.get('/unread/:caregiverId', protect, getUnreadCount);
router.get('/:caregiverId', protect, getAlertsByCaregiverId);
router.put('/:id/read', protect, markAlertAsRead);

module.exports = router;
