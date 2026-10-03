import {initializeApp,getApps,cert} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
let firestore;
function db(){if(firestore)return firestore;const raw=process.env.FIREBASE_SERVICE_ACCOUNT_JSON;if(!raw)throw new Error("Firebase is not configured.");const sa=JSON.parse(raw);if(sa.private_key)sa.private_key=sa.private_key.replace(/\\n/g,"\n");if(!getApps().length)initializeApp({credential:cert(sa)});firestore=getFirestore();return firestore;}
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json","Cache-Control":"public, max-age=120, stale-while-revalidate=300","X-Content-Type-Options":"nosniff"}});
const clean=(v,n)=>String(v||"").replace(/[\u0000-\u001f\u007f]/g,"").trim().slice(0,n);
const safeUrl=v=>{try{const u=new URL(String(v));return u.protocol==="https:"||u.protocol==="http:"?u.toString():null;}catch{return null;}};
export default async req=>{
 if(req.method!=="GET")return json({error:"Method not allowed."},405);
 try{
  const snap=await db().collection("allies").doc("config").get();
  const data=snap.exists?snap.data()||{}:{};
  const clans=(Array.isArray(data.clans)?data.clans:[]).slice(0,50).map((c,i)=>{
   const embed=c.embed&&typeof c.embed==="object"?c.embed:{};
   const leaders=Array.isArray(c.leaderIds)?c.leaderIds.filter(id=>/^\d{17,20}$/.test(String(id))).slice(0,10).map(id=>String(id)):[];
   return{id:clean(c.id,80)||"ally-"+i,name:clean(c.name,100)||"Allied Clan",invite:safeUrl(c.invite),imageUrl:safeUrl(c.imageUrl||embed.image?.url),bannerUrl:safeUrl(c.bannerUrl||c.imageUrl||embed.image?.url),leaders};
  });
  return json({clans});
 }catch(e){console.error("Allied clans endpoint failed:",e);return json({error:"The alliance network is temporarily unavailable."},500);}
};
