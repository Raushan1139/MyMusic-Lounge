const { isDatabaseConnected } = require('../config/db');
const MemoryCollection = require('./memoryCollection');

// Mongoose Models
const UserMongoose = require('./User');
const TrackMongoose = require('./Track');
const PlaylistMongoose = require('./Playlist');
const FavoriteMongoose = require('./Favorite');
const ListeningHistoryMongoose = require('./ListeningHistory');
const StationMongoose = require('./Station');
const ChatMessageMongoose = require('./ChatMessage');
const AppSettingMongoose = require('./AppSetting');

// In-Memory Fallback Collections
const memoryStores = {
  User: new MemoryCollection('User'),
  Track: new MemoryCollection('Track'),
  Playlist: new MemoryCollection('Playlist'),
  Favorite: new MemoryCollection('Favorite'),
  ListeningHistory: new MemoryCollection('ListeningHistory'),
  Station: new MemoryCollection('Station'),
  ChatMessage: new MemoryCollection('ChatMessage'),
  AppSetting: new MemoryCollection('AppSetting'),
};

/**
 * Creates a smart proxy that routes calls to Mongoose (if connected to MongoDB)
 * or to the high-performance in-memory store (for offline dev/tests).
 */
function createModelProxy(mongooseModel, modelName) {
  const memoryStore = memoryStores[modelName];

  return new Proxy(mongooseModel, {
    get(target, prop) {
      if (isDatabaseConnected()) {
        return target[prop];
      }
      if (typeof memoryStore[prop] === 'function') {
        return memoryStore[prop].bind(memoryStore);
      }
      return target[prop];
    },
  });
}

const User = createModelProxy(UserMongoose, 'User');
const Track = createModelProxy(TrackMongoose, 'Track');
const Playlist = createModelProxy(PlaylistMongoose, 'Playlist');
const Favorite = createModelProxy(FavoriteMongoose, 'Favorite');
const ListeningHistory = createModelProxy(ListeningHistoryMongoose, 'ListeningHistory');
const Station = createModelProxy(StationMongoose, 'Station');
const ChatMessage = createModelProxy(ChatMessageMongoose, 'ChatMessage');
const AppSetting = createModelProxy(AppSettingMongoose, 'AppSetting');

module.exports = {
  User,
  Track,
  Playlist,
  Favorite,
  ListeningHistory,
  Station,
  ChatMessage,
  AppSetting,
  memoryStores,
};
