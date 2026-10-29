const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    artist: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    album: {
      type: String,
      trim: true,
      default: null,
    },
    thumbnailUrl: {
      type: String,
      default: null,
    },
    provider: {
      type: String,
      default: 'youtube',
    },
    providerVideoId: {
      type: String,
      required: true,
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound unique index on provider + providerVideoId
trackSchema.index({ provider: 1, providerVideoId: 1 }, { unique: true });

module.exports = mongoose.models.Track || mongoose.model('Track', trackSchema);
