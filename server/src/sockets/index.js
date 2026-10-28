const jwt = require('jsonwebtoken');
const config = require('../config');
const prisma = require('../config/db');
const presenceService = require('../services/presenceService');
const stationService = require('../services/stationService');
const { validateChatMessage } = require('../validators');

// Simple in-memory socket message rate limiting per socket
const socketMessageCooldowns = new Map();

function initSockets(io) {
  stationService.setIO(io);

  // Middleware to authenticate socket connections if token provided
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (token) {
        try {
          const decoded = jwt.verify(token, config.jwtSecret);
          const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, username: true, role: true, avatarUrl: true },
          });
          if (user) {
            socket.user = user;
          }
        } catch {
          // Token invalid, continue as guest
        }
      }
      next();
    } catch (err) {
      next(err);
    }
  });

  io.on('connection', async (socket) => {
    const user = socket.user;
    const sessionId = socket.handshake.auth?.sessionId || socket.id;

    // Register presence (deduplicates tabs by user or session)
    const listenerCount = presenceService.addListener(socket.id, {
      userId: user?.id,
      sessionId,
      username: user?.username || 'Guest Listener',
      role: user?.role || 'GUEST',
      avatarUrl: user?.avatarUrl,
    });

    // Automatically join the main lounge room
    socket.join('lounge');

    // Broadcast updated listener count to all lounge clients
    io.to('lounge').emit('listeners:count', { count: listenerCount });

    // Send immediate initial station state to this client
    socket.emit('station:state', {
      ...stationService.getState(),
      listenerCount,
    });

    // Provide recent chat history
    try {
      const messages = await prisma.chatMessage.findMany({
        where: { deletedAt: null },
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, username: true, avatarUrl: true, role: true },
          },
        },
      });
      socket.emit('chat:history', messages.reverse());
    } catch (err) {
      console.error('[Socket] Error fetching chat history:', err.message);
    }

    // -------------------------------------------------------------
    // CHAT EVENTS
    // -------------------------------------------------------------
    socket.on('chat:send', async (data, callback) => {
      try {
        if (!user) {
          const errResponse = { success: false, message: 'You must log in to participate in the lounge chat.' };
          if (callback) callback(errResponse);
          return socket.emit('chat:error', errResponse);
        }

        // Rate limit: max 1 message every 1.5 seconds per user
        const now = Date.now();
        const lastSent = socketMessageCooldowns.get(user.id) || 0;
        if (now - lastSent < 1500) {
          const errResponse = { success: false, message: 'Please slow down. Messages can be sent every 1.5 seconds.' };
          if (callback) callback(errResponse);
          return socket.emit('chat:error', errResponse);
        }
        socketMessageCooldowns.set(user.id, now);

        const { isValid, sanitized, error } = validateChatMessage(data?.message);
        if (!isValid) {
          const errResponse = { success: false, message: error };
          if (callback) callback(errResponse);
          return socket.emit('chat:error', errResponse);
        }

        const chatMessage = await prisma.chatMessage.create({
          data: {
            userId: user.id,
            message: sanitized,
          },
          include: {
            user: {
              select: { id: true, username: true, avatarUrl: true, role: true },
            },
          },
        });

        // Broadcast new message to everyone in the lounge
        io.to('lounge').emit('chat:message', chatMessage);

        if (callback) callback({ success: true, message: chatMessage });
      } catch (err) {
        console.error('[Socket] Chat error:', err.message);
        if (callback) callback({ success: false, message: 'Failed to send message.' });
      }
    });

    // Delete message (Moderators and Admins only)
    socket.on('chat:delete', async (data, callback) => {
      try {
        if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
          const errResp = { success: false, message: 'Unauthorized to delete messages.' };
          if (callback) callback(errResp);
          return socket.emit('chat:error', errResp);
        }

        const { messageId } = data || {};
        if (!messageId) return;

        await prisma.chatMessage.update({
          where: { id: messageId },
          data: { deletedAt: new Date() },
        });

        io.to('lounge').emit('chat:message-deleted', { messageId });
        if (callback) callback({ success: true });
      } catch (err) {
        console.error('[Socket] Delete chat error:', err.message);
      }
    });

    // -------------------------------------------------------------
    // ADMIN STATION CONTROL EVENTS VIA SOCKET
    // -------------------------------------------------------------
    socket.on('admin:control', async (payload, callback) => {
      if (!user || user.role !== 'ADMIN') {
        const err = { success: false, message: 'Administrator privileges required.' };
        if (callback) callback(err);
        return socket.emit('admin:error', err);
      }

      const { action, trackId, position, queueId, orderedQueueIds } = payload || {};
      try {
        let newState;
        if (action === 'play') {
          newState = await stationService.play();
        } else if (action === 'pause') {
          newState = await stationService.pause();
        } else if (action === 'seek') {
          newState = await stationService.seek(position);
        } else if (action === 'next') {
          newState = await stationService.nextTrack();
        } else if (action === 'set-track') {
          newState = await stationService.setCurrentTrack(trackId);
        } else if (action === 'add-queue') {
          newState = await stationService.addToQueue(trackId);
        } else if (action === 'remove-queue') {
          newState = await stationService.removeFromQueue(queueId);
        } else if (action === 'reorder-queue') {
          newState = await stationService.reorderQueue(orderedQueueIds);
        }

        if (callback) callback({ success: true, station: newState });
      } catch (err) {
        if (callback) callback({ success: false, message: err.message });
      }
    });

    // -------------------------------------------------------------
    // DISCONNECT
    // -------------------------------------------------------------
    socket.on('disconnect', () => {
      const updatedCount = presenceService.removeListener(socket.id);
      io.to('lounge').emit('listeners:count', { count: updatedCount });
    });
  });
}

module.exports = initSockets;
