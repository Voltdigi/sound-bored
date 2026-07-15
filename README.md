# Soundbored — Next.js

A landscape-first meme reaction soundboard. Eight rounded-square pads in a 2×4 grid,
each playing a Web-Audio synthesized placeholder sound. One sound plays at a time
(retrigger cuts the previous), with press-scale + white-flash feedback, labels under
each pad, a **Stop all** button, and a "rotate your phone" hint in portrait.

Built with Next.js 14 (App Router) + TypeScript. No runtime dependencies beyond React/Next.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. For the intended experience, view in a landscape phone
viewport (browser devtools device mode, rotated).

## Project structure

```
app/
  layout.tsx        Fonts (Archivo / Space Grotesk / Space Mono) + metadata + globals
  page.tsx          Renders <Soundboard theme="Arcade" accent="#ff3b6b" showLabels />
  globals.css       Resets + @keyframes (padflash, rotatehint)
components/
  Soundboard.tsx    The soundboard UI. Props: theme, accent, showLabels, pads
lib/
  sounds.ts         SoundEngine class — framework-agnostic Web Audio synth
```

## Customizing

- **Pads / labels / colors** — edit `DEFAULT_PADS` in `components/Soundboard.tsx`
  (each pad has a `label`, an HSL `hue`, and a `sound` key), or pass your own
  `pads={[...]}` array as a prop.
- **Theme / accent / labels** — pass `theme` (`"Arcade" | "Neon" | "Pastel"`),
  `accent` (any CSS color), and `showLabels` to `<Soundboard />` in `app/page.tsx`.
- **Real audio instead of synth** — the sounds are generated in `lib/sounds.ts`.
  To use audio files, swap `SoundEngine.play()` for an `<audio>` / `AudioBufferSourceNode`
  loader that returns the clip duration; the component only needs `play(kind)` and
  `stopAll()`.

## Notes

- Audio is created on first tap (browser autoplay policy) — nothing plays until the
  user interacts.
- `Soundboard.tsx` is a client component (`"use client"`) because it uses Web Audio,
  `matchMedia`, and local state.
