import {createHmac,timingSafeEqual} from "node:crypto";
import {initializeApp,getApps,cert} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
let firestore;function db(){if(firestore)return firestore;const raw=process.env.FIREBASE_SERVICE_ACCOUNT_JSON;if(!raw)throw new Error("Firebase is not configured.");const sa=JSON.parse(raw);if(sa.private_key)sa.private_key=sa.private_key.replace(/\\n/g,"\n");if(!getApps().length)initializeApp({credential:cert(sa)});firestore=getFirestore();return firestore;}
function user(req){const secret=process.env.SESSION_SECRET;if(!secret||secret.length<32)return null;const part=(req.headers.get("cookie")||"").split(";").map(x=>x.trim()).find(x=>x.startsWith("bd_session="));if(!part)return null;let v;try{v=decodeURIComponent(part.slice(11));}catch{return null;}const i=v.lastIndexOf(".");if(i<1)return null;const p=v.slice(0,i),s=v.slice(i+1),e=createHmac("sha256",secret).update(p).digest("base64url"),a=Buffer.from(s),b=Buffer.from(e);if(a.length!==b.length||!timingSafeEqual(a,b))return null;try{const x=JSON.parse(Buffer.from(p,"base64url").toString());return x.exp>Date.now()/1000?{id:String(x.id)}:null;}catch{return null;}}
const json=(d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{"Content-Type":"application/json","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
function avatarUrl(id,hash){if(hash)return "https://cdn.discordapp.com/avatars/"+id+"/"+hash+".png?size=96";return "https://cdn.discordapp.com/embed/avatars/"+Number((BigInt(id)>>22n)%6n)+".png";}
async function discordGuildMember(id){
 const guild=process.env.DISCORD_GUILD_ID,token=process.env.DISCORD_BOT_TOKEN;
 if(!guild||!token)return null;
 try{const r=await fetch("https://discord.com/api/v10/guilds/"+encodeURIComponent(guild)+"/members/"+encodeURIComponent(id),{headers:{Authorization:"Bot "+token},signal:AbortSignal.timeout(5000)});if(!r.ok)return null;return await r.json();}catch{return null;}
}
async function discordUser(id){
 const token=process.env.DISCORD_BOT_TOKEN;
 if(!token)return null;
 try{const r=await fetch("https://discord.com/api/v10/users/"+encodeURIComponent(id),{headers:{Authorization:"Bot "+token},signal:AbortSignal.timeout(5000)});if(!r.ok)return null;return await r.json();}catch{return null;}
}
function publicTryout(t){
 if(!t)return null;
 return{id:String(t.id||""),status:String(t.status||"unknown"),createdAt:Number(t.createdAt)||0,endedAt:Number(t.endedAt)||0,serverLink:typeof t.serverLink==="string"&&t.serverLink.startsWith("https://")?t.serverLink:null,
 results:(Array.isArray(t.results)?t.results:[]).map((r,i)=>({id:String(r.id||""),match:Number(r.matchNumber)||i+1,winnerId:String(r.winnerId||""),loserId:String(r.loserId||""),recordedById:String(r.recordedBy||""),winnerKills:Math.max(0,Number(r.winnerKills)||0),loserKills:Math.max(0,Number(r.loserKills)||0),winnerTotalWins:Math.max(0,Number(r.winnerTotalWins)||0),timestamp:Number(r.timestamp)||0}))};
}
async function enrichTryout(t,store){
 const safe=publicTryout(t);if(!safe)return null;
 const ids=[...new Set(safe.results.flatMap(r=>[r.winnerId,r.loserId,r.recordedById]).filter(id=>/^\d{17,20}$/.test(id)))];
 if(!ids.length)return {...safe,results:safe.results.map(r=>({...r,winnerName:"Discord member",loserName:"Discord member",recordedByName:"Staff member",winnerAvatar:null,loserAvatar:null}))};
 const profileSnaps=await store.getAll(...ids.map(id=>store.collection("webProfiles").doc(id)));
 const playerSnaps=await store.getAll(...ids.map(id=>store.collection("players").doc(id)));
 const people={};
 for(let i=0;i<ids.length;i++){
  const id=ids[i],profile=profileSnaps[i]?.exists?profileSnaps[i].data()||{}:{},player=playerSnaps[i]?.exists?playerSnaps[i].data()||{}:{};
  const name=String(profile.discordGlobalName||profile.discordUsername||player.discordGlobalName||player.discordUsername||"").trim();
  people[id]={name,avatar:profile.discordAvatar?avatarUrl(id,profile.discordAvatar):null};
 }
 const needsLookup=ids.filter(id=>!people[id].name||!people[id].avatar);
 for(let i=0;i<needsLookup.length;i+=5){
  await Promise.all(needsLookup.slice(i,i+5).map(async id=>{
   const member=await discordGuildMember(id);
   let u=member?.user||null;
   if(!u)u=await discordUser(id);
   if(!u)return;
   if(!people[id].name)people[id].name=String(u.global_name||member?.nick||u.username||"Discord member");
   if(!people[id].avatar)people[id].avatar=avatarUrl(id,u.avatar);
  }));
 }
 const person=id=>people[id]||{name:"Discord member",avatar:null};
 return {...safe,results:safe.results.map(r=>({...r,winnerName:person(r.winnerId).name||"Discord member",loserName:person(r.loserId).name||"Discord member",recordedByName:person(r.recordedById).name||"Staff member",winnerAvatar:person(r.winnerId).avatar,loserAvatar:person(r.loserId).avatar}))};
}
export default async req=>{
 try{
  const store=db();
  const snap=await store.collection("tryouts").doc("server").get();
  const raw=snap.exists?snap.data():{};
  if(req.method==="GET"){
   const u=user(req);
   if(!u)return json({error:"Sign in with Discord to view tryout records."},401);
   const [active,history]=await Promise.all([
    enrichTryout(raw.active,store),
    Promise.all((Array.isArray(raw.history)?raw.history:[]).map(t=>enrichTryout(t,store)))
   ]);
   const sortedHistory=history.filter(Boolean).sort((a,b)=>b.createdAt-a.createdAt).slice(0,12);
   let registration=null;
   if(u&&active){
    const r=await store.collection("webTryoutRegistrations").doc(active.id+"_"+u.id).get();
    if(r.exists){const x=r.data();registration={status:String(x.status||"registered"),registeredAt:Number(x.registeredAt)||0};}
   }
   return json({active,history:sortedHistory,registration,signedIn:true});
  }
  if(req.method!=="POST")return json({error:"Method not allowed."},405);
  const u=user(req);
  if(!u)return json({error:"Sign in with Discord to register."},401);
  const active=publicTryout(raw.active);
  if(!active||active.status!=="active")return json({error:"There is no active tryout accepting registrations."},409);
  const profile=await store.collection("webProfiles").doc(u.id).get(),p=profile.exists?profile.data():{};
  if(!p.robloxUserId||!p.robloxUsername)return json({error:"Link and verify your Roblox account before registering."},400);
  const ref=store.collection("webTryoutRegistrations").doc(active.id+"_"+u.id);
  const result=await store.runTransaction(async tx=>{
   const existing=await tx.get(ref);
   if(existing.exists)return false;
   tx.create(ref,{tryoutId:active.id,discordId:u.id,robloxUserId:String(p.robloxUserId),robloxUsername:String(p.robloxUsername).slice(0,32),status:"registered",registeredAt:Date.now()});
   return true;
  });
  return json({ok:true,alreadyRegistered:!result,message:result?"Your place has been registered.":"You're already registered for this tryout."},result?201:200);
 }catch(e){
  console.error("Tryout portal failed:",e);
  return json({error:"Tryout information is temporarily unavailable."},500);
 }
};
