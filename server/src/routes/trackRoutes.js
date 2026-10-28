const express = require('express');
const router = express.Router();
const trackController = require('../controllers/trackController');
const { protect, requireAdmin, optionalAuth } = require('../middleware/auth');

// Public / optional auth
router.get('/', optionalAuth, trackController.getTracks);
router.get('/:id', trackController.getTrackById);
router.post('/validate-url', optionalAuth, trackController.validateVideoUrl);

// Admin catalog management
router.post('/admin', protect, requireAdmin, trackController.createTrack);
router.patch('/admin/:id', protect, requireAdmin, trackController.updateTrack);
router.delete('/admin/:id', protect, requireAdmin, trackController.deleteTrack);

module.exports = router;
