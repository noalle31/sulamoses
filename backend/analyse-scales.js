export function getScales(chord, harmonicFunction = null) {
    const rootMatch = chord.match(/^[A-G][#b]?/);
    if (!rootMatch) return [];

    const root = rootMatch[0];
    const quality = chord.slice(root.length).trim().replace(/\/[A-G][b#]?$/, '');

    // Dominant 7th / 9th / 13th: G7, C9, G13
    if (/^(7|9|13)$/.test(quality)) {
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

    // Augmented dominant: G7#5
    if (/^(7#5)$/.test(quality)) {
        return [
            { name: `${root} Whole Tone` },
            { name: `${root} Altered` },
            { name: `${root} Lydian Dominant` },
        ];
    }

    // Dominant 7b9 (and variants): G7b9, G7b9#9, G7b9#5
    if (/^7b9/.test(quality)) {
        return [
            { name: `${root} Half-Whole Diminished` },
            { name: `${root} Phrygian Dominant` },
            { name: `${root} Altered` },
            { name: `${root} Mixolydian` },
        ];
    }

    // Dominant 7#9: G7#9, G7#9#5
    if (/^7#9/.test(quality)) {
        return [
            { name: `${root} Altered` },
            { name: `${root} Half-Whole Diminished` },
            { name: `${root} Mixolydian` },
        ];
    }

    // Dominant altered: G7alt
    if (/^7alt$/.test(quality)) {
        return [
            { name: `${root} Altered` },
        ];
    }

    // Dominant 7b5: G7b5
    if (/^7b5$/.test(quality)) {
        return [
            { name: `${root} Lydian Dominant` },
            { name: `${root} Whole Tone` },
            { name: `${root} Altered` },
        ];
    }

    // Dominant 7b13: G7b13
    if (/^7b13$/.test(quality)) {
        return [
            { name: `${root} Altered` },
            { name: `${root} Phrygian Dominant` },
        ];
    }

    // Dominant 7#11 / 13#11: G7#11, G13#11
    if (/^(7#11|13#11|9#11)$/.test(quality)) {
        return [
            { name: `${root} Lydian Dominant` },
        ];
    }

    // Dominant sus: G7sus, G9sus, G13sus
    if (/^(7sus|9sus|13sus|sus)$/.test(quality)) {
        return [
            { name: `${root} Mixolydian` },
            { name: `${root} Dorian` },
            { name: `${root} Lydian Dominant` },
        ];
    }

    // Major 7th / 9th / 6th: C^7, C^9, C^, C6, C69, C2, Cadd9
    if (/^(\^7|\^9|\^|6|69|2|add9)$/.test(quality)) {
        return [
            { name: `${root} Ionian` },
            { name: `${root} Lydian` },
            { name: `${root} Lydian Augmented` },
        ];
    }

    // Major 7#11: C^7#11
    if (/^(\^7#11|\^13)$/.test(quality)) {
        return [
            { name: `${root} Lydian` },
        ];
    }

    // Major 7#5: C^7#5
    if (/^(\^7#5)$/.test(quality)) {
        return [
            { name: `${root} Lydian Augmented` },
        ];
    }

    // Minor major 7: C-^7, C-^9
    if (/^(-\^7|-\^9)$/.test(quality)) {
        return [
            { name: `${root} Melodic Minor` },
        ];
    }

    // Half-diminished: Ch7, Ch
    if (/^(h7|h)$/.test(quality)) {
        return [
            { name: `${root} Locrian` },
        ];
    }

    // Diminished 7th: Co7, Co
    if (/^(o7|o)$/.test(quality)) {
        return [
            { name: `${root} Whole-Half Diminished` },
        ];
    }

    // Minor 7th: D-7
    if (/^(-7)$/.test(quality)) {
        if (harmonicFunction === 'ii7') return [
            { name: `${root} Dorian` },
        ];
        return [
            { name: `${root} Aeolian` },
        ];
    }

    // Minor 9th / 11th / 6th: D-9, D-11, D-6, D-69, D-b6
    if (/^(-9|-11|-6|-69|-b6)$/.test(quality)) {
        return [
            { name: `${root} Dorian` },
            { name: `${root} Aeolian` },
            { name: `${root} Melodic Minor` },
        ];
    }

    // Plain minor: A-, A-/B
    if (/^(-)$/.test(quality)) {
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