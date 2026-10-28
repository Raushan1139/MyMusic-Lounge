const stationService = require('../services/stationService');
const presenceService = require('../services/presenceService');
const prisma = require('../config/db');

/**
 * Public: Get current station status
 */
exports.getStationState = async (req, res, next) => {
  try {
    const state = stationService.getState();
    const listenerCount = presenceService.getCount();

    return res.json({
      success: true,
      station: {
        ...state,
        listenerCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public: Get station queue
 */
exports.getStationQueue = async (req, res, next) => {
  try {
    const queue = stationService.queue;
    return res.json({ success: true, queue });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Change current station track
 */
exports.setCurrentTrack = async (req, res, next) => {
  try {
    const { trackId } = req.body;
    if (!trackId) {
      return res.status(400).json({ success: false, message: 'trackId is required.' });
    }

    const state = await stationService.setCurrentTrack(trackId);
    return res.json({
      success: true,
      message: 'Station track updated.',
      station: state,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Add track to station queue
 */
exports.addToQueue = async (req, res, next) => {
  try {
    const { trackId } = req.body;
    if (!trackId) {
      return res.status(400).json({ success: false, message: 'trackId is required.' });
    }

    const state = await stationService.addToQueue(trackId);
    return res.status(201).json({
      success: true,
      message: 'Track added to station queue.',
      station: state,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Remove track from queue
 */
exports.removeFromQueue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const state = await stationService.removeFromQueue(id);
    return res.json({
      success: true,
      message: 'Track removed from station queue.',
      station: state,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Reorder queue
 */
exports.reorderQueue = async (req, res, next) => {
  try {
    const { orderedQueueIds } = req.body;
    if (!Array.isArray(orderedQueueIds)) {
      return res.status(400).json({ success: false, message: 'orderedQueueIds must be an array.' });
    }

    const state = await stationService.reorderQueue(orderedQueueIds);
    return res.json({
      success: true,
      message: 'Station queue reordered.',
      station: state,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Station control action (play, pause, seek, next) or update details
 */
exports.updateStation = async (req, res, next) => {
  try {
    const { action, position, name, description, defaultPlaylistId } = req.body;

    let updatedState;

    if (action === 'play') {
      updatedState = await stationService.play();
    } else if (action === 'pause') {
      updatedState = await stationService.pause();
    } else if (action === 'seek') {
      updatedState = await stationService.seek(position);
    } else if (action === 'next') {
      updatedState = await stationService.nextTrack();
    } else {
      updatedState = await stationService.updateStationDetails({ name, description, defaultPlaylistId });
    }

    return res.json({
      success: true,
      message: `Station ${action || 'updated'} successfully.`,
      station: updatedState,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Real Dashboard Overview Statistics (no fake numbers)
 */
exports.getAdminStats = async (req, res, next) => {
  try {
    const [totalUsers, totalTracks, totalPlaylists, recentUsers, recentTracks] = await Promise.all([
      prisma.user.count(),
      prisma.track.count(),
      prisma.playlist.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, username: true, email: true, role: true, createdAt: true },
      }),
      prisma.track.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const activeListeners = presenceService.getCount();
    const stationState = stationService.getState();

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalTracks,
        totalPlaylists,
        activeListeners,
        stationState: stationState.playbackState,
        currentTrack: stationState.currentTrack,
        recentUsers,
        recentTracks,
      },
    });
  } catch (error) {
    next(error);
  }
};
