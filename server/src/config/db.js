const mongoose = require('mongoose');
const config = require('./index');

let isConnected = false;
let isMemoryFallback = false;

async function connectDB() {
  if (isConnected) return;

  const uri = config.mongodbUri;
  const maskedUri = uri.replace(/\/\/[^@]+@/, '//***:***@');

  try {
    console.log(`[MongoDB] Connecting to MongoDB at ${maskedUri}...`);
    // Connect with a 2.5s timeout so startup doesn't hang if local mongod is not running
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    isConnected = true;
    isMemoryFallback = false;
    console.log(`[MongoDB] Successfully connected to MongoDB database.`);
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
