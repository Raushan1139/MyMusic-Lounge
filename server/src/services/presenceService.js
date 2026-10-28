/**
 * Real Listener Presence Tracking Service
 * Deduplicates multiple browser tabs per user or guest session.
 * Does not fabricate artificial listener statistics.
 */
class PresenceService {
  constructor() {
    // Map of socketId -> listener info
    this.sockets = new Map();
  }

  /**
   * Register a new connected socket
   */
  addListener(socketId, listenerData = {}) {
    const { userId, sessionId, username, role, avatarUrl } = listenerData;
    const identifier = userId || sessionId || socketId;

    this.sockets.set(socketId, {
      socketId,
      identifier,
      userId: userId || null,
      username: username || 'Guest Lounge Listener',
      role: role || 'GUEST',
      avatarUrl: avatarUrl || null,
      connectedAt: new Date(),
    });

    return this.getCount();
  }

  /**
   * Deregister a disconnecting socket
   */
  removeListener(socketId) {
    this.sockets.delete(socketId);
    return this.getCount();
  }

  /**
   * Returns count of unique listeners (deduplicating multiple tabs per user/session)
   */
  getCount() {
    const uniqueIdentifiers = new Set();
    for (const listener of this.sockets.values()) {
      uniqueIdentifiers.add(listener.identifier);
    }
    return uniqueIdentifiers.size;
  }

  /**
   * Returns list of currently active distinct listeners
   */
  getActiveListeners() {
    const seen = new Set();
    const result = [];

    for (const listener of this.sockets.values()) {
      if (!seen.has(listener.identifier)) {
        seen.add(listener.identifier);
        result.push({
          identifier: listener.identifier,
          userId: listener.userId,
          username: listener.username,
          role: listener.role,
          avatarUrl: listener.avatarUrl,
        });
      }
    }

    return result;
  }
}

module.exports = new PresenceService();
