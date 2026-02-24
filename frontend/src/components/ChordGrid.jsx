import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ScaleStaff from './ScaleStaff';
import './ChordGrid.css'

function ChordGrid({ measures, clef }) {
  const [hoveredChord, setHoveredChord] = useState(null);
  const [selectedScale, setSelectedScale] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [panelPos, setPanelPos] = useState({ x: 12, y: 12 });
  const [isTouchOpen, setIsTouchOpen] = useState(false);
  const leaveTimer = useRef(null);
  const panelRef = useRef(null);

  function formatChordSymbol(symbol = '') {
    return symbol
      .replace(/\s*\/\s*/g, '/')
      .replace(/\^/g, '∆')
      .replace(/h(?=\d|$)/g, 'ø');
  }

  const handleChordEnter = (chord, e) => {
    clearTimeout(leaveTimer.current);
    setHoveredChord(chord);
    setSelectedScale(chord.scales?.[0]?.name ?? null);
    setMousePos({ x: e.clientX, y: e.clientY });
    setIsTouchOpen(false);
  };

  useEffect(() => {
    if (!isTouchOpen) return;
    const handleOutsideTap = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        closePanel();
      }
    };
    document.addEventListener('touchend', handleOutsideTap);
    return () => document.removeEventListener('touchend', handleOutsideTap);
  }, [isTouchOpen]);

  const handleChordTap = (chord, e) => {
    e.preventDefault();
    e.stopPropagation();
    clearTimeout(leaveTimer.current);
    if (hoveredChord === chord) {
      setHoveredChord(null);
      setIsTouchOpen(false);
      return;
    }
    const touch = e.changedTouches?.[0];
    if (!touch) return;

    const padding = 12;
    const actualPanelWidth = Math.min(380, window.innerWidth - padding * 2);
    const x = Math.max(padding, Math.min(
      touch.clientX - actualPanelWidth / 2,
      window.innerWidth - actualPanelWidth - padding
    ));
    const estimatedPanelHeight = 300;
    const y = (window.innerHeight - touch.clientY - 30 >= estimatedPanelHeight)
      ? touch.clientY + 20
      : Math.max(padding, touch.clientY - estimatedPanelHeight - 10);

    setHoveredChord(chord);
    setSelectedScale(chord.scales?.[0]?.name ?? null);
    setPanelPos({ x, y });
    setIsTouchOpen(true);
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

  const closePanel = () => {
    setHoveredChord(null);
    setIsTouchOpen(false);
  };

  const rows = []
  for (let i = 0; i < measures.length; i += 4) {
    rows.push(measures.slice(i, i + 4))
  }

  const panelWidth = 380;
  const viewportPadding = 12;
  const panelX = Math.max(
    viewportPadding,
    Math.min(mousePos.x + 12, window.innerWidth - panelWidth - viewportPadding)
  );
  const panelY = Math.max(viewportPadding, mousePos.y + 12);
  const panelMaxHeight = Math.max(180, window.innerHeight - viewportPadding * 2);

  useLayoutEffect(() => {
    if (!hoveredChord || isTouchOpen) return;
    setPanelPos({ x: panelX, y: panelY });
  }, [hoveredChord, isTouchOpen, panelX, panelY]);

  useLayoutEffect(() => {
    if (!hoveredChord || !panelRef.current || isTouchOpen) return;
    const rect = panelRef.current.getBoundingClientRect();
    let nextX = panelPos.x;
    let nextY = panelPos.y;

    if (rect.right > window.innerWidth - viewportPadding) {
      nextX -= rect.right - (window.innerWidth - viewportPadding);
    }
    if (rect.left < viewportPadding) {
      nextX += viewportPadding - rect.left;
    }
    if (rect.bottom > window.innerHeight - viewportPadding) {
      nextY -= rect.bottom - (window.innerHeight - viewportPadding);
    }
    if (rect.top < viewportPadding) {
      nextY += viewportPadding - rect.top;
    }

    if (nextX !== panelPos.x || nextY !== panelPos.y) {
      setPanelPos({ x: Math.round(nextX), y: Math.round(nextY) });
    }
  }, [hoveredChord, selectedScale, panelPos.x, panelPos.y, isTouchOpen]);

  return (
    <>
      <div className="chord-grid" style={{ '--row-count': rows.length }}>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((measure, i) => (
              <div
                key={i}
                className={`measure ${i === row.length - 1 ? 'is-last' : ''} ${measure.length === 3 ? 'is-crowded' : ''} ${measure.length >= 4 ? 'is-dense' : ''}`}
              >
                {measure.map((chord, j) => (
                  <span
                    key={j}
                    className="chord"
                    onMouseEnter={(e) => handleChordEnter(chord, e)}
                    onMouseLeave={handleChordLeave}
                    onTouchEnd={(e) => handleChordTap(chord, e)}
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
          ref={panelRef}
          className={`scale-panel${isTouchOpen ? ' is-touch' : ''}`}
          style={{ left: panelPos.x, top: panelPos.y, maxHeight: `${panelMaxHeight}px` }}
          onMouseEnter={handlePanelEnter}
          onMouseLeave={handlePanelLeave}
        >
          {isTouchOpen && (
            <button className="scale-panel-close" onClick={closePanel}>×</button>
          )}
          <h3>{formatChordSymbol(hoveredChord.chord)}</h3>
          <ul>
            {hoveredChord.scales.map((scale, i) => (
              <li
                key={i}
                className={selectedScale === scale.name ? 'selected' : ''}
                onMouseEnter={() => setSelectedScale(scale.name)}
                onClick={() => setSelectedScale(scale.name)}
              >
                {scale.name}
              </li>
            ))}
          </ul>
          {selectedScale && <ScaleStaff scaleName={selectedScale} clef={clef} />}
        </div>
      )}
    </>
  )
}

export default ChordGrid
