
import { useState, useEffect, useRef, useCallback } from 'react';

export default function PlayerBar({ song, onNext, onPrev, hasPrev, hasNext }) {
  const [playing,    setPlaying]    = useState(false);
  const [progress,   setProgress]   = useState(0);    // 0-100
  const [duration,   setDuration]   = useState(0);    // seconds
  const [currentSec, setCurrentSec] = useState(0);    // seconds
  const [volume,     setVolume]     = useState(80);
  const [dragging,   setDragging]   = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const playerRef  = useRef(null);
  const timerRef   = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    if (song) {
      setPlaying(true);
      setProgress(0);
      setCurrentSec(0);
      setDuration(0);
    }
  }, [song?.videoId]);

  useEffect(() => {
    clearInterval(timerRef.current);
    if (playing && song && duration > 0 && !dragging) {
      timerRef.current = setInterval(() => {
        setCurrentSec(s => {
          const next = s + 1;
          if (next >= duration) { clearInterval(timerRef.current); return duration; }
          setProgress((next / duration) * 100);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, song, duration, dragging]);

  useEffect(() => {
    if (!song) return;

    if (song.duration && song.duration !== '--:--' && song.duration !== 'Live') {
      const parts = song.duration.split(':').map(Number);
      if (parts.length === 2) setDuration(parts[0] * 60 + parts[1]);
      else if (parts.length === 3) setDuration(parts[0] * 3600 + parts[1] * 60 + parts[2]);
    } else {
      setDuration(210); // default 3:30
    }
  }, [song?.videoId]);

  
  const handleProgressClick = useCallback((e) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const sec  = pct * duration;
    setProgress(pct * 100);
    setCurrentSec(sec);
  }, [duration]);

  const fmtSec = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const embedUrl = song
    ? `https://www.youtube.com/embed/${song.videoId}?autoplay=${playing?1:0}&enablejsapi=1&rel=0&modestbranding=1&controls=0`
    : '';

  return (
    <div style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--bg-2)',
      display: 'flex', flexDirection: 'column',
      flexShrink: 0,
    }}>
      
      {song && (
        <div style={{ position:'absolute', width:1, height:1, overflow:'hidden', opacity:0, pointerEvents:'none', bottom:80, left:0 }}>
          <iframe
            ref={playerRef}
            key={`${song.videoId}-${playing}`}
            src={playing ? embedUrl : ''}
            title="yt"
            allow="autoplay; encrypted-media"
            style={{ width:1, height:1, border:'none' }}
          />
        </div>
      )}

      <div
        ref={progressRef}
        onClick={handleProgressClick}
        style={{
          height:3, background:'var(--bg-4)',
          cursor: song ? 'pointer' : 'default',
          position:'relative', flexShrink:0,
        }}
        onMouseEnter={e => { if (song) e.currentTarget.style.height='5px'; }}
        onMouseLeave={e => e.currentTarget.style.height='3px'}
      >
        <div style={{
          height:'100%', width:`${progress}%`,
          background: `linear-gradient(90deg, var(--accent), var(--accent-2))`,
          transition: dragging ? 'none' : 'width 0.5s linear',
          position:'relative',
        }}>
  
          <div style={{
            position:'absolute', right:-5, top:'50%', transform:'translateY(-50%)',
            width:10, height:10, borderRadius:'50%',
            background:'var(--text-1)',
            opacity: song ? 1 : 0,
          }} />
        </div>
      </div>

      <div style={{
        display:'grid', gridTemplateColumns:'1fr auto 1fr',
        alignItems:'center', padding:'0 24px', height:72, gap:16,
      }}>

        <div style={{ display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
          {/* Thumbnail */}
          <div style={{
            width:44, height:44, borderRadius:6, flexShrink:0,
            background:'var(--bg-4)', overflow:'hidden',
            border:'1px solid var(--border)',
            position:'relative',
          }}>
            {song?.thumbnail
              ? <img src={song.thumbnail} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
              : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-4)', fontSize:18 }}>♪</div>
            }
            
            {playing && song && (
              <div style={{
                position:'absolute', inset:-2, borderRadius:8,
                border:`1.5px solid var(--accent)`,
                animation:'pulse 2s ease-in-out infinite',
                pointerEvents:'none',
              }} />
            )}
          </div>

          <div style={{ minWidth:0 }}>
            <div style={{
              fontSize:13, fontWeight:500,
              color: song ? 'var(--text-1)' : 'var(--text-4)',
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
              maxWidth:200,
            }}>
              {song?.title || 'Nothing playing'}
            </div>
            {song && (
              <div style={{ fontSize:11, color:'var(--text-4)', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:200 }}>
                {song.channelTitle}
              </div>
            )}
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            <Btn onClick={onPrev} disabled={!hasPrev} title="Previous">
              <PrevIcon />
            </Btn>

            <button
              onClick={() => setPlaying(p => !p)}
              disabled={!song}
              style={{
                width:40, height:40, borderRadius:'50%',
                background: song ? 'var(--text-1)' : 'var(--bg-4)',
                border:'none', cursor: song ? 'pointer' : 'not-allowed',
                display:'flex', alignItems:'center', justifyContent:'center',
                transition:'all 0.15s', flexShrink:0,
                boxShadow: playing && song ? '0 0 16px var(--accent-glow)' : 'none',
              }}
              onMouseEnter={e => { if (song) e.currentTarget.style.transform='scale(1.08)'; }}
              onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
            >
              {playing
                ? <PauseIcon color="var(--bg)" />
                : <PlayIcon  color="var(--bg)" />
              }
            </button>

            <Btn onClick={onNext} disabled={!hasNext} title="Next">
              <NextIcon />
            </Btn>
          </div>

          {song && (
            <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:10, color:'var(--text-4)', fontVariantNumeric:'tabular-nums', letterSpacing:'0.02em' }}>
              <span>{fmtSec(currentSec)}</span>
              <span style={{ opacity:0.4 }}>/</span>
              <span>{fmtSec(duration)}</span>
            </div>
          )}
        </div>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:10 }}>
          <VolumeIcon muted={volume === 0} />
          <input
            type="range" min={0} max={100} value={volume} step={1}
            onChange={e => setVolume(Number(e.target.value))}
            style={{ width:80, accentColor:'var(--accent-2)', cursor:'pointer' }}
          />

          {song && (
            <a
              href={`https://www.youtube.com/watch?v=${song.videoId}`}
              target="_blank" rel="noreferrer" title="Open full video on YouTube"
              style={{
                display:'flex', alignItems:'center', gap:5,
                padding:'5px 10px', borderRadius:6,
                border:'1px solid var(--border)',
                color:'var(--text-4)', fontSize:11, fontWeight:500,
                transition:'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-2)'; e.currentTarget.style.color='var(--text-1)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-4)'; }}
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
        background:'transparent', border:'none', padding:8,
        color: disabled ? 'var(--text-4)' : 'var(--text-3)',
        opacity: disabled ? 0.3 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display:'flex', alignItems:'center', justifyContent:'center',
        borderRadius:6, transition:'color 0.15s',
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
const PrevIcon  = ()                          => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13 2.5L3 8l10 5.5V2.5z"/><rect x="2" y="2" width="2" height="12" rx="1"/></svg>;
const NextIcon  = ()                          => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M3 2.5l10 5.5-10 5.5V2.5z"/><rect x="12" y="2" width="2" height="12" rx="1"/></svg>;

function VolumeIcon({ muted }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="var(--text-4)">
      <path d="M8 2L4 6H1v4h3l4 4V2z"/>
      {!muted && <path d="M11 5a4 4 0 010 6M13.5 3a7 7 0 010 10" stroke="var(--text-4)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>}
    </svg>
  );
}

function YTIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>;
}