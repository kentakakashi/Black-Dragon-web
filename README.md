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
- Public announcements, news, rules, members, staff and Hall of Fame routes are now present.
- The member directory uses a separate server-side endpoint that exposes only Roblox username, rank and verified kill count; Discord IDs are not returned to the browser.

## Visual direction and assets

The homepage dragon artwork is an AI-generated fantasy illustration by AUDIOREZOUT, published on Pixabay and offered under the Pixabay Content License. See [the original image page](https://pixabay.com/illustrations/dragon-red-eyes-fire-epic-game-8384505/). The original creator permits use in media projects and prohibits reselling or claiming ownership of the artwork. The previous Unsplash reptile photograph was removed.

The site uses React Bits components including GlareHover (official TS/CSS implementation), alongside the existing SpotlightCard, TiltedCard, ShinyText, scroll reveal and particle treatments. React Bits is the open-source component source: https://www.reactbits.dev/get-started/index and https://github.com/DavidHDev/react-bits. Effects are adapted to the BD palette and kept lightweight; no always-on 3D renderer is used.

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
