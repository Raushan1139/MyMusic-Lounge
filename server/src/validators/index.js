const { extractYouTubeVideoId } = require('../utils/youtube');

/**
 * Validates registration input
 */
function validateRegister(data) {
  const errors = [];
  const { username, email, password } = data;

  if (!username || typeof username !== 'string' || username.trim().length < 3 || username.trim().length > 30) {
    errors.push('Username must be between 3 and 30 characters.');
  } else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
    errors.push('Username can only contain alphanumeric characters and underscores.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.push('A valid email address is required.');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates login input
 */
function validateLogin(data) {
  const errors = [];
  const { identifier, password } = data;

  if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
    errors.push('Username or email is required.');
  }

  if (!password || typeof password !== 'string' || !password) {
    errors.push('Password is required.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates track input
 */
function validateTrack(data) {
  const errors = [];
  const { title, artist, url, videoId } = data;

  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.push('Song title is required.');
  }

  if (!artist || typeof artist !== 'string' || !artist.trim()) {
    errors.push('Artist name is required.');
  }

  const resolvedVideoId = extractYouTubeVideoId(url || videoId);
  if (!resolvedVideoId) {
    errors.push('A valid YouTube video URL or 11-character video ID is required.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    resolvedVideoId,
  };
}

/**
 * Validates playlist input
 */
function validatePlaylist(data) {
  const errors = [];
  const { name } = data;

  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push('Playlist name is required.');
  } else if (name.trim().length > 100) {
    errors.push('Playlist name cannot exceed 100 characters.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates chat message
 */
function validateChatMessage(message) {
  if (!message || typeof message !== 'string') {
    return { isValid: false, error: 'Message cannot be empty.' };
  }
  const trimmed = message.trim();
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Message cannot be empty.' };
  }
  if (trimmed.length > 500) {
    return { isValid: false, error: 'Message cannot exceed 500 characters.' };
  }
  return { isValid: true, sanitized: trimmed };
}

module.exports = {
  validateRegister,
  validateLogin,
  validateTrack,
  validatePlaylist,
  validateChatMessage,
};
