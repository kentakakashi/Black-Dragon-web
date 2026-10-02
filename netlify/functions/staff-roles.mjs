import {getSessionUser} from "./_shared/discord-auth.mjs";
import {initializeApp,getApps,cert} from "firebase-admin/app";
import {getFirestore,FieldValue} from "firebase-admin/firestore";

const OWNER_ID="1105394446230638623";
const PERMISSIONS=[
  "applications.review","events.manage","tryouts.manage","content.manage",
  "announcements.manage","audit.view","members.view","members.manage",
  "moderation.manage"
];
let firestore;
function db(){
  if(firestore)return firestore;
  const raw=process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if(!raw)throw new Error("Firebase is not configured.");
  const sa=JSON.parse(raw);
  if(sa.private_key)sa.private_key=sa.private_key.replace(/\\n/g,"\n");
  if(!getApps().length)initializeApp({credential:cert(sa)});
  firestore=getFirestore();return firestore;
}
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
const clean=(v,n)=>String(v??"").replace(/[\u0000-\u001f\u007f]/g,"").trim().slice(0,n);
const validId=v=>/^\d{17,20}$/.test(String(v||""));
export default async req=>{
  const user=getSessionUser(req);
  if(!user)return json({error:"Sign in with Discord first."},401);
  if(user.id!==OWNER_ID)return json({error:"Only the designated Website Role Owner can manage website roles."},403);
  if(!["GET","POST","PATCH","DELETE"].includes(req.method))return json({error:"Method not allowed."},405);
  try{
    const store=db(),rolesCol=store.collection("webStaffRoles"),assignCol=store.collection("webStaffAssignments");
    if(req.method==="GET"){
      const [roles,assignments]=await Promise.all([rolesCol.orderBy("createdAt","asc").get(),assignCol.orderBy("updatedAt","desc").limit(500).get()]);
      return json({
        permissions:PERMISSIONS,
        roles:roles.docs.map(d=>({id:d.id,...d.data()})),
        assignments:assignments.docs.map(d=>({discordId:d.id,...d.data()})),
        ownerDiscordId:OWNER_ID
      });
    }
    let body;try{body=await req.json();}catch{return json({error:"Invalid request body."},400);}
    const now=Date.now();
    if(req.method==="POST"){
      const action=clean(body.action,24);
      if(action==="create_role"){
        const name=clean(body.name,40),description=clean(body.description,180);
        const permissions=Array.isArray(body.permissions)?[...new Set(body.permissions.filter(x=>PERMISSIONS.includes(x)))]:[];
        if(name.length<2||!permissions.length)return json({error:"Enter a role name and select at least one permission."},400);
        const duplicate=await rolesCol.where("nameLower","==",name.toLowerCase()).limit(1).get();
        if(!duplicate.empty)return json({error:"A role with that name already exists."},409);
        const ref=await rolesCol.add({name, nameLower:name.toLowerCase(), description, permissions, active:true, createdAt:now, updatedAt:now, createdBy:user.id});
        await store.collection("webAuditLogs").add({action:"website_role_created",contentId:ref.id,reviewerDiscordId:user.id,createdAt:now});
        return json({ok:true,id:ref.id},201);
      }
      if(action==="assign_role"){
        const discordId=clean(body.discordId,20),roleId=clean(body.roleId,80);
        if(!validId(discordId)||discordId===OWNER_ID)return json({error:"Enter a valid member Discord ID. The owner account is protected."},400);
        const role=await rolesCol.doc(roleId).get();
        if(!role.exists||role.data().active===false)return json({error:"That website role is unavailable."},404);
        const member=await fetch("https://discord.com/api/v10/guilds/"+encodeURIComponent(process.env.DISCORD_GUILD_ID||"")+"/members/"+discordId,{headers:{Authorization:"Bot "+(process.env.DISCORD_BOT_TOKEN||"")},signal:AbortSignal.timeout(8000)});
        if(!member.ok)return json({error:"That Discord account could not be verified as a member of the BD server."},404);
        const ref=assignCol.doc(discordId),snap=await ref.get(),existing=snap.exists&&Array.isArray(snap.data().roleIds)?snap.data().roleIds:[];
        await ref.set({roleIds:[...new Set([...existing,roleId])],updatedAt:now,updatedBy:user.id},{merge:true});
        await store.collection("webAuditLogs").add({action:"website_role_assigned",targetDiscordId:discordId,contentId:roleId,reviewerDiscordId:user.id,createdAt:now});
        return json({ok:true});
      }
      return json({error:"Unknown role action."},400);
    }
    const roleId=clean(body.roleId,80);
    if(req.method==="PATCH"){
      const name=clean(body.name,40),description=clean(body.description,180);
      const permissions=Array.isArray(body.permissions)?[...new Set(body.permissions.filter(x=>PERMISSIONS.includes(x)))]:[];
      if(!roleId||name.length<2||!permissions.length)return json({error:"A role name and at least one permission are required."},400);
      const ref=rolesCol.doc(roleId),snap=await ref.get();
      if(!snap.exists)return json({error:"Role not found."},404);
      const duplicate=await rolesCol.where("nameLower","==",name.toLowerCase()).get();
      if(duplicate.docs.some(d=>d.id!==roleId))return json({error:"A role with that name already exists."},409);
      await ref.update({name,nameLower:name.toLowerCase(),description,permissions,updatedAt:now,updatedBy:user.id});
      await store.collection("webAuditLogs").add({action:"website_role_updated",contentId:roleId,reviewerDiscordId:user.id,createdAt:now});
      return json({ok:true});
    }
    if(body.action==="remove_assignment"){
      const discordId=clean(body.discordId,20);
      if(!validId(discordId)||discordId===OWNER_ID)return json({error:"Invalid or protected Discord account."},400);
      const ref=assignCol.doc(discordId),snap=await ref.get();
      if(!snap.exists)return json({error:"Member has no website roles."},404);
      const ids=(snap.data().roleIds||[]).filter(id=>id!==roleId);
      if(ids.length)await ref.update({roleIds:ids,updatedAt:now,updatedBy:user.id});else await ref.delete();
      await store.collection("webAuditLogs").add({action:"website_role_removed",targetDiscordId:discordId,contentId:roleId,reviewerDiscordId:user.id,createdAt:now});
      return json({ok:true});
    }
    if(!roleId)return json({error:"Role ID is required."},400);
    const ref=rolesCol.doc(roleId),snap=await ref.get();
    if(!snap.exists)return json({error:"Role not found."},404);
    const used=await assignCol.where("roleIds","array-contains",roleId).get();
    const batch=store.batch();
    for(const assignment of used.docs){
      const ids=(assignment.data().roleIds||[]).filter(id=>id!==roleId);
      if(ids.length)batch.update(assignment.ref,{roleIds:ids,updatedAt:now,updatedBy:user.id});else batch.delete(assignment.ref);
    }
    batch.delete(ref);await batch.commit();
    await store.collection("webAuditLogs").add({action:"website_role_deleted",contentId:roleId,reviewerDiscordId:user.id,createdAt:now});
    return json({ok:true});
  }catch(error){console.error("Website role manager failed:",error);return json({error:"The role operation could not be completed."},500);}
};