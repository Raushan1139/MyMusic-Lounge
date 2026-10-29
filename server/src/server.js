const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const config = require('./config');
const { connectDB, mongoose } = require('./config/db');
const stationService = require('./services/stationService');
const initSockets = require('./sockets');

const server = http.createServer(app);

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: [
      config.clientUrl,
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
    credentials: true,
  },
  pingTimeout: 30000,
  pingInterval: 10000,
});

// Initialize real-time features
initSockets(io);

async function startServer() {
  try {
    // 1. Connect to MongoDB database (with graceful zero-config memory fallback)
    await connectDB();

    // 2. Initialize station state
    await stationService.init();

    server.listen(config.port, () => {
      console.log(`===============================================`);
      console.log(`  🎵 MyMusic Lounge Server Running!`);
      console.log(`  🗄️  Database    : MongoDB`);
      console.log(`  📻 Environment : ${config.nodeEnv}`);
      console.log(`  🌐 Port        : ${config.port}`);
      console.log(`  🔗 Client URL  : ${config.clientUrl}`);
      console.log(`  🚀 API Health  : http://localhost:${config.port}/api/health`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down server gracefully...');
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('\nSIGTERM received, shutting down...');
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
  server.close(() => {
    process.exit(0);
  });
});

startServer();
