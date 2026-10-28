const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect, requireAdmin } = require('../middleware/auth');

// Public settings (site name, tagline, theme, etc.)
router.get('/public', settingsController.getPublicSettings);

// Admin settings update
router.patch('/admin', protect, requireAdmin, settingsController.updateAdminSettings);

module.exports = router;
