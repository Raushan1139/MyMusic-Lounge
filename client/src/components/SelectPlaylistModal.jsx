import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, Check, Plus, Library } from 'lucide-react';

export default function SelectPlaylistModal({ isOpen, onClose, track }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      api.playlists.getAll('mine=true')
        .then((res) => {
          if (res.success) setPlaylists(res.playlists || []);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, isAuthenticated]);

  if (!isOpen || !track) return null;

  const handleAdd = async (playlistId) => {
    try {
      setAddingId(playlistId);
      await api.playlists.addTrack(playlistId, { trackId: track.id });
      setFeedback('Track added to playlist!');
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1000);
    } catch (err) {
      alert(err.message);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Library size={18} color="#A78BFA" />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#FFF' }}>Add to Playlist</h3>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '30px', height: '30px' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
          <img src={track.thumbnailUrl} alt={track.title} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#FFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{track.artist}</div>
          </div>
        </div>

        {feedback && (
          <div style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', borderRadius: 'var(--radius-sm)', fontSize: '13px', marginBottom: '12px' }}>
            ✓ {feedback}
          </div>
        )}

        <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
              Loading your playlists...
            </div>
          ) : playlists.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
              You don't have any playlists yet. Visit the Playlists tab to create one.
            </div>
          ) : (
            playlists.map((pl) => (
              <button
                key={pl.id}
                onClick={() => handleAdd(pl.id)}
                disabled={addingId === pl.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  color: '#FFF',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{pl.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {pl._count?.tracks || 0} tracks
                  </div>
                </div>
                <Plus size={16} color="#A78BFA" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
