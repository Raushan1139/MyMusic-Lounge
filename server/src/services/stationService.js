const { Station, Track, Playlist } = require('../models');

class StationService {
  constructor() {
    this.stationId = null;
    this.name = 'MyMusic Lounge Radio';
    this.description = 'Curated audio sanctuary broadcasting synchronized vibes to the lounge.';
    this.currentTrack = null;
    this.playbackState = 'STOPPED'; // PLAYING, PAUSED, STOPPED
    this.positionSeconds = 0;
    this.startedAt = null;
    this.queue = [];
    this.history = [];
    this.defaultPlaylistId = null;
    this.io = null;
    this.initialized = false;
  }

  setIO(ioInstance) {
    this.io = ioInstance;
  }

  async ensureInitialized() {
    if (!this.initialized || !this.stationId) {
      await this.init();
    }
  }

  async init() {
    try {
      let station = await Station.findOne();

      if (!station) {
        console.log('[StationService] No station found, creating default...');
        station = await Station.create({
          name: 'MyMusic Lounge Radio',
          description: 'Curated audio sanctuary broadcasting synchronized vibes to the lounge.',
          playbackState: 'STOPPED',
          positionSeconds: 0,
          queue: [],
        });
      }

      this.stationId = station.id;
      this.name = station.name;
      this.description = station.description;
      this.playbackState = station.playbackState || 'STOPPED';
      this.positionSeconds = station.positionSeconds || 0;
      this.startedAt = this.playbackState === 'PLAYING' ? Date.now() : null;
      this.defaultPlaylistId = station.defaultPlaylistId || null;

      // Resolve current track if ID or object
      if (station.currentTrack) {
        const curId = station.currentTrack._id ? station.currentTrack._id.toString() : station.currentTrack.toString();
        this.currentTrack = await Track.findById(curId);
      } else {
        this.currentTrack = null;
      }

      // Resolve queue
      const resolvedQueue = [];
      if (Array.isArray(station.queue)) {
        for (const q of station.queue) {
          const tId = q.track?._id ? q.track._id.toString() : q.track?.toString();
          const trk = q.track?.title ? q.track : await Track.findById(tId);
          if (trk) {
            resolvedQueue.push({
              id: q._id ? q._id.toString() : q.id || tId,
              trackId: trk.id,
              position: q.position || 0,
              track: trk.toObject ? trk.toObject() : trk,
            });
          }
        }
      }
      this.queue = resolvedQueue;
      this.initialized = true;

      console.log(`[StationService] Station initialized: "${this.name}" | State: ${this.playbackState}`);
    } catch (err) {
      console.error('[StationService] Error initializing station:', err.message);
    }
  }

  getCurrentPosition() {
    if (this.playbackState === 'PLAYING' && this.startedAt) {
      const elapsed = (Date.now() - this.startedAt) / 1000;
      return Math.max(0, this.positionSeconds + elapsed);
    }
    return this.positionSeconds;
  }

  getState() {
    return {
      id: this.stationId,
      name: this.name,
      description: this.description,
      currentTrack: this.currentTrack ? (this.currentTrack.toObject ? this.currentTrack.toObject() : this.currentTrack) : null,
      playbackState: this.playbackState,
      positionSeconds: this.getCurrentPosition(),
      updatedAt: new Date().toISOString(),
      queue: this.queue,
      history: this.history.slice(0, 10),
    };
  }

  broadcastState(event = 'station:state') {
    if (this.io) {
      this.io.emit(event, this.getState());
    }
  }

  async play() {
    await this.ensureInitialized();
    if (!this.currentTrack && this.queue.length > 0) {
      await this.nextTrack();
      return this.getState();
    }

    this.playbackState = 'PLAYING';
    this.startedAt = Date.now();

    await Station.findByIdAndUpdate(this.stationId, {
      playbackState: 'PLAYING',
      positionSeconds: this.positionSeconds,
    });

    this.broadcastState('station:playback-updated');
    return this.getState();
  }

  async pause() {
    await this.ensureInitialized();
    if (this.playbackState === 'PLAYING') {
      this.positionSeconds = this.getCurrentPosition();
    }
    this.playbackState = 'PAUSED';
    this.startedAt = null;

    await Station.findByIdAndUpdate(this.stationId, {
      playbackState: 'PAUSED',
      positionSeconds: this.positionSeconds,
    });

    this.broadcastState('station:playback-updated');
    return this.getState();
  }

  async seek(seconds) {
    await this.ensureInitialized();
    this.positionSeconds = Math.max(0, parseFloat(seconds) || 0);
    if (this.playbackState === 'PLAYING') {
      this.startedAt = Date.now();
    }

    await Station.findByIdAndUpdate(this.stationId, {
      positionSeconds: this.positionSeconds,
    });

    this.broadcastState('station:playback-updated');
    return this.getState();
  }

