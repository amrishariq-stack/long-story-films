# Long Story Films — Website

Story-driven wedding videography one-pager for **Long Story Films** (Northern Virginia / DMV),
plus a standalone inquiry page. Warm-charcoal dark theme, full-bleed scroll-scrubbed film
backgrounds, 3D scroll reveals, and an animated gold ribbon. No build step — plain HTML/CSS/JS.

## Live structure

```
index.html          Home — hero + tagline over the scrubbed invitation film, about,
                    approach (over strip film), films, packages, FAQ, process,
                    final invitation (over reel film)
inquire.html        Standalone inquiry form (Formspree-ready)
css/style.css       All styles. Warm-bone base design + appended 3D/Dynamic layer + Dark theme
js/app.js           Behaviour: nav, FAQ, form, scroll-scrubbed films, parallax, 3D tilt
assets/             Web-optimised media (portrait, sample film, posters, reel)
frames/             242 webp frames — the Invitation film (hero/tagline scrub)
frames-strip/       242 webp frames — the strip film (behind Approach)
```

## Run locally

No bundler or dependencies. Serve the folder over HTTP (not `file://`, or the
frames/videos won't load):

```powershell
py -m http.server 8000
# then open http://localhost:8000
```

## Notable behaviour

- **Scroll-scrubbed films** — the Invitation and strip clips are rendered to pinned,
  full-bleed `<canvas>` elements and advanced frame-by-frame on scroll.
- **Dark theme** — warm charcoal background, bone text, single gold accent (`#C6A36B`).
  The theme lives in a clearly marked block at the bottom of `css/style.css`; delete it to
  restore the original warm-bone light design.
- **Accessibility** — semantic landmarks, visible focus states, and full
  `prefers-reduced-motion` support (films freeze on a still, parallax/tilt disabled).

## Fonts

Cormorant (serif display) + Inter (sans body), loaded from Google Fonts. Two fonts only.

## TODO before launch

- [ ] **Formspree endpoint** — replace `REPLACE_ME` in `inquire.html` with your form id
- [ ] `assets/favicon.png`
- [ ] `assets/og-image.jpg` (1200×630) and set `og:url` to the live domain
- [ ] Real **film embeds** for the "Coming Soon" slots (Vimeo) — remove empty slots before launch
- [ ] Optional: replace `assets/hero-loop.mp4` (currently unused) / refresh sample film

## Media note

Large source masters (`Vision Sample.mp4`, `Invitation video.mp4`, `strip.mp4`, `reel.mp4`,
`mas.png`) are **git-ignored** — the site uses the optimised copies in `assets/` and the
extracted frames. Keep the masters locally for future re-edits.
