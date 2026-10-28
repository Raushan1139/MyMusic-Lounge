import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../context/MusicContext';
import { useSocket } from '../context/SocketContext';
import AddTrackModal from '../components/AddTrackModal';
import Visualizer from '../components/Visualizer';
import {
  Shield,
  Radio,
  Music,
  Users,
  Settings,
  Plus,
  Play,
  Pause,
  SkipForward,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Save,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const { stationState } = useMusic();
  const { controlStationViaSocket } = useSocket();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'station' | 'catalog' | 'settings'
  const [stats, setStats] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [settings, setSettings] = useState({
    site_name: 'MyMusic Lounge',
    site_tagline: 'Your Music. Your Mood. Your Space.',
    hero_title: 'Welcome to MyMusic Lounge',
    hero_subtitle: '',
    chat_enabled: true,
    guest_access: true,
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Station edit form state
  const [stationName, setStationName] = useState('');
  const [stationDesc, setStationDesc] = useState('');
  const [selectedDefaultPlaylist, setSelectedDefaultPlaylist] = useState('');

  // 1. Guard check
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // 2. Load Real Statistics and Data
  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, tracksRes, plRes, settRes] = await Promise.all([
        api.station.getAdminStats(),
        api.tracks.getAll('all=true&limit=100'),
        api.playlists.getAll(),
        api.settings.getPublic(),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (tracksRes.success) setTracks(tracksRes.tracks || []);
      if (plRes.success) setPlaylists(plRes.playlists || []);
      if (settRes.success) setSettings(settRes.settings);

      // Station fields
      if (stationState) {
        setStationName(stationState.name || 'MyMusic Lounge Radio');
        setStationDesc(stationState.description || '');
      }
    } catch (err) {
      console.warn('Error loading admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (msg, isError = false) => {
    setFeedback({ msg, isError });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Station Control Actions
  const handleStationAction = async (action, payload = {}) => {
    try {
      await controlStationViaSocket(action, payload);
      showNotification(`Station command "${action}" executed and broadcast!`);
      loadData();
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  const handleUpdateStationDetails = async (e) => {
    e.preventDefault();
    try {
      await api.station.control(null, null, {
        name: stationName,
        description: stationDesc,
        defaultPlaylistId: selectedDefaultPlaylist || null,
      });
      showNotification('Station profile details updated.');
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  const handleDeleteTrack = async (trackId) => {
    if (confirm('Delete this track permanently from the catalog?')) {
      try {
        await api.tracks.delete(trackId);
        showNotification('Track deleted from catalog.');
        loadData();
      } catch (err) {
        showNotification(err.message, true);
      }
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await api.settings.updateAdmin(settings);
      showNotification('Lounge site settings updated successfully.');
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginTop: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Shield size={24} color="#FFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#FFF' }}>
                Owner Control Room
              </h1>
              <span className="badge-mode station" style={{ fontSize: '11px' }}>
                ADMIN PORTAL
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '2px' }}>
              Manage live lounge radio, catalog tracks, playlists, and platform settings.
            </p>
          </div>
        </div>

        {feedback && (
          <div
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              background: feedback.isError ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              border: feedback.isError ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
              color: feedback.isError ? '#F87171' : '#34D399',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {feedback.isError ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
            <span>{feedback.msg}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
        {[
          { id: 'overview', label: 'Live Overview', icon: Radio },
          { id: 'station', label: 'Station Control & Queue', icon: Play },
          { id: 'catalog', label: 'Music Catalog', icon: Music },
          { id: 'settings', label: 'Lounge Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--gradient-brand)' : 'transparent',
                color: isActive ? '#FFF' : 'var(--text-secondary)',
                fontWeight: '600',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: REAL OVERVIEW STATS (Section 5) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Real Metrics Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            {[
              { label: 'Connected Listeners', val: stats?.activeListeners ?? 1, icon: Users, color: '#06B6D4' },
              { label: 'Catalog Tracks', val: stats?.totalTracks ?? 0, icon: Music, color: '#8B5CF6' },
              { label: 'Total Playlists', val: stats?.totalPlaylists ?? 0, icon: Layers, color: '#EC4899' },
              { label: 'Registered Listeners', val: stats?.totalUsers ?? 0, icon: Shield, color: '#10B981' },
            ].map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={i} className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: `${m.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: m.color,
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
                      {m.label}
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#FFF' }}>
                      {m.val}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current Broadcast Status */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#FFF', marginBottom: '16px' }}>
              Station Broadcast Monitor
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
              <img
                src={stats?.currentTrack?.thumbnailUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&auto=format&fit=crop&q=80'}
                alt="Track"
                style={{ width: '100px', height: '100px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
              />
              <div style={{ flex: 1, minWidth: '240px' }}>
                <span className="badge-live" style={{ marginBottom: '8px' }}>
                  <span className="badge-live-dot" />
                  <span>State: {stats?.stationState || 'STOPPED'}</span>
                </span>
                <h4 style={{ fontSize: '20px', fontWeight: '700', color: '#FFF' }}>
                  {stats?.currentTrack?.title || 'No track selected'}
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '2px' }}>
                  Artist: {stats?.currentTrack?.artist || '—'}
                </p>
                <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleStationAction('play')} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                    <Play size={14} fill="#FFF" /> Resume Live
                  </button>
                  <button onClick={() => handleStationAction('pause')} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                    <Pause size={14} /> Pause Live
                  </button>
                  <button onClick={() => handleStationAction('next')} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                    <SkipForward size={14} /> Skip Track
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: STATION CONTROL & QUEUE */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'station' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '24px' }}>
          {/* Station Details Form */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#FFF', marginBottom: '16px' }}>
              Station Broadcast Configuration
            </h3>
            <form onSubmit={handleUpdateStationDetails} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Station Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Station Description
                </label>
                <textarea
                  className="input-field"
                  value={stationDesc}
                  onChange={(e) => setStationDesc(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Fallback Default Playlist (Loops when queue ends)
                </label>
                <select
                  className="input-field"
                  value={selectedDefaultPlaylist}
                  onChange={(e) => setSelectedDefaultPlaylist(e.target.value)}
                  style={{ background: '#121622' }}
                >
                  <option value="">None</option>
                  {playlists.map((pl) => (
                    <option key={pl.id} value={pl.id}>
                      {pl.name} ({pl._count?.tracks || 0} tracks)
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '12px', fontSize: '14px', alignSelf: 'flex-start' }}>
                <Save size={16} /> Save Station Settings
              </button>
            </form>
          </div>

          {/* Quick Queue Station Addition */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#FFF' }}>
              Broadcast Current Track
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              Select any track from your music catalog to immediately broadcast it live:
            </p>
            <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tracks.map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <img src={t.thumbnailUrl} alt={t.title} style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#FFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t.artist}</div>
                  </div>
                  <button
                    onClick={() => handleStationAction('set-track', { trackId: t.id })}
                    className="btn-primary"
                    style={{ padding: '4px 10px', fontSize: '11px' }}
                    title="Play on Station now"
                  >
                    Play Now
                  </button>
                  <button
                    onClick={() => handleStationAction('add-queue', { trackId: t.id })}
                    className="btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '11px' }}
                    title="Add to Station queue"
                  >
                    Queue
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: MUSIC CATALOG CRUD */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'catalog' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#FFF' }}>
              Catalog Tracks ({tracks.length})
            </h3>
            <button onClick={() => setIsAddModalOpen(true)} className="btn-primary" style={{ padding: '10px 18px', fontSize: '14px' }}>
              <Plus size={16} /> Add YouTube Song
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tracks.map((t) => (
              <div
                key={t.id}
                className="glass-panel"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 18px',
                  gap: '16px',
                }}
              >
                <img src={t.thumbnailUrl} alt={t.title} style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#FFF' }}>{t.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {t.artist} {t.album ? `• ${t.album}` : ''} • ID: {t.providerVideoId}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href={`https://www.youtube.com/watch?v=${t.providerVideoId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-icon"
                    style={{ width: '34px', height: '34px' }}
                    title="Open on YouTube"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button
                    onClick={() => handleDeleteTrack(t.id)}
                    className="btn-icon"
                    style={{ width: '34px', height: '34px', color: '#EF4444' }}
                    title="Delete track"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: PLATFORM BRANDING & SETTINGS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'settings' && (
        <div className="glass-panel" style={{ padding: '28px', maxWidth: '700px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#FFF', marginBottom: '20px' }}>
            Lounge Branding & Site Configuration
          </h3>
          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Platform Name
              </label>
              <input
                type="text"
                className="input-field"
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Site Tagline
              </label>
              <input
                type="text"
                className="input-field"
                value={settings.site_tagline}
                onChange={(e) => setSettings({ ...settings, site_tagline: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Hero Welcome Title
              </label>
              <input
                type="text"
                className="input-field"
                value={settings.hero_title}
                onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Hero Welcome Subtitle
              </label>
              <textarea
                className="input-field"
                value={settings.hero_subtitle}
                onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                rows={3}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="chatEnabled"
                checked={settings.chat_enabled !== false}
                onChange={(e) => setSettings({ ...settings, chat_enabled: e.target.checked })}
                style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
              />
              <label htmlFor="chatEnabled" style={{ fontSize: '14px', color: '#E2E8F0', cursor: 'pointer' }}>
                Enable Lounge Realtime Chat
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="guestAccess"
                checked={settings.guest_access !== false}
                onChange={(e) => setSettings({ ...settings, guest_access: e.target.checked })}
                style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
              />
              <label htmlFor="guestAccess" style={{ fontSize: '14px', color: '#E2E8F0', cursor: 'pointer' }}>
                Allow Guests to Listen without Login
              </label>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '12px 24px', fontSize: '14px', alignSelf: 'flex-start', marginTop: '10px' }}>
              <Save size={16} /> Save Changes
            </button>
          </form>
        </div>
      )}

      {/* Add Track Modal */}
      <AddTrackModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onTrackAdded={loadData}
      />
    </div>
  );
}
