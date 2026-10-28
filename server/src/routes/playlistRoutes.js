const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const { protect, optionalAuth } = require('../middleware/auth');

// Public or personal playlists listing
router.get('/', optionalAuth, playlistController.getPlaylists);
router.get('/:id', optionalAuth, playlistController.getPlaylistById);

// Authenticated personal / admin operations
router.post('/', protect, playlistController.createPlaylist);
router.patch('/:id', protect, playlistController.updatePlaylist);
router.delete('/:id', protect, playlistController.deletePlaylist);

// Tracks inside playlist
router.post('/:id/tracks', protect, playlistController.addTrackToPlaylist);
router.delete('/:id/tracks/:trackId', protect, playlistController.removeTrackFromPlaylist);
router.put('/:id/tracks/reorder', protect, playlistController.reorderPlaylistTracks);

module.exports = router;
