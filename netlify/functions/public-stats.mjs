import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let firestore;

function getDatabase() {
  if (firestore) return firestore;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not configured");
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
    "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
    "X-Content-Type-Options": "nosniff"
  }
});

export default async () => {
  try {
    const store = getDatabase();

    // Match the kill leaderboard: every canonical document in players counts.
    // Website membership approval must not affect clan-wide player statistics.
    const playerSnapshot = await store.collection("players").get();
    const playerDocs = playerSnapshot.docs;
    const profileRefs = playerDocs.map(doc => store.collection("webProfiles").doc(doc.id));
    const profiles = profileRefs.length ? await store.getAll(...profileRefs) : [];

    const ranks = { E: 0, D: 0, C: 0, B: 0, A: 0, S: 0, SS: 0, SSS: 0, Z: 0 };
    let totalKills = 0;
    let verifiedProfiles = 0;

    for (let i = 0; i < playerDocs.length; i++) {
      const player = playerDocs[i].data() || {};
      const profile = profiles[i]?.exists ? profiles[i].data() || {} : {};
      const kills = Math.max(0, Math.floor(Number(player.kills) || 0));
      const rank = String(player.rank || "E").toUpperCase();

      totalKills += kills;
      if (profile.discordUsername) verifiedProfiles++;
      if (Object.prototype.hasOwnProperty.call(ranks, rank)) ranks[rank]++;
    }

    const playerRecords = playerDocs.length;

    return json({
      members: playerRecords,
      playerRecords,
      verifiedProfiles,
      totalVerifiedKills: totalKills,
      averageKills: playerRecords ? Math.round(totalKills / playerRecords) : 0,
      rankDistribution: ranks,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Public statistics failed:", error);
    return json({ error: "Statistics unavailable." }, 500);
  }
};
