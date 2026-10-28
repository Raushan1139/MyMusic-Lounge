import React, { useState, useEffect } from 'react';
import PlaylistCard from '../components/PlaylistCard';
import CreatePlaylistModal from '../components/CreatePlaylistModal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Library, Plus, Sparkles, UserCheck } from 'lucide-react';

export default function Playlists() {
  const [activeTab, setActiveTab] = useState('curated'); // 'curated' | 'my'
  const [curatedPlaylists, setCuratedPlaylists] = useState([]);
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const [curatedRes, myRes] = await Promise.all([
        api.playlists.getAll(),
        isAuthenticated ? api.playlists.getAll('mine=true') : Promise.resolve({ success: true, playlists: [] }),
      ]);

      if (curatedRes.success) setCuratedPlaylists(curatedRes.playlists || []);
      if (myRes.success) setMyPlaylists(myRes.playlists || []);
    } catch (err) {
      console.warn('Error loading playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, [isAuthenticated]);

  const displayedPlaylists = activeTab === 'curated' ? curatedPlaylists : myPlaylists;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginTop: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Library size={28} color="#A78BFA" />
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#FFF' }}>Playlists</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '4px' }}>
            Discover curated mood collections or organize your personal music sanctuary.
          </p>
        </div>

        {isAuthenticated && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: '14px' }}
          >
            <Plus size={16} />
            <span>Create Playlist</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('curated')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'curated' ? 'var(--gradient-brand)' : 'transparent',
            color: activeTab === 'curated' ? '#FFF' : 'var(--text-secondary)',
            fontWeight: '600',
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
        >
          <Sparkles size={16} />
          <span>Lounge Curated ({curatedPlaylists.length})</span>
        </button>

        {isAuthenticated && (
          <button
            onClick={() => setActiveTab('my')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              background: activeTab === 'my' ? 'var(--gradient-brand)' : 'transparent',
              color: activeTab === 'my' ? '#FFF' : 'var(--text-secondary)',
              fontWeight: '600',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <UserCheck size={16} />
            <span>My Personal Playlists ({myPlaylists.length})</span>
          </button>
        )}
      </div>

      {/* Content Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading playlists...
        </div>
      ) : displayedPlaylists.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <Library size={44} color="var(--text-muted)" />
          <h3 style={{ fontSize: '18px', color: '#FFF' }}>
            {activeTab === 'my' ? 'You have not created any personal playlists yet' : 'No playlists available'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '420px' }}>
            Create a custom playlist to collect your favorite YouTube videos and songs for seamless lounge listening.
          </p>
          {isAuthenticated && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary"
              style={{ padding: '10px 20px', fontSize: '14px' }}
            >
              <Plus size={16} />
              <span>Create Your First Playlist</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid-cards">
          {displayedPlaylists.map((pl) => (
            <PlaylistCard key={pl.id} playlist={pl} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPlaylistCreated={() => {
          loadPlaylists();
          setActiveTab('my');
        }}
      />
    </div>
  );
}
