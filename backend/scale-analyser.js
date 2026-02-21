export function getScales(chord, harmonicFunction = null) {
    const rootMatch = chord.match(/^[A-G][#b]?/);
    if (!rootMatch) return [];

    const root = rootMatch[0];
    const quality = chord.slice(root.length).trim();

    // Dominant 7th / 9th: G7, C7, G9, C9, G7(9), G13
    if (/^(7|9|13|7\(9\)|7add9)$/.test(quality)) {
        const all = [
            { name: `${root} Mixolydian` },
            { name: `${root} Lydian Dominant` },
            { name: `${root} Altered` },
            { name: `${root} Half-Whole Diminished` },
            { name: `${root} Whole Tone` },
            { name: `${root} Phrygian Dominant` },
        ];
        if (harmonicFunction === 'V/minor') return [all[2], all[5], all[3], all[0]];
        return all;
    }

    // Augmented dominant: F+7, F7#5, Faug7
    if (/^(\+7|7#5|7\+|aug7)$/.test(quality)) {
        return [
            { name: `${root} Whole Tone` },
            { name: `${root} Altered` },
            { name: `${root} Lydian Dominant` },
        ];
    }

    // Dominant 7b9: G7b9, G7/b9
    if (/7[/]?b9$/.test(quality)) {
        return [
            { name: `${root} Half-Whole Diminished` },
            { name: `${root} Phrygian Dominant` },
            { name: `${root} Altered` },
            { name: `${root} Mixolydian` },
        ];
    }

    // Dominant sus: G7sus4, Gsus
    if (/^(7sus4|sus4|sus)$/.test(quality)) {
        return [
            { name: `${root} Mixolydian` },
            { name: `${root} Dorian` },
            { name: `${root} Lydian Dominant` },
        ];
    }

    // Major 7th / 9th: Cmaj7, FΔ, Cmaj9
    if (/^(maj7|Maj7|M7|maj|Δ7|Δ|maj9|Maj9|M9|9)$/.test(quality)) {
        return [
            { name: `${root} Ionian` },
            { name: `${root} Lydian` },
            { name: `${root} Lydian Augmented` },
        ];
    }

    // Minor Major 7: Cm(maj7)
    if (/^(m\(maj7\)|-\(maj7\)|mM7|minMaj7)$/.test(quality)) {
        return [
            { name: `${root} Melodic Minor` },
        ];
    }

    // Half-diminished: Bm7b5, Bø
    if (/^(m7b5|m7♭5|-7b5|ø7|ø)$/.test(quality)) {
        return [
            { name: `${root} Locrian ♮2` },
            { name: `${root} Locrian` },
        ];
    }

    // Diminished 7th: Bdim7, B°
    if (/^(dim7|°7|dim|°)$/.test(quality)) {
        return [
            { name: `${root} Whole-Half Diminished` },
        ];
    }

    // Minor 7th: Dm7, A-7
    if (/^(m7|-7|min7)$/.test(quality)) {
        if (harmonicFunction === 'ii7') return [
            { name: `${root} Dorian` },
        ];
        if (harmonicFunction === 'vi7') return [
            { name: `${root} Aeolian` },
            { name: `${root} Dorian` },
        ];
        if (harmonicFunction === 'iii7') return [
            { name: `${root} Phrygian` },
        ];
        return [
            { name: `${root} Dorian` },
            { name: `${root} Aeolian` },
            { name: `${root} Phrygian` },
            { name: `${root} Melodic Minor` },
        ];
    }

    // Plain minor: Am, F-
    if (/^(m|-)$/.test(quality)) {
        return [
            { name: `${root} Dorian` },
            { name: `${root} Aeolian` },
            { name: `${root} Minor Pentatonic` },
        ];
    }

    // Plain major or no quality: C, Eb
    return [
        { name: `${root} Ionian` },
        { name: `${root} Lydian` },
        { name: `${root} Major Pentatonic` },
        { name: `${root} Mixolydian` },
    ];
}
