const mongoose = require('mongoose');

const stationQueueSubSchema = new mongoose.Schema(
  {
    track: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Track',
      required: true,
    },
    position: {
      type: Number,
      default: 0,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const stationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'MyMusic Lounge Radio',
    },
    description: {
      type: String,
      default: 'Curated audio sanctuary broadcasting synchronized vibes to the lounge.',
    },
    currentTrack: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Track',
      default: null,
    },
    defaultPlaylist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Playlist',
      default: null,
    },
    playbackState: {
      type: String,
      enum: ['PLAYING', 'PAUSED', 'STOPPED'],
      default: 'STOPPED',
    },
    positionSeconds: {
      type: Number,
      default: 0,
    },
    queue: [stationQueueSubSchema],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.currentTrackId = ret.currentTrack?._id ? ret.currentTrack._id.toString() : ret.currentTrack?.toString();
        ret.defaultPlaylistId = ret.defaultPlaylist?._id ? ret.defaultPlaylist._id.toString() : ret.defaultPlaylist?.toString();
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.currentTrackId = ret.currentTrack?._id ? ret.currentTrack._id.toString() : ret.currentTrack?.toString();
        ret.defaultPlaylistId = ret.defaultPlaylist?._id ? ret.defaultPlaylist._id.toString() : ret.defaultPlaylist?.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.models.Station || mongoose.model('Station', stationSchema);
