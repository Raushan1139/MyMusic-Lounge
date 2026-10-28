import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import TrackCard from '../components/TrackCard';
import PlaylistCard from '../components/PlaylistCard';
import { api } from '../services/api';
import { useMusic } from '../context/MusicContext';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Library, Flame, ArrowRight } from 'lucide-react';

export default function Home({ onOpenPlaylistModal }) {
  const [playlists, setPlaylists] = useState([]);
  const [recentTracks, setRecentTracks] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const { playPersonalTrack } = useMusic();
  const { isAdmin } = useAuth();

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [plRes, trRes, stRes] = await Promise.all([
          api.playlists.getAll(),
          api.tracks.getAll('limit=8'),
          api.settings.getPublic(),
        ]);

        if (plRes.success) setPlaylists(plRes.playlists || []);
        if (trRes.success) setRecentTracks(trRes.tracks || []);
        if (stRes.success) setSettings(stRes.settings);
      } catch (err) {
        console.warn('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  const handleAddToStation = async (trackId) => {
    try {
      await api.station.addToQueue(trackId);
      alert('Track queued for Station broadcast!');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Hero Section */}
      <Hero settings={settings} />

      {/* Featured Playlists Section */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Library size={22} color="#A78BFA" />
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#FFF' }}>
              Curated Lounge Playlists
            </h2>
          </div>
          <Link
            to="/playlists"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              color: '#A78BFA',
              fontWeight: '600',
            }}
          >
            <span>View All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid-cards">
          {playlists.slice(0, 4).map((pl) => (
            <PlaylistCard key={pl.id} playlist={pl} />
          ))}
        </div>
      </section>

      {/* Lounge Catalog & Songs */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Flame size={22} color="#EC4899" />
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#FFF' }}>
              Fresh Catalog Additions
            </h2>
          </div>
          <Link
            to="/discover"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              color: '#A78BFA',
              fontWeight: '600',
            }}
          >
            <span>Explore Catalog</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid-tracks">
          {recentTracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              onOpenPlaylistModal={onOpenPlaylistModal}
              onAddToStationQueue={isAdmin ? handleAddToStation : null}
            />
          ))}
        </div>
      </section>

      {/* Delux Lounge Atmosphere Teaser Card */}
      <section
        className="glass-panel"
        style={{
          padding: '40px 32px',
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, rgba(26, 31, 48, 0.8) 0%, rgba(18, 22, 34, 0.95) 100%)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          marginTop: '16px',
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#A78BFA', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
            <Sparkles size={16} />
            <span>THE DELUXE EXPERIENCE</span>
          </div>
          <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#FFF', marginBottom: '10px' }}>
            Synchronized Audio. Personal Freedom.
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6 }}>
            Whether you want to chill with hundreds of listeners on the owner-curated radio station or build your private sanctuary with custom YouTube links, MyMusic Lounge brings the ultimate listening lounge to your screen.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <Link to="/lounge" className="btn-primary" style={{ padding: '14px 28px', fontSize: '15px' }}>
            Enter Listening Room
          </Link>
          <Link to="/discover" className="btn-secondary" style={{ padding: '14px 24px', fontSize: '15px' }}>
            Search Songs
          </Link>
        </div>
      </section>
    </div>
  );
}
