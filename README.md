# BLACK DRAGONS [BD] — Official Website

A cinematic, responsive clan headquarters built with React, TypeScript and Vite for Netlify deployment.

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env` if you want to override the public Discord invite.
4. Run `npm run dev` and open the local URL printed by Vite.
5. Run `npm run build` to verify a production build.

## Netlify deployment

Import this repository into Netlify. The included `netlify.toml` sets the build command to `npm run build` and publish directory to `dist`.

The official Discord invite is built into the public site as a fallback. Optionally set `VITE_DISCORD_INVITE_URL` in Netlify to override it.

## Current implementation

- Responsive cinematic homepage, clan introduction, rank guide and leaderboard preview.
- Full-screen categorized navigation with Discover, My Account, Competition and Community groups.
- Planned member-only destinations are clearly marked as coming soon until authentication and their pages are implemented.
- Staff administration is shown as a locked destination; actual access control must be implemented and verified server-side before staff tools are enabled.
- First-entry cinematic intro with a skip control; it runs once per browser session.
- Route entrance transitions and reduced-motion fallbacks.
- Public Discord invite connected to the navigation and Join page.
- Public leaderboard remains dependent on the secure Firebase/Netlify integration and is not represented as live until configured.

## Visual direction and assets

The homepage dragon uses a photograph by Peter Burdon, published on Unsplash and marked free to use under the Unsplash License. See [the original image page](https://unsplash.com/photos/a-close-up-of-a-dragons-head-on-a-black-background-HtzFlog4pnc). The old local SVG dragon remains in the repository as a legacy asset but is no longer the main hero artwork.

The site uses lightweight React Bits-inspired patterns: IntersectionObserver scroll reveals, CSS-only shiny text, pointer-based spotlight and tilt cards, ember particles, a staggered menu reveal and reusable route transitions. The goal is to preserve the cinematic feel without a heavy continuous 3D renderer.

## Security and planned integrations

- Discord OAuth and secure server-side sessions are not yet enabled.
- Roblox account ownership verification is not yet implemented.
- Staff role checks and admin operations must be enforced server-side.
- Never place a Discord client secret, bot token, Firebase service-account key, or session secret in a `VITE_*` variable or browser code.
- Keep Firestore rules restrictive. The public leaderboard should expose only approved fields through Firebase Admin on Netlify Functions.
- Before connecting rank-changing tools, confirm the bot's canonical Firestore player document shape and reuse the bot's verified records as the source of truth.

## Project structure

- `src/App.tsx` — route definitions
- `src/components/SiteLayout.tsx` — shared header, categorized menu and footer
- `src/components/IntroLoader.tsx` — first-entry intro
- `src/pages/` — public page routes
- `src/styles.css` — responsive visual system and motion
- `public/dragon-mark.svg` — site mark
- `netlify.toml` — Netlify build and routing configuration
