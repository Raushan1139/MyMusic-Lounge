import React from 'react';
import { Link } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import { useSocket } from '../context/SocketContext';
import Visualizer from './Visualizer';
import { Play, Pause, Radio, Compass, Sparkles, Volume2 } from 'lucide-react';

export default function Hero({ settings }) {
  const { isPlaying, togglePlay, currentTrack, switchToStation, isAutoplayBlocked, unlockAudio } = useMusic();
  const { listenersCount } = useSocket();

  const heroTitle = settings?.hero_title || 'Welcome to MyMusic Lounge';
  const heroSubtitle =
    settings?.hero_subtitle ||
    'An immersive digital music lounge. Listen to our live owner-curated radio station or take the decks with your personal playlist.';

  return (
    <section
      style={{
        position: 'relative',
        borderRadius: 'var(--radius-xl)',
        padding: '56px 40px',
        margin: '28px 0 40px 0',
        background: 'var(--gradient-card)',
        border: '1px solid var(--border-glass)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      {/* Ambient background glow orb */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.22) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(50px)',
        }}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Left Column: Information & Actions */}
        <div>
          {/* Status & Listener pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-glass)',
              marginBottom: '20px',
            }}
          >
            <span className="badge-live-dot" />
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#E2E8F0' }}>
              Live Lounge Broadcast
            </span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '13px', color: '#A78BFA', fontWeight: '600' }}>
              {listenersCount} {listenersCount === 1 ? 'Listener' : 'Listeners'}
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: '800',
              lineHeight: 1.15,
              marginBottom: '16px',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 60%, #C4B5FD 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {heroTitle}
          </h1>

          <p
            style={{
              fontSize: '16px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '32px',
              maxWidth: '540px',
            }}
          >
            {heroSubtitle}
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
            {isAutoplayBlocked ? (
              <button
                onClick={unlockAudio}
                className="btn-primary"
                style={{ padding: '14px 28px', fontSize: '15px' }}
              >
                <Volume2 size={18} />
                <span>Join Lounge Audio</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  switchToStation();
                  togglePlay();
                }}
                className="btn-primary"
                style={{ padding: '14px 28px', fontSize: '15px' }}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} fill="#FFF" />}
                <span>{isPlaying ? 'Pause Station' : 'Listen Now'}</span>
              </button>
            )}

            <Link
              to="/discover"
              className="btn-secondary"
              style={{ padding: '14px 24px', fontSize: '15px' }}
            >
              <Compass size={18} />
              <span>Explore Music</span>
            </Link>

            <Link
              to="/lounge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#A78BFA',
                fontWeight: '600',
                padding: '8px 12px',
              }}
            >
              <Sparkles size={16} />
              <span>Live Listening Room →</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Featured Now Playing Glass Card & Visualizer */}
        <div>
          <div
            className="glass-panel"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              background: 'rgba(18, 22, 34, 0.75)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio size={16} color="#A78BFA" />
                <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#C4B5FD' }}>
                  Now on Air
                </span>
              </div>
              <span className="badge-mode station" style={{ fontSize: '11px' }}>Owner Station</span>
            </div>

            {/* Artwork thumbnail & Song Details */}
            <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
              <img
                src={
                  currentTrack?.thumbnailUrl ||
                  'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80'
                }
                alt={currentTrack?.title || 'Radio'}
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: 'var(--radius-md)',
                  objectFit: 'cover',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid var(--border-glass)',
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#FFF',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: '6px',
                  }}
                >
                  {currentTrack?.title || 'Lofi Hip Hop - Chill Beats'}
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: '4px',
                  }}
                >
                  {currentTrack?.artist || 'Lofi Lounge Sessions'}
                </p>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Album: {currentTrack?.album || 'Midnight Coffee'}
                </div>
              </div>
            </div>

            {/* Animated Audio Visualizer */}
            <div
              style={{
                background: 'rgba(11, 13, 19, 0.6)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <Visualizer height={46} barCount={32} isHero={true} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
