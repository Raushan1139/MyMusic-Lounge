require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'mymusic_lounge_super_secret_jwt_key_change_in_production_98765',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  mongodbUri:
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL ||
    'mongodb://127.0.0.1:27017/mymusic_lounge',
  redisUrl: process.env.REDIS_URL || null,
  youtubeApiKey: process.env.YOUTUBE_API_KEY || null,
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    email: process.env.ADMIN_EMAIL || 'admin@mymusiclounge.com',
    password: process.env.ADMIN_PASSWORD || 'AdminLounge2026!',
  },
};
