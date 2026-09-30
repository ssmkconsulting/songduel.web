# SongDuel website

The official marketing, privacy, terms, and support website for the SongDuel iOS app.

## Local preview

The site is dependency-free. Serve the repository root with any static web server:

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deployment

GitHub Pages serves the static site directly from the repository root on `main`. In the repository settings, use **Pages → Build and deployment → Deploy from a branch**, then select **main** and **/(root)**.

## Two-product landing page

The dependency-free homepage introduces **SongDuel: Rank Your Music** and
**SongDuel: Own the Ring**, with dedicated, deep-linkable product sections.
`products.css` builds on the existing shared `styles.css` palette, typography,
buttons, feedback form, and footer. `script.js` handles progressive reveals,
product navigation, accessible mobile navigation, and motion controls.

### Source review (September 30, 2026)

Both repositories were fetched from `origin/main` before implementation:

- `songduel` at `47ce62b`: personal comparisons, rankings, insights, and Apple
  Music playlists. The README has conflicting playlist-creation timing, so
  homepage copy deliberately avoids a comparison-count threshold. The existing
  website's comparison and ranking captures remain suitable and were reused.
- `songduel.game` at `81df143`: 2–8 players, 5 or 10 rounds, same-room and remote
  audio modes, voting, results, and native external-display TV presentation.
  Browser TV hosting is local-only in the repository documentation, so the site
  makes no public browser-hosting claim. No App Store URL was found for the game.

### Image provenance

`assets/products/` contains compressed WebP exports; no external artist images
were downloaded and no album artwork was extracted from the app screenshots.

| Export | Source |
| --- | --- |
| `rank-logo.webp` | Existing website `assets/songduel-logo.png` |
| `rank-compare.webp`, `rank-chart.webp` | Existing website `assets/screen-compare.jpg`, `assets/screen-rankings.jpg` |
| `ring-logo.webp` | Game `SongDuelGame/Resources/Assets.xcassets/SongDuelLogo.imageset/SongDuelLogo.png`; approved master documented in `docs/assets/branding/README.md` |
| `ring-battle.webp`, `ring-winner.webp` | Game `AppStoreScreenshots/2026-09-29/source/battle.png`, `results.png` |
| `ring-tv.webp`, `ring-tv-small.webp` | Game `AppStoreScreenshots/2026-09-29/source/tv.png` |
| `stage.webp` | Game `AppStoreScreenshots/2026-09-29/artwork/stage.png` |

Game captures are repository marketing fixtures documented in `docs/SCREENSHOTS.md`.
Artist and album imagery remains within the original app captures. The approved
stage artwork is decorative. New product assets total approximately 320 KB.

### Validation and optional production export

Node.js 20.19+ and installed Google Chrome are required for development checks;
they are not required to serve the website. Install tooling with `npm ci`.

```sh
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

For responsive, accessibility, navigation, feedback, and reduced-motion tests,
start the preview server above, then run `npm run test:browser`. Override
`SITE_URL` to test another local server, including one serving `dist/`.
Screenshots go to ignored `test-results/`. The browser tests cover 320, 390, 768,
1024, 1440, and 1920 pixel widths. These are browser emulations, not physical
hardware performance measurements.

`npm run build` assembles deployable static files in ignored `dist/`. GitHub
Pages continues to serve the repository root; its configuration is unchanged.
Legal pages and the existing App Store URL remain intact. No analytics or
social-profile links existed in the reviewed site.
