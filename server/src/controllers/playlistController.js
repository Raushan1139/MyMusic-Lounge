const prisma = require('../config/db');
const { validatePlaylist } = require('../validators');
const { normalizeYouTubeTrack, extractYouTubeVideoId } = require('../utils/youtube');

/**
 * Get playlists (public curated playlists or user's personal playlists)
 */
exports.getPlaylists = async (req, res, next) => {
  try {
    const { mine, search } = req.query;
    const where = {};

    if (mine === 'true') {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required to view your personal playlists.' });
      }
      where.ownerId = req.user.id;
    } else {
      where.isPublic = true;
      where.isPublished = true;
    }

    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim() } },
        { description: { contains: search.trim() } },
      ];
    }

    const playlists = await prisma.playlist.findMany({
      where,
      include: {
        owner: {
          select: { id: true, username: true, avatarUrl: true },
        },
        _count: {
          select: { tracks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, playlists });
  } catch (error) {
    next(error);
  }
};

/**
 * Get playlist by ID with tracks ordered by position
 */
exports.getPlaylistById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, username: true, avatarUrl: true },
        },
        tracks: {
          include: { track: true },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found.' });
    }

    // If private, only owner or admin can view
    if (!playlist.isPublic) {
      if (!req.user || (req.user.id !== playlist.ownerId && req.user.role !== 'ADMIN')) {
        return res.status(403).json({ success: false, message: 'This playlist is private.' });
      }
    }

    return res.json({ success: true, playlist });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new playlist
 */
exports.createPlaylist = async (req, res, next) => {
  try {
    const { isValid, errors } = validatePlaylist(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    const { name, description, coverUrl, isPublic = true, isPublished = true } = req.body;

    const playlist = await prisma.playlist.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        coverUrl: coverUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
        ownerId: req.user.id,
        isPublic: Boolean(isPublic),
        isPublished: req.user.role === 'ADMIN' ? Boolean(isPublished) : true,
      },
      include: {
        owner: {
          select: { id: true, username: true, avatarUrl: true },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Playlist created successfully.',
      playlist,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update playlist details
 */
exports.updatePlaylist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, coverUrl, isPublic, isPublished } = req.body;

    const playlist = await prisma.playlist.findUnique({ where: { id } });
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found.' });
    }

    if (playlist.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You can only edit your own playlists.' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (coverUrl !== undefined) updateData.coverUrl = coverUrl;
    if (isPublic !== undefined) updateData.isPublic = Boolean(isPublic);
    if (isPublished !== undefined && req.user.role === 'ADMIN') {
      updateData.isPublished = Boolean(isPublished);
    }

    const updated = await prisma.playlist.update({
      where: { id },
      data: updateData,
    });

    return res.json({ success: true, message: 'Playlist updated.', playlist: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete playlist
 */
exports.deletePlaylist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const playlist = await prisma.playlist.findUnique({ where: { id } });

    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found.' });
    }

    if (playlist.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You can only delete your own playlists.' });
    }

    await prisma.playlist.delete({ where: { id } });
    return res.json({ success: true, message: 'Playlist deleted.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Add track to playlist (Supports existing trackId OR direct YouTube URL/ID)
 */
exports.addTrackToPlaylist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { trackId, youtubeUrl, title, artist } = req.body;

    const playlist = await prisma.playlist.findUnique({ where: { id } });
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found.' });
    }

    if (playlist.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You can only add tracks to your own playlist.' });
    }

    let finalTrackId = trackId;

    // If a direct YouTube URL or video ID is provided instead of existing catalog trackId
    if (!finalTrackId && youtubeUrl) {
      const videoId = extractYouTubeVideoId(youtubeUrl);
      if (!videoId) {
        return res.status(400).json({ success: false, message: 'Invalid YouTube link provided.' });
      }

      // Find or create in catalog
      let existingTrack = await prisma.track.findUnique({
        where: {
          provider_providerVideoId: {
            provider: 'youtube',
            providerVideoId: videoId,
          },
        },
      });

      if (!existingTrack) {
        const norm = normalizeYouTubeTrack(videoId);
        existingTrack = await prisma.track.create({
          data: {
            title: title ? title.trim() : `YouTube Video (${videoId})`,
            artist: artist ? artist.trim() : 'Personal Selection',
            thumbnailUrl: norm.thumbnailUrl,
            provider: 'youtube',
            providerVideoId: videoId,
            durationSeconds: 180,
            isPublished: true,
          },
        });
      }
      finalTrackId = existingTrack.id;
    }

    if (!finalTrackId) {
      return res.status(400).json({ success: false, message: 'Please provide a trackId or a valid youtubeUrl.' });
    }

    // Check if track is already in this playlist
    const existingEntry = await prisma.playlistTrack.findUnique({
      where: {
        playlistId_trackId: {
          playlistId: id,
          trackId: finalTrackId,
        },
      },
    });

    if (existingEntry) {
      return res.status(409).json({ success: false, message: 'This song is already in the playlist.' });
    }

    const currentCount = await prisma.playlistTrack.count({ where: { playlistId: id } });

    const item = await prisma.playlistTrack.create({
      data: {
        playlistId: id,
        trackId: finalTrackId,
        position: currentCount,
      },
      include: { track: true },
    });

    return res.status(201).json({
      success: true,
      message: 'Song added to playlist.',
      item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove track from playlist
 */
exports.removeTrackFromPlaylist = async (req, res, next) => {
  try {
    const { id, trackId } = req.params;

    const playlist = await prisma.playlist.findUnique({ where: { id } });
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found.' });
    }

    if (playlist.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You can only modify your own playlist.' });
    }

    await prisma.playlistTrack.deleteMany({
      where: {
        playlistId: id,
        trackId,
      },
    });

    // Re-index remaining tracks in order
    const remaining = await prisma.playlistTrack.findMany({
      where: { playlistId: id },
      orderBy: { position: 'asc' },
    });

    for (let i = 0; i < remaining.length; i++) {
      await prisma.playlistTrack.update({
        where: { id: remaining[i].id },
        data: { position: i },
      });
    }

    return res.json({ success: true, message: 'Song removed from playlist.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Reorder tracks in playlist
 */
exports.reorderPlaylistTracks = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderedTrackIds } = req.body;

    if (!Array.isArray(orderedTrackIds)) {
      return res.status(400).json({ success: false, message: 'orderedTrackIds array is required.' });
    }

    const playlist = await prisma.playlist.findUnique({ where: { id } });
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found.' });
    }

    if (playlist.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You can only reorder your own playlist.' });
    }

    for (let i = 0; i < orderedTrackIds.length; i++) {
      await prisma.playlistTrack.updateMany({
        where: {
          playlistId: id,
          trackId: orderedTrackIds[i],
        },
        data: { position: i },
      });
    }

    return res.json({ success: true, message: 'Playlist tracks reordered successfully.' });
  } catch (error) {
    next(error);
  }
};
