import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const { socket, listenersCount } = useSocket();
  const { isAuthenticated, user } = useAuth();

  // Mode: 'station' (Mode A: Owner-Controlled) vs 'personal' (Mode B: User Sandbox)
  const [playbackMode, setPlaybackMode] = useState('station');

  // Station State (synchronized from server)
  const [stationState, setStationState] = useState({
    id: null,
    name: 'MyMusic Lounge Radio',
    description: '',
    currentTrack: null,
    playbackState: 'STOPPED',
    positionSeconds: 0,
    queue: [],
    history: [],
    updatedAt: null,
  });

  // Personal Mode State
  const [personalTrack, setPersonalTrack] = useState(null);
  const [personalPlaybackState, setPersonalPlaybackState] = useState('STOPPED');
  const [personalPositionSeconds, setPersonalPositionSeconds] = useState(0);
  const [personalQueue, setPersonalQueue] = useState([]);
  const [personalHistory, setPersonalHistory] = useState([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  // Active track based on playback mode
  const currentTrack = playbackMode === 'station' ? stationState.currentTrack : personalTrack;
  const isPlaying =
    playbackMode === 'station'
      ? stationState.playbackState === 'PLAYING'
      : personalPlaybackState === 'PLAYING';

  // Audio Controls & Volume
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('lounge_volume');
    return saved !== null ? parseInt(saved, 10) : 80;
  });
  const [isMuted, setIsMuted] = useState(false);

  // Browser Autoplay Policy & Audio Unlock
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false);

  // Favorites Cache
  const [favorites, setFavorites] = useState(new Set());

  // YouTube Player Ref
  const playerRef = useRef(null);

  // Video Window visibility (PiP drawer)
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const toggleVideoOpen = () => setIsVideoOpen((prev) => !prev);

  // Automatic Audio Unlock on first user gesture anywhere
  useEffect(() => {
    const handleFirstGesture = () => {
      if (playerRef.current && typeof playerRef.current.unMute === 'function') {
        try {
          playerRef.current.unMute();
          playerRef.current.setVolume(volume);
          if (isPlaying) {
            playerRef.current.playVideo();
          }
          setIsAutoplayBlocked(false);
        } catch {}
      }
    };

    window.addEventListener('click', handleFirstGesture, { capture: true, once: true });
    window.addEventListener('keydown', handleFirstGesture, { capture: true, once: true });
    return () => {
      window.removeEventListener('click', handleFirstGesture, { capture: true });
      window.removeEventListener('keydown', handleFirstGesture, { capture: true });
    };
  }, [volume, isPlaying]);

  // Save volume preference
  useEffect(() => {
    localStorage.setItem('lounge_volume', volume.toString());
  }, [volume]);

  // Load favorites for authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      api.favorites.getAll()
        .then((res) => {
          if (res.success && res.favorites) {
            setFavorites(new Set(res.favorites.map((f) => f.track.id)));
          }
        })
        .catch(() => {});
    } else {
      setFavorites(new Set());
    }
  }, [isAuthenticated]);

  // Initial Station State Fetch
  useEffect(() => {
    api.station.getState()
      .then((res) => {
        if (res.success && res.station) {
          setStationState(res.station);
        }
      })
      .catch((err) => console.warn('[Station] Failed to fetch station state:', err.message));
  }, []);

  // Listen to Socket.IO Station Updates
  useEffect(() => {
    if (!socket) return;

    const handleStationState = (state) => {
      setStationState(state);
    };

    const handleTrackChanged = (state) => {
      setStationState(state);
      // If we are in station mode, we load the new track
      if (playbackMode === 'station') {
        console.log('[Station] Track changed to:', state.currentTrack?.title);
      }
    };

    const handleQueueUpdated = (state) => {
      setStationState((prev) => ({
        ...prev,
        queue: state.queue,
      }));
    };

    const handlePlaybackUpdated = (state) => {
      setStationState((prev) => ({
        ...prev,
        playbackState: state.playbackState,
        positionSeconds: state.positionSeconds,
      }));
    };

    socket.on('station:state', handleStationState);
    socket.on('station:track-changed', handleTrackChanged);
    socket.on('station:queue-updated', handleQueueUpdated);
    socket.on('station:playback-updated', handlePlaybackUpdated);

    return () => {
      socket.off('station:state', handleStationState);
      socket.off('station:track-changed', handleTrackChanged);
      socket.off('station:queue-updated', handleQueueUpdated);
      socket.off('station:playback-updated', handlePlaybackUpdated);
    };
  }, [socket, playbackMode]);

  // Toggle Play / Pause
  const togglePlay = async () => {
    setIsAutoplayBlocked(false);
    if (playbackMode === 'station') {
      if (user?.role === 'ADMIN') {
        const nextAction = isPlaying ? 'pause' : 'play';
        await api.station.control(nextAction);
      } else {
        // Visitor muting/unmuting or unlocking station audio
        if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
          if (isPlaying) {
            playerRef.current.pauseVideo();
            setStationState((s) => ({ ...s, playbackState: 'PAUSED' }));
          } else {
            playerRef.current.unMute();
            playerRef.current.setVolume(volume);
            playerRef.current.playVideo();
            setStationState((s) => ({ ...s, playbackState: 'PLAYING' }));
          }
        }
      }
    } else {
      // Personal mode
      if (personalPlaybackState === 'PLAYING') {
        setPersonalPlaybackState('PAUSED');
        if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
          playerRef.current.pauseVideo();
        }
      } else {
        setPersonalPlaybackState('PLAYING');
        if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
          playerRef.current.unMute();
          playerRef.current.setVolume(volume);
          playerRef.current.playVideo();
        }
      }
    }
  };

  // Play a personal track or URL
  const playPersonalTrack = (track) => {
    setPlaybackMode('personal');
    setPersonalTrack(track);
    setPersonalPlaybackState('PLAYING');
    setPersonalPositionSeconds(0);
    setIsAutoplayBlocked(false);

    // Direct synchronous command inside user click gesture prevents browser autoplay block
    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      try {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume);
        playerRef.current.loadVideoById({
          videoId: track.providerVideoId,
          startSeconds: 0,
        });
        playerRef.current.playVideo();
      } catch (err) {
        console.warn('[MusicContext] Direct play error:', err);
      }
    }

    // Record history if authenticated
    if (isAuthenticated && track.id) {
      api.history.record(track.id).catch(() => {});
    }
  };

  // Switch back to Station Stream
  const switchToStation = () => {
    setPlaybackMode('station');
    setIsAutoplayBlocked(false);

    if (stationState.currentTrack && playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      try {
        const duration = stationState.currentTrack.durationSeconds || 240;
        const startSeconds = Math.max(0, Math.min(stationState.positionSeconds || 0, Math.max(0, duration - 5)));
        playerRef.current.unMute();
        playerRef.current.setVolume(volume);
        playerRef.current.loadVideoById({
          videoId: stationState.currentTrack.providerVideoId,
          startSeconds,
        });
        playerRef.current.playVideo();
      } catch (err) {
        console.warn('[MusicContext] Switch to station error:', err);
      }
    }
  };

  // Unlock Audio Button for Browser Policy
  const unlockAudio = () => {
    setIsAutoplayBlocked(false);
    if (playerRef.current && typeof playerRef.current.unMute === 'function') {
      try {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume);
        playerRef.current.playVideo();
      } catch (err) {
        console.warn('[MusicContext] unlockAudio error:', err);
      }
    }
  };

  // Skip / Next Track
  const nextTrack = async () => {
    if (playbackMode === 'station') {
      if (user?.role === 'ADMIN') {
        await api.station.control('next');
      }
    } else {
      // Personal next track from queue
      if (personalQueue.length > 0) {
        const next = personalQueue[0];
        setPersonalQueue((q) => q.slice(1));
        playPersonalTrack(next);
      } else if (isRepeat && personalTrack) {
        if (playerRef.current) {
          playerRef.current.seekTo(0);
          playerRef.current.playVideo();
        }
      } else {
        setPersonalPlaybackState('STOPPED');
      }
    }
  };

  // Add to personal queue
  const addToPersonalQueue = (track) => {
    setPersonalQueue((prev) => [...prev, track]);
  };

  // Remove from personal queue
  const removeFromPersonalQueue = (index) => {
    setPersonalQueue((prev) => prev.filter((_, i) => i !== index));
  };

  // Toggle Favorite
  const toggleFavorite = async (track) => {
    if (!isAuthenticated) {
      throw new Error('Please log in to save favorites.');
    }
    const isFav = favorites.has(track.id);
    if (isFav) {
      await api.favorites.remove(track.id);
      setFavorites((prev) => {
        const next = new Set(prev);
        next.delete(track.id);
        return next;
      });
    } else {
      await api.favorites.add(track.id);
      setFavorites((prev) => {
        const next = new Set(prev);
        next.add(track.id);
        return next;
      });
    }
  };

  const isFavorite = (trackId) => favorites.has(trackId);

  const value = {
    playbackMode,
    setPlaybackMode,
    switchToStation,
    currentTrack,
    isPlaying,
    stationState,
    personalTrack,
    personalQueue,
    isShuffle,
    setIsShuffle,
    isRepeat,
    setIsRepeat,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    isAutoplayBlocked,
    setIsAutoplayBlocked,
    unlockAudio,
    togglePlay,
    nextTrack,
    playPersonalTrack,
    addToPersonalQueue,
    removeFromPersonalQueue,
    toggleFavorite,
    isFavorite,
    playerRef,
    isVideoOpen,
    setIsVideoOpen,
    toggleVideoOpen,
  };

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}
