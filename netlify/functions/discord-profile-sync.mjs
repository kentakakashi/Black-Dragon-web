import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export const config = { schedule: "0 */6 * * *" };

let firestore;
function db() {
  if (firestore) return firestore;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("Firebase is not configured.");
  const credentials = JSON.parse(raw);
  if (credentials.private_key) credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
  if (!getApps().length) initializeApp({ credential: cert(credentials) });
  firestore = getFirestore();
  return firestore;
}

async function guildMembers() {
  const guild = process.env.DISCORD_GUILD_ID;
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!guild || !token) throw new Error("Discord bot configuration is missing.");
  const all = [];
  let after = "";
  for (let page = 0; page < 20; page++) {
    const url = new URL("https://discord.com/api/v10/guilds/" + encodeURIComponent(guild) + "/members");
    url.searchParams.set("limit", "1000");
    if (after) url.searchParams.set("after", after);
    const response = await fetch(url, {
      headers: { Authorization: "Bot " + token },
      signal: AbortSignal.timeout(12000)
    });
    if (!response.ok) throw new Error("Discord guild member lookup failed: " + response.status);
    const batch = await response.json();
    if (!Array.isArray(batch)) throw new Error("Discord returned an invalid member list.");
    all.push(...batch);
    if (batch.length < 1000) break;
    after = String(batch[batch.length - 1]?.user?.id || "");
    if (!after) break;
  }
  return all;
}

export default async () => {
  try {
    const store = db();
    const [profiles, players, memberships, users] = await Promise.all([
      store.collection("webProfiles").get(),
      store.collection("players").get(),
      store.collection("webMemberships").get(),
      guildMembers()
    ]);
    const known = new Set([
      ...profiles.docs.map(doc => doc.id),
      ...players.docs.map(doc => doc.id),
      ...memberships.docs.map(doc => doc.id)
    ]);
    const now = Date.now();
    let updated = 0;
    let batch = store.batch();
    let writes = 0;
    for (const member of users) {
      const user = member?.user;
      const id = String(user?.id || "");
      if (!/^\d{17,20}$/.test(id) || !known.has(id)) continue;
      batch.set(store.collection("webProfiles").doc(id), {
        discordId: id,
        discordUsername: String(user.username || "").slice(0, 32),
        discordGlobalName: typeof user.global_name === "string" ? user.global_name.slice(0, 64) : null,
        discordAvatar: typeof user.avatar === "string" ? user.avatar : null,
        discordProfileSyncedAt: now
      }, { merge: true });
      updated++;
      writes++;
      if (writes === 450) {
        await batch.commit();
        batch = store.batch();
        writes = 0;
      }
    }
    if (writes) await batch.commit();
    console.log("Discord profile sync completed:", { updated, checked: users.length });
    return new Response(JSON.stringify({ ok: true, updated, checked: users.length }), {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
    });
  } catch (error) {
    console.error("Scheduled Discord profile sync failed:", error);
    return new Response("Profile sync failed.", { status: 500 });
  }
};
