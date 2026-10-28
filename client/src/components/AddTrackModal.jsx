import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Youtube, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function AddTrackModal({ isOpen, onClose, onTrackAdded, targetPlaylistId = null }) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [preview, setPreview] = useState(null);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!isOpen) return null;

  const handleValidateUrl = async (inputUrl) => {
    setUrl(inputUrl);
    setError(null);
    setPreview(null);

    if (!inputUrl.trim()) return;

    try {
      setValidating(true);
      const res = await api.tracks.validateUrl(inputUrl.trim());
      if (res.success && res.data) {
        setPreview(res.data);
        if (!title) {
          setTitle(`Track (${res.data.providerVideoId})`);
        }
      }
    } catch (err) {
      setError(err.message || 'Invalid YouTube URL');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!preview) {
      setError('Please provide a valid YouTube URL first.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (targetPlaylistId) {
        // Adding track to specific user playlist
        await api.playlists.addTrack(targetPlaylistId, {
          youtubeUrl: preview.watchUrl,
          title: title || preview.providerVideoId,
          artist: artist || 'YouTube Artist',
        });
        setSuccess('Track added to playlist!');
      } else {
        // Admin adding to catalog
        await api.tracks.create({
          url: preview.watchUrl,
          title: title.trim(),
          artist: artist.trim(),
          album: album ? album.trim() : null,
          thumbnailUrl: preview.thumbnailUrl,
        });
        setSuccess('Track added to lounge catalog!');
      }

      setTimeout(() => {
        if (onTrackAdded) onTrackAdded();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to save song');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#FFF' }}>
            {targetPlaylistId ? 'Add Song to Playlist' : 'Add Song to Catalog'}
          </h3>
          <button onClick={onClose} className="btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={16} />
          </button>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', color: '#F87171', fontSize: '13px', marginBottom: '16px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-sm)', color: '#34D399', fontSize: '13px', marginBottom: '16px' }}>
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              YouTube Video URL or ID *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. https://www.youtube.com/watch?v=... or ID"
                value={url}
                onChange={(e) => handleValidateUrl(e.target.value)}
                required
              />
              {validating && (
                <div style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--primary)' }}>
                  <Loader2 size={18} className="animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Video Preview Badge */}
          {preview && (
            <div style={{ display: 'flex', gap: '12px', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
              <img
                src={preview.thumbnailUrl}
                alt="Preview"
                style={{ width: '80px', height: '48px', objectFit: 'cover', borderRadius: '4px' }}
              />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '12px', color: '#10B981', fontWeight: '600' }}>✓ Valid YouTube Stream</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {preview.providerVideoId}</div>
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Song Title *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Midnight Horizon"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Artist Name *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Neon Horizon"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              required
            />
          </div>

          {!targetPlaylistId && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Album (Optional)
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Cyber Dreams"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !preview}
              className="btn-primary"
              style={{ opacity: submitting || !preview ? 0.6 : 1 }}
            >
              {submitting ? 'Saving...' : 'Add Track'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
