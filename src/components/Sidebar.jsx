
export const MOODS = [
  { id:'happy',     label:'Happy',     emoji:'☀️',  color:'#fbbf24', bg:'#fbbf2418' },
  { id:'sad',       label:'Sad',       emoji:'🌧️',  color:'#60a5fa', bg:'#60a5fa18' },
  { id:'chill',     label:'Chill',     emoji:'🌙',  color:'#34d399', bg:'#34d39918' },
  { id:'energetic', label:'Energetic', emoji:'⚡',  color:'#f97316', bg:'#f9731618' },
  { id:'focus',     label:'Focus',     emoji:'🧠',  color:'#a78bfa', bg:'#a78bfa18' },
  { id:'romantic',  label:'Romantic',  emoji:'🌹',  color:'#f472b6', bg:'#f472b618' },
  { id:'party',     label:'Party',     emoji:'🎉',  color:'#facc15', bg:'#facc1518' },
];

export default function Sidebar({ selectedMood, onMoodSelect, history }) {
  return (
    <aside style={{
      width: 220, minWidth: 220, height: '100%',
      background: 'var(--bg-2)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      padding: '24px 0', gap: 32, overflowY: 'auto',
    }}>

      <div style={{ padding: '0 20px' }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:22, letterSpacing:'-0.5px' }}>
          Mood<span style={{ color:'var(--accent-2)' }}>Tune</span>
        </div>
        <div style={{ fontSize:11, color:'var(--text-3)', marginTop:3, letterSpacing:'0.02em' }}>
          AI music for every feeling
        </div>
      </div>

      <div>
        <Label>Moods</Label>
        <div style={{ marginTop:6, display:'flex', flexDirection:'column', gap:1 }}>
          {MOODS.map(mood => {
            const active = selectedMood?.id === mood.id;
            return (
              <button key={mood.id} onClick={() => onMoodSelect(mood)}
                style={{
                  display:'flex', alignItems:'center', gap:10,
                  padding:'9px 20px',
                  background: active ? mood.bg : 'transparent',
                  borderTop:'none', borderRight:'none', borderBottom:'none',
                  borderLeft: `2px solid ${active ? mood.color : 'transparent'}`,
                  color: active ? 'var(--text-1)' : 'var(--text-3)',
                  fontSize:13, fontWeight: active ? 500 : 400,
                  width:'100%', textAlign:'left',
                  transition:'all 0.15s',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background='var(--bg-3)'; e.currentTarget.style.color='var(--text-2)'; }}}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-3)'; }}}
              >
                <span style={{ fontSize:15, width:20, textAlign:'center' }}>{mood.emoji}</span>
                <span style={{ flex:1 }}>{mood.label}</span>
                {active && (
                  <span className="eq-bar">
                    <span style={{ background:mood.color }} />
                    <span style={{ background:mood.color }} />
                    <span style={{ background:mood.color }} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {history.length > 0 && (
        <div>
          <Label>Recent</Label>
          <div style={{ marginTop:6, display:'flex', flexDirection:'column', gap:1 }}>
            {history.slice(0,5).map(item => {
              const mood = MOODS.find(m => m.id === item.mood);
              if (!mood) return null;
              return (
                <button key={item.searchId} onClick={() => onMoodSelect(mood)}
                  style={{
                    display:'flex', alignItems:'center', gap:10,
                    padding:'7px 20px', background:'transparent',
                    border:'none', color:'var(--text-4)', fontSize:12,
                    width:'100%', textAlign:'left', transition:'color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color='var(--text-2)'}
                  onMouseLeave={e => e.currentTarget.style.color='var(--text-4)'}
                >
                  <span style={{ fontSize:13, width:18, textAlign:'center' }}>{mood.emoji}</span>
                  <span style={{ flex:1 }}>{mood.label}</span>
                  <span style={{ fontSize:10 }}>{fmtTime(item.createdAt)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ marginTop:'auto', padding:'0 20px' }}>
        <div style={{ fontSize:10, color:'var(--text-4)', lineHeight:2, letterSpacing:'0.04em', textTransform:'uppercase' }}>
          <div>Groq AI · YouTube API</div>
          <div>AWS Lambda · DynamoDB</div>
        </div>
      </div>
    </aside>
  );
}

function Label({ children }) {
  return (
    <div style={{ padding:'0 20px', fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-4)' }}>
      {children}
    </div>
  );
}

function fmtTime(ts) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m/60)}h ago`;
}