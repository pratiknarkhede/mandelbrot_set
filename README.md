# ∞ Mandelbrot Explorer — The Beauty of Code

An interactive, near-infinitely zoomable explorer for the Mandelbrot set and
other beautiful equations — built to showcase the beauty hidden inside a
deceptively simple formula, `z ← z² + c`.

![Mandelbrot Explorer](https://img.shields.io/badge/WebGL2-fractals-7c9eff)

## Features

- **Seemingly infinite zoom** — GPU double-float (df64) arithmetic pushes
  magnification to ~10¹³ with auto-boosted iteration detail as you dive
- **5 plug-in formulas** — Mandelbrot, Multibrot (zⁿ + c), Julia, Burning Ship, Tricorn
- **Atlas of the Set** — 12 curated famous locations (Seahorse Valley, Elephant
  Valley, the Largest Island, …) with beginner-friendly stories; click to fly,
  or press `A` to journey through them
- **Narrated cinematic tour** — one continuous dive through the most beautiful
  places, with color cycling and landmark narration
- **Julia inset preview** — a live Julia set follows your cursor across the
  Mandelbrot set; one click to jump into it
- **Progressive rendering** — interactive frames at reduced resolution,
  supersampled idle passes, palette baking, smooth escape-time coloring
- Bookmarks, PNG export, shareable zoom HUD, glassmorphism UI (Svelte 5 + WebGL2)

## Tech stack

| Layer | Choice |
|---|---|
| UI | Svelte 5 (runes) + Vite |
| Language | TypeScript |
| Rendering | Raw WebGL 2, one fullscreen triangle + fragment shader |
| Precision | Double-float (df64) emulation — `vec2(hi, lo)` pairs |
| Depth limit | ~10¹³ magnification (df64 mantissa, ~46 bits; beyond needs perturbation) |

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run check    # type checks
npm run build    # production build → dist/
```

## Controls

| Action | Input |
|---|---|
| Pan | click + drag |
| Zoom to cursor | wheel / pinch |
| Fly-zoom ×4 | double-click |
| Pick Julia c | shift + drag (Julia fractal) |
| Fractals | keys `1`–`5` |
| Atlas next landmark | `A` |
| Reset view / Hide UI | `R` / `H` (or `Esc` to show UI) |
| Bookmark / Export | `B` / `E` |

## Architecture

```
src/
  engine/     renderer, camera, palette, df64 precision (framework-agnostic)
  fractals/   plug-in formulas — add a new fractal in one file
  atlas/      curated landmark content (zoom targets + narration)
  components/ Svelte UI (canvas, control panel, atlas, HUD, inset)
  stores/     Svelte 5 runes state
```

Adding a new visualization = one `FractalDefinition` module + one registry
line — the engine never changes.

## License

MIT
