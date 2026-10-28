const prisma = require('../config/db');

exports.getFavorites = async (req, res, next) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: { track: true },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      favorites: favorites.map((f) => ({
        id: f.id,
        createdAt: f.createdAt,
        track: f.track,
      })),
    });
  } catch (error) {
    next(error);
  }
};

exports.addFavorite = async (req, res, next) => {
  try {
    const { trackId } = req.params;

    const track = await prisma.track.findUnique({ where: { id: trackId } });
    if (!track) {
      return res.status(404).json({ success: false, message: 'Track not found.' });
    }

    const favorite = await prisma.favorite.upsert({
      where: {
        userId_trackId: {
          userId: req.user.id,
          trackId,
        },
      },
      update: {},
      create: {
        userId: req.user.id,
        trackId,
      },
      include: { track: true },
    });

    return res.status(201).json({
      success: true,
      message: 'Track saved to your favorites.',
      favorite,
    });
  } catch (error) {
    next(error);
  }
};

exports.removeFavorite = async (req, res, next) => {
  try {
    const { trackId } = req.params;

    await prisma.favorite.deleteMany({
      where: {
        userId: req.user.id,
        trackId,
      },
    });

    return res.json({ success: true, message: 'Track removed from favorites.' });
  } catch (error) {
    next(error);
  }
};
