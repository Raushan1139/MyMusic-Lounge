import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MiniPlayer from './components/MiniPlayer';
import SelectPlaylistModal from './components/SelectPlaylistModal';
import Home from './pages/Home';
import Discover from './pages/Discover';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';
import Favorites from './pages/Favorites';
import ListeningRoom from './pages/ListeningRoom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

export default function App() {
  const [selectedTrackForPlaylist, setSelectedTrackForPlaylist] = useState(null);
  const [isSelectPlaylistModalOpen, setIsSelectPlaylistModalOpen] = useState(false);

  // Register PWA Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log('[PWA] ServiceWorker registration successful with scope:', registration.scope);
          })
          .catch((error) => {
            console.log('[PWA] ServiceWorker registration failed:', error);
          });
      });
    }
  }, []);

  const handleOpenPlaylistModal = (track) => {
    setSelectedTrackForPlaylist(track);
    setIsSelectPlaylistModalOpen(true);
  };

  return (
    <div className="app-container">
      {/* Ambient background glow orbs */}
      <div className="ambient-glow-top" />
      <div className="ambient-glow-bottom" />

      {/* Navigation */}
      <Navbar />

      {/* Page Routes */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home onOpenPlaylistModal={handleOpenPlaylistModal} />} />
          <Route path="/discover" element={<Discover onOpenPlaylistModal={handleOpenPlaylistModal} />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/playlists/:id" element={<PlaylistDetail onOpenPlaylistModal={handleOpenPlaylistModal} />} />
          <Route path="/favorites" element={<Favorites onOpenPlaylistModal={handleOpenPlaylistModal} />} />
          <Route path="/lounge" element={<ListeningRoom />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Persistent Mini Player */}
      <MiniPlayer onOpenPlaylistModal={handleOpenPlaylistModal} />

      {/* Universal Add-to-Playlist Modal */}
      <SelectPlaylistModal
        isOpen={isSelectPlaylistModalOpen}
        onClose={() => setIsSelectPlaylistModalOpen(false)}
        track={selectedTrackForPlaylist}
      />
    </div>
  );
}
