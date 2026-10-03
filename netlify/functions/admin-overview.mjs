import {getSessionUser} from "./_shared/discord-auth.mjs";
import {hasAnyWebsitePermission} from "./_shared/staff-access.mjs";
import {initializeApp,getApps,cert} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
let firestore;
function db(){if(firestore)return firestore;const raw=process.env.FIREBASE_SERVICE_ACCOUNT_JSON;if(!raw)throw new Error("Firebase is not configured.");const sa=JSON.parse(raw);if(sa.private_key)sa.private_key=sa.private_key.replace(/\\n/g,"\n");if(!getApps().length)initializeApp({credential:cert(sa)});firestore=getFirestore();return firestore;}
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
async function count(query){const result=await query.count().get();return Number(result.data().count)||0;}
export default async req=>{
  if(req.method!=="GET")return json({error:"Method not allowed."},405);
  const user=getSessionUser(req);
  if(!user)return json({error:"Sign in with Discord first."},401);
  if(!await hasAnyWebsitePermission(user,"ADMIN_DASHBOARD_ROLE_IDS"))return json({error:"Staff dashboard access required."},403);
  try{
    const store=db(),now=Date.now(),guild=process.env.DISCORD_GUILD_ID,botToken=process.env.DISCORD_BOT_TOKEN;
    const oauthKeys=["DISCORD_CLIENT_ID","DISCORD_CLIENT_SECRET","DISCORD_REDIRECT_URI","DISCORD_GUILD_ID","DISCORD_BOT_TOKEN","SESSION_SECRET","SITE_URL","FIREBASE_SERVICE_ACCOUNT_JSON"];
    const [pendingApplications,upcomingEvents,newsDrafts,announcementDrafts,audit,canonicalPlayers,rankHistoryRecords,websiteProfiles,tryoutSnap,guildResponse]=await Promise.all([
      count(store.collection("webApplications").where("status","in",["pending","reviewing","needs_info"])),
      count(store.collection("webEvents").where("status","==","published").where("startsAt",">",now)),
      count(store.collection("webNews").where("status","==","draft")),
      count(store.collection("webAnnouncements").where("status","==","draft")),
      store.collection("webAuditLogs").orderBy("createdAt","desc").limit(6).get(),
      count(store.collection("players")),
      count(store.collection("rankHistory")),
      count(store.collection("webProfiles")),
      store.collection("tryouts").doc("server").get(),
      guild&&botToken?fetch("https://discord.com/api/v10/guilds/"+encodeURIComponent(guild),{headers:{Authorization:"Bot "+botToken},signal:AbortSignal.timeout(8000)}).catch(()=>null):Promise.resolve(null)
    ]);
    const recentActivity=audit.docs.map(d=>{const x=d.data()||{};return{action:String(x.action||"staff_action").slice(0,60),createdAt:Number(x.createdAt)||0};}).filter(x=>x.createdAt>0);
    const tryoutData=tryoutSnap.exists?tryoutSnap.data()||{}:{};
    const connections={
      firebase:{status:"connected",canonicalPlayers,rankHistoryRecords,websiteProfiles},
      discordBot:{status:guildResponse?.ok?"connected":guild&&botToken?"unavailable":"missing_config",guildName:guildResponse?.ok?(await guildResponse.json()).name||"Discord server":null},
      discordOAuth:{status:oauthKeys.every(key=>Boolean(process.env[key]))?"configured":"missing_config"},
      botTryouts:{status:!tryoutSnap.exists?"not_found":tryoutData.active?"active":"no_active_tryout",historyRecords:Array.isArray(tryoutData.history)?tryoutData.history.length:0}
    };
    return json({pendingApplications,upcomingEvents,newsDrafts,announcementDrafts,recentActivity,connections,generatedAt:now});
  }catch(e){console.error("Admin overview failed:",e);return json({error:"The staff overview could not be loaded."},500);}
};