  async setCurrentTrack(trackId) {
    await this.ensureInitialized();
    const track = await Track.findById(trackId);
    if (!track) {
      throw new Error('Track not found');
    }

    if (this.currentTrack) {
      const prev = this.currentTrack.toObject ? this.currentTrack.toObject() : this.currentTrack;
      this.history.unshift(prev);
      if (this.history.length > 20) this.history.pop();
    }

    this.currentTrack = track;
    this.positionSeconds = 0;
    this.playbackState = 'PLAYING';
    this.startedAt = Date.now();

    await Station.findByIdAndUpdate(this.stationId, {
      currentTrack: track.id,
      playbackState: 'PLAYING',
      positionSeconds: 0,
    });

    this.broadcastState('station:track-changed');
    return this.getState();
  }

  async nextTrack() {
    await this.ensureInitialized();
    if (this.queue.length > 0) {
      const nextItem = this.queue.shift();

      // Update remaining in DB
      const dbQueue = this.queue.map((q, idx) => ({
        track: q.trackId,
        position: idx,
      }));
      await Station.findByIdAndUpdate(this.stationId, { queue: dbQueue });

      await this.setCurrentTrack(nextItem.trackId);
    } else if (this.defaultPlaylistId) {
      const pl = await Playlist.findById(this.defaultPlaylistId);
      if (pl && pl.tracks && pl.tracks.length > 0) {
        const first = pl.tracks[0];
        const tId = first.track?._id ? first.track._id.toString() : first.track?.toString();
        await this.setCurrentTrack(tId);
      } else {
        this.playbackState = 'STOPPED';
        this.broadcastState('station:playback-updated');
      }
    } else {
      this.playbackState = 'STOPPED';
      this.broadcastState('station:playback-updated');
    }

    this.broadcastState('station:queue-updated');
    return this.getState();
  }

  async addToQueue(trackId) {
    await this.ensureInitialized();
    const track = await Track.findById(trackId);
    if (!track) {
      throw new Error('Track not found in catalog');
    }

    const position = this.queue.length;
    const queueItem = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trackId: track.id,
      position,
      track: track.toObject ? track.toObject() : track,
    };

    this.queue.push(queueItem);

    // Save queue in DB
    const dbQueue = this.queue.map((q, idx) => ({
      track: q.trackId,
      position: idx,
    }));
    await Station.findByIdAndUpdate(this.stationId, { queue: dbQueue });

    if (!this.currentTrack || this.playbackState === 'STOPPED') {
      await this.nextTrack();
    } else {
      this.broadcastState('station:queue-updated');
    }

    return this.getState();
  }

  async removeFromQueue(queueId) {
    await this.ensureInitialized();
    this.queue = this.queue.filter((q) => q.id !== queueId);

    // Re-index
    this.queue.forEach((q, idx) => {
      q.position = idx;
    });

    const dbQueue = this.queue.map((q, idx) => ({
      track: q.trackId,
      position: idx,
    }));
    await Station.findByIdAndUpdate(this.stationId, { queue: dbQueue });

    this.broadcastState('station:queue-updated');
    return this.getState();
  }

  async reorderQueue(orderedQueueIds) {
    await this.ensureInitialized();
    if (!Array.isArray(orderedQueueIds)) return this.getState();

    const idToItem = new Map(this.queue.map((item) => [item.id, item]));
    const newQueue = [];

    for (let i = 0; i < orderedQueueIds.length; i++) {
      const item = idToItem.get(orderedQueueIds[i]);
      if (item) {
        item.position = i;
        newQueue.push(item);
      }
    }

    this.queue = newQueue;

    const dbQueue = this.queue.map((q, idx) => ({
      track: q.trackId,
      position: idx,
    }));
    await Station.findByIdAndUpdate(this.stationId, { queue: dbQueue });

    this.broadcastState('station:queue-updated');
    return this.getState();
  }

  async updateStationDetails({ name, description, defaultPlaylistId }) {
    await this.ensureInitialized();
    const updateData = {};
    if (name) {
      this.name = name;
      updateData.name = name;
    }
    if (description !== undefined) {
      this.description = description;
      updateData.description = description;
    }
    if (defaultPlaylistId !== undefined) {
      this.defaultPlaylistId = defaultPlaylistId;
      updateData.defaultPlaylist = defaultPlaylistId || null;
    }

    await Station.findByIdAndUpdate(this.stationId, updateData);
    this.broadcastState('station:state');
    return this.getState();
  }
}

module.exports = new StationService();
