

export default function SongList({ songs, currentSong, onSongSelect, loading, mood }) {
  if (loading) return <Skeleton />;
  if (!mood)   return <EmptyState />;
  if (!songs.length) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:300, gap:12, color:'var(--text-muted)' }}>
      <span style={{ fontSize:36, opacity:0.3 }}>🎵</span>
      <p style={{ fontSize:14 }}>No songs found. Try a different mood.</p>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column' }}>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '48px 1fr 200px 64px',
        padding: '8px 16px',
        borderBottom: '0.5px solid var(--border)',
        marginBottom: 4,
        color: 'var(--text-muted)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        <span style={{ textAlign:'center' }}>#</span>
        <span>Title</span>
        <span>Channel</span>
        <span style={{ textAlign:'right' }}>Duration</span>
      </div>

      
      {songs.map((song, i) => (
        <SongRow
          key={song.videoId}
          song={song}
          index={i + 1}
          isPlaying={currentSong?.videoId === song.videoId}
          onClick={() => onSongSelect(song)}
          delay={i * 0.04}
        />
      ))}
    </div>
  );
}

function SongRow({ song, index, isPlaying, onClick, delay }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: '48px 1fr 200px 64px',
        alignItems: 'center',
        padding: '8px 16px',
        borderRadius: 6,
        background: isPlaying ? 'rgba(168,85,247,0.1)' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
        animation: `fadeUp 0.35s ${delay}s ease both`,
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => { if (!isPlaying) e.currentTarget.style.background = 'var(--bg-hover)'; }}
      onMouseLeave={e => { if (!isPlaying) e.currentTarget.style.background = 'transparent'; }}
    >
      
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
        {isPlaying ? (
          <span className="eq-bar">
            <span style={{ background:'var(--accent)' }} />
            <span style={{ background:'var(--accent)' }} />
            <span style={{ background:'var(--accent)' }} />
          </span>
        ) : (
          <span style={{ fontSize:13, color:'var(--text-muted)', fontVariantNumeric:'tabular-nums' }}>
            {index}
          </span>
        )}
      </div>

      
      <div style={{ display:'flex', alignItems:'center', gap:12, minWidth:0, paddingRight:16 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 4, flexShrink: 0,
          background: 'var(--bg-card)', overflow:'hidden', position:'relative',
        }}>
          {song.thumbnail
            ? <img src={song.thumbnail} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
            : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', fontSize:16 }}>♪</div>
          }
        </div>
        <span style={{
          fontSize: 14, fontWeight: 500,
          color: isPlaying ? 'var(--accent)' : 'var(--text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {song.title}
        </span>
      </div>

      
      <div style={{ paddingRight:16, overflow:'hidden' }}>
        <span style={{
          fontSize: 13, color:'var(--text-muted)',
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block',
        }}>
          {song.channelTitle}
        </span>
      </div>

      
      <div style={{ textAlign:'right' }}>
        <span style={{ fontSize:13, color:'var(--text-muted)', fontVariantNumeric:'tabular-nums' }}>
          {song.duration || '--:--'}
        </span>
      </div>
    </button>
  );
}

function Skeleton() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:4, padding:'8px 16px' }}>
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} style={{
          display:'grid', gridTemplateColumns:'48px 1fr 200px 64px',
          alignItems:'center', padding:'8px 0',
          opacity: 1 - i * 0.12,
        }}>
          <div style={{ display:'flex', justifyContent:'center' }}>
            <div className="skeleton" style={{ width:16, height:16, borderRadius:3 }} />
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12, paddingRight:16 }}>
            <div className="skeleton" style={{ width:40, height:40, borderRadius:4, flexShrink:0 }} />
            <div className="skeleton" style={{ height:14, width: `${120 + Math.random()*100}px` }} />
          </div>
          <div style={{ paddingRight:16 }}>
            <div className="skeleton" style={{ height:13, width:`${60+Math.random()*60}px` }} />
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <div className="skeleton" style={{ height:13, width:36 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="fade-up" style={{
      display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', height:'100%', minHeight:360, gap:20,
    }}>
      <div style={{
        width:80, height:80, borderRadius:'50%',
        background:'var(--bg-card)', border:'0.5px solid var(--border)',
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:36,
      }}>
        🎵
      </div>
      <div style={{ textAlign:'center' }}>
        <p style={{ fontSize:20, fontFamily:'Syne, sans-serif', fontWeight:600, color:'var(--text-primary)', marginBottom:8 }}>
          Pick a mood to start
        </p>
        <p style={{ fontSize:14, color:'var(--text-muted)', maxWidth:280 }}>
          Choose a mood from the sidebar and let Groq AI build your perfect playlist
        </p>
      </div>
    </div>
  );
}