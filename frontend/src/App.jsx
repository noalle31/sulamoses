import { useState, useEffect } from 'react';
import ChordChart from './components/ChordChart.jsx';

const API = 'http://localhost:3001';
const IS_PROD = import.meta.env.PROD;
const BASE_URL = import.meta.env.BASE_URL;
const LOGO_URL = `${BASE_URL}moshe.png`;

export default function App() {
  const [songs, setSongs] = useState([]);
  const [selected, setSelected] = useState('');
  const [chords, setChords] = useState(null);
  const [cache, setCache] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (IS_PROD) {
      fetch(`${BASE_URL}cache.json`)
        .then(r => r.json())
        .then(data => {
          setCache(data);
          const list = Object.keys(data).map(file => ({
            file,
            name: file.replace('.pdf', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          }));
          setSongs(list);
        })
        .catch(() => setError('Could not load song list.'));
      return;
    }

    fetch(`${API}/songs`)
      .then(r => r.json())
      .then(setSongs)
      .catch(() => setError('Could not load song list. Start the backend on http://localhost:3001.'));
  }, []);

  async function load() {
    if (!selected) return;
    setLoading(true);
    setChords(null);
    setError(null);
    try {
      if (IS_PROD) {
        const data = cache?.[selected];
        if (!data) throw new Error('Load failed');
        setChords(data);
        return;
      }

      const res = await fetch(`${API}/analyse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songFile: selected }),
      });
      if (!res.ok) throw new Error('Load failed');
      setChords(await res.json());
    } catch {
      setError('Something went wrong. Make sure backend is running on http://localhost:3001 and try again.');
    } finally {
      setLoading(false);
    }
  }

  const selectedName = songs.find(s => s.file === selected)?.name ?? '';

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <img src={LOGO_URL} alt="Moshe" style={{ display: 'block', width: 120, marginBottom: '1rem' }} />
      <h1 style={{ marginBottom: '0.25rem' }}>Sulamoses</h1>
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

      {chords && (
        <ChordChart
          songName={selectedName}
          chords={chords}
          imageUrl={
            IS_PROD
              ? `${BASE_URL}images/${selected.replace('.pdf', '.1.png')}`
              : `${API}/image/${selected}`
          }
        />
      )}
    </div>
  );
}
