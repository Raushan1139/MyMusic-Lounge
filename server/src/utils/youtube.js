/**
 * YouTube URL and Video ID Parser and Normalizer
 * Adheres to official YouTube standards without scraping or downloading copyrighted media.
 */

// Regex patterns for various valid YouTube URL formats
const YOUTUBE_REGEXES = [
  // Standard watch: https://www.youtube.com/watch?v=XXXXXXXXXXX
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})(?:&.*)?/i,
  // Short URL: https://youtu.be/XXXXXXXXXXX
  /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?.*)?/i,
  // Embed URL: https://www.youtube.com/embed/XXXXXXXXXXX
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(?:\?.*)?/i,
  // Shorts URL: https://www.youtube.com/shorts/XXXXXXXXXXX
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})(?:\?.*)?/i,
  // Music URL: https://music.youtube.com/watch?v=XXXXXXXXXXX
  /(?:https?:\/\/)?music\.youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})(?:&.*)?/i,
];

// Direct 11-character video ID regex
const DIRECT_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Extract an 11-character YouTube video ID from a URL or raw ID
 * @param {string} input - YouTube URL or raw ID
 * @returns {string|null} - Normalized videoId or null if invalid
 */
function extractYouTubeVideoId(input) {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();

  // Check if it's already a direct 11-char video ID
  if (DIRECT_ID_REGEX.test(trimmed)) {
    return trimmed;
  }

  // Test against URL regexes
  for (const regex of YOUTUBE_REGEXES) {
    const match = trimmed.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Also check URL object searchParams if valid URL
  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    if (parsed.hostname.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v && DIRECT_ID_REGEX.test(v)) {
        return v;
      }
    }
  } catch {
    // Not a URL
  }

  return null;
}

/**
 * Normalizes a YouTube input into a standard payload
 * @param {string} input
 * @returns {object|null}
 */
function normalizeYouTubeTrack(input) {
  const videoId = extractYouTubeVideoId(input);
  if (!videoId) {
    return null;
  }

  return {
    provider: 'youtube',
    providerVideoId: videoId,
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${encodeURIComponent(process.env.CLIENT_URL || 'http://localhost:5173')}`,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    maxResThumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
  };
}

/**
 * Format duration in seconds to mm:ss or hh:mm:ss
 * @param {number} seconds
 * @returns {string}
 */
function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0:00';
  const sec = Math.floor(seconds);
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const remainingSecs = sec % 60;

  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  }
  return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
}

module.exports = {
  extractYouTubeVideoId,
  normalizeYouTubeTrack,
  formatDuration,
};
