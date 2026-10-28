const prisma = require('../config/db');

exports.getHistory = async (req, res, next) => {
  try {
    const history = await prisma.listeningHistory.findMany({
      where: { userId: req.user.id },
      include: { track: true },
      orderBy: { playedAt: 'desc' },
      take: 50,
    });

    return res.json({
      success: true,
      history: history.map((h) => ({
        id: h.id,
        playedAt: h.playedAt,
        track: h.track,
      })),
    });
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

    const entry = await prisma.listeningHistory.create({
      data: {
        userId: req.user.id,
        trackId,
      },
      include: { track: true },
    });

    return res.status(201).json({ success: true, entry });
  } catch (error) {
    next(error);
  }
};
