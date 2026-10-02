import {getSessionUser} from "./_shared/discord-auth.mjs";
import {hasWebsitePermission} from "./_shared/staff-access.mjs";
import {initializeApp,getApps,cert} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
let firestore;
function db(){if(firestore)return firestore;const raw=process.env.FIREBASE_SERVICE_ACCOUNT_JSON;if(!raw)throw new Error("Firebase is not configured.");const sa=JSON.parse(raw);if(sa.private_key)sa.private_key=sa.private_key.replace(/\\n/g,"\n");if(!getApps().length)initializeApp({credential:cert(sa)});firestore=getFirestore();return firestore;}
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
const safe=(value,max=100)=>String(value??"").replace(/[\u0000-\u001f\u007f]/g,"").slice(0,max);
export default async req=>{
  if(req.method!=="GET")return json({error:"Method not allowed."},405);
  const user=getSessionUser(req);
  if(!user)return json({error:"Sign in with Discord first."},401);
  const store=db();
  if(!await hasWebsitePermission(user,"audit.view","ADMIN_DASHBOARD_ROLE_IDS"))return json({error:"Staff audit access required."},403);
  try{
    const snapshot=await store.collection("webAuditLogs").orderBy("createdAt","desc").limit(200).get();
    const entries=snapshot.docs.map(doc=>{
      const item=doc.data()||{};
      return {
        id:doc.id,
        action:safe(item.action||"staff_action",80),
        createdAt:Number(item.createdAt)||0,
        actorDiscordId:safe(item.reviewerDiscordId||item.actorDiscordId||item.createdBy||"",24),
        targetDiscordId:safe(item.targetDiscordId||"",24),
        status:safe(item.status||"",32),
        referenceId:safe(item.applicationId||item.contentId||item.eventId||"",40)
      };
    }).filter(item=>item.createdAt>0);
    return json({entries,hasMore:snapshot.size===200,generatedAt:Date.now()});
  }catch(error){console.error("Admin audit log failed:",error);return json({error:"The audit log could not be loaded."},500);}
};
