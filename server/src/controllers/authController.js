const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { User, Playlist, Favorite } = require('../models');
const { validateRegister, validateLogin } = require('../validators');

// Helper to generate JWT token
function generateToken(userId, role) {
  return jwt.sign({ userId, role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

// Helper to set cookie
function sendAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

exports.register = async (req, res, next) => {
  try {
    const { isValid, errors } = validateRegister(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    const { username, email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.trim();

    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          existingUser.email === cleanEmail
            ? 'Email address is already in use.'
            : 'Username is already taken.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      role: 'USER',
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(cleanUsername)}`,
    });

    const token = generateToken(user.id, user.role);
    sendAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully. Welcome to MyMusic Lounge!',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { isValid, errors } = validateLogin(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    const { identifier, password } = req.body;
    const cleanId = identifier.trim().toLowerCase();

    // Find user by case-insensitive email or username
    let user = await User.findOne({
      $or: [
        { email: cleanId },
        { email: { $regex: `^${cleanId}$`, $options: 'i' } },
        { username: { $regex: `^${identifier.trim()}$`, $options: 'i' } },
        { username: identifier.trim() },
      ],
    });

    // Failsafe: If attempting to login as configured admin and no user found, auto-initialize
    if (!user) {
      const defaultAdminEmail = (config.admin.email || 'admin@mymusiclounge.com').toLowerCase();
      const defaultAdminUsername = (config.admin.username || 'admin').toLowerCase();
      if (cleanId === defaultAdminEmail || cleanId === defaultAdminUsername) {
        const passwordHash = await bcrypt.hash(config.admin.password || 'AdminLounge2026!', 10);
        user = await User.create({
          username: config.admin.username || 'admin',
          email: defaultAdminEmail,
          passwordHash,
          role: 'ADMIN',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        });
        console.log('[Auth] Initialized administrator profile during login attempt.');
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/username and password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/username and password.',
      });
    }

    const token = generateToken(user.id, user.role);
    sendAuthCookie(res, token);

    return res.json({
      success: true,
      message: 'Welcome back!',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
  });
  return res.json({ success: true, message: 'Logged out successfully.' });
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const [playlistsCount, favoritesCount] = await Promise.all([
      Playlist.countDocuments({ owner: user.id }),
      Favorite.countDocuments({ user: user.id }),
    ]);

    return res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        _count: {
          playlists: playlistsCount,
          favorites: favoritesCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { username, avatarUrl } = req.body;
    const updateData = {};

    if (username && username.trim() !== req.user.username) {
      const existing = await User.findOne({ username: username.trim() });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Username is already taken.' });
      }
      updateData.username = username.trim();
    }

    if (avatarUrl) {
      updateData.avatarUrl = avatarUrl.trim();
    }

    const updated = await User.findByIdAndUpdate(req.user.id, updateData, { new: true });

    return res.json({
      success: true,
      user: {
        id: updated.id,
        username: updated.username,
        email: updated.email,
        role: updated.role,
        avatarUrl: updated.avatarUrl,
      },
      message: 'Profile updated.',
    });
  } catch (error) {
    next(error);
  }
};
