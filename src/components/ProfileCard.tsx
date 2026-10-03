import { useEffect, useRef, type CSSProperties } from "react";
import "./ProfileCard.css";

export type ProfileCardProps = {
  name: string;
  title: string;
  handle?: string;
  status?: string;
  contactText?: string;
  avatarUrl: string;
  showUserInfo?: boolean;
  enableTilt?: boolean;
  enableMobileTilt?: boolean;
  onContactClick?: () => void;
  iconUrl?: string;
  behindGlowEnabled?: boolean;
  innerGradient?: string;
  className?: string;
};

export default function ProfileCard({
  name,title,handle="",status="",contactText="VIEW PROFILE",avatarUrl,
  showUserInfo=true,enableTilt=true,enableMobileTilt=false,onContactClick,
  iconUrl,behindGlowEnabled=true,innerGradient="linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)",className=""
}:ProfileCardProps){
 const shellRef=useRef<HTMLElement>(null);
 const wrapRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const shell=shellRef.current,wrap=wrapRef.current;
  if(!shell||!wrap||!enableTilt||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  let frame=0;
  const move=(event:PointerEvent)=>{
   if(event.pointerType==="touch"&&!enableMobileTilt)return;
   const rect=shell.getBoundingClientRect();
   const x=Math.max(0,Math.min(100,(event.clientX-rect.left)/rect.width*100));
   const y=Math.max(0,Math.min(100,(event.clientY-rect.top)/rect.height*100));
   cancelAnimationFrame(frame);
   frame=requestAnimationFrame(()=>{
    wrap.style.setProperty("--pc-x",x+"%");
    wrap.style.setProperty("--pc-y",y+"%");
    wrap.style.setProperty("--pc-rotate-x",((50-y)/12)+"deg");
    wrap.style.setProperty("--pc-rotate-y",((x-50)/12)+"deg");
    wrap.style.setProperty("--pc-glow","1");
   });
  };
  const leave=()=>{
   cancelAnimationFrame(frame);
   wrap.style.setProperty("--pc-x","50%");
   wrap.style.setProperty("--pc-y","50%");
   wrap.style.setProperty("--pc-rotate-x","0deg");
   wrap.style.setProperty("--pc-rotate-y","0deg");
   wrap.style.setProperty("--pc-glow","0");
  };
  shell.addEventListener("pointermove",move);
  shell.addEventListener("pointerleave",leave);
  return()=>{cancelAnimationFrame(frame);shell.removeEventListener("pointermove",move);shell.removeEventListener("pointerleave",leave);};
 },[enableTilt,enableMobileTilt]);
 return <div ref={wrapRef} className={`profile-card-wrap ${className}`} style={{"--pc-gradient":innerGradient,"--pc-icon":iconUrl?`url("${iconUrl}")`:"none"} as CSSProperties}>
  {behindGlowEnabled&&<div className="profile-card-behind-glow"/>}
  <section ref={shellRef} className="profile-card-shell" aria-label={name+" profile card"}>
   <div className="profile-card-art">
    <div className="profile-card-pattern"/>
    <div className="profile-card-glare"/>
    <img className="profile-card-avatar" src={avatarUrl} alt={name+" avatar"} loading="lazy" onError={e=>{e.currentTarget.src="https://cdn.discordapp.com/embed/avatars/0.png";}}/>
    <div className="profile-card-top-copy"><span className="profile-card-kicker">BLACK DRAGONS [BD]</span><h3>{name}</h3><p>{title}</p></div>
    {showUserInfo&&<div className="profile-card-user-info">
     <div className="profile-card-user-copy"><span className="profile-card-handle">{handle? "@"+handle : "BLACK DRAGONS MEMBER"}</span><span className="profile-card-status">{status}</span></div>
     <button type="button" className="profile-card-action" onClick={onContactClick}>{contactText}</button>
    </div>}
   </div>
  </section>
 </div>;
}
