import { createHmac, timingSafeEqual } from "node:crypto";

const json = (body,status=200) => new Response(JSON.stringify(body),{
  status,headers:{"Content-Type":"application/json","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}
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
    roles:Array.isArray(payload.roles)?payload.roles.map(String).slice(0,100):[]
  };
}
export default async (request) => {
  if(request.method==="POST") return json({ok:true},200).headers ? new Response(JSON.stringify({ok:true}),{status:200,headers:{"Content-Type":"application/json","Cache-Control":"no-store","Set-Cookie":clearCookie}}) : json({ok:true});
  if(request.method!=="GET") return json({error:"Method not allowed."},405);
  if(!process.env.SESSION_SECRET) return json({error:"Account sessions are not configured."},503);
  try {
    const user=readSession(request);
    return json({user});
  } catch (error) {
    console.error("Account session check failed:",error);
    return json({error:"Account session unavailable."},503);
  }
};
