import { createHmac, timingSafeEqual } from "node:crypto";

const cookie = (request,name) => {
  const raw = request.headers.get("cookie") || "";
  const part = raw.split(";").map(x=>x.trim()).find(x=>x.startsWith(name+"="));
  return part ? decodeURIComponent(part.slice(name.length+1)) : "";
};
const redirect = (url,cookieValue) => new Response(null,{status:302,headers:{
  Location:url,
  "Set-Cookie":cookieValue,
  "Cache-Control":"no-store"
}});
const stateCookie = "bd_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0";
const fail = code => redirect(process.env.SITE_URL+"/account?auth="+code,stateCookie);

export default async (request) => {
  const site = process.env.SITE_URL;
  const required = ["DISCORD_CLIENT_ID","DISCORD_CLIENT_SECRET","DISCORD_REDIRECT_URI","DISCORD_GUILD_ID","DISCORD_BOT_TOKEN","SESSION_SECRET","SITE_URL"];
  if (required.some(key=>!process.env[key])) return new Response("Discord sign-in is not configured.",{status:503});
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

    const memberResponse = await fetch("https://discord.com/api/v10/guilds/"+encodeURIComponent(process.env.DISCORD_GUILD_ID)+"/members/"+encodeURIComponent(discordUser.id),{
      headers:{Authorization:"Bot "+process.env.DISCORD_BOT_TOKEN}
    });
    if (memberResponse.status===404) return fail("not_member");
    if (!memberResponse.ok) return fail("membership");
    const member = await memberResponse.json();
    const now = Math.floor(Date.now()/1000);
    const payload = {
      id:String(discordUser.id),
      username:String(discordUser.username || "").slice(0,32),
      globalName:typeof discordUser.global_name==="string" ? discordUser.global_name.slice(0,64) : null,
      avatar:typeof discordUser.avatar==="string" ? discordUser.avatar : null,
      roles:Array.isArray(member.roles) ? member.roles.map(String).slice(0,100) : [],
      iat:now,
      exp:now+60*60*24*7
    };
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = createHmac("sha256",process.env.SESSION_SECRET).update(encoded).digest("base64url");
    const session = encoded+"."+signature;
    return redirect(site+"/account?connected=1",stateCookie.replace("bd_oauth_state=","bd_session="+encodeURIComponent(session)+"; Max-Age="+(60*60*24*7)+";"));
  } catch (error) {
    console.error("Discord OAuth callback failed:",error);
    return fail("callback");
  }
};
