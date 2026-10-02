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
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json","Cache-Control":"public, max-age=60, stale-while-revalidate=120","X-Content-Type-Options":"nosniff"}});
export default async request => {
  if(request.method!=="GET")return json({error:"Method not allowed."},405);
  if(!process.env.FIREBASE_SERVICE_ACCOUNT_JSON)return json({error:"Leaderboard is not configured yet."},503);
  try {
    const store=getDatabase(),snapshot=await store.collection("players").get();
    const profileRefs=snapshot.docs.map(doc=>store.collection("webProfiles").doc(doc.id));
    const profiles=profileRefs.length?await store.getAll(...profileRefs):[];
    const players=snapshot.docs.map((doc,index)=>{
      const source=doc.data()||{},profile=profiles[index]?.exists?profiles[index].data()||{}:{};
      const id=doc.id,linked=Boolean(profile.discordUsername);
      return {
        discordId:id,
        displayName:linked?String(profile.discordGlobalName||profile.discordUsername).slice(0,64):"BD Player",
        discordUsername:linked?String(profile.discordUsername).slice(0,32):null,
        avatar:linked&&profile.discordAvatar?"https://cdn.discordapp.com/avatars/"+id+"/"+String(profile.discordAvatar)+".png?size=96":null,
        profileLinked:linked,
        robloxUsername:String(profile.robloxUsername||source.robloxUsername||"").slice(0,32)||null,
        kills:Math.max(0,Number(source.kills)||0),
        rank:String(source.rank||"E").toUpperCase()
      };
    }).sort((a,b)=>b.kills-a.kills).slice(0,100);
    return json({updatedAt:new Date().toISOString(),count:players.length,players});
  } catch(error) {
    console.error("Leaderboard function failed:",error);
    return json({error:"Unable to load leaderboard right now."},500);
  }
};