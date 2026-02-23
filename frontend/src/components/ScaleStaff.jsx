import { useEffect, useRef } from 'react';
import { Factory } from 'vexflow';

// Correct major scale letter names for each root
const MAJOR_SCALES = {
  'C':  ['C','D','E','F','G','A','B'],
  'C#': ['C#','D#','E#','F#','G#','A#','B#'],
  'Db': ['Db','Eb','F','Gb','Ab','Bb','C'],
  'D':  ['D','E','F#','G','A','B','C#'],
  'Eb': ['Eb','F','G','Ab','Bb','C','D'],
  'E':  ['E','F#','G#','A','B','C#','D#'],
  'F':  ['F','G','A','Bb','C','D','E'],
  'F#': ['F#','G#','A#','B','C#','D#','E#'],
  'Gb': ['Gb','Ab','Bb','Cb','Db','Eb','F'],
  'G':  ['G','A','B','C','D','E','F#'],
  'Ab': ['Ab','Bb','C','Db','Eb','F','G'],
  'A':  ['A','B','C#','D','E','F#','G#'],
  'Bb': ['Bb','C','D','Eb','F','G','A'],
  'B':  ['B','C#','D#','E','F#','G#','A#'],
};

// Enharmonic fallbacks for rare roots
const ENHARMONIC = { 'G#': 'Ab', 'A#': 'Bb', 'D#': 'Eb' };

function getMajorScale(root) {
  return MAJOR_SCALES[root] ?? MAJOR_SCALES[ENHARMONIC[root]];
}

// Apply a semitone alteration to a note letter name
function applyAlt(note, alt) {
  if (alt === 0) return note;
  const letter = note[0];
  const acc = note.slice(1);
  if (alt === -1) {
    if (acc === '#') return letter;
    if (acc === '') return letter + 'b';
    if (acc === 'b') return letter + 'bb';
  }
  if (alt === 1) {
    if (acc === 'b') return letter;
    if (acc === '') return letter + '#';
    if (acc === '#') return letter + '##';
  }
  return note;
}

// Diatonic-derived scales: semitone intervals + [majorDegreeIndex, alteration] per note.
// The alteration is applied to the major scale degree letter to get correct enharmonic spelling.
// e.g. C Dorian b3: major degree 2 = E, alt -1 → Eb (not D#)
// Works for any number of notes — 5-note pentatonics, 6-note blues, 7-note modes, 8-note bebop.
const DIATONIC_MODES = {
  // 7-note modes
  'Ionian':            { ivls: [0,2,4,5,7,9,11],    degs: [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0]] },
  'Dorian':            { ivls: [0,2,3,5,7,9,10],    degs: [[0,0],[1,0],[2,-1],[3,0],[4,0],[5,0],[6,-1]] },
  'Phrygian':          { ivls: [0,1,3,5,7,8,10],    degs: [[0,0],[1,-1],[2,-1],[3,0],[4,0],[5,-1],[6,-1]] },
  'Lydian':            { ivls: [0,2,4,6,7,9,11],    degs: [[0,0],[1,0],[2,0],[3,1],[4,0],[5,0],[6,0]] },
  'Mixolydian':        { ivls: [0,2,4,5,7,9,10],    degs: [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,-1]] },
  'Aeolian':           { ivls: [0,2,3,5,7,8,10],    degs: [[0,0],[1,0],[2,-1],[3,0],[4,0],[5,-1],[6,-1]] },
  'Locrian':           { ivls: [0,1,3,5,6,8,10],    degs: [[0,0],[1,-1],[2,-1],[3,0],[4,-1],[5,-1],[6,-1]] },
  'Melodic Minor':     { ivls: [0,2,3,5,7,9,11],    degs: [[0,0],[1,0],[2,-1],[3,0],[4,0],[5,0],[6,0]] },
  'Lydian Dominant':   { ivls: [0,2,4,6,7,9,10],    degs: [[0,0],[1,0],[2,0],[3,1],[4,0],[5,0],[6,-1]] },
  'Lydian Augmented':  { ivls: [0,2,4,6,8,9,11],    degs: [[0,0],[1,0],[2,0],[3,1],[4,1],[5,0],[6,0]] },
  'Phrygian Dominant': { ivls: [0,1,4,5,7,8,10],    degs: [[0,0],[1,-1],[2,0],[3,0],[4,0],[5,-1],[6,-1]] },
  'Locrian ♮2':        { ivls: [0,2,3,5,6,8,10],    degs: [[0,0],[1,0],[2,-1],[3,0],[4,-1],[5,-1],[6,-1]] },
  // 5-note pentatonic scales
  'Major Pentatonic':  { ivls: [0,2,4,7,9],          degs: [[0,0],[1,0],[2,0],[4,0],[5,0]] },
  'Minor Pentatonic':  { ivls: [0,3,5,7,10],          degs: [[0,0],[2,-1],[3,0],[4,0],[6,-1]] },
  // 6-note blues scale (minor pentatonic + b5 passing tone)
  'Blues':             { ivls: [0,3,5,6,7,10],        degs: [[0,0],[2,-1],[3,0],[4,-1],[4,0],[6,-1]] },
  // 8-note bebop scales (diatonic mode + one chromatic passing tone)
  'Major Bebop':       { ivls: [0,2,4,5,7,8,9,11],   degs: [[0,0],[1,0],[2,0],[3,0],[4,0],[5,-1],[5,0],[6,0]] },
  'Dominant Bebop':    { ivls: [0,2,4,5,7,9,10,11],  degs: [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,-1],[6,0]] },
  'Minor Bebop':       { ivls: [0,2,3,5,7,9,10,11],  degs: [[0,0],[1,0],[2,-1],[3,0],[4,0],[5,0],[6,-1],[6,0]] },
};

