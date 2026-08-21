<div align="center">
  <h1>🎮 Pixel Dungeon Crawler</h1>
  <p>A turn-based roguelike dungeon crawler — played entirely in the browser, no install required.</p>
</div>

## ▶ Play online (no install)

Once published, the game is playable in any browser at:

```
https://kellifizw.github.io/rockygame/
```

See [Deployment](#deployment) below for the one-time setup that makes this URL live.

## About the game

- **Procedural dungeons** — every floor is a freshly generated room-and-corridor map with fog of war.
- **Four hero classes** — Vanguard Knight, Berserker, Arcanist, and Shadowblade — each with distinct stats, a unique Special ability, and a passive.
- **Turn-based d20 combat** — strike, use your Special, drink potions, or retreat.
- **Gold & a merchant** — enemies drop gold; spend it between floors on potions, damage, armor, or a full rest.
- **A final boss** — descend to Floor 6 and slay the Emberwyrm to win the run.
- **Save & Continue** — your run auto-saves to your browser's local storage.

## Run locally

**Prerequisites:** Node.js 18+ (npm)

1. Install dependencies:
   ```
   npm install
   ```
2. Run the dev server:
   ```
   npm run dev
   ```
3. Open http://localhost:3000

> Note: this game is fully client-side and does **not** require an API key to play.

## Deployment

The game is a static front-end app, so it can be hosted for free on **GitHub Pages**.

### One-time setup (2 steps)

1. **Enable GitHub Pages with the Actions workflow**
   - Go to the repo on GitHub → **Settings → Pages**.
   - Under **Build and deployment → Source**, select **"GitHub Actions"** (instead of "Deploy from a branch").
   - Save.

2. **Trigger the deployment**
   - The workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and deploys automatically on every push to `main`.
   - You can also run it manually: **Actions → "Deploy to GitHub Pages" → Run workflow**.

After the workflow finishes (usually ~1 minute), the game is live at
`https://kellifizw.github.io/rockygame/` — anyone with the link can play immediately.

### Why not Streamlit?

Streamlit is a Python framework for data apps and dashboards. This game is written in
TypeScript/React, so deploying it via Streamlit would require rewriting the entire game in
Python. Static hosting (GitHub Pages, or any alternative like Netlify, Vercel, or
Cloudflare Pages) is the correct — and simplest — way to make a browser game publicly
playable without installation.

### Other static-hosting options

Any static host works with the `dist/` folder produced by `npm run build`:
- **Netlify / Vercel / Cloudflare Pages** — drag-and-drop the `dist/` folder or connect the repo.
- **itch.io** — zip the `dist/` contents and upload as an HTML game.
