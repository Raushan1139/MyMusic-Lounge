const mongoose = require('mongoose');
const config = require('./index');

let isConnected = false;
let isMemoryFallback = false;

async function connectDB() {
  if (isConnected || isMemoryFallback) return;

  const uri = config.mongodbUri;
  const maskedUri = uri.replace(/\/\/[^@]+@/, '//***:***@');
  const isAtlas = uri.startsWith('mongodb+srv://') || uri.includes('mongodb.net');
  const timeoutMs = isAtlas ? 10000 : 2500;

  try {
    console.log(`[MongoDB] Connecting to MongoDB ${isAtlas ? 'Atlas Cluster' : 'Server'} at ${maskedUri}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: timeoutMs,
    });
    isConnected = true;
    isMemoryFallback = false;
    console.log(`[MongoDB] Successfully connected to MongoDB database (${mongoose.connection.name || 'mymusic_lounge'}).`);
  } catch (err) {
    isConnected = false;
    isMemoryFallback = true;
    console.warn(`[MongoDB] Note: Direct connection to ${maskedUri} timed out or was not reachable (${err.message}).`);
    console.warn(`[MongoDB] Operating in high-speed in-memory database mode for zero-dependency local development and testing.`);
    console.warn(`[MongoDB] To connect to a live MongoDB instance, configure MONGODB_URI in your .env file.`);
  }
}

function isDatabaseConnected() {
  return isConnected;
}

function isUsingMemoryFallback() {
  return isMemoryFallback;
}

module.exports = {
  connectDB,
  isDatabaseConnected,
  isUsingMemoryFallback,
  mongoose,
};