// Non-diatonic scales: chromatic intervals + which absolute chromatic indices use flat spelling
const CHROMATIC_SHARP = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const CHROMATIC_FLAT  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];

const CHROMATIC_SCALES = {
  'Altered':               { ivls: [0,1,3,4,6,8,10],   flats: new Set([1,3,6,8,10]) },
  'Half-Whole Diminished': { ivls: [0,1,3,4,6,7,9,10], flats: new Set([1,3,6,10]) },
  'Whole-Half Diminished': { ivls: [0,2,3,5,6,8,9,11], flats: new Set([3,6,8]) },
  'Whole Tone':            { ivls: [0,2,4,6,8,10],      flats: new Set([8,10]) },
};

const ROOT_TO_INDEX = {
  'C':0,'C#':1,'Db':1,'D':2,'D#':3,'Eb':3,'E':4,
  'F':5,'F#':6,'Gb':6,'G':7,'G#':8,'Ab':8,'A':9,'A#':10,'Bb':10,'B':11,
};

function buildNotes(scaleName, clef = 'treble') {
  const match = scaleName.match(/^([A-G][#b]?)\s+(.+)$/);
  if (!match) return null;

  const root = match[1];
  const mode = match[2];
  const rootIdx = ROOT_TO_INDEX[root];
  if (rootIdx === undefined) return null;

  // Bass clef: roots C–Eb (rootIdx 0–3) start at octave 3; E–B (rootIdx 4–11) start at octave 2.
  const baseOctave = clef === 'bass' ? (rootIdx >= 4 ? 2 : 3) : 4;

  // 7-note diatonic mode: use major scale degree letters + alteration
  if (DIATONIC_MODES[mode]) {
    const { ivls, degs } = DIATONIC_MODES[mode];
    const majorScale = getMajorScale(root);
    if (!majorScale) return null;

    return degs.map(([degIdx, alt], i) => {
      const noteName = applyAlt(majorScale[degIdx], alt);
      const octave = baseOctave + Math.floor((rootIdx + ivls[i]) / 12);
      return `${noteName}${octave}`;
    });
  }

  // Non-diatonic: chromatic approach with per-mode flat/sharp preference
  if (CHROMATIC_SCALES[mode]) {
    const { ivls, flats } = CHROMATIC_SCALES[mode];
    return ivls.map(interval => {
      const absIdx = rootIdx + interval;
      const noteIdx = absIdx % 12;
      const octave = baseOctave + Math.floor(absIdx / 12);
      const noteName = flats.has(noteIdx) ? CHROMATIC_FLAT[noteIdx] : CHROMATIC_SHARP[noteIdx];
      return `${noteName}${octave}`;
    });
  }

  return null;
}

export default function ScaleStaff({ scaleName, clef = 'treble' }) {
  const ref = useRef(null);

  useEffect(() => {
    const notes = buildNotes(scaleName, clef);
    if (!notes) return;

    const el = ref.current;
    el.innerHTML = '';

    const n = notes.length;
    const width = el.offsetWidth || n * 55 + 90;

    try {
      const vf = new Factory({ renderer: { elementId: el, width, height: 130 } });
      const score = vf.EasyScore();
      const system = vf.System({ width: width - 20 });

      score.set({ clef });

      system.addStave({
        voices: [
          score.voice(
            score.notes(notes.map(note => `${note}/q`).join(', ')),
            { time: `${n}/4` }
          ),
        ],
      }).addClef(clef);

      vf.draw();
    } catch (e) {
      console.error('VexFlow render error:', e);
    }
  }, [scaleName, clef]);

  return <div ref={ref} />;
}
