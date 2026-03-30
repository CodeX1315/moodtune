
const MOODS = [
  { id: 'happy',     label: 'Happy',     emoji: '☀️',  color: '#f59e0b' },
  { id: 'sad',       label: 'Sad',       emoji: '🌧️',  color: '#60a5fa' },
  { id: 'chill',     label: 'Chill',     emoji: '🌙',  color: '#34d399' },
  { id: 'energetic', label: 'Energetic', emoji: '⚡',  color: '#f97316' },
  { id: 'focus',     label: 'Focus',     emoji: '🧠',  color: '#a78bfa' },
  { id: 'romantic',  label: 'Romantic',  emoji: '🌹',  color: '#f472b6' },
  { id: 'party',     label: 'Party',     emoji: '🎉',  color: '#facc15' },
];

export { MOODS };

export default function Sidebar({ selectedMood, onMoodSelect, history }) {
  return (
    <aside style={{
      width: 240,
      minWidth: 240,
      height: '100%',
      background: 'var(--bg-elevated)',
      borderRight: '0.5px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      gap: 32,
      padding: '28px 0',
      overflowY: 'auto',
    }}>

      
      <div style={{ padding: '0 24px' }}>
        <div style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
          fontSize: 24,
          letterSpacing: '-0.5px',
          color: 'var(--text-primary)',
        }}>
          Mood<span style={{ color: 'var(--accent)' }}>Tune</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          AI music for every feeling
        </div>
      </div>

      
      <div>
        <SectionLabel>Your Mood</SectionLabel>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 8 }}>
          {MOODS.map(mood => {
            const active = selectedMood?.id === mood.id;
            return (
              <MoodButton
                key={mood.id}
                mood={mood}
                active={active}
                onClick={() => onMoodSelect(mood)}
              />
            );
          })}
        </nav>
      </div>

      
      {history.length > 0 && (
        <div>
          <SectionLabel>Recent</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 8 }}>
            {history.slice(0, 5).map(item => {
              const mood = MOODS.find(m => m.id === item.mood);
              if (!mood) return null;
              return (
                <button
                  key={item.searchId}
                  onClick={() => onMoodSelect(mood)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 24px',
                    background: 'transparent', border: 'none',
                    color: 'var(--text-muted)', fontSize: 13,
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'color 0.15s',
                    width: '100%',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <span style={{ fontSize: 14, width: 20, textAlign: 'center' }}>{mood.emoji}</span>
                  <span style={{ flex: 1 }}>{mood.label}</span>
                  <span style={{ fontSize: 10 }}>{formatTime(item.createdAt)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      
      <div style={{ marginTop: 'auto', padding: '0 24px' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.8 }}>
          <div>Groq AI + YouTube Data API</div>
          <div>AWS Lambda · API Gateway · DynamoDB</div>
        </div>
      </div>
    </aside>
  );
}

function MoodButton({ mood, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 24px',
        paddingLeft: active ? 21 : 24,
        borderTop: 'none',
        borderRight: 'none',
        borderBottom: 'none',
        borderLeft: active ? `3px solid ${mood.color}` : '3px solid transparent',
        background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
        color: active ? 'var(--text-primary)' : 'var(--text-sub)',
        fontSize: 14,
        fontWeight: active ? 500 : 400,
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.color = 'var(--text-sub)';
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      <span style={{ fontSize: 17, width: 22, textAlign: 'center', lineHeight: 1 }}>
        {mood.emoji}
      </span>
      <span style={{ flex: 1 }}>{mood.label}</span>
      {active && (
        <span className="eq-bar">
          <span style={{ background: mood.color }} />
          <span style={{ background: mood.color }} />
          <span style={{ background: mood.color }} />
        </span>
      )}
    </button>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 600,
      letterSpacing: '0.1em', textTransform: 'uppercase',
      color: 'var(--text-muted)', padding: '0 24px',
    }}>
      {children}
    </div>
  );
}

function formatTime(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}