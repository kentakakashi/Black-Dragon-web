import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let firestore;
function getDatabase() {
  if (firestore) return firestore;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("Firebase is not configured.");
  const serviceAccount = JSON.parse(raw);
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
  }
  if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });
  firestore = getFirestore();
  return firestore;
}

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  }
});

async function guildUsers() {
  const guild = process.env.DISCORD_GUILD_ID;
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!guild || !token) return [];

  try {
    const all = [];
    let after = "";
    for (let page = 0; page < 20; page++) {
      const url = new URL("https://discord.com/api/v10/guilds/" + encodeURIComponent(guild) + "/members");
      url.searchParams.set("limit", "1000");
      if (after) url.searchParams.set("after", after);
      const response = await fetch(url, {
        headers: { Authorization: "Bot " + token },
        signal: AbortSignal.timeout(9000)
      });
      if (!response.ok) break;
      const batch = await response.json();
      if (!Array.isArray(batch)) break;
      all.push(...batch);
      if (batch.length < 1000) break;
      after = String(batch[batch.length - 1]?.user?.id || "");
      if (!after) break;
    }
    return all;
  } catch (error) {
    console.error("Member directory Discord lookup failed:", error);
    return [];
  }
}

function avatar(user, id) {
  if (user?.avatar && user.id) {
    return "https://cdn.discordapp.com/avatars/" + id + "/" + user.avatar + ".png?size=128";
  }
  const index = user?.discriminator && user.discriminator !== "0"
    ? Number(user.discriminator) % 5
    : Number((BigInt(id) >> 22n) % 6n);
  return "https://cdn.discordapp.com/embed/avatars/" + index + ".png";
}

export default async () => {
  try {
    const store = getDatabase();
    const [playersSnapshot, profilesSnapshot, membershipsSnapshot, guildMembers] = await Promise.all([
      store.collection("players").get(),
      store.collection("webProfiles").get(),
      store.collection("webMemberships").get(),
      guildUsers()
    ]);

    const validId = id => /^\d{17,20}$/.test(String(id));
    const playerById = new Map(
      playersSnapshot.docs.filter(doc => validId(doc.id)).map(doc => [doc.id, doc.data() || {}])
    );
    const profileById = new Map(
      profilesSnapshot.docs.filter(doc => validId(doc.id)).map(doc => [doc.id, doc.data() || {}])
    );
    const membershipById = new Map(
      membershipsSnapshot.docs.filter(doc => validId(doc.id)).map(doc => [doc.id, doc.data() || {}])
    );
    const discordById = new Map(
      guildMembers.filter(member => member.user?.id)
        .map(member => [String(member.user.id), member.user])
    );

    // The directory is the union of bot leaderboard players, Discord accounts
    // that signed into the website, and accounts explicitly assigned a membership.
    // Discord IDs are the shared key, so users appearing in multiple sources show once.
    const ids = [...new Set([
      ...playerById.keys(),
      ...profileById.keys(),
      ...membershipById.keys()
    ])];

    const members = ids.map(id => {
      const player = playerById.get(id) || {};
      const profile = profileById.get(id) || {};
      const discord = discordById.get(id) || {};
      const hasPlayerRecord = playerById.has(id);

      const discordUsername = String(
        profile.discordUsername || discord.username ||
        player.discordUsername || player.username || "Discord member"
      ).slice(0, 32);

      const displayName = String(
        profile.discordGlobalName || discord.global_name ||
        player.displayName || discordUsername
      ).slice(0, 64);

      // Live Discord data wins over the stored snapshot.
      const avatarUrl = discord.id
        ? avatar(discord, id)
        : profile.discordAvatar
          ? "https://cdn.discordapp.com/avatars/" + id + "/" + profile.discordAvatar + ".png?size=128"
          : avatar(discord, id);

      // Keep only Discord identity fields fresh; game data remains bot-owned.
      if (discord.id) {
        store.collection("webProfiles").doc(id).set({
          discordId: id,
          discordUsername: String(discord.username || profile.discordUsername || "").slice(0, 32),
          discordGlobalName: typeof discord.global_name === "string" ? discord.global_name.slice(0, 64) : null,
          discordAvatar: typeof discord.avatar === "string" ? discord.avatar : null,
          discordProfileSyncedAt: Date.now()
        }, { merge: true }).catch(error => console.error("Discord profile snapshot update failed:", error));
      }

      return {
        discordId: id,
        discordUsername,
        displayName,
        avatar: avatarUrl,
        robloxUsername: String(player.robloxUsername || profile.robloxUsername || "").slice(0, 32) || null,
        robloxUserId: player.robloxUserId
          ? String(player.robloxUserId)
          : profile.robloxUserId ? String(profile.robloxUserId) : null,
        kills: Math.max(0, Number(player.kills) || 0),
        rank: hasPlayerRecord && player.rank ? String(player.rank).toUpperCase() : "UNRANKED",
        hasPlayerRecord,
        membershipType: membershipById.get(id)?.membershipType || null
      };
    }).sort((a, b) => b.kills - a.kills || a.displayName.localeCompare(b.displayName))
      .slice(0, 300);

    return json({
      count: members.length,
      members,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Member directory failed:", error);
    return json({ error: "Unable to load the member directory." }, 500);
  }
};
