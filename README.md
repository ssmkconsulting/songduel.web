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
