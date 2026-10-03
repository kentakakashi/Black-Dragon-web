import { initializeApp,getApps,cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
let firestore;
function getDatabase(){if(firestore)return firestore;const raw=process.env.FIREBASE_SERVICE_ACCOUNT_JSON;if(!raw)throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not configured");const sa=JSON.parse(raw);if(sa.private_key)sa.private_key=sa.private_key.replace(/\\n/g,"\n");if(!getApps().length)initializeApp({credential:cert(sa)});firestore=getFirestore();return firestore;}
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json","Cache-Control":"public, max-age=60, stale-while-revalidate=120","X-Content-Type-Options":"nosniff"}});
const LABELS={shadow_monarch:"SHADOW MONARCH",destruction_monarch:"DESTRUCTION MONARCH",white_flame_monarch:"WHITE FLAME MONARCH",frost_monarch:"FROST MONARCH",plague_monarch:"PLAGUE MONARCH",fang_monarch:"FANG MONARCH",monarch_of_beginning:"MONARCH OF BEGINNING",iron_body_monarch:"IRON BODY MONARCH",transfiguration_monarch:"TRANSFIGURATION MONARCH",rising_monarch:"RISING MONARCH"};
function discordAvatar(user,size=96){if(user?.avatar&&user.id)return "https://cdn.discordapp.com/avatars/"+user.id+"/"+user.avatar+".png?size="+size;if(user?.id){const index=user.discriminator&&user.discriminator!=="0"?Number(user.discriminator)%5:Number((BigInt(user.id)>>22n)%6n);return "https://cdn.discordapp.com/embed/avatars/"+index+".png";}return null;}
async function getGuildMembers(){
 const token=process.env.DISCORD_BOT_TOKEN,guild=process.env.DISCORD_GUILD_ID;
 if(!token||!guild)throw new Error("Discord bot token or guild ID is not configured");
 const members=[];let after="";
 for(let page=0;page<20;page++){
  const url=new URL("https://discord.com/api/v10/guilds/"+encodeURIComponent(guild)+"/members");url.searchParams.set("limit","1000");if(after)url.searchParams.set("after",after);
  const response=await fetch(url,{headers:{Authorization:"Bot "+token}});
  if(!response.ok)throw new Error("Discord member lookup failed: "+response.status);
  const batch=await response.json();if(!Array.isArray(batch))throw new Error("Invalid Discord member response");
  members.push(...batch);
  if(batch.length<1000)break;
  after=String(batch[batch.length-1]?.user?.id||"");if(!after)break;
 }
 return members;
}
export default async request=>{
 if(request.method!=="GET")return json({error:"Method not allowed."},405);
 if(!process.env.FIREBASE_SERVICE_ACCOUNT_JSON)return json({error:"Leaderboard is not configured yet."},503);
 try{
  const store=getDatabase(),[snapshot,configSnap,members]=await Promise.all([store.collection("players").get(),store.collection("config").doc("server").get(),getGuildMembers()]);
  const memberById=new Map(members.filter(m=>m.user?.id).map(m=>[String(m.user.id),m.user]));
  const profileRefs=snapshot.docs.map(d=>store.collection("webProfiles").doc(d.id)),profiles=profileRefs.length?await store.getAll(...profileRefs):[];
  const players=snapshot.docs.map((doc,i)=>{
   const source=doc.data()||{},profile=profiles[i]?.exists?profiles[i].data()||{}:{},id=String(doc.id),discordUser=memberById.get(id),profileHasIdentity=Boolean(profile.discordUsername);
   const discordUsername=profileHasIdentity?String(profile.discordUsername).slice(0,32):String(discordUser?.username||"").slice(0,32);
   const displayName=String(profile.discordGlobalName||discordUser?.global_name||discordUsername||"BD Player").slice(0,64);
   const avatar=profile.discordAvatar?"https://cdn.discordapp.com/avatars/"+id+"/"+String(profile.discordAvatar)+".png?size=96":discordAvatar(discordUser,96);
   return{discordId:id,displayName,discordUsername:discordUsername||null,avatar,profileLinked:Boolean(discordUser||profileHasIdentity),robloxUsername:String(profile.robloxUsername||source.robloxUsername||"").slice(0,32)||null,kills:Math.max(0,Number(source.kills)||0),rank:String(source.rank||"E").toUpperCase()};
  }).sort((a,b)=>b.kills-a.kills).slice(0,100);
  const config=configSnap.exists?configSnap.data()||{}:{},roleIds=config.leaderboards?.rankingRoleIds||{},labels=new Map(Object.entries(roleIds).filter(([key,id])=>LABELS[key]&&/^\d{17,20}$/.test(String(id||""))).map(([key,id])=>[String(id),LABELS[key]]));
  const titleHolders=[];
  for(const member of members){const user=member.user;if(!user?.id)continue;for(const role of member.roles||[]){const title=labels.get(String(role));if(title)titleHolders.push({discordId:String(user.id),displayName:String(user.global_name||user.username||"BD Member").slice(0,64),discordUsername:String(user.username||"").slice(0,32),avatar:discordAvatar(user,128),profileLinked:true,robloxUsername:null,title});}}
  const titleRefs=titleHolders.map(h=>store.collection("webProfiles").doc(h.discordId)),titleProfiles=titleRefs.length?await store.getAll(...titleRefs):[];
  const enrichedTitles=titleHolders.map((h,i)=>{const p=titleProfiles[i]?.exists?titleProfiles[i].data()||{}:{};return{...h,displayName:String(p.discordGlobalName||h.displayName).slice(0,64),discordUsername:String(p.discordUsername||h.discordUsername).slice(0,32),avatar:p.discordAvatar?"https://cdn.discordapp.com/avatars/"+h.discordId+"/"+String(p.discordAvatar)+".png?size=128":h.avatar,profileLinked:true,robloxUsername:String(p.robloxUsername||"").slice(0,32)||null};});
  return json({updatedAt:new Date().toISOString(),count:players.length,players,titleHolders:enrichedTitles,titleStatus:enrichedTitles.length?"ready":"empty"});
 }catch(e){console.error("Leaderboard function failed:",e);return json({error:"Unable to load leaderboard right now."},500);}
};