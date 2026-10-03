import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const cookie = (request,name) => {
  const raw = request.headers.get("cookie") || "";
  const part = raw.split(";").map(x=>x.trim()).find(x=>x.startsWith(name+"="));
  return part ? decodeURIComponent(part.slice(name.length+1)) : "";
};
const expiredState = "bd_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0";
const redirect = (url,cookieValue) => new Response(null,{status:302,headers:{
  Location:url,
  "Set-Cookie":cookieValue,
  "Cache-Control":"no-store"
}});
const fail = code => redirect(process.env.SITE_URL.replace(/\/$/,"")+"/account?auth="+code,expiredState);

export default async (request) => {
  const required = ["DISCORD_CLIENT_ID","DISCORD_CLIENT_SECRET","DISCORD_REDIRECT_URI","SESSION_SECRET","SITE_URL","FIREBASE_SERVICE_ACCOUNT_JSON"];
  if (required.some(key=>!process.env[key]) || process.env.SESSION_SECRET.length<32) return new Response("Discord sign-in is not configured.",{status:503});
  const site = process.env.SITE_URL.replace(/\/$/,"");
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (url.searchParams.get("error")) return fail("denied");
  const savedState = cookie(request,"bd_oauth_state");
  if (!code || !state || !savedState || state.length!==savedState.length || !timingSafeEqual(Buffer.from(state),Buffer.from(savedState))) return fail("invalid_state");

  try {
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token",{
      method:"POST",
      headers:{"Content-Type":"application/x-www-form-urlencoded"},
      body:new URLSearchParams({
        client_id:process.env.DISCORD_CLIENT_ID,
        client_secret:process.env.DISCORD_CLIENT_SECRET,
        grant_type:"authorization_code",
        code,
        redirect_uri:process.env.DISCORD_REDIRECT_URI
      })
    });
    if (!tokenResponse.ok) return fail("token");
    const token = await tokenResponse.json();
    const userResponse = await fetch("https://discord.com/api/users/@me",{
      headers:{Authorization:"Bearer "+token.access_token}
    });
    if (!userResponse.ok) return fail("identity");
    const discordUser = await userResponse.json();

    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    if (serviceAccount.private_key) serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g,"\n");
    if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });
    await getFirestore().collection("webProfiles").doc(String(discordUser.id)).set({
      discordId:String(discordUser.id),
      discordUsername:String(discordUser.username || "").slice(0,32),
      discordGlobalName:typeof discordUser.global_name==="string" ? discordUser.global_name.slice(0,64) : null,
      discordAvatar:typeof discordUser.avatar==="string" ? discordUser.avatar : null,
      discordProfileUpdatedAt:Date.now()
    },{merge:true});
    const now = Math.floor(Date.now()/1000);
    const payload = {
      id:String(discordUser.id),
      username:String(discordUser.username || "").slice(0,32),
      globalName:typeof discordUser.global_name==="string" ? discordUser.global_name.slice(0,64) : null,
      avatar:typeof discordUser.avatar==="string" ? discordUser.avatar : null,
      roles:[],
      iat:now,
      exp:now+60*60*24*7
    };
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = createHmac("sha256",process.env.SESSION_SECRET).update(encoded).digest("base64url");
    const session = encoded+"."+signature;
    const sessionCookie = "bd_session="+encodeURIComponent(session)+"; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age="+(60*60*24*7);
    return redirect(site+"/account?connected=1",sessionCookie);
  } catch (error) {
    console.error("Discord OAuth callback failed:",error);
    return fail("callback");
  }
};
