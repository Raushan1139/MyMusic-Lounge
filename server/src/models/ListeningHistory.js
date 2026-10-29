const mongoose = require('mongoose');

const listeningHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    track: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Track',
      required: true,
    },
    playedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.userId = ret.user?._id ? ret.user._id.toString() : ret.user?.toString();
        ret.trackId = ret.track?._id ? ret.track._id.toString() : ret.track?.toString();
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.userId = ret.user?._id ? ret.user._id.toString() : ret.user?.toString();
        ret.trackId = ret.track?._id ? ret.track._id.toString() : ret.track?.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

listeningHistorySchema.index({ user: 1, playedAt: -1 });

module.exports = mongoose.models.ListeningHistory || mongoose.model('ListeningHistory', listeningHistorySchema);
