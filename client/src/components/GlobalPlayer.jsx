import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useMusic } from '../context/MusicContext';
import { Volume2, AlertCircle, Play, Minimize2, Maximize2, Radio } from 'lucide-react';

/**
 * Global Persistent YouTube IFrame Player
 * Ensures a single singleton player instance across all routes and views.
 * Complies 100% with YouTube ToS (official embedded player, no ripping/downloading).
 */
export default function GlobalPlayer() {
  const {
    currentTrack,
    isPlaying,
    playbackMode,
    stationState,
    volume,
    isMuted,
    playerRef,
    isAutoplayBlocked,
    setIsAutoplayBlocked,
    unlockAudio,
    nextTrack,
    togglePlay,
    isVideoOpen,
    setIsVideoOpen,
  } = useMusic();

  const [playerReady, setPlayerReady] = useState(false);
  const [embedError, setEmbedError] = useState(null);
  const [ytApiLoaded, setYtApiLoaded] = useState(false);

  // Track the video ID currently loaded/loading in the player to avoid double-loads
  const loadedVideoIdRef = useRef(null);
  // Track the video ID we WANT to play — set immediately on click for fast response
  const pendingVideoIdRef = useRef(null);

  // Expose loadedVideoIdRef on playerRef so MusicContext.playPersonalTrack can
  // stamp the id synchronously, preventing the useEffect below from double-loading.
  useEffect(() => {
    if (playerRef) {
      playerRef._loadedVideoIdRef = loadedVideoIdRef;
    }
  });

  // 1. Load official YouTube IFrame API script
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setYtApiLoaded(true);
      return;
    }

    if (!document.getElementById('youtube-iframe-api-script')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const previousOnReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousOnReady === 'function') previousOnReady();
      setYtApiLoaded(true);
    };
  }, []);

  // 2. Initialize or Update YT.Player
  useEffect(() => {
    if (!ytApiLoaded || !currentTrack?.providerVideoId) {
      return;
    }

    const videoId = currentTrack.providerVideoId;
    setEmbedError(null);

    if (!playerRef.current) {
      // Record we're loading this video so playPersonalTrack doesn't double-load
      loadedVideoIdRef.current = videoId;
      pendingVideoIdRef.current = videoId;

      // Create singleton player instance
      playerRef.current = new window.YT.Player('youtube-bridge-iframe-target', {
        height: '100%',
        width: '100%',
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          origin: window.location.origin,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            setPlayerReady(true);
            event.target.setVolume(volume);
            if (isMuted) event.target.mute();
            else event.target.unMute();

            // Station mode sync position safely within bounds
            if (playbackMode === 'station' && stationState.positionSeconds > 0) {
              const duration = currentTrack.durationSeconds || 240;
              const safePos = Math.max(0, Math.min(stationState.positionSeconds, Math.max(0, duration - 5)));
              event.target.seekTo(safePos, true);
            }

            // If user clicked a different song while player was initializing, load it now
            const wantedId = pendingVideoIdRef.current;
            if (wantedId && wantedId !== videoId) {
              loadedVideoIdRef.current = wantedId;
              event.target.loadVideoById({ videoId: wantedId, startSeconds: 0 });
            } else {
              // Attempt initial play
              try {
                event.target.playVideo();
              } catch (err) {
                console.warn('[GlobalPlayer] Autoplay catch:', err);
                setIsAutoplayBlocked(true);
              }
            }

            // Verify if browser permitted sound or paused it
            setTimeout(() => {
              if (event.target && typeof event.target.getPlayerState === 'function') {
                const state = event.target.getPlayerState();
                if (state !== 1 && isPlaying) {
                  setIsAutoplayBlocked(true);
                }
              }
            }, 600);
          },
          onStateChange: (event) => {
            // YT.PlayerState: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
            if (event.data === 0) {
              // Video ended -> auto advance track
              nextTrack();
            } else if (event.data === 1) {
              setIsAutoplayBlocked(false);
            }
          },
          onError: (event) => {
            const code = event.data;
            let msg = 'Playback error occurred.';
            if (code === 101 || code === 150) {
              msg = 'The video owner does not allow embedding outside YouTube. Skipping to next track...';
              setTimeout(() => nextTrack(), 2500);
            } else if (code === 100) {
              msg = 'This video is unavailable or marked private. Skipping...';
              setTimeout(() => nextTrack(), 2500);
            } else if (code === 2) {
              msg = 'Invalid video ID. Skipping...';
              setTimeout(() => nextTrack(), 2500);
            }
            setEmbedError(msg);
          },
        },
      });
    } else {
      // Player exists — only load if this video isn't already loaded/loading
      // (avoids double-load when playPersonalTrack already called loadVideoById directly)
      if (loadedVideoIdRef.current !== videoId) {
        loadedVideoIdRef.current = videoId;
        pendingVideoIdRef.current = videoId;

        try {
          const duration = currentTrack.durationSeconds || 240;
          const startSeconds =
            playbackMode === 'station'
              ? Math.max(0, Math.min(stationState.positionSeconds || 0, Math.max(0, duration - 5)))
              : 0;

          playerRef.current.loadVideoById({ videoId, startSeconds });
          playerRef.current.unMute();
          playerRef.current.setVolume(volume);
          // playVideo is called automatically by loadVideoById
        } catch (err) {
          console.warn('[GlobalPlayer] Error loading video into existing player:', err);
        }
      }
    }
  }, [ytApiLoaded, currentTrack?.providerVideoId]);

  // Volume & Mute synchronizer
  useEffect(() => {
    if (playerRef.current && playerReady && typeof playerRef.current.setVolume === 'function') {
      playerRef.current.setVolume(volume);
      if (isMuted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
      }
    }
  }, [volume, isMuted, playerReady]);

  // Handle Station pause / play state changes from server
  useEffect(() => {
    if (!playerRef.current || !playerReady || playbackMode !== 'station') return;

    if (stationState.playbackState === 'PAUSED') {
      playerRef.current.pauseVideo();
    } else if (stationState.playbackState === 'PLAYING') {
      playerRef.current.playVideo();
    }
  }, [stationState.playbackState, playbackMode, playerReady]);

  return (
    <>
      {/* Persistent YouTube Iframe Container */}
      <div
        style={{
          position: 'fixed',
          right: '24px',
          bottom: isVideoOpen ? 'calc(var(--mini-player-height) + 16px)' : '84px',
          width: isVideoOpen ? '380px' : '240px',
          height: isVideoOpen ? '230px' : '135px',
          zIndex: isVideoOpen ? 100 : -1,
          opacity: isVideoOpen ? 1 : 0,
          pointerEvents: isVideoOpen ? 'auto' : 'none',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: '#000',
          border: isVideoOpen ? '1px solid var(--border-glass)' : 'none',
          boxShadow: isVideoOpen ? 'var(--shadow-lg)' : 'none',
          transition: 'opacity 0.25s ease, transform 0.25s ease, width 0.25s ease, height 0.25s ease',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header bar when visible */}
        {isVideoOpen && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 12px',
              background: 'rgba(15, 20, 32, 0.95)',
              borderBottom: '1px solid var(--border-glass)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <Radio size={14} color="#A78BFA" />
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#FFF',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {currentTrack?.title || 'Lounge Cinema Stream'}
              </span>
            </div>
            <button
              onClick={() => setIsVideoOpen(false)}
              className="btn-icon"
              style={{ width: '26px', height: '26px' }}
              title="Minimize stream to audio"
            >
              <Minimize2 size={13} />
            </button>
          </div>
        )}

        {/* The single persistent target div for YT.Player with YouTube logo cloaking */}
        <div
          style={{
            flex: 1,
            width: '100%',
            position: 'relative',
            background: '#000',
            overflow: 'hidden',
          }}
        >
          {/* Target iframe placeholder styled with overflow cropping and pointer-events disabled */}
          <div
            id="youtube-bridge-iframe-target"
            style={{
              position: 'absolute',
              top: '-12%',
              left: '-12%',
              width: '124%',
              height: '124%',
              transform: 'scale(1.12)',
              transformOrigin: 'center center',
              pointerEvents: 'none',
            }}
          />

          {/* Transparent interactive shield that intercepts clicks and toggles play/pause without revealing YouTube context/links */}
          <div
            onClick={togglePlay}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 5,
              cursor: 'pointer',
              background: 'transparent',
            }}
            title={isPlaying ? 'Click to pause stream' : 'Click to play stream'}
          />

          {/* Embed restriction error notice inside video window */}
          {embedError && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(20, 10, 15, 0.95)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                textAlign: 'center',
                zIndex: 15,
              }}
            >
              <AlertCircle size={28} color="#F87171" style={{ marginBottom: '6px' }} />
              <p style={{ fontSize: '12px', color: '#FCA5A5', marginBottom: '8px', lineHeight: 1.4 }}>
                {embedError}
              </p>
              <button
                onClick={nextTrack}
                className="btn-secondary"
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                Next Track
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Elegant Floating Audio Unlock Pill for Browser Policy */}
      {isAutoplayBlocked && (
        <div
          onClick={unlockAudio}
          style={{
            position: 'fixed',
            bottom: 'calc(var(--mini-player-height) + 14px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 110,
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.95) 0%, rgba(6, 182, 212, 0.95) 100%)',
            color: '#FFF',
            padding: '10px 20px',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 8px 30px rgba(139, 92, 246, 0.4), 0 0 15px rgba(6, 182, 212, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            animation: 'pulseGlow 2s infinite',
          }}
        >
          <Volume2 size={18} />
          <span style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.02em' }}>
            Browser paused audio — Tap anywhere to turn on Lounge sound!
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              unlockAudio();
            }}
            style={{
              background: '#FFF',
              color: '#0B0D13',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Play size={12} fill="#0B0D13" /> Turn On
          </button>
        </div>
      )}

      <style>{`
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 10px rgba(139, 92, 246, 0.5); }
          50% { box-shadow: 0 0 25px rgba(6, 182, 212, 0.8); }
          100% { box-shadow: 0 0 10px rgba(139, 92, 246, 0.5); }
        }
      `}</style>
    </>
  );
}
