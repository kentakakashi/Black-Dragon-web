import {useEffect,useMemo,useState} from "react";
import {ShieldCheck,Plus,Save,Trash2,UserPlus,RefreshCw,LockKeyhole} from "lucide-react";
import "./StaffRolesPage.css";

type Role={id:string;name:string;description:string;permissions:string[];active?:boolean};
type Assignment={discordId:string;roleIds:string[]};
type Data={permissions:string[];roles:Role[];assignments:Assignment[];ownerDiscordId:string};
const labels:Record<string,string>={
 "applications.review":"Review applications","events.manage":"Manage events",
 "tryouts.manage":"Manage tryouts","content.manage":"Manage news & Hall of Fame",
 "announcements.manage":"Manage announcements","audit.view":"View audit archive",
 "members.view":"View member management","members.manage":"Manage member website profiles",
 "moderation.manage":"Moderation tools"
};
export function StaffRolesPage(){
 const [data,setData]=useState<Data|null>(null),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const [roleId,setRoleId]=useState(""),[name,setName]=useState(""),[description,setDescription]=useState(""),[selected,setSelected]=useState<string[]>([]);
 const [discordId,setDiscordId]=useState(""),[assignRoleId,setAssignRoleId]=useState("");
 const editing=Boolean(roleId);
 async function load(){setLoading(true);setError("");try{const r=await fetch("/.netlify/functions/staff-roles",{credentials:"same-origin",cache:"no-store"});const j=await r.json();if(!r.ok)throw Error(j.error||"Could not load roles.");setData(j);setAssignRoleId(j.roles[0]?.id||"");}catch(e){setError(e instanceof Error?e.message:"Could not load role manager.");}finally{setLoading(false);}}
 useEffect(()=>{load();},[]);
 const assignedCount=useMemo(()=>data?.assignments.length||0,[data]);
 function reset(){setRoleId("");setName("");setDescription("");setSelected([]);}
 function edit(role:Role){setRoleId(role.id);setName(role.name);setDescription(role.description||"");setSelected(role.permissions||[]);}
 async function send(method:string,body:Record<string,unknown>,success:string){setBusy(true);setError("");setNotice("");try{const r=await fetch("/.netlify/functions/staff-roles",{method,credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const j=await r.json();if(!r.ok)throw Error(j.error||"Operation failed.");setNotice(success);await load();}catch(e){setError(e instanceof Error?e.message:"Operation failed.");}finally{setBusy(false);}}
 async function saveRole(){if(!name.trim()||!selected.length)return;await send(editing?"PATCH":"POST",editing?{roleId,name,description,permissions:selected}:{action:"create_role",name,description,permissions:selected},editing?"Website role updated.":"Website role created.");reset();}
 async function removeRole(id:string){if(!window.confirm("Delete this role and remove it from every assigned member?"))return;await send("DELETE",{roleId:id},"Role deleted and assignments cleared.");if(roleId===id)reset();}
 async function assign(){await send("POST",{action:"assign_role",discordId,roleId:assignRoleId},"Website role assigned.");setDiscordId("");}
 async function unassign(id:string,role:string){await send("DELETE",{action:"remove_assignment",discordId:id,roleId:role},"Website role removed from member.");}
 return <main className="inner-page staff-roles-page"><section className="page-hero public-page-hero"><div className="section-kicker">OWNER ONLY / ACCESS CONTROL</div><h1>STAFF<br/><em>AUTHORITY.</em></h1><p>Create website-only staff roles and assign precise permissions to Discord members.</p></section><section className="section-pad staff-roles-content">
 <div className="roles-owner-lock"><LockKeyhole size={22}/><div><strong>SOLE WEBSITE ROLE OWNER</strong><span>Discord ID: 1105394446230638623 · This identity is hard-coded on the server. No website role can override it.</span></div><ShieldCheck size={22}/></div>
 {error&&<div className="roles-message roles-error">{error}</div>}{notice&&<div className="roles-message">{notice}</div>}
 {loading?<div className="leader-empty large-empty">Loading secure role records…</div>:<><div className="roles-section-head"><div><div className="section-kicker">ACCESS ARCHITECTURE</div><h2>BUILD A<br/><em>STAFF ROLE.</em></h2></div><button className="button button-quiet" onClick={load} disabled={busy}><RefreshCw size={14}/> REFRESH</button></div>
 <div className="roles-editor"><div className="roles-editor-top"><h3>{editing?"EDIT WEBSITE ROLE":"CREATE WEBSITE ROLE"}</h3><span>{editing?"UPDATE PERMISSIONS":"NEW ROLE"}</span></div><label>ROLE NAME<input value={name} onChange={e=>setName(e.target.value)} maxLength={40} placeholder="e.g. Tryout Staff"/></label><label>DESCRIPTION<input value={description} onChange={e=>setDescription(e.target.value)} maxLength={180} placeholder="What can this role do?"/></label><div className="roles-permission-title">PERMISSIONS</div><div className="roles-permission-grid">{(data?.permissions||[]).map(p=><label className="roles-permission" key={p}><input type="checkbox" checked={selected.includes(p)} onChange={e=>setSelected(old=>e.target.checked?[...old,p]:old.filter(x=>x!==p))}/><span>{labels[p]||p}</span></label>)}</div><div className="roles-editor-actions"><button className="button button-primary" onClick={saveRole} disabled={busy||name.trim().length<2||!selected.length}><Save size={15}/>{busy?"SAVING…":editing?"SAVE ROLE":"CREATE ROLE"}</button>{editing&&<button className="button button-quiet" onClick={reset}>CANCEL EDIT</button>}</div></div>
 <div className="roles-section-head"><div><div className="section-kicker">WEBSITE STAFF DIRECTORY</div><h2>DEFINED<br/><em>ROLES.</em></h2></div><span className="roles-count">{data?.roles.length||0} ROLES</span></div>
 <div className="roles-list">{data?.roles.length?data.roles.map(role=><article className="roles-card" key={role.id}><div className="roles-card-head"><div><h3>{role.name}</h3><p>{role.description||"No description provided."}</p></div><div className="roles-card-actions"><button onClick={()=>edit(role)} disabled={busy}><Save size={14}/> EDIT</button><button onClick={()=>removeRole(role.id)} disabled={busy}><Trash2 size={14}/> DELETE</button></div></div><div className="roles-chip-list">{role.permissions.map(p=><span key={p}>{labels[p]||p}</span>)}</div></article>):<div className="leader-empty">No website roles created yet. Start by creating the first one above.</div>}</div>
 <div className="roles-section-head"><div><div className="section-kicker">MEMBER ACCESS</div><h2>ASSIGN<br/><em>AUTHORITY.</em></h2></div><span className="roles-count">{assignedCount} ASSIGNMENTS</span></div>
 <div className="roles-assign"><p>Enter the member’s Discord user ID. The server checks that the account belongs to the BLACK DRAGONS Discord guild before assigning the role.</p><label>MEMBER DISCORD ID<input value={discordId} onChange={e=>setDiscordId(e.target.value)} inputMode="numeric" placeholder="17–20 digit Discord ID"/></label><label>WEBSITE ROLE<select value={assignRoleId} onChange={e=>setAssignRoleId(e.target.value)}><option value="">Select a role</option>{data?.roles.map(r=><option value={r.id} key={r.id}>{r.name}</option>)}</select></label><button className="button button-primary" onClick={assign} disabled={busy||!assignRoleId||!/^\d{17,20}$/.test(discordId)}><UserPlus size={15}/> ASSIGN WEBSITE ROLE</button></div>
 <div className="roles-assignment-list">{data?.assignments.map(a=><article key={a.discordId}><div><strong>{a.discordId}</strong><div className="roles-chip-list">{a.roleIds.map(id=>{const role=data.roles.find(r=>r.id===id);return <span key={id}>{role?.name||"Deleted role"} <button onClick={()=>unassign(a.discordId,id)} aria-label="Remove role">×</button></span>;})}</div></div></article>)}</div>
 <p className="roles-footnote"><ShieldCheck size={15}/> Website roles are separate from Discord server roles. Assigning a website role never changes the member’s actual Discord roles. The owner identity cannot be assigned or modified through this panel.</p></>}
 </section></main>;
}