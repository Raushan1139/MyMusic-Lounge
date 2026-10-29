const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
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
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
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

// Unique compound index on user + track
favoriteSchema.index({ user: 1, track: 1 }, { unique: true });

module.exports = mongoose.models.Favorite || mongoose.model('Favorite', favoriteSchema);
