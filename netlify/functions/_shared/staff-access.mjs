import {getFirestore} from "firebase-admin/firestore";
import {hasGuildRole} from "./discord-auth.mjs";
export const WEBSITE_ROLE_OWNER_ID="1105394446230638623";
export const WEBSITE_PERMISSIONS=[
 "applications.review","events.manage","tryouts.manage","content.manage",
 "announcements.manage","audit.view","members.view","members.manage","moderation.manage"
];
export async function hasWebsitePermission(user,permission,legacyPrimary,legacyFallback){
 if(!user)return false;
 if(String(user.id)===WEBSITE_ROLE_OWNER_ID)return true;
 try{
  const store=getFirestore();
  const assignment=await store.collection("webStaffAssignments").doc(String(user.id)).get();
  if(assignment.exists){
   const ids=Array.isArray(assignment.data().roleIds)?assignment.data().roleIds:[];
   if(ids.length){
    const refs=ids.filter(id=>typeof id==="string"&&id.length<100).map(id=>store.collection("webStaffRoles").doc(id));
    const docs=await store.getAll(...refs);
    if(docs.some(doc=>doc.exists&&doc.data().active!==false&&Array.isArray(doc.data().permissions)&&doc.data().permissions.includes(permission)))return true;
   }
  }
 }catch(error){console.error("Website permission lookup failed:",error);return false;}
 if(legacyPrimary&&await hasGuildRole(user,legacyPrimary,legacyFallback))return true;
 return false;
}
