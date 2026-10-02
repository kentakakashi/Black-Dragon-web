import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return new Response(JSON.stringify({ error: "Member directory is not configured yet." }), {
      status: 503, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
    });
  }
  try {
    const snapshot = await getDatabase().collection("players").get();
    const members = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        robloxUsername: typeof data.robloxUsername === "string" ? data.robloxUsername.trim().slice(0, 32) : "",
        kills: Math.max(0, Number(data.kills) || 0),
        rank: String(data.rank || "E").toUpperCase()
      };
    }).filter(member => member.robloxUsername)
      .sort((a,b) => b.kills - a.kills)
      .slice(0, 200);
    return new Response(JSON.stringify({ count: members.length, members, updatedAt: new Date().toISOString() }), {
      status: 200, headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch (error) {
    console.error("Member directory function failed:", error);
    return new Response(JSON.stringify({ error: "Unable to load the member directory." }), {
      status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
    });
  }
};
