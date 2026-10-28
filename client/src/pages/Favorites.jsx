import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TrackCard from '../components/TrackCard';
import { api } from '../services/api';
import { useMusic } from '../context/MusicContext';
import { useAuth } from '../context/AuthContext';
import { Heart, Play, LogIn, Music } from 'lucide-react';

export default function Favorites({ onOpenPlaylistModal }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playPersonalTrack, addToPersonalQueue } = useMusic();
  const { isAuthenticated } = useAuth();

  const loadFavorites = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.favorites.getAll();
      if (res.success) {
        setFavorites(res.favorites || []);
      }
    } catch (err) {
      console.warn('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [isAuthenticated]);

  const handlePlayAll = () => {
    if (favorites.length === 0) return;
    const [first, ...rest] = favorites.map((f) => f.track);
    playPersonalTrack(first);
    rest.forEach((t) => addToPersonalQueue(t));
  };

  if (!isAuthenticated) {
    return (
      <div
        className="glass-panel"
        style={{
          margin: '60px auto',
          maxWidth: '480px',
          padding: '48px 32px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <Heart size={44} color="#EC4899" />
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#FFF' }}>Favorites Locked</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
          Please sign in to save your favorite songs and access them across sessions in your personal lounge.
        </p>
        <Link to="/login" className="btn-primary" style={{ padding: '12px 24px' }}>
          <LogIn size={16} /> Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginTop: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(236, 72, 153, 0.4)',
            }}
          >
            <Heart size={26} color="#FFF" fill="#FFF" />
          </div>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#FFF' }}>My Favorites</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              {favorites.length} saved {favorites.length === 1 ? 'song' : 'songs'} in your library
            </p>
          </div>
        </div>

        {favorites.length > 0 && (
          <button onClick={handlePlayAll} className="btn-primary" style={{ padding: '12px 24px' }}>
            <Play size={18} fill="#FFF" />
            <span>Play Favorites</span>
          </button>
        )}
      </div>

      {/* Tracks */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading favorites...
        </div>
      ) : favorites.length === 0 ? (
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
          <Music size={40} color="var(--text-muted)" />
          <h3 style={{ fontSize: '18px', color: '#FFF' }}>No favorites saved yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '420px' }}>
            Browse songs in the Discover page or Lounge Station and click the heart icon to save them to your favorites.
          </p>
          <Link to="/discover" className="btn-secondary" style={{ marginTop: '8px' }}>
            Discover Songs
          </Link>
        </div>
      ) : (
        <div className="grid-tracks">
          {favorites.map((fav) => (
            <TrackCard
              key={fav.id}
              track={fav.track}
              onOpenPlaylistModal={onOpenPlaylistModal}
            />
          ))}
        </div>
      )}
    </div>
  );
}
