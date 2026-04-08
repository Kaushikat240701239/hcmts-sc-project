const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  assignComplaint,
  resolveComplaint,
  rejectComplaint,
  updateStatus,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('student'), createComplaint);
router.get('/', protect, getComplaints);
router.put('/:id/assign', protect, authorize('warden'), assignComplaint);
router.put('/:id/resolve', protect, authorize('staff', 'warden'), resolveComplaint);
router.put('/:id/reject', protect, authorize('warden'), rejectComplaint);
router.put('/:id/status', protect, authorize('warden', 'admin'), updateStatus);

module.exports = router;
