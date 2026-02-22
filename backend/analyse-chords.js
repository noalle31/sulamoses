const NOTE_SEMITONES = {
    'C': 0, 'B#': 0,
    'C#': 1, 'Db': 1,
    'D': 2,
    'D#': 3, 'Eb': 3,
    'E': 4, 'Fb': 4,
    'F': 5, 'E#': 5,
    'F#': 6, 'Gb': 6,
    'G': 7,
    'G#': 8, 'Ab': 8,
    'A': 9,
    'A#': 10, 'Bb': 10,
    'B': 11, 'Cb': 11,
};

const SEMITONE_TO_NOTE = [
    'C',
    'Db',
    'D',
    'Eb',
    'E',
    'F', 
    'F#',
    'G',
    'Ab',
    'A',
    'Bb',
    'B',
];


function interval(noteA, noteB) {
    return (NOTE_SEMITONES[noteB] - NOTE_SEMITONES[noteA] + 12) % 12;
}

function getRoot(chord) {
    if (!chord) return null;
    const root = chord.match(/^[A-G][#b]?/);
    return root ? root[0] : null;
}

export function analyseChords(chords) {
    const result = chords.map(chord => ({
        chord,
        harmonicFunction: null,
        key: null,
    }));

    for (let i = 0; i < result.length - 1; i++) {
        const curr = result[i];
        const next = result[i + 1];
        const res = result[i + 2];

        const currRoot = getRoot(curr.chord);
        const nextRoot = getRoot(next.chord);
        if (!currRoot || !nextRoot ) continue;

        const currQuality = curr.chord.slice(currRoot.length);
        const nextQuality = next.chord.slice(nextRoot.length);

        const isII = /^-7$/.test(currQuality);
        const isIIhalf = /^(h|h7)$/.test(currQuality);
        const iiFunction = isII ? 'ii7' : isIIhalf ? 'iio7' : null;
        const isV = /^(7|9|13|7alt|7b9|7#9|7#5|7b5|7sus|9sus|13sus)$/.test(nextQuality);
        const isFourthUp = interval(currRoot, nextRoot) === 5;

        if (iiFunction && isV && isFourthUp) {
            const nextRootNum = NOTE_SEMITONES[nextRoot];
            const keyNum = (nextRootNum + 5 + 12) % 12;
            const keyRoot = SEMITONE_TO_NOTE[keyNum];

            curr.harmonicFunction = iiFunction;
            curr.key = keyRoot;
            next.harmonicFunction = 'V7';
            next.key = keyRoot;

            const resRoot = getRoot(res?.chord);
            const resQuality = res?.chord.slice(resRoot?.length ?? 0);

            const isI = /^(\^7|\^9|\^|6|69|2|add9|)$/.test(resQuality);
            const isMinorI = /^(-7|-9|-11|-)$/.test(resQuality);

            if (resRoot === keyRoot ) {
                if (isI) {
                    res.harmonicFunction = 'I';
                    res.key = keyRoot;
                } else if (isMinorI) {
                    res.harmonicFunction = 'i';
                    res.key = keyRoot;
                }
            }
        }
    }

    return result;
}