
import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import SongList from './components/SongList';
import PlayerBar from './components/PlayerBar';
import { useSongs } from './hooks/useSongs';

export default function App() {
  const [selectedMood,  setSelectedMood]  = useState(null);
  const [currentSong,   setCurrentSong]   = useState(null);
  const [currentIndex,  setCurrentIndex]  = useState(-1);
  const [history,       setHistory]       = useState([]);

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
    const nextIdx = currentIndex + 1;
    if (songs[nextIdx]) {
      setCurrentSong(songs[nextIdx]);
      setCurrentIndex(nextIdx);
      if (nextIdx >= songs.length - 3 && hasMore) fetchMore();
    }
  }, [songs, currentIndex, hasMore, fetchMore]);

  const handlePrev = useCallback(() => {
    const prevIdx = currentIndex - 1;
    if (songs[prevIdx]) { setCurrentSong(songs[prevIdx]); setCurrentIndex(prevIdx); }
  }, [songs, currentIndex]);

  const moodColor = selectedMood?.color || 'transparent';

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', background:'var(--bg-base)' }}>
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        <Sidebar selectedMood={selectedMood} onMoodSelect={handleMoodSelect} history={history} />

        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

          {/* Header */}
          <div style={{
            padding:'32px 32px 20px', flexShrink:0,
            background: selectedMood ? `linear-gradient(180deg, ${moodColor}20 0%, transparent 100%)` : 'transparent',
            transition:'background 0.6s ease',
          }}>
            {selectedMood ? (
              <div className="fade-up" key={selectedMood.id}>
                <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:moodColor, marginBottom:6 }}>
                  Mood Playlist
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <span style={{ fontSize:40 }}>{selectedMood.emoji}</span>
                  <div>
                    <h2 style={{ fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:32, color:'var(--text-primary)', letterSpacing:'-0.5px' }}>
                      {selectedMood.label}
                    </h2>
                    <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:4 }}>
                      {loading ? 'AI is curating your playlist...' : `${totalSongs} songs · Groq AI · YouTube · All languages`}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="fade-up">
                <h2 style={{ fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:32, color:'var(--text-primary)' }}>Good evening 👋</h2>
                <p style={{ fontSize:14, color:'var(--text-muted)', marginTop:6 }}>How are you feeling today?</p>
              </div>
            )}
          </div>

          
          {error && (
            <div style={{ margin:'0 32px 16px', padding:'12px 16px', background:'rgba(239,68,68,0.1)', border:'0.5px solid rgba(239,68,68,0.3)', borderRadius:8, fontSize:13, color:'#f87171', flexShrink:0 }}>
              ⚠ {error}
            </div>
          )}

          
          <div style={{ flex:1, overflowY:'auto', padding:'0 16px' }}>
            <SongList songs={songs} currentSong={currentSong} onSongSelect={handleSongSelect} loading={loading} mood={selectedMood} />

            {!loading && songs.length > 0 && (
              <div style={{ padding:'16px 16px 24px', display:'flex', justifyContent:'center' }}>
                {hasMore ? (
                  <button
                    onClick={fetchMore} disabled={loadingMore}
                    style={{
                      padding:'10px 32px', borderRadius:100,
                      border:'0.5px solid var(--border)', background:'transparent',
                      color: loadingMore ? 'var(--text-muted)' : 'var(--text-primary)',
                      fontSize:13, fontWeight:500, fontFamily:'DM Sans, sans-serif',
                      cursor: loadingMore ? 'not-allowed' : 'pointer', transition:'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!loadingMore) e.currentTarget.style.background='var(--bg-hover)'; }}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  >
                    {loadingMore ? 'Loading more...' : 'Load more songs'}
                  </button>
                ) : (
                  <p style={{ fontSize:12, color:'var(--text-muted)' }}>All {totalSongs} songs loaded</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <PlayerBar song={currentSong} onNext={handleNext} onPrev={handlePrev}
        hasNext={currentIndex >= 0 && currentIndex < songs.length - 1} hasPrev={currentIndex > 0} />
    </div>
  );
}