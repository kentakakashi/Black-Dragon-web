import { initializeApp,getApps,cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
let firestore;
function getDatabase(){if(firestore)return firestore;const raw=process.env.FIREBASE_SERVICE_ACCOUNT_JSON;if(!raw)throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not configured");const sa=JSON.parse(raw);if(sa.private_key)sa.private_key=sa.private_key.replace(/\\n/g,"\n");if(!getApps().length)initializeApp({credential:cert(sa)});firestore=getFirestore();return firestore;}
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json","Cache-Control":"public, max-age=60, stale-while-revalidate=120","X-Content-Type-Options":"nosniff"}});
const LABELS={shadow_monarch:"SHADOW MONARCH",destruction_monarch:"DESTRUCTION MONARCH",white_flame_monarch:"WHITE FLAME MONARCH",frost_monarch:"FROST MONARCH",plague_monarch:"PLAGUE MONARCH",fang_monarch:"FANG MONARCH",monarch_of_beginning:"MONARCH OF BEGINNING",iron_body_monarch:"IRON BODY MONARCH",transfiguration_monarch:"TRANSFIGURATION MONARCH",rising_monarch:"RISING MONARCH"};
async function getTitleHolders(roleIds){
 const token=process.env.DISCORD_BOT_TOKEN,guild=process.env.DISCORD_GUILD_ID;
 const roles=Object.entries(roleIds||{}).filter(([key,id])=>LABELS[key]&&/^\d{17,20}$/.test(String(id||"")));
 if(!token||!guild||!roles.length)return {holders:[],status:"unavailable"};
 const labels=new Map(roles.map(([key,id])=>[String(id),LABELS[key]])),holders=[];let after="";
 try{
  for(let page=0;page<20;page++){
   const url=new URL("https://discord.com/api/v10/guilds/"+encodeURIComponent(guild)+"/members");url.searchParams.set("limit","1000");if(after)url.searchParams.set("after",after);
   const response=await fetch(url,{headers:{Authorization:"Bot "+token}});if(!response.ok)throw new Error("Discord member lookup failed: "+response.status);
   const members=await response.json();if(!Array.isArray(members))throw new Error("Invalid Discord member response");
   for(const m of members){const u=m.user;if(!u?.id)continue;for(const role of (m.roles||[])){const title=labels.get(String(role));if(title)holders.push({discordId:u.id,displayName:String(u.global_name||u.username||"BD Member").slice(0,64),discordUsername:String(u.username||"").slice(0,32),avatar:u.avatar?"https://cdn.discordapp.com/avatars/"+u.id+"/"+u.avatar+".png?size=128":null,profileLinked:false,robloxUsername:null,title});}}
   if(members.length<1000)break;after=String(members[members.length-1]?.user?.id||"");if(!after)break;
  }
  return {holders,status:holders.length?"ready":"empty"};
 }catch(e){console.error("Monarch role lookup failed:",e);return {holders:[],status:"unavailable"};}
}
export default async request=>{
 if(request.method!=="GET")return json({error:"Method not allowed."},405);
 if(!process.env.FIREBASE_SERVICE_ACCOUNT_JSON)return json({error:"Leaderboard is not configured yet."},503);
 try{
  const store=getDatabase(),[snapshot,configSnap]=await Promise.all([store.collection("players").get(),store.collection("config").doc("server").get()]);
  const profileRefs=snapshot.docs.map(d=>store.collection("webProfiles").doc(d.id)),profiles=profileRefs.length?await store.getAll(...profileRefs):[];
  const players=snapshot.docs.map((doc,i)=>{const source=doc.data()||{},profile=profiles[i]?.exists?profiles[i].data()||{}:{},id=doc.id,linked=Boolean(profile.discordUsername);return{discordId:id,displayName:linked?String(profile.discordGlobalName||profile.discordUsername).slice(0,64):"BD Player",discordUsername:linked?String(profile.discordUsername).slice(0,32):null,avatar:linked&&profile.discordAvatar?"https://cdn.discordapp.com/avatars/"+id+"/"+String(profile.discordAvatar)+".png?size=96":null,profileLinked:linked,robloxUsername:String(profile.robloxUsername||source.robloxUsername||"").slice(0,32)||null,kills:Math.max(0,Number(source.kills)||0),rank:String(source.rank||"E").toUpperCase()};}).sort((a,b)=>b.kills-a.kills).slice(0,100);
  const config=configSnap.exists?configSnap.data()||{}:{},roleIds=config.leaderboards?.rankingRoleIds||{},titleResult=await getTitleHolders(roleIds);
  const refs=titleResult.holders.map(h=>store.collection("webProfiles").doc(h.discordId)),titleProfiles=refs.length?await store.getAll(...refs):[];
  const titleHolders=titleResult.holders.map((h,i)=>{const p=titleProfiles[i]?.exists?titleProfiles[i].data()||{}:{};return{...h,displayName:String(p.discordGlobalName||p.discordUsername||h.displayName).slice(0,64),discordUsername:String(p.discordUsername||h.discordUsername).slice(0,32),avatar:p.discordAvatar?"https://cdn.discordapp.com/avatars/"+h.discordId+"/"+String(p.discordAvatar)+".png?size=128":h.avatar,profileLinked:Boolean(p.discordUsername),robloxUsername:String(p.robloxUsername||"").slice(0,32)||null};});
  return json({updatedAt:new Date().toISOString(),count:players.length,players,titleHolders,titleStatus:titleResult.status});
 }catch(e){console.error("Leaderboard function failed:",e);return json({error:"Unable to load leaderboard right now."},500);}
};