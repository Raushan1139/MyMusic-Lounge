import React, { useState } from 'react';
import { Search, Youtube, ArrowRight } from 'lucide-react';

export default function SearchBar({ value, onChange, onDirectYouTube, placeholder = 'Search by song title, artist, or paste YouTube link...' }) {
  const [localInput, setLocalInput] = useState(value || '');

  const handleChange = (e) => {
    const val = e.target.value;
    setLocalInput(val);
    if (onChange) onChange(val);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (
        (localInput.includes('youtube.com') || localInput.includes('youtu.be')) &&
        onDirectYouTube
      ) {
        onDirectYouTube(localInput);
      }
    }
  };

  const isLink = localInput.includes('youtube.com') || localInput.includes('youtu.be');

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '16px',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        {isLink ? <Youtube size={18} color="#EF4444" /> : <Search size={18} />}
      </div>

      <input
        type="text"
        className="input-field"
        value={localInput}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          paddingLeft: '48px',
          paddingRight: isLink ? '110px' : '20px',
          height: '48px',
          fontSize: '14px',
        }}
      />

      {isLink && onDirectYouTube && (
        <button
          onClick={() => onDirectYouTube(localInput)}
          className="btn-primary"
          style={{
            position: 'absolute',
            right: '6px',
            padding: '6px 12px',
            fontSize: '12px',
          }}
        >
          <span>Play Link</span>
          <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}
