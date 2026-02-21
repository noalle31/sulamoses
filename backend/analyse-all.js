import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { fromPath } from 'pdf2pic';
import { extractChordsFromImage } from './ai-vision-analyser.js';
import { getScales } from './scale-analyser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

const PDFS_DIR = path.resolve(__dirname, './pdfs');
const IMAGES_DIR = path.resolve(__dirname, './images');
const CACHE_FILE = path.resolve(__dirname, './cache.json');

const pdfs = fs.readdirSync(PDFS_DIR).filter(f => f.endsWith('.pdf'));
const cache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8')) : {};

for (const file of pdfs) {
    if (cache[file]) {
        console.log(`Skipping ${file} (already cached)`);
        continue;
    }

    console.log(`Analysing ${file}...`);

    const convert = fromPath(path.join(PDFS_DIR, file), {
        density: 300,
        saveFilename: file.replace('.pdf', ''),
        savePath: IMAGES_DIR,
        format: 'png',
        width: 2550,
        height: 3300,
    });

    try {
        const result = await convert(1);
        const staves = await extractChordsFromImage(result.path);

        cache[file] = staves.map(stave =>
            stave.map(c => ({
                ...c,
                scales: getScales(c.chord, c['harmonic-function']),
            }))
        );

        const total = cache[file].reduce((sum, stave) => sum + stave.length, 0);
        console.log(`  → ${cache[file].length} staves, ${total} chords`);
    } catch (err) {
        console.error(`  ✗ Failed: ${err.message}`);
    }
}

fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
console.log(`\nDone. Cache written to ${CACHE_FILE}`);
