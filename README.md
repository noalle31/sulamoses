# Sulamoses

Sulamoses is a tool I built for my dad, to help him with scales and modes in jazz improvisation. Load a jazz standard chart (exported as .html), and it displays harmonic analysis and per-chord scale suggestions on a music staff (you can also flip between treble and bass clef!)

## Usage

1. Use the sample chart in this repo, [A Felicidade.html](A%20Felicidade.html), OR in iReal Pro, open a chart and export it as HTML (Song → Share → Export → HTML) 
2. Open the [live app](https://noalle31.github.io/sulamoses/) and click **Load Chart**, then select the exported `.html` file.
3. The chart renders as a chord grid with harmonic analysis and suggested scales underneath each chord. Use the clef toggle in the top bar to switch between treble and bass clef.

Everything runs client-side in the browser — no file is uploaded anywhere.

## Features

- Parses the chords and works out each chord's harmonic function within the key
- Suggests scales for each chord based on its harmonic function
- Renders chords and scales as notation (via [VexFlow](https://www.vexflow.com/))
- Responsive layout with touch support for mobile
- Treble/bass clef toggle

## Run locally

```bash
cd frontend
npm install
npm run dev
```

Then open the printed local URL and use it the same way as the [live app](#usage).

## Project structure

```
frontend/          React app — parsing, analysis, and rendering all happen client-side
  src/
    analyse-songs.js    parses the iReal Pro export into songs/measures
    analyse-chords.js   works out each chord's harmonic function
    analyse-scales.js   suggests scales per chord
    components/
      ChordGrid.jsx      chord grid layout
      ScaleStaff.jsx     VexFlow staff rendering
backend/          Express server with the same analysis logic, exposed over an /upload endpoint (legacy, not used by the deployed app)
unused/           Older experiments (PDF/AI-vision chart parsing) kept for reference, not part of the app
```
