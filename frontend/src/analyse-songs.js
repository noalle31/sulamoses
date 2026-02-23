import iRealReader from 'ireal-reader';
import { analyseChords } from './analyse-chords.js';
import { getScales } from './analyse-scales.js';

export function analyseSongs(input) {
    const parsed = iRealReader(input)

    return parsed.songs.map(song => {
        const measures = song.music.measures.map(measure => measure.filter(Boolean));
        const flatChords = measures.flat();
        const analysed = analyseChords(flatChords);
        const annotated = analysed.map(entry => ({
            ...entry,
            scales: getScales(entry.chord, entry.harmonicFunction),
        }));

        let cursor = 0;
        const annotatedMeasures = measures.map(measure => {
            const slice = annotated.slice(cursor, cursor + measure.length);
            cursor += measure.length;
            return slice;
        })

        return {
            title: song.title,
            composer: song.composer,
            key: song.key,
            measures: annotatedMeasures,
        };
    });
}
