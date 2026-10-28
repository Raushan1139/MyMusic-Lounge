import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import TrackCard from '../components/TrackCard';
import AddTrackModal from '../components/AddTrackModal';
import { api } from '../services/api';
import { useMusic } from '../context/MusicContext';
import { useAuth } from '../context/AuthContext';
import { Play, Plus, ArrowLeft, Trash2, ArrowUp, ArrowDown, Music, Clock } from 'lucide-react';

export default function PlaylistDetail({ onOpenPlaylistModal }) {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { playPersonalTrack, addToPersonalQueue } = useMusic();
  const { user, isAdmin } = useAuth();

  const loadPlaylist = async () => {
    try {
      setLoading(true);
      const res = await api.playlists.getById(id);
      if (res.success) {
        setPlaylist(res.playlist);
      }
    } catch (err) {
      console.warn('Error loading playlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylist();
  }, [id]);

  const isOwner = user?.id === playlist?.ownerId || isAdmin;

  const handlePlayAll = () => {
    if (!playlist?.tracks || playlist.tracks.length === 0) return;
    const [first, ...rest] = playlist.tracks.map((pt) => pt.track);
    playPersonalTrack(first);
    rest.forEach((t) => addToPersonalQueue(t));
  };

  const handleRemoveTrack = async (trackId) => {
    try {
      await api.playlists.removeTrack(id, trackId);
      loadPlaylist();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMove = async (index, direction) => {
    if (!playlist?.tracks) return;
    const newTracks = [...playlist.tracks];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= newTracks.length) return;

    const temp = newTracks[index];
    newTracks[index] = newTracks[targetIdx];
    newTracks[targetIdx] = temp;

    const orderedIds = newTracks.map((pt) => pt.trackId);
    try {
      await api.playlists.reorder(id, orderedIds);
      loadPlaylist();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
        Loading playlist details...
      </div>
    );
  }

  if (!playlist) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <h2 style={{ color: '#FFF', marginBottom: '12px' }}>Playlist not found</h2>
        <Link to="/playlists" className="btn-secondary">
          <ArrowLeft size={16} /> Return to Playlists
        </Link>
      </div>
    );
  }

  const tracks = playlist.tracks?.map((pt) => pt.track) || [];
  const totalDuration = tracks.reduce((acc, t) => acc + (t.durationSeconds || 0), 0);
  const durationMins = Math.floor(totalDuration / 60);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '20px' }}>
      {/* Back button */}
      <div>
        <Link
          to="/playlists"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-secondary)',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Playlists</span>
        </Link>
      </div>

      {/* Playlist Hero Info */}
      <div
        className="glass-panel"
        style={{
          padding: '32px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '28px',
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(26, 31, 48, 0.7) 0%, rgba(18, 22, 34, 0.9) 100%)',
        }}
      >
        <img
          src={
            playlist.coverUrl ||
            'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80'
          }
          alt={playlist.name}
          style={{
            width: '180px',
            height: '180px',
            borderRadius: 'var(--radius-lg)',
            objectFit: 'cover',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-glass)',
          }}
        />

        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#A78BFA', letterSpacing: '0.06em', marginBottom: '8px' }}>
            PLAYLIST
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#FFF', marginBottom: '12px', lineHeight: 1.2 }}>
            {playlist.name}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.5, marginBottom: '20px', maxWidth: '600px' }}>
            {playlist.description || 'A handpicked compilation of tracks for pure lounge enjoyment.'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            <span>Created by <strong style={{ color: '#E2E8F0' }}>{playlist.owner?.username}</strong></span>
            <span>•</span>
            <span>{tracks.length} {tracks.length === 1 ? 'song' : 'songs'}</span>
            <span>•</span>
            <span>~{durationMins} mins</span>
          </div>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={handlePlayAll}
              disabled={tracks.length === 0}
              className="btn-primary"
              style={{ padding: '12px 24px', opacity: tracks.length === 0 ? 0.5 : 1 }}
            >
              <Play size={18} fill="#FFF" />
              <span>Play All</span>
            </button>

            {isOwner && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn-secondary"
                style={{ padding: '12px 20px' }}
              >
                <Plus size={18} />
                <span>Add YouTube Track</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tracks Section */}
      <div>
        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#FFF', marginBottom: '16px' }}>
          Tracks
        </h3>

        {tracks.length === 0 ? (
          <div className="glass-panel" style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            This playlist has no songs yet.
            {isOwner && (
              <div style={{ marginTop: '16px' }}>
                <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
                  <Plus size={16} /> Add First Track
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {playlist.tracks.map((pt, idx) => (
              <div key={pt.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isOwner && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button
                      onClick={() => handleMove(idx, -1)}
                      disabled={idx === 0}
                      style={{ background: 'none', border: 'none', color: idx === 0 ? '#475569' : '#94A3B8', cursor: idx === 0 ? 'default' : 'pointer' }}
                      title="Move Up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => handleMove(idx, 1)}
                      disabled={idx === playlist.tracks.length - 1}
                      style={{ background: 'none', border: 'none', color: idx === playlist.tracks.length - 1 ? '#475569' : '#94A3B8', cursor: idx === playlist.tracks.length - 1 ? 'default' : 'pointer' }}
                      title="Move Down"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                )}

                <div style={{ flex: 1 }}>
                  <TrackCard track={pt.track} onOpenPlaylistModal={onOpenPlaylistModal} />
                </div>

                {isOwner && (
                  <button
                    onClick={() => handleRemoveTrack(pt.trackId)}
                    className="btn-icon"
                    style={{ width: '36px', height: '36px', color: '#EF4444' }}
                    title="Remove from playlist"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Track Modal for this playlist */}
      <AddTrackModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        targetPlaylistId={id}
        onTrackAdded={loadPlaylist}
      />
    </div>
  );
}
