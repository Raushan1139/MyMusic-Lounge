import React, { useState } from 'react';
import { useMusic } from '../context/MusicContext';
import { useAuth } from '../context/AuthContext';
import YouTubeBridge from './YouTubeBridge';
import VolumeControl from './VolumeControl';
import {
  Play,
  Pause,
  SkipForward,
  Heart,
  Radio,
  Music2,
  Maximize2,
  Minimize2,
  ListPlus,
  Volume2,
} from 'lucide-react';

export default function MiniPlayer({ onOpenPlaylistModal }) {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    playbackMode,
    switchToStation,
    toggleFavorite,
    isFavorite,
    isAutoplayBlocked,
    unlockAudio,
  } = useMusic();

  const { isAuthenticated, user } = useAuth();
  const [showVideo, setShowVideo] = useState(false);

  if (!currentTrack) return null;

  const isFav = isFavorite(currentTrack.id);

  return (
    <>
      {/* Floating or Docked Video Modal when user wants to see the visual video stream */}
      {showVideo && (
        <div
          style={{
            position: 'fixed',
            bottom: 'calc(var(--mini-player-height) + 16px)',
            right: '24px',
            zIndex: 100,
            width: '360px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-lg)',
            padding: '12px',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
              padding: '0 4px',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#FFF' }}>
              Official YouTube Stream
            </span>
            <button
              onClick={() => setShowVideo(false)}
              className="btn-icon"
              style={{ width: '28px', height: '28px' }}
              title="Minimize video player"
            >
              <Minimize2 size={14} />
            </button>
          </div>
          <YouTubeBridge isExpanded={true} />
        </div>
      )}

      {/* Hidden/Persistent YouTube Audio Bridge when minimized */}
      {!showVideo && (
        <div
          style={{
            position: 'fixed',
            bottom: -9999,
            left: -9999,
            opacity: 0.01,
            pointerEvents: 'none',
          }}
        >
          <YouTubeBridge isExpanded={false} />
        </div>
      )}

      {/* Mini Player Bar */}
      <footer
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 'var(--mini-player-height)',
          background: 'rgba(11, 13, 19, 0.95)',
          backdropFilter: 'blur(24px)',
          borderTop: '1px solid var(--border-glass)',
          zIndex: 80,
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
        }}
      >
        <div
          style={{
            maxWidth: 'var(--max-content-width)',
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          {/* Left: Track Information & Thumbnail */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px', maxWidth: '35%' }}>
            <div style={{ position: 'relative' }}>
              <img
                src={
                  currentTrack.thumbnailUrl ||
                  'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80'
                }
                alt={currentTrack.title}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-sm)',
                  objectFit: 'cover',
                  border: '1px solid var(--border-glass)',
                }}
              />
            </div>

            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#FFF',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {currentTrack.title}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{currentTrack.artist}</span>
                {playbackMode === 'station' ? (
                  <span style={{ color: '#A78BFA', fontSize: '10px', fontWeight: '700' }}>• STATION</span>
                ) : (
                  <span style={{ color: '#67E8F9', fontSize: '10px', fontWeight: '700' }}>• PERSONAL</span>
                )}
              </div>
            </div>

            {/* Favorite button */}
            {isAuthenticated && (
              <button
                onClick={() => toggleFavorite(currentTrack)}
                className="btn-icon"
                style={{ width: '34px', height: '34px', flexShrink: 0 }}
                title={isFav ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart size={16} fill={isFav ? '#EC4899' : 'none'} color={isFav ? '#EC4899' : 'currentColor'} />
              </button>
            )}

            {/* Add to personal playlist button */}
            {isAuthenticated && onOpenPlaylistModal && (
              <button
                onClick={() => onOpenPlaylistModal(currentTrack)}
                className="btn-icon"
                style={{ width: '34px', height: '34px', flexShrink: 0 }}
                title="Add to Playlist"
              >
                <ListPlus size={16} />
              </button>
            )}
          </div>

          {/* Center: Playback Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* If audio unlock needed */}
            {isAutoplayBlocked ? (
              <button
                onClick={unlockAudio}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                <Volume2 size={16} />
                <span>Join Sound</span>
              </button>
            ) : (
              <button
                onClick={togglePlay}
                className="btn-icon"
                style={{
                  width: '46px',
                  height: '46px',
                  background: 'var(--gradient-brand)',
                  color: '#FFF',
                  border: 'none',
                  boxShadow: 'var(--shadow-glow)',
                }}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} fill="#FFF" style={{ marginLeft: '2px' }} />}
              </button>
            )}

            {/* Skip / Next */}
            {(playbackMode === 'personal' || user?.role === 'ADMIN') && (
              <button
                onClick={nextTrack}
                className="btn-icon"
                style={{ width: '38px', height: '38px' }}
                title="Skip to next track"
              >
                <SkipForward size={18} />
              </button>
            )}
          </div>

          {/* Right: Volume & Video Drawer Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Toggle Video Stream View */}
            <button
              onClick={() => setShowVideo(!showVideo)}
              className={`btn-icon ${showVideo ? 'active' : ''}`}
              style={{ width: '38px', height: '38px' }}
              title={showVideo ? 'Hide video window' : 'Show YouTube video window'}
            >
              {showVideo ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            {/* Volume slider */}
            <div className="mini-player-volume" style={{ width: '130px' }}>
              <VolumeControl />
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 640px) {
          .mini-player-volume {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
