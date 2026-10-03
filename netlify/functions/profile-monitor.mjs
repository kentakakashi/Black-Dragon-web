import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getSessionUser } from "./_shared/discord-auth.mjs";
import { hasWebsitePermission } from "./_shared/staff-access.mjs";

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
const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" }
});
async function discordMembers() {
  const guild = process.env.DISCORD_GUILD_ID, token = process.env.DISCORD_BOT_TOKEN;
  if (!guild || !token) throw new Error("Discord bot configuration is missing.");
  const all = [];
  let after = "";
  for (let page = 0; page < 20; page++) {
    const url = new URL("https://discord.com/api/v10/guilds/" + encodeURIComponent(guild) + "/members");
    url.searchParams.set("limit", "1000");
    if (after) url.searchParams.set("after", after);
    const response = await fetch(url, { headers: { Authorization: "Bot " + token }, signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error("Discord returned " + response.status + ".");
    const batch = await response.json();
    if (!Array.isArray(batch)) throw new Error("Discord returned an invalid member list.");
    all.push(...batch);
    if (batch.length < 1000) break;
    after = String(batch[batch.length - 1]?.user?.id || "");
    if (!after) break;
  }
  return all;
}
async function syncAll(store) {
  const [profiles, players, memberships, users] = await Promise.all([
    store.collection("webProfiles").get(), store.collection("players").get(),
    store.collection("webMemberships").get(), discordMembers()
  ]);
  const known = new Set([...profiles.docs, ...players.docs, ...memberships.docs].map(doc => doc.id));
  let batch = store.batch(), writes = 0, updated = 0;
  const now = Date.now();
  for (const member of users) {
    const user = member?.user, id = String(user?.id || "");
    if (!/^\d{17,20}$/.test(id) || !known.has(id)) continue;
    batch.set(store.collection("webProfiles").doc(id), {
      discordId: id, discordUsername: String(user.username || "").slice(0, 32),
      discordGlobalName: typeof user.global_name === "string" ? user.global_name.slice(0, 64) : null,
      discordAvatar: typeof user.avatar === "string" ? user.avatar : null,
      discordProfileSyncedAt: now
    }, { merge: true });
    writes++; updated++;
    if (writes === 450) { await batch.commit(); batch = store.batch(); writes = 0; }
  }
  if (writes) await batch.commit();
  return { updated, checked: users.length, syncedAt: now };
}
export default async request => {
  if (!["GET", "POST"].includes(request.method)) return json({ error: "Method not allowed." }, 405);
  const user = getSessionUser(request);
  if (!user) return json({ error: "Sign in first." }, 401);
  if (!await hasWebsitePermission(user, "members.view", "APPLICATION_REVIEW_ROLE_IDS")) return json({ error: "Staff permission required." }, 403);
  try {
    const store = db();
    let syncResult = null;
    if (request.method === "POST") syncResult = await syncAll(store);
    const [profiles, players, memberships] = await Promise.all([
      store.collection("webProfiles").get(), store.collection("players").get(), store.collection("webMemberships").get()
    ]);
    const knownIds = new Set([...profiles.docs, ...players.docs, ...memberships.docs].map(doc => doc.id));
    const docs = profiles.docs.filter(doc => /^\d{17,20}$/.test(doc.id));
    const rows = docs.map(doc => {
      const data = doc.data() || {}, syncedAt = Number(data.discordProfileSyncedAt) || 0;
      return {
        discordId: doc.id, username: String(data.discordUsername || "Unknown"),
        displayName: String(data.discordGlobalName || data.discordUsername || "Unknown"),
        avatar: typeof data.discordAvatar === "string" ? data.discordAvatar : null,
        syncedAt, status: !syncedAt ? "never" : Date.now() - syncedAt > 8 * 60 * 60 * 1000 ? "outdated" : "current"
      };
    }).sort((a, b) => (a.syncedAt || 0) - (b.syncedAt || 0));
    return json({
      profiles: rows, totalKnown: knownIds.size, profilesStored: profiles.size,
      missingSnapshots: Math.max(0, knownIds.size - profiles.size),
      current: rows.filter(x => x.status === "current").length,
      outdated: rows.filter(x => x.status === "outdated").length,
      neverSynced: rows.filter(x => x.status === "never").length,
      syncResult
    });
  } catch (error) {
    console.error("Profile monitor failed:", error);
    return json({ error: "Profile monitor could not complete the request." }, 500);
  }
};
