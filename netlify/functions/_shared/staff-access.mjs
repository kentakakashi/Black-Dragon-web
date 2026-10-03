import {getFirestore} from "firebase-admin/firestore";
import {hasGuildRole} from "./discord-auth.mjs";
export const WEBSITE_ROLE_OWNER_ID="1105394446230638623";
export const WEBSITE_PERMISSIONS=[
 "applications.review","events.manage","tryouts.manage","content.manage",
 "announcements.manage","audit.view","members.view","members.manage","moderation.manage"
];
async function assignedPermissions(user){
 const store=getFirestore();
 const assignment=await store.collection("webStaffAssignments").doc(String(user.id)).get();
 if(!assignment.exists)return null;
 const ids=Array.isArray(assignment.data().roleIds)?assignment.data().roleIds:[];
 const refs=ids.filter(id=>typeof id==="string"&&/^[A-Za-z0-9_-]{1,80}$/.test(id)).map(id=>store.collection("webStaffRoles").doc(id));
 if(!refs.length)return [];
 const docs=await store.getAll(...refs);
 return docs.filter(doc=>doc.exists&&doc.data().active!==false).flatMap(doc=>Array.isArray(doc.data().permissions)?doc.data().permissions:[]);
}
export async function hasWebsitePermission(user,permission,legacyPrimary,legacyFallback){
 if(!user)return false;
 if(String(user.id)===WEBSITE_ROLE_OWNER_ID)return true;
 try{
  const permissions=await assignedPermissions(user);
  if(permissions!==null)return permissions.includes(permission);
 }catch(error){console.error("Website permission lookup failed:",error);return false;}
 if(legacyPrimary&&await hasGuildRole(user,legacyPrimary,legacyFallback))return true;
 return false;
}
export async function hasAnyWebsitePermission(user,legacyPrimary,legacyFallback){
 if(!user)return false;
 if(String(user.id)===WEBSITE_ROLE_OWNER_ID)return true;
 try{
  const permissions=await assignedPermissions(user);
  if(permissions!==null)return permissions.some(permission=>WEBSITE_PERMISSIONS.includes(permission));
 }catch(error){console.error("Website permission lookup failed:",error);return false;}
 return Boolean(legacyPrimary&&await hasGuildRole(user,legacyPrimary,legacyFallback));
}
