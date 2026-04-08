const express = require('express');
const router = express.Router();
const { 
  getNotifications, 
  markAsRead,
  adminSendNotification,
  broadcastNotification
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getNotifications);
router.put('/:id', protect, markAsRead);

// Admin features
router.post('/admin/send', protect, authorize('admin'), adminSendNotification);
router.post('/admin/broadcast', protect, authorize('admin'), broadcastNotification);

module.exports = router;
