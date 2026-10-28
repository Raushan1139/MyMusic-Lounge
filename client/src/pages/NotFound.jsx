import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Radio } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '32px 16px',
      }}
    >
      <div
        style={{
          fontSize: '96px',
          fontWeight: '900',
          background: 'var(--gradient-brand)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
          marginBottom: '16px',
        }}
      >
        404
      </div>
      <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#FFF', marginBottom: '8px' }}>
        Track Not Found
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '420px', marginBottom: '28px' }}>
        The frequency you are searching for does not exist in MyMusic Lounge. Let's tune back to the music!
      </p>
      <div style={{ display: 'flex', gap: '14px' }}>
        <Link to="/" className="btn-primary" style={{ padding: '12px 24px' }}>
          <Radio size={16} /> Return to Lounge Home
        </Link>
        <Link to="/discover" className="btn-secondary" style={{ padding: '12px 24px' }}>
          <Compass size={16} /> Explore Music
        </Link>
      </div>
    </div>
  );
}
