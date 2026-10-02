import { useEffect, useState } from "react";
import { ArrowRight, Crown, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { ParticleField } from "../components/ParticleField";

type Player = { discordId:string; robloxUsername?:string; kills:number; rank:string };
type State = "loading"|"ready"|"setup"|"error";
export function LeaderboardPage() {
  const [players,setPlayers] = useState<Player[]>([]);
  const [state,setState] = useState<State>("loading");
  const [updatedAt,setUpdatedAt] = useState("");
  useEffect(() => {
    let active = true;
    fetch("/.netlify/functions/leaderboard").then(async response => {
      if(response.status===503) throw new Error("setup");
      if(!response.ok) throw new Error("request");
      return response.json();
    }).then((data:{players?:Player[];updatedAt?:string})=>{
      if(!active)return;
      setPlayers(data.players||[]);
      setUpdatedAt(data.updatedAt||"");
      setState("ready");
    }).catch((error:Error)=>{if(active)setState(error.message==="setup"?"setup":"error");});
    return ()=>{active=false;};
  },[]);
  return <main className="inner-page"><section className="page-hero leaderboard-hero"><ParticleField/><div className="section-kicker">THE HALL OF FAME</div><h1>LET THE<br/><em>NUMBERS TALK.</em></h1><p>Every name on this board represents time, effort, and a record earned in battle.</p><div className="page-hero-mark"><Trophy size={55}/><span>VERIFIED PLAYER RECORDS</span></div></section>
    <section className="section-pad leaderboard-page"><div className="leaderboard-heading"><div><div className="section-kicker">01 / CURRENT STANDINGS</div><h2>THE TOP<br/><em>DRAGONS.</em></h2></div><div className="leader-live"><span className={state==="ready"?"status-dot":"status-dot status-wait"}/>{state==="ready"?"LIVE DATA":"DATA STATUS: "+state.toUpperCase()}</div></div>
      {state==="loading"?<div className="leader-empty large-empty">Fetching verified player records…</div>:state==="setup"?<div className="leader-empty large-empty">The secure Firebase connection needs its Netlify service-account setting before player records can appear.</div>:state==="error"?<div className="leader-empty large-empty">Player rankings could not be loaded. Please check back shortly.</div>:players.length===0?<div className="leader-empty large-empty">No verified player records are available yet. The board will appear here when records are published.</div>:
      <div className="leaderboard-table"><div className="leader-table-head"><span>RANK</span><span>PLAYER</span><span>INSIGNIA</span><span>KILLS</span></div>{players.map((player,index)=><div className={`leader-table-row ${index===0?"first-place":""}`} key={player.discordId}><span className="table-position">{index===0?<Crown size={18}/>:String(index+1).padStart(2,"0")}</span><strong>{player.robloxUsername||"BD Member"}</strong><span className="table-rank">{player.rank}</span><b>{Number(player.kills||0).toLocaleString("en-US")}</b></div>)}</div>}
      {updatedAt&&<p className="data-updated">LAST UPDATED · {new Date(updatedAt).toLocaleString()}</p>}
    </section><section className="clan-bottom section-pad"><div className="section-kicker">YOUR NAME COULD BE NEXT</div><h2>MAKE YOUR<br/><em>MARK.</em></h2><p>Build your record and earn your place among the dragons.</p><Link to="/ranks" className="button button-primary">EXPLORE THE RANKS <ArrowRight size={16}/></Link></section>
  </main>;
}
