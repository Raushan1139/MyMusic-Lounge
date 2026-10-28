import React from 'react';
import YouTubeBridge from '../components/YouTubeBridge';
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
          {/* Official YouTube Embed */}
          <div className="glass-panel" style={{ padding: '16px', background: '#000', overflow: 'hidden' }}>
            <YouTubeBridge isExpanded={true} />
          </div>

          {/* Current Track Details Card */}
          <div
            className="glass-panel"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#A78BFA', letterSpacing: '0.06em' }}>
                  Broadcasting Now
                </span>
                <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#FFF', marginTop: '2px' }}>
                  {currentTrack?.title || 'Waiting for next track...'}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                  {currentTrack?.artist || 'Lounge Station'}
                </p>
              </div>

              {isAutoplayBlocked ? (
                <button onClick={unlockAudio} className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
                  <Volume2 size={16} /> Join Sound
                </button>
              ) : (
                <button
                  onClick={togglePlay}
                  className="btn-icon active"
                  style={{ width: '48px', height: '48px' }}
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} fill="#FFF" style={{ marginLeft: '2px' }} />}
                </button>
              )}
            </div>

            {/* Audio Visualizer */}
            <div
              style={{
                background: 'rgba(11, 13, 19, 0.7)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <Visualizer height={50} barCount={48} />
            </div>

            {/* Info notice for listeners */}
            <div
              style={{
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
