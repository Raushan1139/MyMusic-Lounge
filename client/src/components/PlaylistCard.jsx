import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import { Play, Music } from 'lucide-react';

export default function PlaylistCard({ playlist }) {
  const { playPersonalTrack } = useMusic();
  const navigate = useNavigate();

  const trackCount = playlist._count?.tracks || playlist.tracks?.length || 0;

  return (
    <div
      className="glass-card-interactive"
      onClick={() => navigate(`/playlists/${playlist.id}`)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      {/* Cover Image */}
      <div
        style={{
          position: 'relative',
          paddingTop: '65%', // Aspect ratio
          overflow: 'hidden',
          background: '#1A1F30',
        }}
      >
        <img
          src={
            playlist.coverUrl ||
            'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80'
          }
          alt={playlist.name}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform var(--transition-normal)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, transparent 40%, rgba(11, 13, 19, 0.9) 100%)',
          }}
        />

        {/* Hover quick play floating button */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
          }}
        >
          <div
            className="btn-icon active"
            style={{ width: '42px', height: '42px' }}
            title="Open Playlist"
          >
            <Play size={18} fill="#FFF" style={{ marginLeft: '2px' }} />
          </div>
        </div>
      </div>

      {/* Playlist Meta Details */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        <h4
          style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#FFF',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {playlist.name}
        </h4>

        <p
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            height: '36px',
          }}
        >
          {playlist.description || 'Curated lounge collection.'}
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 'auto',
            paddingTop: '8px',
            fontSize: '12px',
            color: 'var(--text-muted)',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <span>By {playlist.owner?.username || 'Owner'}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Music size={12} />
            {trackCount} {trackCount === 1 ? 'track' : 'tracks'}
          </span>
        </div>
      </div>
    </div>
  );
}
