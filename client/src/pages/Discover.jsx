import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import TrackCard from '../components/TrackCard';
import AddTrackModal from '../components/AddTrackModal';
import { api } from '../services/api';
import { useMusic } from '../context/MusicContext';
import { useAuth } from '../context/AuthContext';
import { Compass, Plus, Music2, Sparkles, Filter } from 'lucide-react';

const GENRE_TAGS = ['All', 'Lo-Fi', 'Synthwave', 'Ambient', 'Jazz', 'Acoustic', 'Electronic'];

export default function Discover({ onOpenPlaylistModal }) {
  const [tracks, setTracks] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { playPersonalTrack } = useMusic();
  const { isAuthenticated, isAdmin } = useAuth();

  const fetchTracks = async (query = '') => {
    try {
      setLoading(true);
      const params = query ? `search=${encodeURIComponent(query)}` : '';
      const res = await api.tracks.getAll(params);
      if (res.success) {
        setTracks(res.tracks || []);
      }
    } catch (err) {
      console.warn('Error fetching tracks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTracks(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Handle direct YouTube URL paste
  const handleDirectYouTube = (url) => {
    api.tracks.validateUrl(url)
      .then((res) => {
        if (res.success && res.data) {
          playPersonalTrack({
            title: `YouTube Video (${res.data.providerVideoId})`,
            artist: 'Direct Selection',
            thumbnailUrl: res.data.thumbnailUrl,
            provider: 'youtube',
            providerVideoId: res.data.providerVideoId,
            durationSeconds: 180,
          });
        }
      })
      .catch((err) => alert(err.message || 'Invalid YouTube URL'));
  };

  // Filter by genre tag
  const filteredTracks = tracks.filter((t) => {
    if (selectedTag === 'All') return true;
    const tag = selectedTag.toLowerCase();
    return (
      t.title.toLowerCase().includes(tag) ||
      t.artist.toLowerCase().includes(tag) ||
      (t.album && t.album.toLowerCase().includes(tag))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginTop: '20px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Compass size={28} color="#A78BFA" />
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#FFF' }}>Discover Music</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '4px' }}>
            Browse the lounge catalog or paste any valid YouTube link to stream in your personal session.
          </p>
        </div>

        {isAuthenticated && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: '14px' }}
          >
            <Plus size={16} />
            <span>Add YouTube Track</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <SearchBar
        value={search}
        onChange={setSearch}
        onDirectYouTube={handleDirectYouTube}
        placeholder="Search lounge songs, artists, or paste a YouTube video URL..."
      />

      {/* Mood / Genre Filter Chips */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {GENRE_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              border: selectedTag === tag ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
              background: selectedTag === tag ? 'var(--gradient-brand)' : 'rgba(255, 255, 255, 0.05)',
              color: selectedTag === tag ? '#FFF' : 'var(--text-secondary)',
              transition: 'all var(--transition-fast)',
              whiteSpace: 'nowrap',
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Track List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Showing {filteredTracks.length} {filteredTracks.length === 1 ? 'track' : 'tracks'}
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            Loading tracks...
          </div>
        ) : filteredTracks.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <Music2 size={40} color="var(--text-muted)" />
            <h3 style={{ fontSize: '18px', color: '#FFF' }}>No songs matched your search</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '400px' }}>
              Try searching with another keyword or paste a full YouTube URL into the search bar to stream it right away.
            </p>
          </div>
        ) : (
          <div className="grid-tracks">
            {filteredTracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                onOpenPlaylistModal={onOpenPlaylistModal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Track Modal */}
      <AddTrackModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onTrackAdded={() => fetchTracks(search)}
      />
    </div>
  );
}
