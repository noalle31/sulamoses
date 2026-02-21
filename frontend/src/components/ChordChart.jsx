import { useState } from 'react';
import ScaleStaff from './ScaleStaff.jsx';

export default function ChordChart({ songName, chords, imageUrl }) {
  const [selectedChord, setSelectedChord] = useState({ staveIndex: 0, chordIndex: 0 });
  const [selectedScale, setSelectedScale] = useState(0);

  const staves = Array.isArray(chords?.[0]) ? chords : [Array.isArray(chords) ? chords : []];

  function handleChordClick(staveIndex, chordIndex) {
    const isSame =
      selectedChord?.staveIndex === staveIndex && selectedChord?.chordIndex === chordIndex;
    if (isSame) {
      setSelectedChord(null);
      setSelectedScale(null);
    } else {
      setSelectedChord({ staveIndex, chordIndex });
      setSelectedScale(0);
    }
  }

  function handleScaleClick(j) {
    setSelectedScale(selectedScale === j ? null : j);
  }

  const chord =
    selectedChord !== null
      ? staves[selectedChord.staveIndex]?.[selectedChord.chordIndex] ?? null
      : null;

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>{songName}</h2>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        {imageUrl && (
          <img
            src={imageUrl}
            alt={songName}
            style={{ width: '50%', borderRadius: 8, border: '1px solid #ddd', flexShrink: 0 }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0, position: 'sticky', top: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {staves.map((stave, staveIndex) => (
              <div
                key={staveIndex}
                style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px dashed #e5e7eb' }}
              >
                {stave.map((c, chordIndex) => {
                  const isSelected =
                    selectedChord?.staveIndex === staveIndex &&
                    selectedChord?.chordIndex === chordIndex;
                  return (
                    <button
                      key={`${staveIndex}-${chordIndex}`}
                      onClick={() => handleChordClick(staveIndex, chordIndex)}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: 6,
                        border: '1px solid',
                        borderColor: isSelected ? '#333' : '#ddd',
                        background: isSelected ? '#333' : '#fafafa',
                        color: isSelected ? '#fff' : '#000',
                        fontWeight: 600,
                        fontSize: '1rem',
                        cursor: 'pointer',
                      }}
                    >
                      {c.chord}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {chord && (
            <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem', background: '#fafafa' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{chord.chord}</span>
                <span style={{ fontSize: '0.85rem', color: '#888' }}>
                  {chord['harmonic-function']} · {chord.key}
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                {(chord.scales ?? []).map((s, j) => (
                  <li
                    key={j}
                    style={{ marginBottom: '0.4rem', cursor: 'pointer' }}
                    onClick={() => handleScaleClick(j)}
                  >
                    <span style={{
                      background: selectedScale === j ? '#c9d7f7' : 'transparent',
                      borderRadius: 4,
                      padding: '0.15rem 0.3rem',
                    }}>
                      <strong style={{ color: selectedScale === j ? '#2563eb' : 'inherit' }}>{s.name}</strong>
                    </span>
                  </li>
                ))}
              </ul>
              {selectedScale !== null && chord.scales?.[selectedScale] && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.25rem' }}>
                    {chord.scales[selectedScale].name}
                  </div>
                  <ScaleStaff scaleName={chord.scales[selectedScale].name} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
