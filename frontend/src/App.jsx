import { useState, useEffect } from 'react';
import ChordChart from './components/ChordChart.jsx';

const API = 'http://localhost:3001';

export default function App() {
  const [songs, setSongs] = useState([]);
  const [selected, setSelected] = useState('');
  const [chords, setChords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API}/songs`)
      .then(r => r.json())
      .then(setSongs)
      .catch(() => setError('Could not load song list.'));
  }, []);

  async function load() {
    if (!selected) return;
    setLoading(true);
    setChords(null);
    setError(null);
    try {
      const res = await fetch(`${API}/analyse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songFile: selected }),
      });
      if (!res.ok) throw new Error('Load failed');
      setChords(await res.json());
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  const selectedName = songs.find(s => s.file === selected)?.name ?? '';

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <img src="/moshe.png" alt="Moshe" style={{ display: 'block', width: 120, marginBottom: '1rem' }} />
      <h1 style={{ marginBottom: '0.25rem' }}>Sulamoshe</h1>
      <p style={{ color: '#666', marginTop: 0, marginBottom: '2rem' }}>
        Pick a lead sheet and get scale suggestions for every chord.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <select
          value={selected}
          onChange={e => { setSelected(e.target.value); setChords(null); }}
          style={{ flex: 1, padding: '0.5rem', fontSize: '1rem' }}
        >
          <option value="">— Select a song —</option>
          {songs.map(s => (
            <option key={s.file} value={s.file}>{s.name}</option>
          ))}
        </select>

        <button
          onClick={load}
          disabled={!selected || loading}
          style={{ padding: '0.5rem 1.25rem', fontSize: '1rem', cursor: selected && !loading ? 'pointer' : 'default' }}
        >
          {loading ? 'Loading…' : 'Load'}
        </button>
      </div>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

      {chords && <ChordChart songName={selectedName} chords={chords} imageUrl={`${API}/image/${selected}`} />}
    </div>
  );
}
