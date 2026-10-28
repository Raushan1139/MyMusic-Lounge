import React from 'react';
import { useMusic } from '../context/MusicContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ListMusic, Trash2, ArrowUp, Radio, Music } from 'lucide-react';

export default function QueuePanel() {
  const {
    playbackMode,
    stationState,
    personalQueue,
    removeFromPersonalQueue,
    playPersonalTrack,
  } = useMusic();
  const { isAdmin } = useAuth();

  const handleAdminRemoveStationQueue = async (queueId) => {
    try {
      await api.station.removeFromQueue(queueId);
    } catch (err) {
      alert(err.message);
    }
  };

  const queueList =
    playbackMode === 'station'
      ? stationState.queue.map((item) => ({
          id: item.id,
          track: item.track,
          isStation: true,
        }))
      : personalQueue.map((track, index) => ({
          id: `personal_${index}`,
          track,
          index,
          isStation: false,
        }));

  return (
    <div
      className="glass-panel"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        background: 'rgba(18, 22, 34, 0.8)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ListMusic size={18} color="#A78BFA" />
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFF' }}>
            {playbackMode === 'station' ? 'Lounge Station Queue' : 'Your Personal Queue'}
          </h3>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {queueList.length} {queueList.length === 1 ? 'track' : 'tracks'}
        </span>
      </div>

      {queueList.length === 0 ? (
        <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
          {playbackMode === 'station'
            ? 'The station queue is currently empty. Next up is the default playlist.'
            : 'Your personal queue is empty. Add songs from Discover or paste YouTube links!'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto' }}>
          {queueList.map((item, idx) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', width: '18px', textAlign: 'center' }}>
                {idx + 1}
              </span>
              <img
                src={item.track.thumbnailUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=100&auto=format&fit=crop&q=80'}
                alt={item.track.title}
                style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#FFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.track.title}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.track.artist}
                </div>
              </div>

              {/* Remove action */}
              {item.isStation && isAdmin && (
                <button
                  onClick={() => handleAdminRemoveStationQueue(item.id)}
                  style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                  title="Remove from Station Queue"
                >
                  <Trash2 size={14} />
                </button>
              )}

              {!item.isStation && (
                <button
                  onClick={() => removeFromPersonalQueue(item.index)}
                  style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                  title="Remove from personal queue"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
