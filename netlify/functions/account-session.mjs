import { createHmac, timingSafeEqual } from "node:crypto";

const json = (body,status=200,extraHeaders={}) => new Response(JSON.stringify(body),{
  status,headers:{"Content-Type":"application/json","Cache-Control":"no-store","X-Content-Type-Options":"nosniff",...extraHeaders}
});
const clearCookie = "bd_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0";
function getCookie(request,name) {
  const raw=request.headers.get("cookie")||"";
  const part=raw.split(";").map(x=>x.trim()).find(x=>x.startsWith(name+"="));
  return part?decodeURIComponent(part.slice(name.length+1)):"";
}
function readSession(request) {
  const secret=process.env.SESSION_SECRET;
  if(!secret || secret.length<32) throw new Error("Session signing is not configured.");
  const value=getCookie(request,"bd_session");
  const split=value.lastIndexOf(".");
  if(split<1) return null;
  const encoded=value.slice(0,split), supplied=value.slice(split+1);
  const expected=createHmac("sha256",secret).update(encoded).digest("base64url");
  const a=Buffer.from(supplied), b=Buffer.from(expected);
  if(a.length!==b.length || !timingSafeEqual(a,b)) return null;
  let payload;
  try { payload=JSON.parse(Buffer.from(encoded,"base64url").toString("utf8")); } catch { return null; }
  if(!payload.exp || payload.exp<=Math.floor(Date.now()/1000)) return null;
  return {
    id:String(payload.id),
    username:String(payload.username||"").slice(0,32),
    globalName:typeof payload.globalName==="string"?payload.globalName.slice(0,64):null,
    avatar:typeof payload.avatar==="string"?payload.avatar:null,
    roles:Array.isArray(payload.roles)?payload.roles.map(String).slice(0,40):[]
  };
}
export default async (request) => {
  if(request.method==="POST") return json({ok:true},200,{"Set-Cookie":clearCookie});
  if(request.method!=="GET") return json({error:"Method not allowed."},405,{Allow:"GET, POST"});
  if(!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length<32) return json({error:"Account sessions are not configured."},503);
  try {
    const user=readSession(request);
    if (!user) return json({ user: null });
    const serviceAccountRaw=process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if(serviceAccountRaw){
      const serviceAccount=JSON.parse(serviceAccountRaw);
      if(serviceAccount.private_key)serviceAccount.private_key=serviceAccount.private_key.replace(/\\n/g,"\n");
      const {getApps,initializeApp,cert}=await import("firebase-admin/app");
      const {getFirestore}=await import("firebase-admin/firestore");
      if(!getApps().length)initializeApp({credential:cert(serviceAccount)});
      const revoked=await getFirestore().collection("webAccessRevocations").doc(user.id).get();
      if(revoked.exists&&Number(revoked.data()?.revokedAt||0)>Number(readSession(request)?.iat||0)*1000)return json({user:null,revoked:true},200,{"Set-Cookie":clearCookie});
    }

    // Session cookies contain a login-time snapshot. Refresh the account card
    // from Discord so avatar/name changes do not require signing out again.
    let current = user;
    if (process.env.DISCORD_BOT_TOKEN) {
      try {
        const response = await fetch("https://discord.com/api/v10/users/" + encodeURIComponent(user.id), {
          headers: { Authorization: "Bot " + process.env.DISCORD_BOT_TOKEN },
          signal: AbortSignal.timeout(5000)
        });
        if (response.ok) {
          const discord = await response.json();
          current = {
            ...user,
            username: String(discord.username || user.username).slice(0, 32),
            globalName: typeof discord.global_name === "string" ? discord.global_name.slice(0, 64) : null,
            avatar: typeof discord.avatar === "string" ? discord.avatar : null
          };
        }
      } catch (error) {
        console.error("Account Discord profile refresh failed:", error);
      }
    }
    return json({ user: current });
  } catch (error) {
    console.error("Account session check failed:",error);
    return json({error:"Account session unavailable."},503);
  }
};
