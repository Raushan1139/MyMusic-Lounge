import React, { useEffect } from 'react';
import Visualizer from '../components/Visualizer';
import QueuePanel from '../components/QueuePanel';
import ChatPanel from '../components/ChatPanel';
import { useMusic } from '../context/MusicContext';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import {
  Radio,
  Users,
  Play,
  Pause,
  Clock,
  Sparkles,
  Info,
  Shield,
  Volume2,
} from 'lucide-react';

export default function ListeningRoom() {
  const {
    stationState,
    isPlaying,
    togglePlay,
    switchToStation,
    playbackMode,
    isAutoplayBlocked,
    unlockAudio,
  } = useMusic();
  const { listenersCount } = useSocket();
  const { isAdmin } = useAuth();

  const currentTrack = stationState.currentTrack;
  const isStationMode = playbackMode === 'station';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginTop: '20px' }}>
      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 32px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          background: 'linear-gradient(135deg, rgba(22, 28, 44, 0.8) 0%, rgba(11, 13, 19, 0.95) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Radio size={24} color="#FFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#FFF' }}>
                {stationState.name || 'Owner-Curated Radio Lounge'}
              </h1>
              <span className="badge-live">
                <span className="badge-live-dot" />
                <span>{stationState.playbackState}</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              {stationState.description || 'Synchronized live music broadcast handpicked by the owner.'}
            </p>
          </div>
        </div>

        {/* Live stats & switch action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-glass)',
            }}
          >
            <Users size={16} color="#06B6D4" />
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#E2E8F0' }}>
              {listenersCount} {listenersCount === 1 ? 'Listener Connected' : 'Listeners Connected'}
            </span>
          </div>

          {!isStationMode && (
            <button onClick={switchToStation} className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
              <Radio size={14} /> Tune Into Live Station
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left (Video Stream & Now Playing) / Right (Chat & Queue) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)',
          gap: '24px',
        }}
        className="listening-room-grid"
      >
        {/* Left: Video Player & Audio Stream info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Deluxe Music Lounge Stage (Pure Audio & Visuals, No Raw YouTube Embeds) */}
          <div
            className="glass-panel"
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              padding: '36px 32px',
              background: 'linear-gradient(135deg, rgba(26, 31, 48, 0.85) 0%, rgba(14, 17, 26, 0.95) 100%)',
              border: '1px solid var(--border-glass)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {/* Ambient Blurred Background Glow */}
            {currentTrack?.thumbnailUrl && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${currentTrack.thumbnailUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.18,
                  filter: 'blur(35px) brightness(0.6)',
                  transform: 'scale(1.2)',
                  pointerEvents: 'none',
                }}
              />
            )}

            {/* Stage Header Info */}
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="badge-live">
                  <span className="badge-live-dot" />
                  <span>ON AIR BROADCAST</span>
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#06B6D4',
                    background: 'rgba(6, 182, 212, 0.12)',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid rgba(6, 182, 212, 0.25)',
                    letterSpacing: '0.04em',
                  }}
                >
                  DELUXE HI-FI AUDIO
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Curated by Station Master
              </div>
            </div>

            {/* Main Stage Artwork & Song Title Presentation */}
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
              }}
            >
              {/* Album Art with Vinyl Glow Aura */}
              <div
                style={{
                  position: 'relative',
                  width: '120px',
                  height: '120px',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  flexShrink: 0,
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6), 0 0 25px rgba(139, 92, 246, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <img
                  src={
                    currentTrack?.thumbnailUrl ||
                    'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80'
                  }
                  alt={currentTrack?.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>

              {/* Title & Artist & Quick Play Control */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#A78BFA', letterSpacing: '0.08em', marginBottom: '4px' }}>
                  Now Broadcasting
                </div>
                <h2
                  style={{
                    fontSize: 'clamp(20px, 3vw, 26px)',
                    fontWeight: '800',
                    color: '#FFF',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: '6px',
                  }}
                >
                  {currentTrack?.title || 'Waiting for next track...'}
                </h2>
                <p
                  style={{
                    fontSize: '15px',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: '16px',
                  }}
                >
                  {currentTrack?.artist || 'Lounge Radio'} {currentTrack?.album ? `• ${currentTrack.album}` : ''}
                </p>

                {/* Audio controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {isAutoplayBlocked ? (
                    <button onClick={unlockAudio} className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                      <Volume2 size={16} /> Join Sound
                    </button>
                  ) : (
                    <button
                      onClick={togglePlay}
                      className="btn-primary"
                      style={{ padding: '8px 20px', fontSize: '13px' }}
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} fill="#FFF" />}
                      <span>{isPlaying ? 'Pause Station' : 'Listen Now'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Deluxe Live Audio Frequency Spectrum */}
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                padding: '14px 18px',
                background: 'rgba(0, 0, 0, 0.35)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#94A3B8',
                    letterSpacing: '0.06em',
                  }}
                >
                  LIVE AUDIO SPECTRUM
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    color: isPlaying ? '#10B981' : '#64748B',
                    fontWeight: '700',
                    letterSpacing: '0.03em',
                  }}
                >
                  {isPlaying ? '● LIVE AUDIO STREAM' : 'PAUSED'}
                </span>
              </div>
              <Visualizer height={56} barCount={44} />
            </div>

            {/* Info notice for listeners */}
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.25)',
                fontSize: '13px',
                color: '#C4B5FD',
              }}
            >
              <Info size={16} style={{ flexShrink: 0 }} />
              <span>
                The lounge owner controls the live synchronized broadcast. Want to play your own custom tracks? Head to <strong>Discover</strong> or <strong>Playlists</strong> to enter Personal Mode anytime!
              </span>
            </div>
          </div>

          {/* Station Queue */}
          <QueuePanel />
        </div>

        {/* Right: Real-time Community Chat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <ChatPanel />

          {/* Station Recently Played History */}
          <div
            className="glass-panel"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="#A78BFA" />
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#FFF' }}>
                Recently Played on Station
              </h3>
            </div>

            {(!stationState.history || stationState.history.length === 0) ? (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                Songs played on the station will appear here.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {stationState.history.slice(0, 5).map((track, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.02)',
                    }}
                  >
                    <img
                      src={track.thumbnailUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=80&auto=format&fit=crop&q=80'}
                      alt={track.title}
                      style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#FFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {track.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {track.artist}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .listening-room-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
