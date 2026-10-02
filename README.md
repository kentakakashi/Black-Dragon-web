# BLACK DRAGONS [BD] — Official Website

A cinematic, responsive community website built with React, TypeScript and Vite. Designed for Netlify deployment.

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and set `VITE_DISCORD_INVITE_URL` to the real Discord invite.
4. Run `npm run dev` and open the local URL printed by Vite.
5. Run `npm run build` to verify a production build.

## Netlify deployment

Import this repository into Netlify. The included `netlify.toml` sets the build command to `npm run build` and publish directory to `dist`.

Set `VITE_DISCORD_INVITE_URL` in the Netlify site's environment variables. Redeploy after changing environment variables.

## Current launch status

- Responsive landing page, clan introduction, rank guide and leaderboard preview are implemented.
- The rank thresholds shown on the site mirror the currently documented bot rank guide.
- The leaderboard is intentionally marked as pending until the server-side Firebase integration is configured and verified.
- Discord sign-in is not yet enabled. OAuth must be implemented server-side; never place a Discord client secret, bot token, Firebase service-account key, or session secret in a `VITE_*` variable or browser code.
- The existing Firestore rules deny direct client access. Keep them restrictive. The planned leaderboard endpoint will read approved fields using Firebase Admin on Netlify Functions, rather than opening Firestore to the public.

## Planned secure integration

The next phase adds Netlify Functions for Discord OAuth/session handling and a public, read-only leaderboard endpoint. Required secrets will be entered directly in Netlify's environment-variable settings, not committed to Git. Before wiring the endpoint, confirm the bot's canonical Firestore player document shape and the Discord guild/role IDs.

## Project structure

- `src/App.tsx` — site sections and page layout
- `src/styles.css` — responsive visual system
- `public/dragon-mark.svg` — site mark
- `netlify.toml` — Netlify build and routing configuration
