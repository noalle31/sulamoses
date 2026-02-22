import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { analyseSongs } from './analyse-songs.js';

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(cors());
app.use(express.json());

// POST /upload
app.post('/upload', upload.single('file'), (req, res) => {
    const html = req.file.buffer.toString('utf-8');
    const song = analyseSongs(html);
    res.json(song);
})

app.listen(3001, () => console.log('Server running on http://localhost:3001'));
