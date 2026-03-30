
import { useState, useEffect, useRef } from 'react';

export default function PlayerBar({ song, onNext, onPrev, hasPrev, hasNext }) {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume]   = useState(70);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (song) setPlaying(true);
  }, [song?.videoId]);

  const embedSrc = song
    ? `https://www.youtube.com/embed/${song.videoId}?autoplay=${playing ? 1 : 0}&enablejsapi=1&rel=0&modestbranding=1`
    : '';

  return (
    <div style={{
      borderTop: '0.5px solid var(--border)',
      background: 'var(--bg-elevated)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      
      {song && (
        <div style={{ position:'absolute', width:1, height:1, overflow:'hidden', opacity:0, pointerEvents:'none', top:0, left:0 }}>
          <iframe
            ref={iframeRef}
            key={song.videoId + playing}
            src={embedSrc}
            title="yt-player"
            allow="autoplay; encrypted-media"
            style={{ width:1, height:1, border:'none' }}
          />
        </div>
      )}

      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        padding: '0 24px',
        height: 80,
        gap: 16,
      }}>

        
        <div style={{ display:'flex', alignItems:'center', gap:14, minWidth:0 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 6, flexShrink: 0,
            background: 'var(--bg-card)', overflow:'hidden',
            border: '0.5px solid var(--border)',
          }}>
            {song?.thumbnail
              ? <img src={song.thumbnail} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
              : <div style={{ width:'100%', height:'100%', background:'var(--bg-card)' }} />
            }
          </div>
          <div style={{ minWidth:0 }}>
            <div style={{
              fontSize: 14, fontWeight: 500,
              color: song ? 'var(--text-primary)' : 'var(--text-muted)',
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
              maxWidth: 220,
            }}>
              {song?.title || 'Nothing playing'}
            </div>
            {song && (
              <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2,
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:220 }}>
                {song.channelTitle}
              </div>
            )}
          </div>
        </div>

        
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <CtrlBtn onClick={onPrev} disabled={!hasPrev} title="Previous">
            <SkipBackIcon />
          </CtrlBtn>

          <button
            onClick={() => setPlaying(p => !p)}
            disabled={!song}
            title={playing ? 'Pause' : 'Play'}
            style={{
              width: 38, height: 38, borderRadius: '50%',
              background: song ? 'var(--text-primary)' : 'var(--bg-card)',
              border: 'none', cursor: song ? 'pointer' : 'not-allowed',
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'transform 0.1s, background 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={e => { if (song) e.currentTarget.style.transform = 'scale(1.06)'; }}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {playing
              ? <PauseIcon color="var(--bg-base)" />
              : <PlayIcon  color="var(--bg-base)" />
            }
          </button>

          <CtrlBtn onClick={onNext} disabled={!hasNext} title="Next">
            <SkipFwdIcon />
          </CtrlBtn>
        </div>

        
        <div style={{ display:'flex', alignItems:'center', gap:12, justifyContent:'flex-end' }}>
          <VolumeIcon muted={volume === 0} />
          <input
            type="range" min={0} max={100} value={volume} step={1}
            onChange={e => setVolume(Number(e.target.value))}
            style={{ width:90, accentColor:'var(--accent)', cursor:'pointer' }}
            title="Volume"
          />
          {song && (
            <a
              href={`https://www.youtube.com/watch?v=${song.videoId}`}
              target="_blank" rel="noreferrer"
              title="Open on YouTube"
              style={{
                display:'flex', alignItems:'center', justifyContent:'center',
                width:30, height:30, borderRadius:6,
                border:'0.5px solid var(--border)', color:'var(--text-muted)',
                textDecoration:'none', transition:'all 0.15s', flexShrink:0,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--text-sub)'; e.currentTarget.style.color='var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-muted)'; }}
            >
              <YTIcon />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function CtrlBtn({ children, onClick, disabled, title }) {
  return (
    <button
      onClick={onClick} disabled={disabled} title={title}
      style={{
        background:'transparent', border:'none',
        color: disabled ? 'var(--text-muted)' : 'var(--text-sub)',
        opacity: disabled ? 0.35 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: 8, display:'flex', alignItems:'center', justifyContent:'center',
        borderRadius:6, transition:'color 0.15s',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.color = 'var(--text-primary)'; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.color = 'var(--text-sub)'; }}
    >
      {children}
    </button>
  );
}

function PlayIcon({ color='currentColor' }) {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill={color}><path d="M3 2.5l10 5.5-10 5.5V2.5z"/></svg>;
}
function PauseIcon({ color='currentColor' }) {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill={color}><rect x="3" y="2" width="4" height="12" rx="1"/><rect x="9" y="2" width="4" height="12" rx="1"/></svg>;
}
function SkipBackIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13 2.5L3 8l10 5.5V2.5z"/><rect x="2" y="2" width="2" height="12" rx="1"/></svg>;
}
function SkipFwdIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M3 2.5l10 5.5-10 5.5V2.5z"/><rect x="12" y="2" width="2" height="12" rx="1"/></svg>;
}
function VolumeIcon({ muted }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--text-muted)">
      <path d="M8 2L4 6H1v4h3l4 4V2z"/>
      {!muted && <path d="M11 5a4 4 0 010 6" stroke="var(--text-muted)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>}
    </svg>
  );
}
function YTIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/>
    </svg>
  );
}