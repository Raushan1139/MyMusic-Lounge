const { Playlist, Track, User } = require('../models');
const { validatePlaylist } = require('../validators');
const { normalizeYouTubeTrack, extractYouTubeVideoId } = require('../utils/youtube');

/**
 * Helper to populate playlist owner and track details
 */
async function populatePlaylist(playlistDoc) {
  if (!playlistDoc) return null;
  const pl = playlistDoc.toObject ? playlistDoc.toObject() : { ...playlistDoc };

  // Resolve owner
  if (pl.owner && typeof pl.owner === 'object' && pl.owner.username) {
    pl.owner = {
      id: pl.owner._id ? pl.owner._id.toString() : pl.owner.id,
      username: pl.owner.username,
      avatarUrl: pl.owner.avatarUrl,
    };
  } else if (pl.owner) {
    const ownerDoc = await User.findById(pl.owner);
    pl.owner = ownerDoc
      ? { id: ownerDoc.id, username: ownerDoc.username, avatarUrl: ownerDoc.avatarUrl }
      : { id: pl.owner.toString(), username: 'Lounge Member' };
  }

  // Resolve tracks
  if (Array.isArray(pl.tracks)) {
    const resolvedTracks = [];
    for (const pt of pl.tracks) {
      let trackObj = pt.track;
      if (!trackObj?.title) {
        trackObj = await Track.findById(pt.track);
      }
      if (trackObj) {
        resolvedTracks.push({
          id: pt._id ? pt._id.toString() : pt.id || pt.track.toString(),
          playlistId: pl.id,
          trackId: trackObj.id,
          position: pt.position || 0,
          addedAt: pt.addedAt,
          track: trackObj.toObject ? trackObj.toObject() : trackObj,
        });
      }
    }
    // Sort by position
    resolvedTracks.sort((a, b) => a.position - b.position);
    pl.tracks = resolvedTracks;
  }

  pl._count = { tracks: pl.tracks?.length || 0 };
  return pl;
}

/**
 * Get playlists (public curated playlists or user's personal playlists)
 */
exports.getPlaylists = async (req, res, next) => {
  try {
    const { mine, search } = req.query;
    const query = {};

    if (mine === 'true') {
      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: 'Authentication required to view your personal playlists.' });
      }
      query.owner = req.user.id;
    } else {
      query.isPublic = true;
      query.isPublished = true;
    }

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    const rawPlaylists = await Playlist.find(query).sort({ createdAt: -1 });
    const playlists = await Promise.all(rawPlaylists.map(populatePlaylist));

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
    const raw = await Playlist.findById(id);

    if (!raw) {
      return res.status(404).json({ success: false, message: 'Playlist not found.' });
    }

    const playlist = await populatePlaylist(raw);

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

    const raw = await Playlist.create({
      name: name.trim(),
      description: description ? description.trim() : null,
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
      owner: req.user.id,
      isPublic: Boolean(isPublic),
      isPublished: req.user.role === 'ADMIN' ? Boolean(isPublished) : true,
      tracks: [],
    });

    const playlist = await populatePlaylist(raw);

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

    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found.' });
    }

    const ownerIdStr = playlist.owner?._id ? playlist.owner._id.toString() : playlist.owner.toString();
    if (ownerIdStr !== req.user.id && req.user.role !== 'ADMIN') {
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

    const updated = await Playlist.findByIdAndUpdate(id, updateData, { new: true });
    const result = await populatePlaylist(updated);

    return res.json({ success: true, message: 'Playlist updated.', playlist: result });
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
    const playlist = await Playlist.findById(id);

    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found.' });
    }

    const ownerIdStr = playlist.owner?._id ? playlist.owner._id.toString() : playlist.owner.toString();
    if (ownerIdStr !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You can only delete your own playlists.' });
    }

    await Playlist.findByIdAndDelete(id);
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

    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found.' });
    }

    const ownerIdStr = playlist.owner?._id ? playlist.owner._id.toString() : playlist.owner.toString();
    if (ownerIdStr !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You can only add tracks to your own playlist.' });
    }

    let finalTrackId = trackId;

    if (!finalTrackId && youtubeUrl) {
      const videoId = extractYouTubeVideoId(youtubeUrl);
      if (!videoId) {
        return res.status(400).json({ success: false, message: 'Invalid YouTube link provided.' });
      }

      let existingTrack = await Track.findOne({
        provider: 'youtube',
        providerVideoId: videoId,
      });

      if (!existingTrack) {
        const norm = normalizeYouTubeTrack(videoId);
        existingTrack = await Track.create({
          title: title ? title.trim() : `YouTube Video (${videoId})`,
          artist: artist ? artist.trim() : 'Personal Selection',
          thumbnailUrl: norm.thumbnailUrl,
          provider: 'youtube',
          providerVideoId: videoId,
          durationSeconds: 180,
          isPublished: true,
        });
      }
      finalTrackId = existingTrack.id;
    }

    if (!finalTrackId) {
      return res.status(400).json({ success: false, message: 'Please provide a trackId or a valid youtubeUrl.' });
    }

    const tracksList = playlist.tracks || [];
    const alreadyPresent = tracksList.some(
      (pt) => (pt.track?._id ? pt.track._id.toString() : pt.track?.toString()) === finalTrackId
    );

    if (alreadyPresent) {
      return res.status(409).json({ success: false, message: 'This song is already in the playlist.' });
    }

    const position = tracksList.length;
    tracksList.push({
      track: finalTrackId,
      position,
      addedAt: new Date(),
    });

    await Playlist.findByIdAndUpdate(id, { tracks: tracksList });

    const trackObj = await Track.findById(finalTrackId);

    return res.status(201).json({
      success: true,
      message: 'Song added to playlist.',
      item: {
        playlistId: id,
        trackId: finalTrackId,
        position,
        track: trackObj,
      },
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

    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found.' });
    }

    const ownerIdStr = playlist.owner?._id ? playlist.owner._id.toString() : playlist.owner.toString();
    if (ownerIdStr !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You can only modify your own playlist.' });
    }

    const tracksList = (playlist.tracks || []).filter(
      (pt) => (pt.track?._id ? pt.track._id.toString() : pt.track?.toString()) !== trackId
    );

    // Re-index
    tracksList.forEach((pt, index) => {
      pt.position = index;
    });

    await Playlist.findByIdAndUpdate(id, { tracks: tracksList });

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

    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found.' });
    }

    const ownerIdStr = playlist.owner?._id ? playlist.owner._id.toString() : playlist.owner.toString();
    if (ownerIdStr !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You can only reorder your own playlist.' });
    }

    const trackMap = new Map();
    (playlist.tracks || []).forEach((pt) => {
      const tId = pt.track?._id ? pt.track._id.toString() : pt.track?.toString();
      trackMap.set(tId, pt);
    });

    const newTracks = [];
    for (let i = 0; i < orderedTrackIds.length; i++) {
      const item = trackMap.get(orderedTrackIds[i]);
      if (item) {
        item.position = i;
        newTracks.push(item);
      }
    }

    await Playlist.findByIdAndUpdate(id, { tracks: newTracks });

    return res.json({ success: true, message: 'Playlist tracks reordered successfully.' });
  } catch (error) {
    next(error);
  }
};
