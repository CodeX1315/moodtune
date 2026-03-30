
export default function SongList({ songs, currentSong, onSongSelect, loading, mood }) {
  if (loading)  return <Skeleton />;
  if (!mood)    return <Empty />;
  if (!songs.length) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:320, gap:16 }}>
      <div style={{ fontSize:48, opacity:0.15 }}>🎵</div>
      <div style={{ textAlign:'center' }}>
        <p style={{ fontSize:15, fontWeight:500, color:'var(--text-2)', marginBottom:6 }}>No songs found</p>
        <p style={{ fontSize:13, color:'var(--text-4)' }}>YouTube quota may have reset — try again shortly</p>
      </div>
    </div>
  );

  return (
    <div>
  
      <div style={{
        display:'grid', gridTemplateColumns:'48px 1fr 180px 56px',
        padding:'8px 16px 8px 8px',
        borderBottom:'1px solid var(--border)',
        marginBottom:4,
        fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase',
        color:'var(--text-4)',
      }}>
        <span style={{ textAlign:'center' }}>#</span>
        <span>Title</span>
        <span>Channel</span>
        <span style={{ textAlign:'right' }}>Lang</span>
      </div>

      {songs.map((song, i) => (
        <SongRow
          key={song.videoId}
          song={song}
          index={i + 1}
          isPlaying={currentSong?.videoId === song.videoId}
          onClick={() => onSongSelect(song)}
          delay={Math.min(i * 0.03, 0.3)}
        />
      ))}
    </div>
  );
}

function SongRow({ song, index, isPlaying, onClick, delay }) {
  return (
    <button onClick={onClick}
      style={{
        display:'grid', gridTemplateColumns:'48px 1fr 180px 56px',
        alignItems:'center', padding:'6px 16px 6px 8px',
        width:'100%', border:'none', textAlign:'left',
        background: isPlaying ? 'var(--accent-glow)' : 'transparent',
        borderRadius:8, cursor:'pointer',
        animation:`fadeUp 0.3s ${delay}s ease both`,
        transition:'background 0.15s',
      }}
      onMouseEnter={e => { if (!isPlaying) e.currentTarget.style.background='var(--bg-3)'; }}
      onMouseLeave={e => { if (!isPlaying) e.currentTarget.style.background='transparent'; }}
    >
  
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:40 }}>
        {isPlaying ? (
          <span className="eq-bar">
            <span style={{ background:'var(--accent-2)' }} />
            <span style={{ background:'var(--accent-2)' }} />
            <span style={{ background:'var(--accent-2)' }} />
          </span>
        ) : (
          <span style={{ fontSize:13, color:'var(--text-4)', fontVariantNumeric:'tabular-nums' }}>{index}</span>
        )}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:12, minWidth:0, paddingRight:16 }}>
        <div style={{
          width:40, height:40, borderRadius:6, flexShrink:0,
          background:'var(--bg-4)', overflow:'hidden',
          border:'1px solid var(--border)',
        }}>
          {song.thumbnail
            ? <img src={song.thumbnail} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
            : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-4)', fontSize:16 }}>♪</div>
          }
        </div>
        <div style={{ minWidth:0 }}>
          <div style={{
            fontSize:13, fontWeight:500,
            color: isPlaying ? 'var(--accent-2)' : 'var(--text-1)',
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
          }}>
            {song.title}
          </div>
          {song.originalArtist && (
            <div style={{ fontSize:11, color:'var(--text-4)', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {song.originalArtist}
            </div>
          )}
        </div>
      </div>

      <div style={{ paddingRight:16, overflow:'hidden' }}>
        <span style={{ fontSize:12, color:'var(--text-3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block' }}>
          {song.channelTitle}
        </span>
      </div>

      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <span style={{
          fontSize:9, fontWeight:600, letterSpacing:'0.06em',
          padding:'2px 6px', borderRadius:4,
          background:'var(--bg-4)', color:'var(--text-3)',
          border:'1px solid var(--border)',
          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:52,
        }}>
          {(song.language || 'Unknown').slice(0,6)}
        </span>
      </div>
    </button>
  );
}

function Skeleton() {
  return (
    <div style={{ padding:'4px 8px', display:'flex', flexDirection:'column', gap:2 }}>
      {Array.from({ length:8 }).map((_, i) => (
        <div key={i} style={{
          display:'grid', gridTemplateColumns:'48px 1fr 180px 56px',
          alignItems:'center', padding:'6px 16px 6px 8px',
          opacity: 1 - i * 0.1,
        }}>
          <div style={{ display:'flex', justifyContent:'center' }}>
            <div className="skeleton" style={{ width:18, height:14 }} />
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12, paddingRight:16 }}>
            <div className="skeleton" style={{ width:40, height:40, borderRadius:6, flexShrink:0 }} />
            <div>
              <div className="skeleton" style={{ height:13, width: 80 + Math.floor(Math.random()*100), marginBottom:6 }} />
              <div className="skeleton" style={{ height:10, width: 50 + Math.floor(Math.random()*60) }} />
            </div>
          </div>
          <div style={{ paddingRight:16 }}>
            <div className="skeleton" style={{ height:12, width: 60 + Math.floor(Math.random()*50) }} />
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <div className="skeleton" style={{ height:18, width:36, borderRadius:4 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Empty() {
  return (
    <div className="fade-up" style={{
      display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', height:'100%', minHeight:400, gap:20,
    }}>
      <div style={{
        width:88, height:88, borderRadius:'50%',
        background:'var(--bg-3)', border:'1px solid var(--border)',
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:40,
      }}>
        🎵
      </div>
      <div style={{ textAlign:'center' }}>
        <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:22, color:'var(--text-1)', marginBottom:8 }}>
          Pick a mood
        </p>
        <p style={{ fontSize:13, color:'var(--text-4)', maxWidth:260, lineHeight:1.6 }}>
          Select a mood from the sidebar and let Groq AI build your playlist
        </p>
      </div>
    </div>
  );
}