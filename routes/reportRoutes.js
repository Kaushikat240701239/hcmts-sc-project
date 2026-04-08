const express = require('express');
const router = express.Router();
const { generateCSV, generatePDF } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/csv', protect, authorize('admin', 'warden'), generateCSV);
router.get('/pdf', protect, authorize('admin', 'warden'), generatePDF);

module.exports = router;
