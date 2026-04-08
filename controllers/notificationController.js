const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    if (notification.user_id !== req.user.id) return res.status(401).json({ success: false, message: 'Not authorized' });

    notification.is_read = true;
    await notification.save();
    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Admin: Send notification to specific user
// @route   POST /api/notifications/admin/send
// @access  Private (Admin)
exports.adminSendNotification = async (req, res) => {
  const { user_id, message } = req.body;
  try {
    const notification = await Notification.create({ user_id, message });
    res.status(201).json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Admin: Broadcast notification to all users
// @route   POST /api/notifications/admin/broadcast
// @access  Private (Admin)
exports.broadcastNotification = async (req, res) => {
  const { message } = req.body;
  const User = require('../models/User');
  try {
    const users = await User.findAll({ attributes: ['id'] });
    const notifications = users.map(u => ({ user_id: u.id, message }));
    await Notification.bulkCreate(notifications);
    res.json({ success: true, message: `Notification broadcasted to ${users.length} users.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
