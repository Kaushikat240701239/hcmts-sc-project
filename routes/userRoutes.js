const express = require('express');
const router = express.Router();
const { getUsers, updateUser, deleteUser, getUsersByRole } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin'), getUsers);
router.get('/role/:role', protect, getUsersByRole);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
