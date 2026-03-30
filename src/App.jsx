
import { useState, useCallback } from 'react';
import Sidebar, { MOODS } from './components/Sidebar';
import SongList from './components/SongList';
import PlayerBar from './components/PlayerBar';
import { useSongs } from './hooks/useSongs';

export default function App() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [currentSong,  setCurrentSong]  = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [history,      setHistory]      = useState([]);

  const {
    songs: rawSongs, loading, loadingMore,
    error, hasMore, totalSongs,
    fetchSongs, fetchMore,
  } = useSongs();

  const songs = rawSongs ?? [];

  const handleMoodSelect = useCallback(async (mood) => {
    if (!mood) return;
    setSelectedMood(mood);
    setCurrentSong(null);
    setCurrentIndex(-1);
    await fetchSongs(mood);
    setHistory(prev => [
      { searchId: Date.now(), mood: mood.id, createdAt: Date.now() },
      ...prev.filter(h => h.mood !== mood.id),
    ].slice(0, 10));
  }, [fetchSongs]);

  const handleSongSelect = useCallback((song) => {
    const idx = songs.findIndex(s => s.videoId === song.videoId);
    setCurrentSong(song);
    setCurrentIndex(idx);
  }, [songs]);

  const handleNext = useCallback(() => {
    const next = songs[currentIndex + 1];
    if (next) {
      setCurrentSong(next);
      setCurrentIndex(i => i + 1);
      if (currentIndex + 1 >= songs.length - 2 && hasMore) fetchMore();
    }
  }, [songs, currentIndex, hasMore, fetchMore]);

  const handlePrev = useCallback(() => {
    const prev = songs[currentIndex - 1];
    if (prev) { setCurrentSong(prev); setCurrentIndex(i => i - 1); }
  }, [songs, currentIndex]);

  const moodColor = selectedMood?.color || 'var(--accent)';

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', background:'var(--bg)' }}>
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        <Sidebar selectedMood={selectedMood} onMoodSelect={handleMoodSelect} history={history} />

        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

          
          <div style={{
            padding:'28px 32px 20px', flexShrink:0,
            background: selectedMood
              ? `linear-gradient(160deg, ${selectedMood.color}14 0%, transparent 60%)`
              : 'transparent',
            transition:'background 0.8s ease',
            borderBottom:'1px solid var(--border)',
          }}>
            {selectedMood ? (
              <div className="fade-up" key={selectedMood.id}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
                  <div style={{
                    fontSize:9, fontWeight:700, letterSpacing:'0.14em',
                    textTransform:'uppercase', color: moodColor,
                    padding:'3px 8px', borderRadius:4,
                    background:`${moodColor}18`,
                    border:`1px solid ${moodColor}30`,
                  }}>
                    Mood Playlist
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                  <span style={{ fontSize:44, lineHeight:1 }}>{selectedMood.emoji}</span>
                  <div>
                    <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:34, color:'var(--text-1)', letterSpacing:'-1px', lineHeight:1 }}>
                      {selectedMood.label}
                    </h2>
                    <p style={{ fontSize:12, color:'var(--text-4)', marginTop:6, letterSpacing:'0.02em' }}>
                      {loading
                        ? 'Groq AI is curating your playlist...'
                        : `${totalSongs} songs · All languages · Groq AI + YouTube`
                      }
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="fade-up">
                <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:34, color:'var(--text-1)', letterSpacing:'-1px' }}>
                  Good evening 👋
                </h2>
                <p style={{ fontSize:13, color:'var(--text-4)', marginTop:8 }}>
                  How are you feeling today?
                </p>
                
                <div style={{ display:'flex', gap:8, marginTop:16, flexWrap:'wrap' }}>
                  {MOODS.map(mood => (
                    <button key={mood.id} onClick={() => handleMoodSelect(mood)}
                      style={{
                        display:'flex', alignItems:'center', gap:6,
                        padding:'6px 12px', borderRadius:100,
                        background:'var(--bg-3)', border:'1px solid var(--border)',
                        color:'var(--text-3)', fontSize:12, fontWeight:500,
                        cursor:'pointer', transition:'all 0.15s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = mood.bg;
                        e.currentTarget.style.color = mood.color;
                        e.currentTarget.style.borderColor = `${mood.color}40`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'var(--bg-3)';
                        e.currentTarget.style.color = 'var(--text-3)';
                        e.currentTarget.style.borderColor = 'var(--border)';
                      }}
                    >
                      <span style={{ fontSize:13 }}>{mood.emoji}</span>
                      {mood.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          
          {error && (
            <div style={{
              margin:'12px 32px 0', padding:'10px 14px', flexShrink:0,
              background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)',
              borderRadius:8, fontSize:12, color:'#f87171',
            }}>
              ⚠ {error}
            </div>
          )}

          
          <div style={{ flex:1, overflowY:'auto', padding:'12px 16px 0' }}>
            <SongList
              songs={songs} currentSong={currentSong}
              onSongSelect={handleSongSelect} loading={loading} mood={selectedMood}
            />

            
            {!loading && songs.length > 0 && (
              <div style={{ padding:'20px 16px', display:'flex', alignItems:'center', justifyContent:'center', gap:12 }}>
                {hasMore ? (
                  <button onClick={fetchMore} disabled={loadingMore}
                    style={{
                      padding:'9px 28px', borderRadius:100,
                      border:'1px solid var(--border-2)',
                      background: loadingMore ? 'var(--bg-3)' : 'transparent',
                      color: loadingMore ? 'var(--text-4)' : 'var(--text-2)',
                      fontSize:12, fontWeight:500, cursor: loadingMore ? 'not-allowed' : 'pointer',
                      transition:'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!loadingMore) e.currentTarget.style.background='var(--bg-3)'; }}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  >
                    {loadingMore ? 'Loading...' : `Load more songs`}
                  </button>
                ) : (
                  <p style={{ fontSize:11, color:'var(--text-4)', letterSpacing:'0.04em' }}>
                    All {totalSongs} songs loaded
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <PlayerBar
        song={currentSong}
        onNext={handleNext} onPrev={handlePrev}
        hasNext={currentIndex >= 0 && currentIndex < songs.length - 1}
        hasPrev={currentIndex > 0}
      />
    </div>
  );
}