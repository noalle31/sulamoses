import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

const PDFS_DIR = path.resolve(__dirname, './pdfs');
const IMAGES_DIR = path.resolve(__dirname, './images');
const CACHE_FILE = path.resolve(__dirname, './cache.json');

const app = express();
app.use(cors());
app.use(express.json());

// GET /songs - returns list of available songs
app.get('/songs', (_req, res) => {
    const files = fs.readdirSync(PDFS_DIR).filter(f => f.endsWith('.pdf'));
    const songs = files.map(f => ({
        file: f,
        name: f.replace('.pdf', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    }));
    res.json(songs);
});

// GET /image/:songFile - serves the pre-converted PNG for a song
app.get('/image/:songFile', (req, res) => {
    const imageName = req.params.songFile.replace('.pdf', '') + '.1.png';
    const imagePath = path.join(IMAGES_DIR, imageName);

    if (!fs.existsSync(imagePath)) {
        return res.status(404).json({ error: `No image found for ${req.params.songFile}.` });
    }

    res.sendFile(imagePath);
});

// POST /analyse - returns pre-analysed chords from cache
app.post('/analyse', (req, res) => {
    const { songFile } = req.body;

    if (!fs.existsSync(CACHE_FILE)) {
        return res.status(503).json({ error: 'Cache not found. Run node backend/analyse-all.js first.' });
    }

    const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));

    if (!cache[songFile]) {
        return res.status(404).json({ error: `No analysis found for ${songFile}. Run node backend/analyse-all.js to generate it.` });
    }

    res.json(cache[songFile]);
});

app.listen(3001, () => console.log('Server running on http://localhost:3001'));
