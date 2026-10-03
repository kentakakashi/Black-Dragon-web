import {initializeApp,getApps,cert} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
let firestore;
function db(){if(firestore)return firestore;const raw=process.env.FIREBASE_SERVICE_ACCOUNT_JSON;if(!raw)throw new Error("Firebase is not configured.");const sa=JSON.parse(raw);if(sa.private_key)sa.private_key=sa.private_key.replace(/\\n/g,"\n");if(!getApps().length)initializeApp({credential:cert(sa)});firestore=getFirestore();return firestore;}
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json","Cache-Control":"public, max-age=60, stale-while-revalidate=120","X-Content-Type-Options":"nosniff"}});
async function guildUsers(){const guild=process.env.DISCORD_GUILD_ID,token=process.env.DISCORD_BOT_TOKEN;if(!guild||!token)return[];try{const all=[];let after="";for(let i=0;i<20;i++){const url=new URL("https://discord.com/api/v10/guilds/"+encodeURIComponent(guild)+"/members");url.searchParams.set("limit","1000");if(after)url.searchParams.set("after",after);const r=await fetch(url,{headers:{Authorization:"Bot "+token},signal:AbortSignal.timeout(9000)});if(!r.ok)break;const batch=await r.json();if(!Array.isArray(batch))break;all.push(...batch);if(batch.length<1000)break;after=String(batch[batch.length-1]?.user?.id||"");if(!after)break;}return all;}catch(e){console.error("Member directory Discord lookup failed:",e);return[];}}
function avatar(user,id){if(user?.avatar&&user.id)return "https://cdn.discordapp.com/avatars/"+id+"/"+user.avatar+".png?size=128";if(user?.id){const index=user.discriminator&&user.discriminator!=="0"?Number(user.discriminator)%5:Number((BigInt(user.id)>>22n)%6n);return "https://cdn.discordapp.com/embed/avatars/"+index+".png";}return null;}
export default async()=>{
 try{
  const store=db(),[playersSnap,membershipsSnap,guildMembers]=await Promise.all([store.collection("players").get(),store.collection("webMemberships").get(),guildUsers()]);
  const discordById=new Map(guildMembers.filter(m=>m.user?.id).map(m=>[String(m.user.id),m.user]));
  const playerById=new Map(playersSnap.docs.map(d=>[d.id,d.data()||{}]));
  const membershipById=new Map(membershipsSnap.docs.map(d=>[d.id,d.data()||{}]));
  const ids=new Set();
  for(const d of membershipsSnap.docs)if(d.data()?.membershipType==="member")ids.add(d.id);
  const eligible=[...ids].filter(id=>membershipById.get(id)?.membershipType!=="allies"&&/^\d{17,20}$/.test(id));
  const refs=eligible.map(id=>store.collection("webProfiles").doc(id)),profiles=refs.length?await store.getAll(...refs):[];
  const members=eligible.map((id,i)=>{
   const p=playerById.get(id)||{},w=profiles[i]?.exists?profiles[i].data()||{}:{};
   const discord=discordById.get(id)||{},username=String(w.discordUsername||discord.username||"").slice(0,32);if(!username)return null;
   const avatarUrl=w.discordAvatar?"https://cdn.discordapp.com/avatars/"+id+"/"+w.discordAvatar+".png?size=128":avatar(discord,id);
   return{discordId:id,discordUsername:username,displayName:String(w.discordGlobalName||discord.global_name||username).slice(0,64),avatar:avatarUrl,robloxUsername:String(p.robloxUsername||w.robloxUsername||"").slice(0,32)||null,robloxUserId:p.robloxUserId?String(p.robloxUserId):w.robloxUserId?String(w.robloxUserId):null,kills:Math.max(0,Number(p.kills)||0),rank:String(p.rank||"E").toUpperCase()};
  }).filter(Boolean).sort((a,b)=>b.kills-a.kills||a.displayName.localeCompare(b.displayName)).slice(0,300);
  return json({count:members.length,members,updatedAt:new Date().toISOString()});
 }catch(e){console.error("Member directory failed:",e);return json({error:"Unable to load the member directory."},500);}
};