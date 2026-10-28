const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', favoriteController.getFavorites);
router.post('/:trackId', favoriteController.addFavorite);
router.delete('/:trackId', favoriteController.removeFavorite);

module.exports = router;
