const express = require('express');
const router = express.Router();
const stationController = require('../controllers/stationController');
const { protect, requireAdmin } = require('../middleware/auth');

// Public
router.get('/', stationController.getStationState);
router.get('/queue', stationController.getStationQueue);

// Admin-controlled station actions
router.post('/admin/current-track', protect, requireAdmin, stationController.setCurrentTrack);
router.post('/admin/queue', protect, requireAdmin, stationController.addToQueue);
router.delete('/admin/queue/:id', protect, requireAdmin, stationController.removeFromQueue);
router.put('/admin/queue/reorder', protect, requireAdmin, stationController.reorderQueue);
router.patch('/admin', protect, requireAdmin, stationController.updateStation);
router.get('/admin/stats', protect, requireAdmin, stationController.getAdminStats);

module.exports = router;
