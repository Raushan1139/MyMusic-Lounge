const { ListeningHistory, Track } = require('../models');

exports.getHistory = async (req, res, next) => {
  try {
    const rawHistory = await ListeningHistory.find({ user: req.user.id })
      .sort({ playedAt: -1 })
      .limit(50);

    const history = [];
    for (const h of rawHistory) {
      let trackObj = h.track;
      if (!trackObj?.title) {
        trackObj = await Track.findById(h.track);
      }
      if (trackObj) {
        history.push({
          id: h.id,
          playedAt: h.playedAt,
          track: trackObj.toObject ? trackObj.toObject() : trackObj,
        });
      }
    }

    return res.json({ success: true, history });
  } catch (error) {
    next(error);
  }
};

exports.recordHistory = async (req, res, next) => {
  try {
    const { trackId } = req.body;
    if (!trackId) {
      return res.status(400).json({ success: false, message: 'trackId is required.' });
    }

    const entry = await ListeningHistory.create({
      user: req.user.id,
      track: trackId,
      playedAt: new Date(),
    });

    const track = await Track.findById(trackId);

    return res.status(201).json({
      success: true,
      entry: {
        id: entry.id,
        playedAt: entry.playedAt,
        track,
      },
    });
  } catch (error) {
    next(error);
  }
};
