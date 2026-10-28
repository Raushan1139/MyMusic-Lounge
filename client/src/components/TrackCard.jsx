import React from 'react';
import { useMusic } from '../context/MusicContext';
import { useAuth } from '../context/AuthContext';
import { Play, Heart, ListPlus, Radio, Plus } from 'lucide-react';

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function TrackCard({ track, onOpenPlaylistModal, onAddToStationQueue }) {
  const { playPersonalTrack, toggleFavorite, isFavorite, currentTrack, isPlaying } = useMusic();
  const { isAuthenticated, isAdmin } = useAuth();

  const isCurrent = currentTrack?.id === track.id;
  const isFav = isFavorite(track.id);

  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        gap: '14px',
        background: isCurrent ? 'rgba(139, 92, 246, 0.12)' : 'rgba(22, 28, 44, 0.6)',
        borderColor: isCurrent ? 'var(--primary)' : 'var(--border-subtle)',
        transition: 'all var(--transition-fast)',
      }}
    >
      {/* Thumbnail with quick play button */}
      <div
        style={{
          position: 'relative',
          width: '52px',
          height: '52px',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <img
          src={
            track.thumbnailUrl ||
            'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80'
          }
          alt={track.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <button
          onClick={() => playPersonalTrack(track)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF',
            cursor: 'pointer',
            transition: 'opacity var(--transition-fast)',
          }}
          title="Play in Personal Mode"
        >
          <Play size={18} fill="#FFF" />
        </button>
      </div>

      {/* Song info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: isCurrent ? '#A78BFA' : '#FFF',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {track.title}
        </div>
        <div
          style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {track.artist} {track.album ? `• ${track.album}` : ''}
        </div>
      </div>

      {/* Duration */}
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }}>
        {formatDuration(track.durationSeconds)}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Favorite */}
        {isAuthenticated && (
          <button
            onClick={() => toggleFavorite(track)}
            className="btn-icon"
            style={{ width: '32px', height: '32px' }}
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={14} fill={isFav ? '#EC4899' : 'none'} color={isFav ? '#EC4899' : 'currentColor'} />
          </button>
        )}

        {/* Add to playlist */}
        {isAuthenticated && onOpenPlaylistModal && (
          <button
            onClick={() => onOpenPlaylistModal(track)}
            className="btn-icon"
            style={{ width: '32px', height: '32px' }}
            title="Add to Playlist"
          >
            <ListPlus size={14} />
          </button>
        )}

        {/* Admin send to station queue */}
        {isAdmin && onAddToStationQueue && (
          <button
            onClick={() => onAddToStationQueue(track.id)}
            className="btn-icon"
            style={{ width: '32px', height: '32px' }}
            title="Queue for Live Lounge Station"
          >
            <Radio size={14} color="#A78BFA" />
          </button>
        )}
      </div>
    </div>
  );
}
