const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', historyController.getHistory);
router.post('/', historyController.recordHistory);

module.exports = router;
