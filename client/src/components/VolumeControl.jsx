import React from 'react';
import { useMusic } from '../context/MusicContext';
import { Volume2, Volume1, VolumeX } from 'lucide-react';

export default function VolumeControl() {
  const { volume, setVolume, isMuted, setIsMuted } = useMusic();

  const handleVolumeChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setVolume(val);
    if (val > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button
        onClick={toggleMute}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
        }}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        <VolumeIcon size={18} />
      </button>

      <input
        type="range"
        min="0"
        max="100"
        value={isMuted ? 0 : volume}
        onChange={handleVolumeChange}
        className="custom-range"
        aria-label="Volume Slider"
      />
    </div>
  );
}
