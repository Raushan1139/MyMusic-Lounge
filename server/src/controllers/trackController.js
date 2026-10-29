const { Track } = require('../models');
const { validateTrack } = require('../validators');
const { normalizeYouTubeTrack } = require('../utils/youtube');

/**
 * Get all published catalog tracks (with search, pagination, and sorting)
 */
exports.getTracks = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 50, all = false } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const query = {};

    // Non-admins can only view published tracks
    if (!all || !req.user || req.user.role !== 'ADMIN') {
      query.isPublished = true;
    }

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { artist: { $regex: q, $options: 'i' } },
        { album: { $regex: q, $options: 'i' } },
      ];
    }

    const [tracks, total] = await Promise.all([
      Track.find(query).sort({ createdAt: -1 }).skip(skip).limit(take),
      Track.countDocuments(query),
    ]);

    return res.json({
      success: true,
      tracks,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: take,
        pages: Math.ceil(total / take) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single track by ID
 */
exports.getTrackById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const track = await Track.findById(id);

    if (!track) {
      return res.status(404).json({ success: false, message: 'Track not found.' });
    }

    return res.json({ success: true, track });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper endpoint to validate and preview a YouTube video URL before saving
 */
exports.validateVideoUrl = async (req, res) => {
  const { url, videoId } = req.body;
  const input = url || videoId;

  const normalized = normalizeYouTubeTrack(input);
  if (!normalized) {
    return res.status(400).json({
      success: false,
      message:
        'Invalid YouTube URL or Video ID. Please provide a standard YouTube video link (e.g. https://www.youtube.com/watch?v=...) or 11-character video ID.',
    });
  }

  // Check if already in catalog
  const existing = await Track.findOne({
    provider: 'youtube',
    providerVideoId: normalized.providerVideoId,
  });

  return res.json({
    success: true,
    data: normalized,
    alreadyInCatalog: Boolean(existing),
    existingTrackId: existing?.id || null,
  });
};

/**
 * Create track in catalog (Admin only)
 */
exports.createTrack = async (req, res, next) => {
  try {
    const { isValid, errors, resolvedVideoId } = validateTrack(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    const {
      title,
      artist,
      album,
      thumbnailUrl,
      durationSeconds = 180,
      isPublished = true,
      provider = 'youtube',
    } = req.body;

    const normalized = normalizeYouTubeTrack(resolvedVideoId);

    // Check duplicate
    const existing = await Track.findOne({
      provider,
      providerVideoId: resolvedVideoId,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'This video is already in the music catalog.',
        track: existing,
      });
    }

    const track = await Track.create({
      title: title.trim(),
      artist: artist.trim(),
      album: album ? album.trim() : null,
      thumbnailUrl: thumbnailUrl || normalized.thumbnailUrl,
      provider,
      providerVideoId: resolvedVideoId,
      durationSeconds: parseInt(durationSeconds, 10) || 180,
      isPublished: Boolean(isPublished),
    });

    return res.status(201).json({
      success: true,
      message: 'Song successfully added to lounge catalog.',
      track,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update track metadata (Admin only)
 */
exports.updateTrack = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, artist, album, thumbnailUrl, durationSeconds, isPublished } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (artist !== undefined) updateData.artist = artist.trim();
    if (album !== undefined) updateData.album = album ? album.trim() : null;
    if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl;
    if (durationSeconds !== undefined) updateData.durationSeconds = parseInt(durationSeconds, 10);
    if (isPublished !== undefined) updateData.isPublished = Boolean(isPublished);

    const updated = await Track.findByIdAndUpdate(id, updateData, { new: true });

    return res.json({
      success: true,
      message: 'Track updated successfully.',
      track: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete track from catalog (Admin only)
 */
exports.deleteTrack = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Track.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Track deleted from catalog.' });
  } catch (error) {
    next(error);
  }
};
