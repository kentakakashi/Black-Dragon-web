import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const allowedFields = ["discordId", "robloxUsername", "kills", "rank", "updatedAt", "verifiedAt"];
let firestore;

function getDatabase() {
  if (firestore) return firestore;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not configured");
  const serviceAccount = JSON.parse(raw);
  if (serviceAccount.private_key) serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
  if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });
  firestore = getFirestore();
  return firestore;
}

export default async () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON === undefined) {
    return new Response(JSON.stringify({ error: "Leaderboard is not configured yet." }), {
      status: 503, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
    });
  }

  try {
    const snapshot = await getDatabase().collection("players").get();
    const players = snapshot.docs.map((doc) => {
      const source = doc.data();
      const player = {};
      for (const field of allowedFields) {
        if (source[field] !== undefined && source[field] !== null) player[field] = source[field];
      }
      if (!player.discordId) player.discordId = doc.id;
      player.kills = Number(player.kills) || 0;
      player.rank = String(player.rank || "E").toUpperCase();
      return player;
    }).filter((player) => player.discordId)
      .sort((a, b) => b.kills - a.kills)
      .slice(0, 100);

    return new Response(JSON.stringify({
      updatedAt: new Date().toISOString(),
      count: players.length,
      players
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch (error) {
    console.error("Leaderboard function failed:", error);
    return new Response(JSON.stringify({ error: "Unable to load leaderboard right now." }), {
      status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
    });
  }
};