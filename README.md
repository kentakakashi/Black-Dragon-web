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

## Current implementation

- Responsive cinematic homepage, clan introduction, rank guide and leaderboard preview.
- Full-screen categorized navigation and first-entry intro with reduced-motion support.
- Public announcements, news, rules, member directory, staff and Hall of Fame routes.
- Discord account gateway with OAuth start/callback, signed HTTP-only session cookies, and server-side guild-membership validation.
- The account gateway does not yet claim Roblox ownership verification. That is a separate next phase.
- Public member and leaderboard endpoints expose approved fields only. Firebase Admin remains server-side.
- Staff permissions must be checked server-side on every privileged operation; hiding a link is not access control.

## Discord OAuth setup

Create a Discord application and add this exact redirect URI in its OAuth2 settings:

`https://YOUR-SITE-DOMAIN/.netlify/functions/discord-oauth-callback`

Add the following **server-side** variables in Netlify Site configuration → Environment variables:

- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_REDIRECT_URI` (must exactly match the registered URI)
- `DISCORD_GUILD_ID`
- `DISCORD_BOT_TOKEN` (the bot must be in the guild and able to read guild members)
- `SESSION_SECRET` (random secret, at least 32 characters)
- `SITE_URL` (the canonical HTTPS website origin)

Never put secrets in `VITE_*` variables, GitHub files, or chat messages. The callback checks the user's membership using the bot API before issuing a seven-day signed, HttpOnly, Secure, SameSite=Lax session cookie. The browser receives only the Discord identity and role IDs needed for later server-side authorization. This is the first authentication milestone; staff role enforcement on admin endpoints and Roblox ownership verification are not enabled yet.

## Visual direction and assets

The homepage dragon artwork is an AI-generated fantasy illustration by AUDIOREZOUT, published on Pixabay and offered under the Pixabay Content License. See [the original image page](https://pixabay.com/illustrations/dragon-red-eyes-fire-epic-game-8384505/).

The site uses React Bits components including GlareHover, alongside SpotlightCard, TiltedCard, ShinyText, scroll reveal and particle treatments. React Bits: https://www.reactbits.dev/get-started/index and https://github.com/DavidHDev/react-bits. Effects are adapted to the BD palette and kept lightweight.

## Data and security

- The Discord identity session is signed server-side and stored in an HttpOnly cookie.
- Roblox account ownership verification is not yet implemented.
- Staff role checks and admin operations must be enforced server-side before being enabled.
- Keep Firestore rules restrictive. Firebase Admin is used only by Netlify Functions.
- The bot's `players` collection is the canonical source for verified player records; its loader reconstructs `rankUsers` from these documents. The website must read only this verified source and never create a competing kill/rank database.

## Project structure

- `src/App.tsx` — route definitions
- `src/components/SiteLayout.tsx` — shared header, categorized menu and footer
- `src/pages/` — public page routes
- `netlify/functions/` — server-side API and authentication endpoints
- `src/styles.css` — responsive visual system and motion
- `netlify.toml` — Netlify build and routing configuration
