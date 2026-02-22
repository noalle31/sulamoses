import { useState } from 'react'
import ChordGrid from './components/ChordGrid'
import './App.css'

function App() {
  const [songs, setSongs] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function normalizeSongs(payload) {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.songs)) return payload.songs;
    if (payload && Array.isArray(payload.data)) return payload.data;
    if (payload && payload.measures) return [payload];
    return [];
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setSelectedFileName(file.name)
    setError('')
    setLoading(true)
    setSongs([])

    const formData = new FormData()
    formData.append('file', file)

    fetch('http://localhost:3001/upload', {
      method: 'POST',
      body: formData,
    })
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(`Upload failed (${res.status})`)
      }
      return res.json()
    })
    .then((data) => {
      const normalized = normalizeSongs(data)
      setSongs(normalized)
      if (!normalized.length) {
        setError('No songs were found in this file.')
      }
    })
    .catch(() => {
      setError('Could not load chart. Make sure backend is running on http://localhost:3001.')
    })
    .finally(() => setLoading(false))
  }

  const activeSong = songs?.[0]
  const hasMeasures = Array.isArray(activeSong?.measures) && activeSong.measures.length > 0
  const songTitle = activeSong?.title || selectedFileName.replace(/\.html?$/i, '') || 'No Chart Loaded'

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="top-bar__left">Sulamoses</div>
        <div className="top-bar__center">{songTitle}</div>
        <div className="top-bar__right">
          <label className="file-picker">
            <span>Load Chart</span>
            <input type="file" accept=".html" onChange={handleFileChange} />
          </label>
        </div>
      </header>

      {loading && <p className="status-message">Loading chart...</p>}
      {!loading && error && <p className="status-message status-message--error">{error}</p>}
      {!loading && !error && activeSong && !hasMeasures && (
        <p className="status-message status-message--error">Chart loaded, but no measures were found.</p>
      )}

      {activeSong && hasMeasures && (
        <div className="sheet-page">
          <section className="chart-header">
            <h1 className="chart-header__title">{songTitle}</h1>
          </section>
          <ChordGrid measures={activeSong.measures} />
        </div>
      )}
    </div>
  )
}

export default App
