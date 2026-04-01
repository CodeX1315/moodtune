// src/App.jsx
import { useState, useCallback, useMemo } from 'react';
import Sidebar, { MOODS } from './components/Sidebar';
import SongList from './components/SongList';
import PlayerBar from './components/PlayerBar';
import { useSongs } from './hooks/useSongs';

export default function App() {
  const [selectedMood,    setSelectedMood]    = useState(null);
  const [currentSong,     setCurrentSong]     = useState(null);
  const [currentIndex,    setCurrentIndex]    = useState(-1);
  const [history,         setHistory]         = useState([]);
  const [selectedLang,    setSelectedLang]    = useState('All');

  const {
    songs: rawSongs, loading, loadingMore,
    error, hasMore, totalSongs,
    fetchSongs, fetchMore, refresh,
  } = useSongs();

  const songs = rawSongs ?? [];

  const handleRefresh = useCallback(async () => {
    if (!selectedMood || loading) return;
    setCurrentSong(null);
    setCurrentIndex(-1);
    setSelectedLang('All');
    await refresh(selectedMood);
  }, [selectedMood, loading, refresh]);

  // ── Build language list from loaded songs ──────────────────────────────────
  const languages = useMemo(() => {
    if (!songs.length) return [];
    const counts = {};
    songs.forEach(s => {
      const lang = s.language || 'Unknown';
      counts[lang] = (counts[lang] || 0) + 1;
    });
    // Sort by count descending
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([lang, count]) => ({ lang, count }));
  }, [songs]);

  // ── Filtered songs based on selected language ──────────────────────────────
  const filteredSongs = useMemo(() => {
    if (selectedLang === 'All') return songs;
    return songs.filter(s => (s.language || 'Unknown') === selectedLang);
  }, [songs, selectedLang]);

  // ── Reset language filter when mood changes ───────────────────────────────
  const handleMoodSelect = useCallback(async (mood) => {
    if (!mood) return;
    setSelectedMood(mood);
    setCurrentSong(null);
    setCurrentIndex(-1);
    setSelectedLang('All');
    await fetchSongs(mood);
    setHistory(prev => [
      { searchId: Date.now(), mood: mood.id, createdAt: Date.now() },
      ...prev.filter(h => h.mood !== mood.id),
    ].slice(0, 10));
  }, [fetchSongs]);

  // ── Song select uses filteredSongs for correct index ──────────────────────
  const handleSongSelect = useCallback((song) => {
    const idx = filteredSongs.findIndex(s => s.videoId === song.videoId);
    setCurrentSong(song);
    setCurrentIndex(idx);
  }, [filteredSongs]);

  const handleNext = useCallback(() => {
    const next = filteredSongs[currentIndex + 1];
    if (next) {
      setCurrentSong(next);
      setCurrentIndex(i => i + 1);
      if (currentIndex + 1 >= filteredSongs.length - 2 && hasMore) fetchMore();
    }
  }, [filteredSongs, currentIndex, hasMore, fetchMore]);

  const handlePrev = useCallback(() => {
    const prev = filteredSongs[currentIndex - 1];
    if (prev) { setCurrentSong(prev); setCurrentIndex(i => i - 1); }
  }, [filteredSongs, currentIndex]);

  const moodColor = selectedMood?.color || 'var(--accent)';

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', background:'var(--bg)' }}>
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        <Sidebar selectedMood={selectedMood} onMoodSelect={handleMoodSelect} history={history} />

        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

          {/* Header */}
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
                    background:`${moodColor}18`, border:`1px solid ${moodColor}30`,
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
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:6 }}>
                      <p style={{ fontSize:12, color:'var(--text-4)' }}>
                        {loading
                          ? 'Groq AI is curating your playlist...'
                          : `${filteredSongs.length}${selectedLang !== 'All' ? ` ${selectedLang}` : ''} songs · ${totalSongs} total · All languages · Groq AI + YouTube`
                        }
                      </p>
                      {!loading && songs.length > 0 && (
                        <button
                          onClick={handleRefresh}
                          title="Refresh — fetch new songs (clears cache)"
                          style={{
                            display:'flex', alignItems:'center', gap:4,
                            padding:'3px 8px', borderRadius:4,
                            border:'1px solid var(--border)', background:'transparent',
                            color:'var(--text-4)', fontSize:10, fontWeight:500,
                            cursor:'pointer', letterSpacing:'0.04em',
                            transition:'all 0.15s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-2)'; e.currentTarget.style.color='var(--text-2)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-4)'; }}
                        >
                          ↺ Refresh
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="fade-up">
                <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:34, color:'var(--text-1)', letterSpacing:'-1px' }}>
                  Good evening 👋
                </h2>
                <p style={{ fontSize:13, color:'var(--text-4)', marginTop:8 }}>How are you feeling today?</p>
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
                      onMouseEnter={e => { e.currentTarget.style.background=mood.bg; e.currentTarget.style.color=mood.color; e.currentTarget.style.borderColor=`${mood.color}40`; }}
                      onMouseLeave={e => { e.currentTarget.style.background='var(--bg-3)'; e.currentTarget.style.color='var(--text-3)'; e.currentTarget.style.borderColor='var(--border)'; }}
                    >
                      <span style={{ fontSize:13 }}>{mood.emoji}</span>
                      {mood.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Language filter bar — only shows when songs are loaded */}
          {!loading && songs.length > 0 && (
            <div className="fade-in" style={{
              display:'flex', alignItems:'center', gap:6,
              padding:'10px 20px', flexShrink:0, overflowX:'auto',
              borderBottom:'1px solid var(--border)',
            }}>
              {/* "All" pill */}
              <LangPill
                label="All"
                count={songs.length}
                active={selectedLang === 'All'}
                color={selectedMood?.color}
                onClick={() => setSelectedLang('All')}
              />
              {/* One pill per language */}
              {languages.map(({ lang, count }) => (
                <LangPill
                  key={lang}
                  label={lang}
                  count={count}
                  active={selectedLang === lang}
                  color={selectedMood?.color}
                  onClick={() => setSelectedLang(lang)}
                />
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ margin:'12px 32px 0', padding:'10px 14px', flexShrink:0, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, fontSize:12, color:'#f87171' }}>
              ⚠ {error}
            </div>
          )}

          {/* Song list */}
          <div style={{ flex:1, overflowY:'auto', padding:'12px 16px 0' }}>
            <SongList
              songs={filteredSongs}
              currentSong={currentSong}
              onSongSelect={handleSongSelect}
              loading={loading}
              mood={selectedMood}
              selectedLang={selectedLang}
            />

            {/* Load more — only show when not filtering */}
            {!loading && selectedLang === 'All' && songs.length > 0 && (
              <div style={{ padding:'20px 16px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {hasMore ? (
                  <button onClick={fetchMore} disabled={loadingMore}
                    style={{
                      padding:'9px 28px', borderRadius:100,
                      border:'1px solid var(--border-2)',
                      background: loadingMore ? 'var(--bg-3)' : 'transparent',
                      color: loadingMore ? 'var(--text-4)' : 'var(--text-2)',
                      fontSize:12, fontWeight:500,
                      cursor: loadingMore ? 'not-allowed' : 'pointer',
                      transition:'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!loadingMore) e.currentTarget.style.background='var(--bg-3)'; }}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  >
                    {loadingMore ? 'Loading...' : 'Load more songs'}
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
        hasNext={currentIndex >= 0 && currentIndex < filteredSongs.length - 1}
        hasPrev={currentIndex > 0}
      />
    </div>
  );
}

// ── Language filter pill ────────────────────────────────────────────────────
function LangPill({ label, count, active, color, onClick }) {
  const activeColor = color || 'var(--accent-2)';
  return (
    <button
      onClick={onClick}
      style={{
        display:'flex', alignItems:'center', gap:5,
        padding:'4px 12px', borderRadius:100, flexShrink:0,
        border: active ? `1px solid ${activeColor}60` : '1px solid var(--border)',
        background: active ? `${activeColor}18` : 'transparent',
        color: active ? activeColor : 'var(--text-4)',
        fontSize:12, fontWeight: active ? 600 : 400,
        cursor:'pointer', transition:'all 0.15s',
        whiteSpace:'nowrap',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background='var(--bg-3)'; e.currentTarget.style.color='var(--text-2)'; }}}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-4)'; }}}
    >
      {label}
      <span style={{
        fontSize:10, padding:'1px 5px', borderRadius:100,
        background: active ? `${activeColor}28` : 'var(--bg-4)',
        color: active ? activeColor : 'var(--text-4)',
      }}>
        {count}
      </span>
    </button>
  );
}