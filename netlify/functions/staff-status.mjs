import {getSessionUser} from "./_shared/discord-auth.mjs";
import {hasAnyWebsitePermission,hasWebsitePermission} from "./_shared/staff-access.mjs";
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
export default async req=>{
 if(req.method!=="GET")return json({error:"Method not allowed."},405);
 const user=getSessionUser(req);
 if(!user)return json({signedIn:false,isStaff:false},200);
 const isStaff=await hasAnyWebsitePermission(user,"ADMIN_DASHBOARD_ROLE_IDS");
 const canManageMembers=await hasWebsitePermission(user,"members.manage","APPLICATION_REVIEW_ROLE_IDS");
 return json({signedIn:true,isStaff,canManageMembers,user:{id:user.id,username:user.username,globalName:user.globalName}});
};