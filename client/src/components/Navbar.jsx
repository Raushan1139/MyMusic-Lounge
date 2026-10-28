import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../context/MusicContext';
import { useSocket } from '../context/SocketContext';
import {
  Radio,
  Compass,
  Library,
  Heart,
  Users,
  Shield,
  LogOut,
  LogIn,
  Menu,
  X,
  Headphones,
  Music2,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { playbackMode, switchToStation } = useMusic();
  const { listenersCount } = useSocket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Radio },
    { name: 'Discover', path: '/discover', icon: Compass },
    { name: 'Playlists', path: '/playlists', icon: Library },
    { name: 'Favorites', path: '/favorites', icon: Heart, authOnly: true },
    { name: 'Community', path: '/lounge', icon: Users },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(11, 13, 19, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-glass)',
        height: 'var(--navbar-height)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--max-content-width)',
          width: '100%',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo & Name */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'var(--gradient-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Headphones size={22} color="#FFF" />
          </div>
          <div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: '700',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #FFF 0%, #C4B5FD 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              MyMusic Lounge
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              DELUXE AUDIO
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav
          style={{
            display: 'none',
            gap: '24px',
            alignItems: 'center',
          }}
          className="desktop-nav"
        >
          {navLinks.map((item) => {
            if (item.authOnly && !isAuthenticated) return null;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'all var(--transition-fast)',
                })}
              >
                <Icon size={16} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Right Section: Mode & Listener Pills & User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Active Mode Pill */}
          {playbackMode === 'station' ? (
            <div className="badge-mode station" title="Connected to Owner-Curated Station">
              <Radio size={13} />
              <span>Owner Station</span>
            </div>
          ) : (
            <button
              onClick={switchToStation}
              className="badge-mode personal"
              title="Click to return to live Lounge Radio"
              style={{ cursor: 'pointer', border: '1px solid rgba(6, 182, 212, 0.4)' }}
            >
              <Music2 size={13} />
              <span>Personal Mode</span>
              <span style={{ fontSize: '10px', opacity: 0.8 }}>(Return to Live)</span>
            </button>
          )}

          {/* Live Listener Count */}
          <div
            className="badge-live"
            title={`${listenersCount} listener${listenersCount === 1 ? '' : 's'} tuned in right now`}
          >
            <span className="badge-live-dot"></span>
            <span>{listenersCount} {listenersCount === 1 ? 'Listener' : 'Listeners'}</span>
          </div>

          {/* Admin Dashboard shortcut */}
          {isAdmin && (
            <Link
              to="/admin"
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '13px' }}
              title="Lounge Owner Control Room"
            >
              <Shield size={15} color="#A78BFA" />
              <span>Admin</span>
            </Link>
          )}

          {/* User Account / Login */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={user.avatarUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=user'}
                alt={user.username}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  border: '2px solid var(--primary)',
                }}
              />
              <button
                onClick={handleLogout}
                className="btn-icon"
                title="Log Out"
                style={{ width: '34px', height: '34px' }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn-icon mobile-menu-btn"
            style={{ width: '38px', height: '38px' }}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'var(--navbar-height)',
            left: 0,
            right: 0,
            background: 'var(--bg-surface-elevated)',
            borderBottom: '1px solid var(--border-glass)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {navLinks.map((item) => {
            if (item.authOnly && !isAuthenticated) return null;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '15px',
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                })}
              >
                <Icon size={18} />
                {item.name}
              </NavLink>
            );
          })}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '15px',
                fontWeight: '600',
                color: '#A78BFA',
                padding: '12px 16px',
              }}
            >
              <Shield size={18} />
              Owner Admin Dashboard
            </Link>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 820px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
