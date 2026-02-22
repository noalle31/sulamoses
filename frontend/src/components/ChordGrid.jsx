import { useState, useRef } from 'react';
import ScaleStaff from './ScaleStaff';
import './ChordGrid.css'

function ChordGrid({ measures }) {
  const [hoveredChord, setHoveredChord] = useState(null);
  const [selectedScale, setSelectedScale] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const leaveTimer = useRef(null);

  function formatChordSymbol(symbol = '') {
    return symbol
      .replace(/\^/g, '∆')
      .replace(/h(?=\d|$)/g, 'ø');
  }

  const handleChordEnter = (chord, e) => {
    clearTimeout(leaveTimer.current);
    setHoveredChord(chord);
    setSelectedScale(chord.scales?.[0]?.name ?? null);
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleChordLeave = () => {
    leaveTimer.current = setTimeout(() => setHoveredChord(null), 150);
  };

  const handlePanelEnter = () => {
    clearTimeout(leaveTimer.current);
  };

  const handlePanelLeave = () => {
    leaveTimer.current = setTimeout(() => setHoveredChord(null), 150);
  };

  const rows = []
  for (let i = 0; i < measures.length; i += 4) {
    rows.push(measures.slice(i, i + 4))
  }

  const panelWidth = 380;
  const panelX = Math.min(mousePos.x + 12, window.innerWidth - panelWidth - 16);
  const panelY = Math.min(mousePos.y + 12, window.innerHeight - 320);

  return (
    <>
      <div className="chord-grid" style={{ '--row-count': rows.length }}>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((measure, i) => (
              <div key={i} className={`measure ${i === row.length - 1 ? 'is-last' : ''}`}>
                {measure.map((chord, j) => (
                  <span
                    key={j}
                    className="chord"
                    onMouseEnter={(e) => handleChordEnter(chord, e)}
                    onMouseLeave={handleChordLeave}
                  >
                    {formatChordSymbol(chord.chord)}
                  </span>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      {hoveredChord && (
        <div
          className="scale-panel"
          style={{ left: panelX, top: panelY }}
          onMouseEnter={handlePanelEnter}
          onMouseLeave={handlePanelLeave}
        >
          <h3>{formatChordSymbol(hoveredChord.chord)}</h3>
          <ul>
            {hoveredChord.scales.map((scale, i) => (
              <li
                key={i}
                className={selectedScale === scale.name ? 'selected' : ''}
                onMouseEnter={() => setSelectedScale(scale.name)}
              >
                {scale.name}
              </li>
            ))}
          </ul>
          {selectedScale && <ScaleStaff scaleName={selectedScale} />}
        </div>
      )}
    </>
  )
}

export default ChordGrid
