import { randomBytes } from "node:crypto";

const json = (body, status=200, headers={}) => new Response(JSON.stringify(body), {
  status, headers: { "Content-Type":"application/json", "Cache-Control":"no-store", ...headers }
});

export default async (request) => {
  if (request.method !== "GET") return json({ error:"Method not allowed." },405,{Allow:"GET"});
  const required = ["DISCORD_CLIENT_ID","DISCORD_REDIRECT_URI","SITE_URL"];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length) return json({ error:"Discord sign-in is not configured." },503);
  const state = randomBytes(32).toString("hex");
  const authorize = new URL("https://discord.com/oauth2/authorize");
  authorize.search = new URLSearchParams({
    client_id:process.env.DISCORD_CLIENT_ID,
    redirect_uri:process.env.DISCORD_REDIRECT_URI,
    response_type:"code",
    scope:"identify",
    state
  }).toString();
  return new Response(null,{status:302,headers:{
    Location:authorize.toString(),
    "Set-Cookie":`bd_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
    "Cache-Control":"no-store"
  }});
};
