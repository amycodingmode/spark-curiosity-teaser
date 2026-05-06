# Forma — Scenes teaser

Single-page, static teaser for **Scenes**: HTML5, CSS, vanilla JS, GSAP 3 + ScrollTrigger + MotionPathPlugin, and Lenis smooth scrolling. Open `index.html` with [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) or any static host (Vercel, Netlify).

## Setup

1. Clone or copy this folder.
2. Serve the root directory over HTTP (required for video, module scripts, and some browser APIs). Example:

   ```bash
   python3 -m http.server 8080
   ```

   Then open `http://localhost:8080`.

3. Optional: add self-hosted fonts under `assets/fonts/` (`Degular-*.woff2`, `Roboto-*.woff2`). Until then, **Inter** and **Roboto** load from Google Fonts as fallbacks (see `index.html`).

## Replacing assets

| Role | Path | Notes |
|------|------|--------|
| Hero loop | `assets/video/hero.mp4` | H.264, target &lt; 4 MB; `preload="metadata"` in HTML |
| Hero poster | `assets/video/hero-poster.jpg` | First frame / fallback |
| Logo | `assets/images/logo.svg` | Swap with production wordmark |
| Apple | `assets/images/apple.png` | Transparent PNG; CSS fallback renders if missing |
| Rabbit-hole BG | `assets/images/hole-bg.png` | Parallax layer in `#features` (`.scenes__bg`) |
| Still-life props | `assets/images/objects/*.png` | Six files: `clock`, `book`, `teapot`, `chair`, `table`, `cards` |
| Space backdrop | `assets/images/space-bg.jpg` | 1920×1080-ish |
| Astronaut | `assets/images/astronaut.png` | Transparent PNG for the CTA figure |

WebP sources are referenced in `<picture>`; keep PNGs as fallbacks for transparency.

## Tuning scroll choreography

Edit **`scripts/scroll.js`**:

- **Pin length:** `pinScrollDistance()` — default **~2.85× viewport height** (minimum **1800px**). Tweak the multiplier or minimum.
- **Story beats:** `FALL_START` / `FALL_DUR`, `PROPS_FADE0`, `DRIFT_START` / `DRIFT_DUR`, `APPLE_EXIT`, `MERGE_START` / `MERGE_DUR` (see comments in `scroll.js`).
- **Layouts:** `applyOuterRingLayout`, `approachLayoutsDesk` / `approachLayoutsMob`, `mergeSteps`.
- **Apple path:** `#apple-path` in `index.html` — `MotionPathPlugin`; hole layer **`.scenes__bg`** moves with the fall for depth.
- **Space particles:** `initSpaceParticles` — `NUM`, colors, `delayedCall` delay before showing **Test Scenes** (default ~1.15s).
- **Space parallax:** mousemove handler on `#contact` — scale factors `12` and `10` on `gsap.set(spaceBg, { x, y })`.

Lenis options live in **`scripts/main.js`** (`initLenis`): `duration: 1.2` matches the brief’s 1.2s-style smoothing.

## Waitlist endpoint

The modal posts JSON `{ "email": "<address>" }` to **`/api/waitlist`**. Static hosting will show the placeholder error message until you wire a serverless function or backend.

## Accessibility

With **`prefers-reduced-motion: reduce`**, Lenis and scroll-driven animations are skipped; the Scenes objects appear composed, the CTA is visible immediately, and parallax / pinning are disabled (see `body.motion-reduced` in CSS and `scripts/main.js`).

## Performance checklist

- Compress hero MP4; keep poster small.
- Optimize PNG/WebP props and backgrounds.
- Lazy-loaded images below the fold are marked `loading="lazy"` where appropriate.
