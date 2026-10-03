import {initializeApp,getApps,cert} from "firebase-admin/app";
import {getSessionUser} from "./_shared/discord-auth.mjs";
import {getFirestore} from "firebase-admin/firestore";
let firestore;
function db(){if(firestore)return firestore;const raw=process.env.FIREBASE_SERVICE_ACCOUNT_JSON;if(!raw)throw new Error("Firebase is not configured.");const sa=JSON.parse(raw);if(sa.private_key)sa.private_key=sa.private_key.replace(/\\n/g,"\n");if(!getApps().length)initializeApp({credential:cert(sa)});firestore=getFirestore();return firestore;}
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
async function guildUser(id){const guild=process.env.DISCORD_GUILD_ID,token=process.env.DISCORD_BOT_TOKEN;if(!guild||!token)return null;try{const r=await fetch("https://discord.com/api/v10/guilds/"+encodeURIComponent(guild)+"/members/"+encodeURIComponent(id),{headers:{Authorization:"Bot "+token},signal:AbortSignal.timeout(8000)});if(!r.ok)return null;return(await r.json()).user||null;}catch{return null;}}
function discordAvatar(user,id){if(user?.avatar)return "https://cdn.discordapp.com/avatars/"+id+"/"+user.avatar+".png?size=256";const index=user?.discriminator&&user.discriminator!=="0"?Number(user.discriminator)%5:Number((BigInt(id)>>22n)%6n);return "https://cdn.discordapp.com/embed/avatars/"+index+".png";}
export default async req=>{
 if(req.method!=="GET")return json({error:"Method not allowed."},405);
 if(!getSessionUser(req))return json({error:"Sign in with Discord to view member profiles."},401);
 const id=new URL(req.url).searchParams.get("id")||"";if(!/^\d{17,20}$/.test(id))return json({error:"Invalid member id."},400);
 try{
  const store=db(),[profileSnap,playerSnap,historySnap,achievementSnap,membershipSnap,discordUser]=await Promise.all([
   store.collection("webProfiles").doc(id).get(),store.collection("players").doc(id).get(),
   store.collection("rankHistory").where("userId","==",id).get(),
   store.collection("webAchievements").where("discordId","==",id).get(),
   store.collection("webMemberships").doc(id).get(),guildUser(id)
  ]);
  const membership=membershipSnap.exists?membershipSnap.data()||{}:{};
  if(membership.membershipType==="allies"||(!playerSnap.exists&&membership.membershipType!=="member")||!profileSnap.exists)return json({error:"Member not found."},404);
  const storedProfile=profileSnap.exists?profileSnap.data()||:{};
  const profile={...storedProfile,discordUsername:storedProfile.discordUsername||discordUser?.username||"",discordGlobalName:storedProfile.discordGlobalName||discordUser?.global_name||null};
  const player=playerSnap.exists?playerSnap.data()||:{};
  if(!profile.discordUsername)return json({error:"Member not found."},404);
  const avatar=profile.discordAvatar?"https://cdn.discordapp.com/avatars/"+id+"/"+profile.discordAvatar+".png?size=256":discordUser?discordAvatar(discordUser,id):null;
  const history=historySnap.docs.map(doc=>{const x=doc.data()||{};return{rank:String(x.rank||"").toUpperCase().slice(0,8),previousRank:String(x.previousRank||"").toUpperCase().slice(0,8),kills:Math.max(0,Number(x.kills)||0),previousKills:Math.max(0,Number(x.previousKills)||0),action:String(x.action||"rank_update").slice(0,40),reason:"",timestamp:Number(x.timestamp)||0};}).filter(x=>x.timestamp>0).sort((a,b)=>b.timestamp-a.timestamp).slice(0,20);
  const achievements=achievementSnap.docs.map(doc=>{const x=doc.data()||{};return{id:doc.id,title:String(x.displayName||x.title||"Achievement").slice(0,80),category:String(x.category||"Recognition").slice(0,50),reason:String(x.reason||"").slice(0,300),status:String(x.status||""),date:Number(x.inductedAt||x.createdAt)||0};}).filter(x=>x.status==="published").sort((a,b)=>b.date-a.date).slice(0,20);
  return json({profile:{discordId:id,discordUsername:String(profile.discordUsername).slice(0,32),displayName:String(profile.discordGlobalName||profile.discordUsername).slice(0,64),avatar,robloxUsername:String(player.robloxUsername||profile.robloxUsername||"").slice(0,32)||null,robloxUserId:player.robloxUserId?String(player.robloxUserId):profile.robloxUserId?String(profile.robloxUserId):null,rank:String(player.rank||"E").toUpperCase(),kills:Math.max(0,Number(player.kills)||0),history,achievements}});
 }catch(e){console.error("Member profile failed:",e);return json({error:"Unable to load member profile."},500);}
};