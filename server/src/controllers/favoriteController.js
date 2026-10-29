const { Favorite, Track } = require('../models');

exports.getFavorites = async (req, res, next) => {
  try {
    const rawFavorites = await Favorite.find({ user: req.user.id }).sort({ createdAt: -1 });

    const favorites = [];
    for (const fav of rawFavorites) {
      let trackObj = fav.track;
      if (!trackObj?.title) {
        trackObj = await Track.findById(fav.track);
      }
      if (trackObj) {
        favorites.push({
          id: fav.id,
          createdAt: fav.createdAt,
          track: trackObj.toObject ? trackObj.toObject() : trackObj,
        });
      }
    }

    return res.json({ success: true, favorites });
  } catch (error) {
    next(error);
  }
};

exports.addFavorite = async (req, res, next) => {
  try {
    const { trackId } = req.params;

    const track = await Track.findById(trackId);
    if (!track) {
      return res.status(404).json({ success: false, message: 'Track not found.' });
    }

    const favorite = await Favorite.findOneAndUpdate(
      { user: req.user.id, track: trackId },
      { user: req.user.id, track: trackId, createdAt: new Date() },
      { upsert: true, new: true }
    );

    return res.status(201).json({
      success: true,
      message: 'Track saved to your favorites.',
      favorite: {
        id: favorite.id,
        createdAt: favorite.createdAt,
        track: track.toObject ? track.toObject() : track,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.removeFavorite = async (req, res, next) => {
  try {
    const { trackId } = req.params;

    await Favorite.deleteMany({
      user: req.user.id,
      track: trackId,
    });

    return res.json({ success: true, message: 'Track removed from favorites.' });
  } catch (error) {
    next(error);
  }
};
