import {initializeApp,getApps,cert} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
let firestore;
function db(){if(firestore)return firestore;const raw=process.env.FIREBASE_SERVICE_ACCOUNT_JSON;if(!raw)throw new Error("Firebase is not configured.");const sa=JSON.parse(raw);if(sa.private_key)sa.private_key=sa.private_key.replace(/\\n/g,"\n");if(!getApps().length)initializeApp({credential:cert(sa)});firestore=getFirestore();return firestore;}
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json","Cache-Control":"public, max-age=60, stale-while-revalidate=120","X-Content-Type-Options":"nosniff"}});
export default async()=>{
 try{
  const store=db(),[playersSnap,membershipsSnap]=await Promise.all([store.collection("players").get(),store.collection("webMemberships").get()]);
  const playerById=new Map(playersSnap.docs.map(d=>[d.id,d.data()||{}]));
  const membershipById=new Map(membershipsSnap.docs.map(d=>[d.id,d.data()||{}]));
  const ids=new Set();
  for(const d of playersSnap.docs)ids.add(d.id);
  for(const d of membershipsSnap.docs)if(d.data()?.membershipType==="member")ids.add(d.id);
  const eligible=[...ids].filter(id=>membershipById.get(id)?.membershipType!=="allies"&&/^\\d{17,20}$/.test(id));
  const refs=eligible.map(id=>store.collection("webProfiles").doc(id)),profiles=refs.length?await store.getAll(...refs):[];
  const members=eligible.map((id,i)=>{
   const p=playerById.get(id)||{},w=profiles[i]?.exists?profiles[i].data()||{}:{};
   const username=String(w.discordUsername||"").slice(0,32);if(!username)return null;
   const avatar=w.discordAvatar?"https://cdn.discordapp.com/avatars/"+id+"/"+w.discordAvatar+".png?size=128":null;
   return{discordId:id,discordUsername:username,displayName:String(w.discordGlobalName||username).slice(0,64),avatar,robloxUsername:String(p.robloxUsername||w.robloxUsername||"").slice(0,32)||null,kills:Math.max(0,Number(p.kills)||0),rank:String(p.rank||"E").toUpperCase()};
  }).filter(Boolean).sort((a,b)=>b.kills-a.kills||a.displayName.localeCompare(b.displayName)).slice(0,300);
  return json({count:members.length,members,updatedAt:new Date().toISOString()});
 }catch(e){console.error("Member directory failed:",e);return json({error:"Unable to load the member directory."},500);}
};