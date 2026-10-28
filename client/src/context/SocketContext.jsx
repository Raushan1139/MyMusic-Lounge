import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [listenersCount, setListenersCount] = useState(1);
  const [chatMessages, setChatMessages] = useState([]);
  const socketRef = useRef(null);

  // Generate or retrieve persistent guest session ID
  const getSessionId = () => {
    let sid = sessionStorage.getItem('lounge_session_id');
    if (!sid) {
      sid = 'guest_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
      sessionStorage.setItem('lounge_session_id', sid);
    }
    return sid;
  };

  useEffect(() => {
    const s = io(window.location.origin, {
      auth: {
        token: token || null,
        sessionId: getSessionId(),
      },
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = s;
    setSocket(s);

    s.on('connect', () => {
      setConnected(true);
      console.log('[Socket] Connected to Lounge Realtime Gateway:', s.id);
    });

    s.on('disconnect', () => {
      setConnected(false);
      console.log('[Socket] Disconnected from Lounge Gateway.');
    });

    s.on('listeners:count', ({ count }) => {
      if (typeof count === 'number') {
        setListenersCount(count);
      }
    });

    s.on('chat:history', (history) => {
      if (Array.isArray(history)) {
        setChatMessages(history);
      }
    });

    s.on('chat:message', (newMsg) => {
      setChatMessages((prev) => [...prev, newMsg]);
    });

    s.on('chat:message-deleted', ({ messageId }) => {
      setChatMessages((prev) => prev.filter((m) => m.id !== messageId));
    });

    return () => {
      s.disconnect();
    };
  }, [token]);

  const sendChatMessage = (message) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) return reject(new Error('Socket not connected'));
      socketRef.current.emit('chat:send', { message }, (response) => {
        if (response?.success) {
          resolve(response.message);
        } else {
          reject(new Error(response?.message || 'Failed to send message'));
        }
      });
    });
  };

  const deleteChatMessage = (messageId) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) return reject(new Error('Socket not connected'));
      socketRef.current.emit('chat:delete', { messageId }, (res) => {
        if (res?.success) resolve();
        else reject(new Error(res?.message || 'Delete failed'));
      });
    });
  };

  const controlStationViaSocket = (action, payload = {}) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) return reject(new Error('Socket not connected'));
      socketRef.current.emit('admin:control', { action, ...payload }, (res) => {
        if (res?.success) resolve(res.station);
        else reject(new Error(res?.message || 'Station control failed'));
      });
    });
  };

  const value = {
    socket,
    connected,
    listenersCount,
    chatMessages,
    sendChatMessage,
    deleteChatMessage,
    controlStationViaSocket,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
