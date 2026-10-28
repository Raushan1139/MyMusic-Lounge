import React, { useEffect, useRef, useState } from 'react';
import { useMusic } from '../context/MusicContext';
import { Volume2, AlertCircle, Play } from 'lucide-react';

/**
 * Official YouTube IFrame Player API Bridge
 * Adheres strictly to YouTube Terms of Service, embedding the genuine player.
 */
export default function YouTubeBridge({ isExpanded = false }) {
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
  } = useMusic();

  const containerRef = useRef(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [embedError, setEmbedError] = useState(null);
  const [ytApiLoaded, setYtApiLoaded] = useState(false);

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

    window.onYouTubeIframeAPIReady = () => {
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
      // Create new player instance
      playerRef.current = new window.YT.Player('youtube-bridge-iframe-target', {
        height: '100%',
        width: '100%',
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          disablekb: 0,
          enablejsapi: 1,
          fs: 1,
          modestbranding: 1,
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

            // Station mode sync position
            if (playbackMode === 'station' && stationState.positionSeconds > 0) {
              event.target.seekTo(stationState.positionSeconds, true);
            }

            // Attempt playback; detect if autoplay blocked by browser
            try {
              const playPromise = event.target.playVideo();
              // YT Player doesn't return promise directly in older versions, but state change captures it
            } catch {
              setIsAutoplayBlocked(true);
            }
          },
          onStateChange: (event) => {
            // YT.PlayerState: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
            if (event.data === 0) {
              // Video ended -> auto-advance
              nextTrack();
            } else if (event.data === 1) {
              setIsAutoplayBlocked(false);
            }
          },
          onError: (event) => {
            // Error codes: 2 (invalid video ID), 5 (HTML5 error), 100 (not found/private), 101/150 (not allowed to be embedded)
            const code = event.data;
            let msg = 'Playback error occurred.';
            if (code === 101 || code === 150) {
              msg = 'The video owner does not allow embedding outside YouTube. Please skip to the next track.';
            } else if (code === 100) {
              msg = 'This video was not found or is marked private.';
            } else if (code === 2) {
              msg = 'Invalid video ID provided.';
            }
            setEmbedError(msg);
          },
        },
      });
    } else {
      // Player already exists: load new video
      try {
        const currentLoaded = playerRef.current.getVideoData?.()?.video_id;
        if (currentLoaded !== videoId) {
          playerRef.current.loadVideoById({
            videoId,
            startSeconds: playbackMode === 'station' ? (stationState.positionSeconds || 0) : 0,
          });
        }
      } catch (err) {
        console.warn('[YT Bridge] Error loading video:', err);
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

  // Handle Station seek / pause / play external changes
  useEffect(() => {
    if (!playerRef.current || !playerReady || playbackMode !== 'station') return;

    if (stationState.playbackState === 'PAUSED') {
      playerRef.current.pauseVideo();
    } else if (stationState.playbackState === 'PLAYING') {
      playerRef.current.playVideo();
    }
  }, [stationState.playbackState, playbackMode, playerReady]);

  return (
    <div
      style={{
        width: isExpanded ? '100%' : '240px',
        height: isExpanded ? '380px' : '135px',
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: '#000',
        border: '1px solid var(--border-glass)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Target container for YT Iframe */}
      <div id="youtube-bridge-iframe-target" style={{ width: '100%', height: '100%' }}></div>

      {/* Autoplay unlock prompt (Browsers block sound before user interaction) */}
      {isAutoplayBlocked && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(11, 13, 19, 0.9)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            textAlign: 'center',
            zIndex: 10,
          }}
        >
          <Volume2 size={32} color="#A78BFA" style={{ marginBottom: '8px' }} />
          <p style={{ fontSize: '13px', color: '#E2E8F0', marginBottom: '12px' }}>
            Browser paused audio until you tap below:
          </p>
          <button
            onClick={unlockAudio}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            <Play size={14} fill="#FFF" /> Join Lounge Audio
          </button>
        </div>
      )}

      {/* Embed restriction error */}
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
            padding: '20px',
            textAlign: 'center',
            zIndex: 15,
          }}
        >
          <AlertCircle size={32} color="#F87171" style={{ marginBottom: '8px' }} />
          <p style={{ fontSize: '13px', color: '#FCA5A5', marginBottom: '12px', lineHeight: 1.4 }}>
            {embedError}
          </p>
          <button
            onClick={nextTrack}
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '6px 14px' }}
          >
            Skip to Next Track
          </button>
        </div>
      )}
    </div>
  );
}
