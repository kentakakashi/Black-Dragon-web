# BLACK DRAGONS [BD] — Official Website

React, TypeScript and Vite website for Netlify.

## Build
`npm install` then `npm run build`.

## Discord authentication
Register `https://YOUR-SITE-DOMAIN/.netlify/functions/discord-oauth-callback` as the Discord OAuth2 redirect URI. Configure the server-side Netlify variables `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_REDIRECT_URI`, `DISCORD_GUILD_ID`, `DISCORD_BOT_TOKEN`, `SESSION_SECRET` (random, at least 32 characters), `SITE_URL` and `FIREBASE_SERVICE_ACCOUNT_JSON`. Never expose secrets in VITE variables, GitHub or chat.

## Roblox ownership verification
A signed-in member enters their Roblox username. The server resolves it through the official Roblox Users API and creates a random 30-minute challenge. The member places the code in their Roblox profile description, saves it, then requests verification. The server fetches the public description and checks the code. A Roblox account can be linked to only one Discord account. The link is stored separately in `webProfiles/{discordId}` and `robloxOwnership/{robloxUserId}`.

## Canonical player data
The bot's `utils/database.js` loads Firestore `players` documents into `rankUsers`, keyed by Discord ID, and writes them to `players/{discordId}`. The website reads only the signed-in member's document for rank and kills. It never changes bot rank or kill records. Keep Firestore rules restrictive; Firebase Admin runs only in Netlify Functions.

## React Bits
The site uses actual React Bits implementations adapted to the BD visual system, including GlareHover. https://www.reactbits.dev/get-started/index


## Applications and recruitment
The public recruitment portal is available at `/applications`. Applicants must sign in through Discord and can submit clan membership, tryout staff, or other recruitment applications. Submissions are stored in Firestore `webApplications`, tied to the applicant's Discord ID. Applicants can view status and staff feedback from the portal. The private review workspace is `/admin/applications`.

Set the server-side Netlify variable `APPLICATION_REVIEW_ROLE_IDS` to a comma-separated list of Discord role IDs permitted to review applications. Review permissions are checked in the Netlify Function against roles in the signed Discord session; hiding the route in the UI is not the security boundary. Review decisions are recorded in `webAuditLogs`. Keep Firestore client rules deny-all; only Firebase Admin functions access these collections.


## Events and scheduling
Public events are listed at `/events`. Members register using their Discord session and a verified Roblox link. Event records are stored in Firestore `webEvents`; attendee records are private subcollection documents at `webEvents/{eventId}/registrations/{discordId}`. Staff tools are at `/admin/events` and use the server-side `EVENT_MANAGE_ROLE_IDS` variable (falling back to `APPLICATION_REVIEW_ROLE_IDS`) to authorize creation, publication, registration controls, cancellation/completion and attendance updates. Actions are written to `webAuditLogs`. Existing bot `tryouts/server` data and canonical `players` records are read-only to this feature.


## Editorial and Hall of Fame
The public News page reads published records from `webNews`; the Hall of Fame reads staff-inducted records from `webAchievements`. Staff can create news drafts/published stories and induct members at `/admin/content`. Configure the server-side `CONTENT_MANAGE_ROLE_IDS` variable (or reuse `APPLICATION_REVIEW_ROLE_IDS`) with trusted Discord role IDs. Content changes are audited in `webAuditLogs`. These editorial records never modify canonical player kills or ranks.
