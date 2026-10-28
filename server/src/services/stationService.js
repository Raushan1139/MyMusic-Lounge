const prisma = require('../config/db');

class StationService {
  constructor() {
    this.stationId = null;
    this.name = 'MyMusic Lounge Radio';
    this.description = 'Curated lounge audio stream';
    this.currentTrack = null;
    this.playbackState = 'STOPPED'; // PLAYING, PAUSED, STOPPED
    this.positionSeconds = 0;
    this.startedAt = null;
    this.queue = [];
    this.history = [];
    this.defaultPlaylistId = null;
    this.io = null;
  }

  setIO(ioInstance) {
    this.io = ioInstance;
  }

  async init() {
    try {
      let station = await prisma.station.findFirst({
        include: {
          currentTrack: true,
          queue: {
            include: { track: true },
            orderBy: { position: 'asc' },
          },
        },
      });

      if (!station) {
        console.log('[StationService] No station found in DB, creating default...');
        station = await prisma.station.create({
          data: {
            name: 'MyMusic Lounge Radio',
            description: 'Curated audio sanctuary broadcasting synchronized vibes to the lounge.',
            playbackState: 'STOPPED',
          },
          include: {
            currentTrack: true,
            queue: {
              include: { track: true },
              orderBy: { position: 'asc' },
            },
          },
        });
      }

      this.stationId = station.id;
      this.name = station.name;
      this.description = station.description;
      this.currentTrack = station.currentTrack;
      this.playbackState = station.playbackState;
      this.positionSeconds = station.positionSeconds || 0;
      this.startedAt = this.playbackState === 'PLAYING' ? Date.now() : null;
      this.defaultPlaylistId = station.defaultPlaylistId;
      this.queue = station.queue.map((q) => ({
        id: q.id,
        position: q.position,
        trackId: q.trackId,
        track: q.track,
      }));

      console.log(`[StationService] Station initialized: "${this.name}" | State: ${this.playbackState}`);
    } catch (err) {
      console.error('[StationService] Error initializing station:', err.message);
    }
  }

  async ensureInitialized() {
    if (!this.stationId) {
      await this.init();
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
      currentTrack: this.currentTrack,
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

    await prisma.station.update({
      where: { id: this.stationId },
      data: {
        playbackState: 'PLAYING',
        positionSeconds: this.positionSeconds,
      },
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

    await prisma.station.update({
      where: { id: this.stationId },
      data: {
        playbackState: 'PAUSED',
        positionSeconds: this.positionSeconds,
      },
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

    await prisma.station.update({
      where: { id: this.stationId },
      data: { positionSeconds: this.positionSeconds },
    });

    this.broadcastState('station:playback-updated');
    return this.getState();
  }

  async setCurrentTrack(trackId) {
    await this.ensureInitialized();
    const track = await prisma.track.findUnique({ where: { id: trackId } });
    if (!track) {
      throw new Error('Track not found');
    }

    if (this.currentTrack) {
      this.history.unshift(this.currentTrack);
      if (this.history.length > 20) this.history.pop();
    }

    this.currentTrack = track;
    this.positionSeconds = 0;
    this.playbackState = 'PLAYING';
    this.startedAt = Date.now();

    await prisma.station.update({
      where: { id: this.stationId },
      data: {
        currentTrackId: track.id,
        playbackState: 'PLAYING',
        positionSeconds: 0,
      },
    });

    this.broadcastState('station:track-changed');
    return this.getState();
  }

  async nextTrack() {
    await this.ensureInitialized();
    if (this.queue.length > 0) {
      const nextItem = this.queue.shift();

      // Delete from DB StationQueue
      await prisma.stationQueue.delete({ where: { id: nextItem.id } }).catch(() => {});

      // Re-index remaining queue
      for (let i = 0; i < this.queue.length; i++) {
        this.queue[i].position = i;
        await prisma.stationQueue.update({
          where: { id: this.queue[i].id },
          data: { position: i },
        }).catch(() => {});
      }

      await this.setCurrentTrack(nextItem.trackId);
    } else if (this.defaultPlaylistId) {
      // Loop default playlist tracks if queue empty
      const playlistTracks = await prisma.playlistTrack.findMany({
        where: { playlistId: this.defaultPlaylistId },
        include: { track: true },
        orderBy: { position: 'asc' },
      });

      if (playlistTracks.length > 0) {
        const next = playlistTracks[0].track;
        await this.setCurrentTrack(next.id);
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
    const track = await prisma.track.findUnique({ where: { id: trackId } });
    if (!track) {
      throw new Error('Track not found in catalog');
    }

    const position = this.queue.length;
    const queueRecord = await prisma.stationQueue.create({
      data: {
        stationId: this.stationId,
        trackId: track.id,
        position,
      },
      include: { track: true },
    });

    this.queue.push({
      id: queueRecord.id,
      position: queueRecord.position,
      trackId: queueRecord.trackId,
      track: queueRecord.track,
    });

    // If currently stopped or no current track, play it immediately!
    if (!this.currentTrack || this.playbackState === 'STOPPED') {
      await this.nextTrack();
    } else {
      this.broadcastState('station:queue-updated');
    }

    return this.getState();
  }

  async removeFromQueue(queueId) {
    await this.ensureInitialized();
    await prisma.stationQueue.delete({ where: { id: queueId } }).catch(() => {});
    this.queue = this.queue.filter((q) => q.id !== queueId);

    // Re-index
    for (let i = 0; i < this.queue.length; i++) {
      this.queue[i].position = i;
      await prisma.stationQueue.update({
        where: { id: this.queue[i].id },
        data: { position: i },
      }).catch(() => {});
    }

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
        await prisma.stationQueue.update({
          where: { id: item.id },
          data: { position: i },
        }).catch(() => {});
      }
    }

    this.queue = newQueue;
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
      updateData.defaultPlaylistId = defaultPlaylistId;
    }

    await prisma.station.update({
      where: { id: this.stationId },
      data: updateData,
    });

    this.broadcastState('station:state');
    return this.getState();
  }
}

module.exports = new StationService();
