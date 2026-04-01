// src/components/PlayerBar.jsx
// Uses YouTube IFrame Player API for real seek, volume, and duration control

import { useState, useEffect, useRef, useCallback } from 'react';

// Load YouTube IFrame API script once globally
function loadYTScript() {
  if (window.YT || document.getElementById('yt-api-script')) return;
  const tag = document.createElement('script');
  tag.id  = 'yt-api-script';
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
}

export default function PlayerBar({ song, onNext, onPrev, hasPrev, hasNext }) {
  const [ready,      setReady]      = useState(false);   // YT player ready
  const [playing,    setPlaying]    = useState(false);
  const [progress,   setProgress]   = useState(0);       // 0-100
  const [currentSec, setCurrentSec] = useState(0);
  const [duration,   setDuration]   = useState(0);
  const [volume,     setVolume]     = useState(80);
  const [buffering,  setBuffering]  = useState(false);

  const playerRef   = useRef(null);   // YT.Player instance
  const containerRef = useRef(null);  // div the player mounts into
  const tickRef     = useRef(null);
  const progressBarRef = useRef(null);

  // ── Load YouTube API on mount ─────────────────────────────────────────────
  useEffect(() => {
    loadYTScript();

    // YT API calls this when ready
    window.onYouTubeIframeAPIReady = () => {
      initPlayer();
    };

    // If already loaded
    if (window.YT?.Player) initPlayer();

    return () => {
      clearInterval(tickRef.current);
      if (playerRef.current?.destroy) playerRef.current.destroy();
    };
  }, []);

  function initPlayer() {
    if (playerRef.current) return;
    playerRef.current = new window.YT.Player(containerRef.current, {
      height: '1',
      width:  '1',
      videoId: '',
      playerVars: {
        autoplay    : 1,
        controls    : 0,
        rel         : 0,
        modestbranding: 1,
        playsinline : 1,
      },
      events: {
        onReady: (e) => {
          setReady(true);
          e.target.setVolume(80);
        },
        onStateChange: (e) => {
          const S = window.YT.PlayerState;
          if (e.data === S.PLAYING) {
            setPlaying(true);
            setBuffering(false);
            setDuration(Math.floor(e.target.getDuration()));
            startTick();
          } else if (e.data === S.PAUSED) {
            setPlaying(false);
            stopTick();
          } else if (e.data === S.BUFFERING) {
            setBuffering(true);
          } else if (e.data === S.ENDED) {
            setPlaying(false);
            setProgress(100);
            stopTick();
            onNext?.();   // auto advance
          }
        },
        onError: (e) => {
          console.warn('YT player error:', e.data);
          setBuffering(false);
          // Skip to next on error (video unavailable etc)
          setTimeout(() => onNext?.(), 1500);
        },
      },
    });
  }

  // ── Load new song when it changes ─────────────────────────────────────────
  useEffect(() => {
    if (!song || !ready || !playerRef.current) return;
    setProgress(0);
    setCurrentSec(0);
    setDuration(0);
    setBuffering(true);
    playerRef.current.loadVideoById(song.videoId);
  }, [song?.videoId, ready]);

  // ── Tick: update progress every 500ms while playing ───────────────────────
  function startTick() {
    stopTick();
    tickRef.current = setInterval(() => {
      if (!playerRef.current?.getCurrentTime) return;
      const cur = playerRef.current.getCurrentTime() || 0;
      const dur = playerRef.current.getDuration()    || 0;
      setCurrentSec(cur);
      setDuration(dur);
      setProgress(dur > 0 ? (cur / dur) * 100 : 0);
    }, 500);
  }
  function stopTick() { clearInterval(tickRef.current); }

  // ── Play / Pause ───────────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    if (!playerRef.current || !ready) return;
    if (playing) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [playing, ready]);

  // ── Seek: click on progress bar ───────────────────────────────────────────
  const handleSeek = useCallback((e) => {
    if (!progressBarRef.current || !playerRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const sec  = pct * duration;
    playerRef.current.seekTo(sec, true);
    setCurrentSec(sec);
    setProgress(pct * 100);
  }, [duration]);

  // ── Volume ─────────────────────────────────────────────────────────────────
  const handleVolume = useCallback((val) => {
    setVolume(val);
    if (playerRef.current?.setVolume) {
      playerRef.current.setVolume(val);
    }
  }, []);

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  };

  return (
    <div style={{ borderTop:'1px solid var(--border)', background:'var(--bg-2)', display:'flex', flexDirection:'column', flexShrink:0 }}>

      {/* Hidden YT player container */}
      <div style={{ position:'absolute', width:1, height:1, overflow:'hidden', opacity:0, pointerEvents:'none', bottom:80 }}>
        <div ref={containerRef} />
      </div>

      {/* Progress bar */}
      <div
        ref={progressBarRef}
        onClick={handleSeek}
        style={{ height:3, background:'var(--bg-4)', cursor: song ? 'pointer' : 'default', position:'relative', flexShrink:0, transition:'height 0.1s' }}
        onMouseEnter={e => e.currentTarget.style.height='5px'}
        onMouseLeave={e => e.currentTarget.style.height='3px'}
      >
        <div style={{
          height:'100%', width:`${progress}%`,
          background:'linear-gradient(90deg, var(--accent), var(--accent-2))',
          transition:'width 0.5s linear',
          position:'relative',
        }}>
          <div style={{
            position:'absolute', right:-5, top:'50%', transform:'translateY(-50%)',
            width:10, height:10, borderRadius:'50%',
            background:'var(--text-1)', opacity: song ? 1 : 0,
            boxShadow:'0 0 6px var(--accent)',
          }} />
        </div>
      </div>

      {/* Controls row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', alignItems:'center', padding:'0 24px', height:72, gap:16 }}>

        {/* Left — song info */}
        <div style={{ display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
          <div style={{
            width:44, height:44, borderRadius:6, flexShrink:0,
            background:'var(--bg-4)', overflow:'hidden', border:'1px solid var(--border)',
            position:'relative',
          }}>
            {song?.thumbnail
              ? <img src={song.thumbnail} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
              : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-4)', fontSize:18 }}>♪</div>
            }
            {buffering && (
              <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div className="spin" style={{ width:14, height:14, border:'2px solid var(--text-4)', borderTopColor:'var(--accent-2)', borderRadius:'50%' }} />
              </div>
            )}
            {playing && !buffering && (
              <div style={{ position:'absolute', inset:-2, borderRadius:8, border:'1.5px solid var(--accent)', animation:'pulse 2s ease-in-out infinite', pointerEvents:'none' }} />
            )}
          </div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:500, color: song ? 'var(--text-1)' : 'var(--text-4)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:200 }}>
              {song?.title || 'Nothing playing'}
            </div>
            {song && (
              <div style={{ fontSize:11, color:'var(--text-4)', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:200 }}>
                {song.channelTitle}
              </div>
            )}
          </div>
        </div>

        {/* Center — controls + time */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            <Btn onClick={onPrev} disabled={!hasPrev} title="Previous"><PrevIcon /></Btn>

            <button
              onClick={togglePlay} disabled={!song || !ready}
              style={{
                width:40, height:40, borderRadius:'50%',
                background: song && ready ? 'var(--text-1)' : 'var(--bg-4)',
                border:'none', cursor: song && ready ? 'pointer' : 'not-allowed',
                display:'flex', alignItems:'center', justifyContent:'center',
                transition:'all 0.15s', flexShrink:0,
                boxShadow: playing ? '0 0 20px var(--accent-glow)' : 'none',
              }}
              onMouseEnter={e => { if (song && ready) e.currentTarget.style.transform='scale(1.08)'; }}
              onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
            >
              {buffering
                ? <div className="spin" style={{ width:14, height:14, border:'2px solid var(--bg-3)', borderTopColor:'var(--bg)', borderRadius:'50%' }} />
                : playing
                  ? <PauseIcon color="var(--bg)" />
                  : <PlayIcon  color="var(--bg)" />
              }
            </button>

            <Btn onClick={onNext} disabled={!hasNext} title="Next"><NextIcon /></Btn>
          </div>

          {/* Time */}
          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:10, color:'var(--text-4)', fontVariantNumeric:'tabular-nums', letterSpacing:'0.04em' }}>
            <span style={{ minWidth:32, textAlign:'right' }}>{fmt(currentSec)}</span>
            <span style={{ opacity:0.3 }}>/</span>
            <span style={{ minWidth:32 }}>{fmt(duration)}</span>
          </div>
        </div>

        {/* Right — volume + YT link */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:10 }}>
          <button
            onClick={() => handleVolume(volume === 0 ? 80 : 0)}
            style={{ background:'transparent', border:'none', cursor:'pointer', padding:4, display:'flex', alignItems:'center' }}
          >
            <VolumeIcon level={volume} />
          </button>
          <input
            type="range" min={0} max={100} value={volume} step={1}
            onChange={e => handleVolume(Number(e.target.value))}
            style={{ width:80, accentColor:'var(--accent-2)', cursor:'pointer' }}
          />
          {song && (
            <a href={`https://www.youtube.com/watch?v=${song.videoId}`}
              target="_blank" rel="noreferrer" title="Open on YouTube"
              style={{
                display:'flex', alignItems:'center', gap:5,
                padding:'5px 10px', borderRadius:6,
                border:'1px solid var(--border)', color:'var(--text-4)',
                fontSize:11, fontWeight:500, transition:'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-2)'; e.currentTarget.style.color='var(--text-1)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)';   e.currentTarget.style.color='var(--text-4)'; }}
            >
              <YTIcon /> YT
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Btn({ children, onClick, disabled, title }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      style={{
        background:'transparent', border:'none', padding:8, borderRadius:6,
        color: disabled ? 'var(--text-4)' : 'var(--text-3)',
        opacity: disabled ? 0.3 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display:'flex', alignItems:'center', justifyContent:'center',
        transition:'color 0.15s',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.color='var(--text-1)'; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.color='var(--text-3)'; }}
    >
      {children}
    </button>
  );
}

const PlayIcon  = ({ color='currentColor' }) => <svg width="16" height="16" viewBox="0 0 16 16" fill={color}><path d="M3 2.5l10 5.5-10 5.5V2.5z"/></svg>;
const PauseIcon = ({ color='currentColor' }) => <svg width="16" height="16" viewBox="0 0 16 16" fill={color}><rect x="3" y="2" width="4" height="12" rx="1"/><rect x="9" y="2" width="4" height="12" rx="1"/></svg>;
const PrevIcon  = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13 2.5L3 8l10 5.5V2.5z"/><rect x="2" y="2" width="2" height="12" rx="1"/></svg>;
const NextIcon  = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M3 2.5l10 5.5-10 5.5V2.5z"/><rect x="12" y="2" width="2" height="12" rx="1"/></svg>;

function VolumeIcon({ level }) {
  const color = 'var(--text-4)';
  if (level === 0) return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill={color}>
      <path d="M8 2L4 6H1v4h3l4 4V2z"/>
      <line x1="10" y1="6" x2="14" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="14" y1="6" x2="10" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
  if (level < 40) return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill={color}>
      <path d="M8 2L4 6H1v4h3l4 4V2z"/>
      <path d="M11 6a2.5 2.5 0 010 4" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill={color}>
      <path d="M8 2L4 6H1v4h3l4 4V2z"/>
      <path d="M11 5a4 4 0 010 6M13.5 3a7 7 0 010 10" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function YTIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>;
}