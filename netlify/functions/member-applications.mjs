import {getSessionUser} from "./_shared/discord-auth.mjs";
import {hasWebsitePermission} from "./_shared/staff-access.mjs";
import {initializeApp,getApps,cert} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
let firestore;
function db(){if(firestore)return firestore;const raw=process.env.FIREBASE_SERVICE_ACCOUNT_JSON;if(!raw)throw new Error("Firebase is not configured.");const sa=JSON.parse(raw);if(sa.private_key)sa.private_key=sa.private_key.replace(/\\n/g,"\n");if(!getApps().length)initializeApp({credential:cert(sa)});firestore=getFirestore();return firestore;}
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});

async function fetchGuildMembers(){
 const guild=process.env.DISCORD_GUILD_ID,token=process.env.DISCORD_BOT_TOKEN;if(!guild||!token)return [];
 try{const all=[];let after="";for(let page=0;page<20;page++){const url=new URL("https://discord.com/api/v10/guilds/"+encodeURIComponent(guild)+"/members");url.searchParams.set("limit","1000");if(after)url.searchParams.set("after",after);const response=await fetch(url,{headers:{Authorization:"Bot "+token},signal:AbortSignal.timeout(9000)});if(!response.ok)throw new Error("Discord membership lookup failed");const batch=await response.json();if(!Array.isArray(batch))break;all.push(...batch);if(batch.length<1000)break;after=String(batch[batch.length-1]?.user?.id||"");if(!after)break;}return all;}catch(error){console.error("Membership queue server lookup failed:",error);return [];}
}
export default async req=>{
 const user=getSessionUser(req);if(!user)return json({error:"Sign in with Discord first."},401);
 const store=db();if(!await hasWebsitePermission(user,"members.manage","APPLICATION_REVIEW_ROLE_IDS"))return json({error:"You do not have permission to assign website membership."},403);
 try{
  const apps=store.collection("webApplications");
  if(req.method==="GET"){
   const snap=await apps.orderBy("submittedAt","desc").limit(250).get();
   const membershipApps=snap.docs.filter(d=>d.data()?.type==="clan_membership").slice(0,150);
   const [allProfilesSnap,allMembershipsSnap,guildMemberList]=await Promise.all([store.collection("webProfiles").limit(1000).get(),store.collection("webMemberships").get(),fetchGuildMembers()]);
   const guildIds=new Set(guildMemberList.map(member=>String(member.user?.id||"")).filter(Boolean));
   const assignedIds=new Set(allMembershipsSnap.docs.filter(d=>["member","allies"].includes(d.data()?.membershipType)).map(d=>d.id));
   const pendingIds=new Set(membershipApps.filter(d=>["pending","reviewing","needs_info"].includes(String(d.data()?.status||"pending"))).map(d=>String(d.data()?.discordId||"")));
   const existingAccounts=allProfilesSnap.docs.filter(d=>/^\d{17,20}$/.test(d.id)&&!assignedIds.has(d.id)&&!pendingIds.has(d.id)).map(d=>{const p=d.data()||{};return{discordId:d.id,discordUsername:String(p.discordUsername||"").slice(0,32),displayName:String(p.discordGlobalName||p.discordUsername||"Discord user").slice(0,64),avatar:p.discordAvatar?"https://cdn.discordapp.com/avatars/"+d.id+"/"+p.discordAvatar+".png?size=128":null,createdAt:Number(p.createdAt||p.firstLoginAt||p.updatedAt)||0,isInServer:guildIds.has(d.id)};}).filter(a=>a.discordUsername||a.displayName!=="Discord user").sort((a,b)=>a.displayName.localeCompare(b.displayName));
   const ids=[...new Set(snap.docs.map(d=>String(d.data().discordId||"")).filter(id=>/^\d{17,20}$/.test(id)))];
   const refs=ids.map(id=>store.collection("webProfiles").doc(id)),profiles=refs.length?await store.getAll(...refs):[];
   const byId=new Map(ids.map((id,i)=>[id,profiles[i]?.exists?profiles[i].data()||{}:{}]));
   const memberships=ids.map(id=>store.collection("webMemberships").doc(id)),memberDocs=memberships.length?await store.getAll(...memberships):[];
   const membershipById=new Map(ids.map((id,i)=>[id,memberDocs[i]?.exists?memberDocs[i].data()||{}:{}]));
   return json({existingAccounts,applications:membershipApps.map(d=>{const a=d.data()||{},id=String(a.discordId||""),p=byId.get(id)||{},m=membershipById.get(id)||{};return{id:d.id,discordId:id,discordUsername:String(a.discordUsername||p.discordUsername||"").slice(0,32),displayName:String(a.discordGlobalName||p.discordGlobalName||a.discordUsername||"Applicant").slice(0,64),avatar:p.discordAvatar&&id?"https://cdn.discordapp.com/avatars/"+id+"/"+p.discordAvatar+".png?size=128":null,type:a.type,status:a.status,submittedAt:Number(a.submittedAt)||0,answers:a.answers||{},staffFeedback:a.staffFeedback||null,membershipType:m.membershipType||null,isInServer:guildIds.has(id)};})});
  }
  if(req.method!=="PATCH")return json({error:"Method not allowed."},405);
  const body=await req.json().catch(()=>null);if(!body)return json({error:"Invalid request."},400);
  const decision=String(body.decision||"");
  if(body.action==="random_kid"){
   const target=String(body.targetDiscordId||"");
   if(!/^\\d{17,20}$/.test(target))return json({error:"Choose a valid Discord account."},400);
   const [profile,membership,applicationSnap]=await Promise.all([store.collection("webProfiles").doc(target).get(),store.collection("webMemberships").doc(target).get(),store.collection("webApplications").where("discordId","==",target).get()]);
   if(!profile.exists&&!membership.exists&&!applicationSnap.size)return json({error:"No stored website data remains for this account."},404);
   const batch=store.batch(),now=Date.now();
   if(profile.exists)batch.delete(profile.ref);
   if(membership.exists)batch.delete(membership.ref);
   applicationSnap.docs.forEach(doc=>batch.delete(doc.ref));
   batch.set(store.collection("webAccessRevocations").doc(target),{discordId:target,revokedAt:now,revokedBy:user.id,reason:"staff_removed_as_unassigned_account"});
   batch.set(store.collection("webAuditLogs").doc(),{action:"unassigned_account_removed",actorDiscordId:user.id,targetDiscordId:target,createdAt:now});
   await batch.commit();
   return json({ok:true,removed:true});
  }
  if(body.action==="assign_existing"){
   const target=String(body.targetDiscordId||"");
   if(!/^\d{17,20}$/.test(target)||!["member","allies"].includes(decision))return json({error:"Choose a valid existing account and membership type."},400);
   const profile=await store.collection("webProfiles").doc(target).get();if(!profile.exists)return json({error:"That existing website account could not be found."},404);
   const membershipRef=store.collection("webMemberships").doc(target),current=await membershipRef.get();if(current.exists&&["member","allies"].includes(current.data()?.membershipType))return json({error:"This account already has a membership assignment."},409);
   if(decision==="member"){
    const guild=process.env.DISCORD_GUILD_ID,token=process.env.DISCORD_BOT_TOKEN;if(!guild||!token)return json({error:"Discord server membership verification is not configured."},503);
    const membership=await fetch("https://discord.com/api/v10/guilds/"+encodeURIComponent(guild)+"/members/"+encodeURIComponent(target),{headers:{Authorization:"Bot "+token},signal:AbortSignal.timeout(8000)});
    if(membership.status===404)return json({error:"This account must be in the official BLACK DRAGONS Discord before being assigned as a member. You can assign it as an ally instead."},409);
    if(!membership.ok)return json({error:"Discord could not verify this account right now. Try again shortly."},503);
   }
   const now=Date.now(),batch=store.batch();batch.set(membershipRef,{discordId:target,membershipType:decision,source:"existing_website_account",assignedBy:user.id,assignedAt:now,updatedAt:now},{merge:true});batch.set(store.collection("webAuditLogs").doc(),{action:"existing_account_assigned_"+decision,actorDiscordId:user.id,targetDiscordId:target,createdAt:now});await batch.commit();return json({ok:true,membershipType:decision});
  }
  const id=String(body.id||""),feedback=String(body.feedback||"").trim().slice(0,800);
  if(!/^[A-Za-z0-9]{15,40}$/.test(id)||!["member","allies","rejected","reviewing","needs_info"].includes(decision))return json({error:"Choose a valid membership decision."},400);
  const ref=apps.doc(id),snap=await ref.get();if(!snap.exists||snap.data().type!=="clan_membership")return json({error:"Member application not found."},404);
  const target=String(snap.data().discordId||"");if(!/^\d{17,20}$/.test(target))return json({error:"The applicant's Discord identity is invalid."},400);
  if(decision==="member"){
   const guild=process.env.DISCORD_GUILD_ID,token=process.env.DISCORD_BOT_TOKEN;
   if(!guild||!token)return json({error:"Discord server membership verification is not configured."},503);
   const membership=await fetch("https://discord.com/api/v10/guilds/"+encodeURIComponent(guild)+"/members/"+encodeURIComponent(target),{headers:{Authorization:"Bot "+token},signal:AbortSignal.timeout(8000)});
   if(membership.status===404)return json({error:"This applicant must join the official BLACK DRAGONS Discord before being assigned as a member. You can still assign them as an ally."},409);
   if(!membership.ok)return json({error:"Discord could not verify this applicant's server membership. Try again shortly."},503);
  }
  const now=Date.now(),status=decision==="rejected"?"rejected":decision==="reviewing"?"reviewing":decision==="needs_info"?"needs_info":"accepted";
  const batch=store.batch();
  batch.update(ref,{status,staffFeedback:feedback||null,reviewerDiscordId:user.id,reviewedAt:now,updatedAt:now,membershipDecision:decision==="member"||decision==="allies"?decision:null});
  if(decision==="member"||decision==="allies"){
   batch.set(store.collection("webMemberships").doc(target),{discordId:target,membershipType:decision,sourceApplicationId:id,assignedBy:user.id,assignedAt:now,updatedAt:now},{merge:true});
  }
  batch.set(store.collection("webAuditLogs").doc(),{action:"member_application_"+decision,actorDiscordId:user.id,targetDiscordId:target,referenceId:id,status,createdAt:now});
  await batch.commit();
  return json({ok:true,status,membershipType:decision==="member"||decision==="allies"?decision:null});
 }catch(e){console.error("Member application management failed:",e);return json({error:"The membership decision could not be saved."},500);}
};