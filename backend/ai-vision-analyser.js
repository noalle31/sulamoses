import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

const client = new Anthropic();

export async function extractChordsFromImage(imagePath) {
    const imageData = fs.readFileSync(imagePath).toString('base64');

    const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        messages: [{
            role: 'user',
            content: [
                { 
                    type: 'image', 
                    source: { 
                        type: 'base64',
                        media_type: 'image/png', 
                        data: imageData 
                    } 
                },
                {
                    type: 'text',
                    text:
`This is a jazz lead sheet image. Analyze it and return ONLY a raw JSON array of staves with no markdown formatting, no code blocks, no explanation.

The top-level array represents staves (rows of music), read from top to bottom. Each stave is an array of chord objects in the order they appear left to right on that stave. Include every chord occurrence — do NOT deduplicate. Each chord object has: chord (string), harmonic-function (string), key (string).

Example output structure:
[
  [ {"chord":"Cmaj7","harmonic-function":"Imaj7","key":"C"}, {"chord":"C-7","harmonic-function":"ii7","key":"Bb"}, {"chord":"F7","harmonic-function":"V7","key":"Bb"} ],
  [ {"chord":"Bbmaj7","harmonic-function":"Imaj7","key":"Bb"}, {"chord":"Bb-7","harmonic-function":"ii7","key":"Ab"}, {"chord":"Eb7","harmonic-function":"V7","key":"Ab"} ]
]

CRITICAL JAZZ HARMONY RULES — follow these exactly:

STEP 1 — SCAN FOR ii-V PAIRS FIRST, before assigning any keys.
Go through the chord sequence and identify every ii-V pair: a minor 7th chord immediately followed by a dominant 7th chord a perfect 4th above. Do this scan BEFORE deciding the key for any chord.
   - C-7 → F7: ii-V in Bb (both get key "Bb")
   - Bb-7 → Eb7: ii-V in Ab (both get key "Ab")
   - F-7 → Bb7: ii-V in Eb (both get key "Eb")
   - D-7 → G7: ii-V in C (both get key "C")

STEP 2 — ASSIGN KEYS based on that scan.
- Every chord identified as part of a ii-V pair gets the key of the implied tonic (a perfect 5th below the dominant).
- If the ii-V resolves to a major or minor chord, that resolution chord is "I" or "i" in the same local key.
- Only assign the home key of the piece to chords that are genuinely diatonic in that key AND not part of any ii-V pattern.

STEP 3 — WATCH FOR THE PARALLEL MINOR TRAP.
A minor chord on the same root as the previous major chord (e.g. Bbmaj7 followed by Bb-7) is NOT automatically "i" in that key. Always check what comes AFTER it. If Bb-7 is followed by Eb7, it is ii7 in Ab — not i7 in Bb.

STEP 4 — HARMONIC FUNCTION.
Use Roman numerals relative to the local key. Lowercase for minor-quality chords (i, ii, iii), uppercase for major/dominant (I, II, V). Add quality suffixes: ii7, V7, Imaj7, i7, etc.

STEP 5 — VISION ACCURACY: watch for these common misreads.
- The digit "7" is often misread as "1". If you see a chord like "C1" or "G1", it is almost certainly "C7" or "G7".
- The letter "m" is often misread as "n". "Gn7" means "Gm7". Always output "m" not "n" for minor quality.
- The minor sign "-" is small and easy to miss. "Bb7" and "Bb-7" look similar — always look carefully for a dash before the 7. Cross-check with harmonic function: a chord labeled ii7 MUST be minor quality (m7 or -7). If you assigned "ii7" but read a bare dominant chord (e.g. "Bb7"), re-examine the image — you likely missed the "-".
- The augmented "+" sign and the sharp "#" sign look similar. "F+7" (augmented dominant) and "F#7" (F-sharp dominant) are completely different. Look carefully at whether the symbol before the 7 is a "+" (augmented, applied to the root or chord quality) or "#" (a root accidental).
- Two chords on the same beat should never be merged into one symbol (e.g. "D-15 G9" is two chords: "D-7" and "G9" or similar — split them).
- "maj7" preceded by a minor sign (e.g. "G-maj7") is almost certainly a misread — check if it should be "Gmaj7" (major) or "Gm(maj7)" (minor-major 7th).

STEP 6 — BLUES FORM AWARENESS.
If the piece is clearly a blues (repeating 12-bar or similar blues form), the tonic chord is a dominant 7th (e.g. G7 in G blues, Bb7 in Bb blues). Do NOT re-label it as a minor chord (Gm7) or major 7th (Gmaj7) just because it fits a ii-V pattern. Blues tonic chords are I7, IV7, V7 — all dominant quality.`,
                },
            ],
        }],
    });

    const raw = response.content[0].text;
    const cleaned = raw.replace(/```json\n?/, '').replace(/\n?```/, '').trim();
    return JSON.parse(cleaned);
}

