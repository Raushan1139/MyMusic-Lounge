const API_BASE = '/api';

/**
 * Universal request wrapper
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (response.status === 401 && token) {
    // Session expired or invalid
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth:unauthorized'));
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Authentication
  auth: {
    register: (body) => request('/auth/register', { method: 'POST', body }),
    login: (body) => request('/auth/login', { method: 'POST', body }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    getMe: () => request('/auth/me'),
    updateProfile: (body) => request('/auth/profile', { method: 'PATCH', body }),
  },

  // Music Catalog Tracks
  tracks: {
    getAll: (params = '') => request(`/tracks${params ? `?${params}` : ''}`),
    getById: (id) => request(`/tracks/${id}`),
    validateUrl: (urlOrId) => request('/tracks/validate-url', { method: 'POST', body: { url: urlOrId } }),
    create: (body) => request('/tracks/admin', { method: 'POST', body }),
    update: (id, body) => request(`/tracks/admin/${id}`, { method: 'PATCH', body }),
    delete: (id) => request(`/tracks/admin/${id}`, { method: 'DELETE' }),
  },

  // Playlists
  playlists: {
    getAll: (params = '') => request(`/playlists${params ? `?${params}` : ''}`),
    getById: (id) => request(`/playlists/${id}`),
    create: (body) => request('/playlists', { method: 'POST', body }),
    update: (id, body) => request(`/playlists/${id}`, { method: 'PATCH', body }),
    delete: (id) => request(`/playlists/${id}`, { method: 'DELETE' }),
    addTrack: (playlistId, body) => request(`/playlists/${playlistId}/tracks`, { method: 'POST', body }),
    removeTrack: (playlistId, trackId) => request(`/playlists/${playlistId}/tracks/${trackId}`, { method: 'DELETE' }),
    reorder: (playlistId, orderedTrackIds) => request(`/playlists/${playlistId}/tracks/reorder`, { method: 'PUT', body: { orderedTrackIds } }),
  },

  // Favorites & History
  favorites: {
    getAll: () => request('/me/favorites'),
    add: (trackId) => request(`/me/favorites/${trackId}`, { method: 'POST' }),
    remove: (trackId) => request(`/me/favorites/${trackId}`, { method: 'DELETE' }),
  },
  history: {
    getAll: () => request('/me/history'),
    record: (trackId) => request('/me/history', { method: 'POST', body: { trackId } }),
  },

  // Station
  station: {
    getState: () => request('/station'),
    getQueue: () => request('/station/queue'),
    control: (action, position = null) => request('/station/admin', { method: 'PATCH', body: { action, position } }),
    setCurrentTrack: (trackId) => request('/station/admin/current-track', { method: 'POST', body: { trackId } }),
    addToQueue: (trackId) => request('/station/admin/queue', { method: 'POST', body: { trackId } }),
    removeFromQueue: (queueId) => request(`/station/admin/queue/${queueId}`, { method: 'DELETE' }),
    reorderQueue: (orderedQueueIds) => request('/station/admin/queue/reorder', { method: 'PUT', body: { orderedQueueIds } }),
    getAdminStats: () => request('/station/admin/stats'),
  },

  // Settings
  settings: {
    getPublic: () => request('/settings/public'),
    updateAdmin: (body) => request('/settings/admin', { method: 'PATCH', body }),
  },
};
