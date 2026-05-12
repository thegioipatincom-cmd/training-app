import React, { useState, useEffect } from "react";

// Storage layer — dùng localStorage để sync data
const STORAGE = {
  async get(key) {
    try {
      const v = localStorage.getItem(key);
      return v ? { value: v } : null;
    } catch { return null; }
  },
  async set(key, val) {
    try { localStorage.setItem(key, val); return true; } catch { return false; }
  }
};
window.storage = STORAGE;


const TRAINER_PASS = "hue2024";
const COMPANIES = {
  QJC: { label: "QJC", color: "#C9A84C", bg: "#FDF8EE", users: ["Anh Tình", "Hoa", "Phượng"] },
  CENTOSY: { label: "CENTOSY", color: "#3B6FE8", bg: "#EEF2FD", users: ["Hoài", "Nhi", "Hạnh", "Hoá", "Vân", "Phú", "Thuỷ"] },
};
const SKILLS = [
  { k: "cn", label: "Quản lý con người", icon: "👥" },
  { k: "qd", label: "Ra quyết định", icon: "⚡" },
  { k: "tg", label: "Quản lý thời gian", icon: "🕐" },
  { k: "ds", label: "Đọc số / Tài chính", icon: "📊" },
  { k: "ht", label: "Xây hệ thống", icon: "⚙️" },
  { k: "ld", label: "Tư duy lãnh đạo", icon: "🎯" },
];
const CATS = ["Quản lý con người","Ra quyết định","Quản lý thời gian","Đọc số","Xây hệ thống","Tư duy lãnh đạo","Thực chiến","Văn hoá"];
const STATUS = {
  chua: { label: "Chưa làm", color: "#999" },
  dang: { label: "Đang làm", color: "#3B6FE8" },
  xong: { label: "Hoàn thành", color: "#27AE60" },
  tre: { label: "Trễ hạn", color: "#E84A4A" },
};
const defScore = () => Object.fromEntries(SKILLS.map(s => [s.k, 1]));
const today = () => new Date().toISOString().slice(0, 10);
const fmt = d => { if (!d) return ""; const p = d.split("-"); return p[2]+"/"+p[1]+"/"+p[0]; };
const C = { navy:"#1A2B4A", bg:"#F5F4F0", card:"#fff", gray:"#6B7A99", border:"#E0D9CE" };
const cardSt = { background:C.card, borderRadius:14, border:"1px solid "+C.border, padding:"16px 18px", marginBottom:12, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" };
const inpSt = { width:"100%", padding:"10px 13px", border:"1.5px solid "+C.border, borderRadius:9, fontSize:14, fontFamily:"inherit", color:C.navy, outline:"none", boxSizing:"border-box", marginBottom:10, background:"#FAFAF8" };
const lblSt = { fontSize:11, fontWeight:700, color:C.gray, letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:4 };

async function dbLoad(key) {
  try { const r = await window.storage.get(key, true); return r ? JSON.parse(r.value) : null; } catch { return null; }
}
async function dbSave(key, val) {
  try { await window.storage.set(key, JSON.stringify(val), true); } catch(e) { console.error(e); }
}

function Btn({ children, onClick, color, textColor, full, small, style: extra }) {
  const bg = color || C.navy;
  const tc = textColor || "#fff";
  return (
    <button onClick={onClick} style={{ padding: small?"7px 12px":"11px 18px", background:bg, color:tc, border:"none", borderRadius:9, fontSize:small?12:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", width:full?"100%":"auto", ...(extra||{}) }}>
      {children}
    </button>
  );
}

function Tag({ text, color }) {
  return <span style={{ display:"inline-block", padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:700, color, background:color+"22", border:"1px solid "+color+"44", marginRight:4 }}>{text}</span>;
}

function H1({ title, sub }) {
  return <div style={{marginBottom:16}}><div style={{fontSize:18,fontWeight:900,color:C.navy}}>{title}</div>{sub&&<div style={{fontSize:12,color:C.gray,marginTop:2}}>{sub}</div>}</div>;
}
function InfoBlock({ icon, title, text }) {
  return <div style={{marginBottom:8}}><div style={{fontSize:11,fontWeight:700,color:C.gray}}>{icon} {title}</div><div style={{fontSize:13,color:C.navy,lineHeight:1.6}}>{text}</div></div>;
}
function Empty({ text }) {
  return <div style={{textAlign:"center",padding:"36px 20px",color:C.gray,fontSize:13,background:"#FAFAF8",borderRadius:12,border:"1px dashed "+C.border}}>{text}</div>;
}

function ScoreRow({ skill, scores, setScores, color }) {
  return (
    <div style={{marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
        <span style={{fontWeight:600,color:C.navy,fontSize:13}}>{skill.icon} {skill.label}</span>
        <span style={{color,fontWeight:900}}>{scores[skill.k]}/5</span>
      </div>
      <div style={{display:"flex",gap:6}}>
        {[1,2,3,4,5].map(v => (
          <button key={v} onClick={()=>setScores(f=>({...f,[skill.k]:v}))} style={{ flex:1, padding:"8px 0", border:"1.5px solid", borderColor:scores[skill.k]>=v?color:"#E0D9CE", background:scores[skill.k]>=v?color+"18":"#FAFAF8", color:scores[skill.k]>=v?color:C.gray, fontWeight:800, fontSize:13, cursor:"pointer", borderRadius:8, fontFamily:"inherit" }}>
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

// LOGIN
function Login({ onLogin }) {
  const [role, setRole] = useState(null);
  const [co, setCo] = useState("QJC");
  const [pw, setPw] = useState("");
  const [user, setUser] = useState("");
  const [err, setErr] = useState("");

  const doTrainer = () => {
    if (pw === TRAINER_PASS) { onLogin("trainer", co, "Huế Nguyễn"); }
    else { setErr("Sai mật khẩu"); }
  };
  const doTrainee = () => {
    if (user) { onLogin("trainee", co, user); }
    else { setErr("Chọn tên trước"); }
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"system-ui,sans-serif"}}>
      <div style={{width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:44,marginBottom:8}}>💎</div>
          <div style={{fontSize:22,fontWeight:900,color:C.navy}}>Training System</div>
          <div style={{fontSize:13,color:C.gray,marginTop:4}}>Huế Nguyễn — CEO Coaching</div>
        </div>
        {!role && (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <Btn onClick={()=>setRole("trainer")} full style={{fontSize:15,padding:"15px"}}>🎓 Trainer — Huế Nguyễn</Btn>
            <Btn onClick={()=>setRole("trainee")} color="#C9A84C" full style={{fontSize:15,padding:"15px"}}>📚 Học viên</Btn>
          </div>
        )}
        {role && (
          <div style={cardSt}>
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              {Object.entries(COMPANIES).map(([k,c])=>(
                <Btn key={k} onClick={()=>{setCo(k);setUser("");}} color={co===k?c.color:"#eee"} textColor={co===k?"#fff":C.gray} style={{flex:1,fontSize:12}}>{c.label}</Btn>
              ))}
            </div>
            {role==="trainer" ? (
              <>
                <span style={lblSt}>Mật khẩu</span>
                <input type="password" value={pw} onChange={e=>{setPw(e.target.value);setErr("");}} placeholder="Nhập mật khẩu..." style={inpSt} onKeyDown={e=>e.key==="Enter"&&doTrainer()}/>
                <Btn onClick={doTrainer} color={COMPANIES[co].color} full>Đăng nhập →</Btn>
              </>
            ) : (
              <>
                <span style={lblSt}>Chọn tên</span>
                <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:12}}>
                  {COMPANIES[co].users.map(u=>(
                    <Btn key={u} onClick={()=>{setUser(u);setErr("");}} color={user===u?COMPANIES[co].color:"#eee"} textColor={user===u?"#fff":C.gray} small>{u}</Btn>
                  ))}
                </div>
                <Btn onClick={doTrainee} color={COMPANIES[co].color} full>Vào học →</Btn>
              </>
            )}
            {err&&<div style={{color:"#E84A4A",fontSize:12,marginTop:8,textAlign:"center"}}>{err}</div>}
            <Btn onClick={()=>{setRole(null);setErr("");setPw("");setUser("");}} color="transparent" textColor={C.gray} full style={{marginTop:8,fontSize:12}}>← Quay lại</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// TRAINER APP
function Trainer({ onLogout }) {
  const [tab, setTab] = useState("dash");
  const [co, setCo] = useState("QJC");
  const [db, setDb] = useState({ tasks:[], reports:[], lessons:[], scores:{}, baselines:{} });
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    (async()=>{
      const [t,r,l,s,b] = await Promise.all([dbLoad("tasks"),dbLoad("reports"),dbLoad("lessons"),dbLoad("scores"),dbLoad("baselines")]);
      setDb({tasks:t||[],reports:r||[],lessons:l||[],scores:s||{},baselines:b||{}});
      setLoading(false);
    })();
  },[]);

  const upd = async (key,val) => { setDb(d=>({...d,[key]:val})); await dbSave(key,val); };
  const coCfg = COMPANIES[co];
  const pending = db.reports.filter(r=>r.company===co&&!r.read).length;

  const tabs = [
    {k:"dash",label:"Dashboard",icon:"📊"},
    {k:"tasks",label:"Bài tập",icon:"📝"},
    {k:"lessons",label:"Bài giảng",icon:"📚"},
    {k:"reports",label:"Báo cáo"+(pending?" ("+pending+")":""),icon:"📋"},
    {k:"scores",label:"Chấm điểm",icon:"⭐"},
  ];

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif",maxWidth:960,margin:"0 auto"}}>
      <div style={{background:C.navy,padding:"14px 18px",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",letterSpacing:2}}>TRAINER</div>
            <div style={{fontSize:16,fontWeight:900,color:"#fff"}}>Huế Nguyễn 💎</div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {Object.entries(COMPANIES).map(([k,c])=>(
              <Btn key={k} onClick={()=>setCo(k)} color={co===k?c.color:"rgba(255,255,255,0.15)"} textColor="#fff" small>{c.label}</Btn>
            ))}
            <Btn onClick={onLogout} color="rgba(255,255,255,0.1)" textColor="rgba(255,255,255,0.6)" small>↩</Btn>
          </div>
        </div>
        <div style={{display:"flex",overflowX:"auto",gap:2,paddingBottom:2}}>
          {tabs.map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)} style={{padding:"8px 12px",background:"none",border:"none",borderBottom:tab===t.k?"2px solid #fff":"2px solid transparent",color:tab===t.k?"#fff":"rgba(255,255,255,0.45)",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{padding:"18px 16px 40px"}}>
        {loading ? <p style={{textAlign:"center",color:C.gray,padding:40}}>Đang tải...</p> : (
          <>
            {tab==="dash"    && <TDash co={co} coCfg={coCfg} db={db}/>}
            {tab==="tasks"   && <TTasks co={co} coCfg={coCfg} db={db} upd={upd}/>}
            {tab==="lessons" && <TLessons co={co} coCfg={coCfg} db={db} upd={upd}/>}
            {tab==="reports" && <TReports co={co} coCfg={coCfg} db={db} upd={upd}/>}
            {tab==="scores"  && <TScores co={co} coCfg={coCfg} db={db} upd={upd}/>}
          </>
        )}
      </div>
    </div>
  );
}

function TDash({ co, coCfg, db }) {
  return (
    <div>
      <H1 title={"Dashboard — "+co} sub={coCfg.label}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
        {coCfg.users.map(u=>{
          const uTasks = db.tasks.filter(t=>t.company===co&&t.user===u);
          const done = uTasks.filter(t=>t.status==="xong").length;
          const pend = db.reports.filter(r=>r.company===co&&r.user===u&&!r.read).length;
          const hasBase = !!db.baselines[u];
          const uScores = db.scores[u]||{};
          const latestKey = Object.keys(uScores).sort().slice(-1)[0];
          const latest = uScores[latestKey];
          const totalNow = latest ? SKILLS.reduce((s,sk)=>s+(latest[sk.k]||1),0) : null;
          const totalBase = db.baselines[u] ? SKILLS.reduce((s,sk)=>s+(db.baselines[u][sk.k]||1),0) : null;
          return (
            <div key={u} style={{...cardSt,borderTop:"3px solid "+coCfg.color}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{fontWeight:800,color:C.navy,fontSize:15,marginBottom:4}}>{u}</div>
                  {pend>0&&<Tag text={pend+" báo cáo chờ"} color="#E84A4A"/>}
                  {!hasBase&&<Tag text="Chưa có baseline" color="#E8904A"/>}
                  {totalNow&&totalBase&&totalNow>totalBase&&<Tag text={"+" +(totalNow-totalBase)+" vs baseline"} color="#27AE60"/>}
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:22,fontWeight:900,color:coCfg.color}}>{done}</div>
                  <div style={{fontSize:11,color:C.gray}}>/{uTasks.length} bài</div>
                </div>
              </div>
              {uTasks.length>0&&(
                <div style={{marginTop:10,height:5,background:"#eee",borderRadius:3}}>
                  <div style={{height:"100%",width:(done/uTasks.length*100)+"%",background:coCfg.color,borderRadius:3}}/>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {db.reports.filter(r=>r.company===co&&!r.read).length>0&&(
        <>
          <H1 title="Báo cáo chờ đọc" sub="Học viên vừa nộp"/>
          {db.reports.filter(r=>r.company===co&&!r.read).map(r=>(
            <div key={r.id} style={{...cardSt,borderLeft:"3px solid #E84A4A"}}>
              <span style={{fontWeight:700,color:C.navy}}>{r.user}</span>
              <span style={{fontSize:12,color:C.gray,marginLeft:8}}>{r.type==="weekly"?"Báo cáo tuần":"Đúc kết sau học"} — {fmt(r.date)}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function TTasks({ co, coCfg, db, upd }) {
  const [show, setShow] = useState(false);
  const [exp, setExp] = useState(null);
  const [fUser, setFUser] = useState("all");
  const [fSt, setFSt] = useState("all");
  const [form, setForm] = useState({user:"all",cat:CATS[0],title:"",content:"",output:"",date:today(),deadline:"",link:""});

  const tasks = db.tasks.filter(t=>t.company===co&&(fUser==="all"||t.user===fUser)&&(fSt==="all"||t.status===fSt));

  const addTask = async () => {
    if (!form.title.trim()) return;
    const targets = form.user==="all" ? coCfg.users : [form.user];
    const news = targets.map(u=>({id:Date.now()+Math.random(),company:co,user:u,...form,status:"chua",note:""}));
    await upd("tasks",[...db.tasks,...news]);
    setForm({user:"all",cat:CATS[0],title:"",content:"",output:"",date:today(),deadline:"",link:""});
    setShow(false);
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <H1 title="Bài tập" sub={tasks.length+" bài"}/>
        <Btn onClick={()=>setShow(!show)} color={coCfg.color}>+ Giao bài</Btn>
      </div>
      {show&&(
        <div style={{...cardSt,borderTop:"3px solid "+coCfg.color}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>
              <span style={lblSt}>Giao cho</span>
              <select value={form.user} onChange={e=>setForm(f=>({...f,user:e.target.value}))} style={inpSt}>
                <option value="all">Tất cả</option>
                {coCfg.users.map(u=><option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <span style={lblSt}>Chủ đề</span>
              <select value={form.cat} onChange={e=>setForm(f=>({...f,cat:e.target.value}))} style={inpSt}>
                {CATS.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <span style={lblSt}>Tiêu đề *</span>
          <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Tên bài tập..." style={inpSt}/>
          <span style={lblSt}>Nội dung / Yêu cầu</span>
          <textarea value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))} placeholder="Chi tiết bài tập..." style={{...inpSt,minHeight:80,resize:"vertical"}}/>
          <span style={lblSt}>Output yêu cầu</span>
          <input value={form.output} onChange={e=>setForm(f=>({...f,output:e.target.value}))} placeholder="File Word, quyết định..." style={inpSt}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><span style={lblSt}>Ngày giao</span><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={inpSt}/></div>
            <div><span style={lblSt}>Deadline</span><input type="date" value={form.deadline} onChange={e=>setForm(f=>({...f,deadline:e.target.value}))} style={inpSt}/></div>
          </div>
          <span style={lblSt}>Link tài liệu (Drive)</span>
          <input value={form.link} onChange={e=>setForm(f=>({...f,link:e.target.value}))} placeholder="https://drive.google.com/..." style={inpSt}/>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={addTask} color={coCfg.color} style={{flex:1}}>Giao bài</Btn>
            <Btn onClick={()=>setShow(false)} color="#eee" textColor={C.gray} style={{flex:1}}>Huỷ</Btn>
          </div>
        </div>
      )}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
        {[["all","Tất cả"],...Object.entries(STATUS).map(([k,v])=>[k,v.label])].map(([k,lb])=>(
          <Btn key={k} onClick={()=>setFSt(k)} color={fSt===k?C.navy:"#eee"} textColor={fSt===k?"#fff":C.gray} small>{lb}</Btn>
        ))}
        <select value={fUser} onChange={e=>setFUser(e.target.value)} style={{...inpSt,width:"auto",marginBottom:0,fontSize:12}}>
          <option value="all">Tất cả người</option>
          {coCfg.users.map(u=><option key={u} value={u}>{u}</option>)}
        </select>
      </div>
      {tasks.length===0&&<Empty text="Chưa có bài tập nào"/>}
      {tasks.map(t=>{
        const st = STATUS[t.status]||STATUS.chua;
        return (
          <div key={t.id} style={{...cardSt,borderLeft:"3px solid "+st.color,padding:0,overflow:"hidden"}}>
            <div onClick={()=>setExp(exp===t.id?null:t.id)} style={{padding:"13px 16px",cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
                <div style={{flex:1}}>
                  <div style={{marginBottom:4}}>
                    <Tag text={t.cat} color={coCfg.color}/>
                    <Tag text={st.label} color={st.color}/>
                    <span style={{fontSize:11,color:C.gray,fontWeight:700}}>{t.user}</span>
                  </div>
                  <div style={{fontWeight:700,color:C.navy}}>{t.title}</div>
                  {t.output&&<div style={{fontSize:12,color:C.gray,marginTop:2}}>📋 {t.output}</div>}
                </div>
                <div style={{fontSize:11,color:t.deadline&&t.deadline<today()&&t.status!=="xong"?"#E84A4A":C.gray,flexShrink:0,textAlign:"right"}}>
                  {t.deadline?fmt(t.deadline):""}<br/>{exp===t.id?"▲":"▼"}
                </div>
              </div>
            </div>
            {exp===t.id&&(
              <div style={{padding:"0 16px 14px",borderTop:"1px solid "+C.border}}>
                {t.content&&<p style={{fontSize:13,color:C.navy,lineHeight:1.6,margin:"10px 0"}}>{t.content}</p>}
                {t.link&&<a href={t.link} target="_blank" rel="noreferrer" style={{fontSize:12,color:"#3B6FE8",display:"block",marginBottom:8}}>📁 Tài liệu →</a>}
                <div style={{display:"flex",gap:6,flexWrap:"wrap",margin:"10px 0"}}>
                  {Object.entries(STATUS).map(([k,v])=>(
                    <Btn key={k} onClick={()=>upd("tasks",db.tasks.map(x=>x.id===t.id?{...x,status:k}:x))} color={t.status===k?v.color:"#eee"} textColor={t.status===k?"#fff":C.gray} small>{v.label}</Btn>
                  ))}
                </div>
                <textarea defaultValue={t.note||""} onBlur={e=>upd("tasks",db.tasks.map(x=>x.id===t.id?{...x,note:e.target.value}:x))} placeholder="Ghi chú nhận xét..." style={{...inpSt,minHeight:60,resize:"vertical",marginTop:4,marginBottom:0}}/>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TLessons({ co, coCfg, db, upd }) {
  const [show, setShow] = useState(false);
  const [exp, setExp] = useState(null);
  const [form, setForm] = useState({module:"",title:"",content:"",video:"",link:"",date:today()});
  const lessons = db.lessons.filter(l=>l.company===co);

  const add = async () => {
    if (!form.title.trim()) return;
    await upd("lessons",[...db.lessons,{id:Date.now(),company:co,...form}]);
    setForm({module:"",title:"",content:"",video:"",link:"",date:today()});
    setShow(false);
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <H1 title="Bài giảng" sub={lessons.length+" bài"}/>
        <Btn onClick={()=>setShow(!show)} color={coCfg.color}>+ Thêm</Btn>
      </div>
      {show&&(
        <div style={{...cardSt,borderTop:"3px solid "+coCfg.color}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><span style={lblSt}>Module</span><input value={form.module} onChange={e=>setForm(f=>({...f,module:e.target.value}))} placeholder="Module 1..." style={inpSt}/></div>
            <div><span style={lblSt}>Ngày</span><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={inpSt}/></div>
          </div>
          <span style={lblSt}>Tiêu đề *</span>
          <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Tên bài giảng..." style={inpSt}/>
          <span style={lblSt}>Nội dung</span>
          <textarea value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))} placeholder="Key points, framework, ví dụ thực tế..." style={{...inpSt,minHeight:100,resize:"vertical"}}/>
          <span style={lblSt}>Link Video</span>
          <input value={form.video} onChange={e=>setForm(f=>({...f,video:e.target.value}))} placeholder="https://youtube.com/..." style={inpSt}/>
          <span style={lblSt}>Link Tài liệu (Drive)</span>
          <input value={form.link} onChange={e=>setForm(f=>({...f,link:e.target.value}))} placeholder="https://drive.google.com/..." style={inpSt}/>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={add} color={coCfg.color} style={{flex:1}}>Thêm bài giảng</Btn>
            <Btn onClick={()=>setShow(false)} color="#eee" textColor={C.gray} style={{flex:1}}>Huỷ</Btn>
          </div>
        </div>
      )}
      {lessons.length===0&&<Empty text="Chưa có bài giảng nào"/>}
      {lessons.map(l=>(
        <div key={l.id} style={{...cardSt,borderLeft:"3px solid "+coCfg.color}}>
          <div onClick={()=>setExp(exp===l.id?null:l.id)} style={{cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                {l.module&&<Tag text={l.module} color={coCfg.color}/>}
                <div style={{fontWeight:800,color:C.navy,marginTop:4}}>{l.title}</div>
                <div style={{fontSize:11,color:C.gray,marginTop:2}}>{fmt(l.date)} {l.video?"🎬":""}{l.link?"📁":""}</div>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <Btn onClick={e=>{e.stopPropagation();upd("lessons",db.lessons.filter(x=>x.id!==l.id));}} color="#E84A4A" small>Xoá</Btn>
                <span style={{color:C.gray}}>{exp===l.id?"▲":"▼"}</span>
              </div>
            </div>
          </div>
          {exp===l.id&&l.content&&(
            <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid "+C.border}}>
              <p style={{fontSize:13,color:C.navy,lineHeight:1.7,whiteSpace:"pre-wrap",margin:"0 0 12px"}}>{l.content}</p>
              <div style={{display:"flex",gap:10}}>
                {l.video&&<a href={l.video} target="_blank" rel="noreferrer" style={{fontSize:13,color:"#fff",background:"#E84A4A",padding:"6px 14px",borderRadius:7,textDecoration:"none",fontWeight:700}}>▶ Video</a>}
                {l.link&&<a href={l.link} target="_blank" rel="noreferrer" style={{fontSize:13,color:"#fff",background:"#3B6FE8",padding:"6px 14px",borderRadius:7,textDecoration:"none",fontWeight:700}}>📁 Tài liệu</a>}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TReports({ co, coCfg, db, upd }) {
  const [fUser, setFUser] = useState("all");
  const reports = db.reports.filter(r=>r.company===co&&(fUser==="all"||r.user===fUser)).sort((a,b)=>b.date.localeCompare(a.date));
  return (
    <div>
      <H1 title="Báo cáo học viên" sub={reports.filter(r=>!r.read).length+" chưa đọc"}/>
      <select value={fUser} onChange={e=>setFUser(e.target.value)} style={{...inpSt,width:"auto",marginBottom:14}}>
        <option value="all">Tất cả</option>
        {coCfg.users.map(u=><option key={u} value={u}>{u}</option>)}
      </select>
      {reports.length===0&&<Empty text="Chưa có báo cáo nào"/>}
      {reports.map(r=>(
        <div key={r.id} style={{...cardSt,borderLeft:"3px solid "+(r.read?C.border:"#E84A4A")}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div>
              <span style={{fontWeight:800,color:C.navy}}>{r.user}</span>
              <span style={{fontSize:11,color:C.gray,marginLeft:8}}>{r.type==="weekly"?"Báo cáo tuần":"Đúc kết sau học"} — {fmt(r.date)}</span>
            </div>
            {!r.read&&<Btn onClick={()=>upd("reports",db.reports.map(x=>x.id===r.id?{...x,read:true}:x))} color={coCfg.color} small>Đã đọc</Btn>}
          </div>
          {r.learned&&<InfoBlock icon="💡" title="Học được" text={r.learned}/>}
          {r.apply&&<InfoBlock icon="🎯" title="Sẽ áp dụng" text={r.apply}/>}
          {r.unclear&&<InfoBlock icon="❓" title="Chưa rõ" text={r.unclear}/>}
          {r.progress&&<InfoBlock icon="📌" title="Tiến độ bài tập" text={r.progress}/>}
          {r.stuck&&<InfoBlock icon="🔧" title="Đang kẹt" text={r.stuck}/>}
          {r.decision&&<InfoBlock icon="⚡" title="Quyết định" text={r.decision}/>}
          {r.applied&&<InfoBlock icon="✅" title="Áp dụng thực tế" text={r.applied}/>}
          {r.selfPre&&(
            <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid "+C.border}}>
              <div style={{fontSize:11,fontWeight:700,color:C.gray,marginBottom:6}}>TỰ CHẤM TRƯỚC → SAU</div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                {SKILLS.map(sk=>{
                  const pre2=r.selfPre[sk.k]||1;
                  const post2=r.selfPost?r.selfPost[sk.k]||pre2:pre2;
                  const d=post2-pre2;
                  return <div key={sk.k} style={{textAlign:"center",minWidth:50}}>
                    <div style={{fontSize:13,fontWeight:800,color:d>0?"#27AE60":d<0?"#E84A4A":C.gray}}>{pre2}→{post2}</div>
                    <div style={{fontSize:10,color:C.gray}}>{sk.icon}</div>
                  </div>;
                })}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TScores({ co, coCfg, db, upd }) {
  const [selUser, setSelUser] = useState(coCfg.users[0]);
  const [sf, setSf] = useState(defScore());
  const [date, setDate] = useState(today());
  const [isBase, setIsBase] = useState(false);
  const [view, setView] = useState("score");
  const RUBRIC = ["","Chưa nhận thức","Bắt đầu nhận ra","Làm được khi hỗ trợ","Tự làm được","Làm tốt, dạy lại được"];

  const saveScore = async () => {
    if (isBase) {
      await upd("baselines",{...db.baselines,[selUser]:{...sf,date}});
    } else {
      const prev = db.scores[selUser]||{};
      await upd("scores",{...db.scores,[selUser]:{...prev,[date]:{...sf,date}}});
    }
  };

  const uScores = db.scores[selUser]||{};
  const latestKey = Object.keys(uScores).sort().slice(-1)[0];
  const latest = uScores[latestKey];
  const prevKey = Object.keys(uScores).sort().slice(-2)[0];
  const prev = uScores[prevKey];
  const base = db.baselines[selUser];

  return (
    <div>
      <H1 title="Chấm điểm" sub="Trainer chấm độc lập"/>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
        {coCfg.users.map(u=>(
          <Btn key={u} onClick={()=>setSelUser(u)} color={selUser===u?coCfg.color:"#eee"} textColor={selUser===u?"#fff":C.gray} small>
            {u}{!db.baselines[u]?" ⚠️":""}
          </Btn>
        ))}
      </div>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {[["score","Chấm điểm"],["compare","So sánh"],["history","Lịch sử"]].map(([k,lb])=>(
          <Btn key={k} onClick={()=>setView(k)} color={view===k?C.navy:"#eee"} textColor={view===k?"#fff":C.gray} small>{lb}</Btn>
        ))}
      </div>

      {view==="score"&&(
        <div style={cardSt}>
          <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
            <div style={{flex:1}}>
              <span style={lblSt}>Ngày chấm</span>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{...inpSt,marginBottom:0}}/>
            </div>
            <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,fontWeight:700,color:C.navy,marginTop:16}}>
              <input type="checkbox" checked={isBase} onChange={e=>setIsBase(e.target.checked)}/>
              Là Baseline
            </label>
          </div>
          {isBase&&<div style={{background:"#FDF8EE",border:"1px solid #C9A84C44",borderRadius:8,padding:"8px 12px",marginBottom:12,fontSize:12,color:"#8B6914"}}>⚠️ Baseline = điểm gốc để đo sự phát triển của {selUser}</div>}
          {SKILLS.map(sk=>(
            <div key={sk.k}>
              <ScoreRow skill={sk} scores={sf} setScores={setSf} color={coCfg.color}/>
              <div style={{fontSize:11,color:C.gray,marginBottom:10}}>{RUBRIC[sf[sk.k]]}</div>
            </div>
          ))}
          <Btn onClick={saveScore} color={coCfg.color} full style={{padding:"13px"}}>💾 Lưu {isBase?"Baseline":"điểm kỳ này"} — {selUser}</Btn>
        </div>
      )}

      {view==="compare"&&(
        <div style={cardSt}>
          <p style={{fontSize:13,color:C.gray,marginTop:0}}>So sánh Trainer vs Tự chấm — {selUser}</p>
          {!latest?<Empty text="Chưa có điểm nào"/>:
            SKILLS.map(sk=>{
              const tp=latest[sk.k]||1;
              const pp=prev?prev[sk.k]||1:null;
              return (
                <div key={sk.k} style={{display:"flex",alignItems:"center",gap:12,marginBottom:12,paddingBottom:12,borderBottom:"1px solid "+C.border}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,color:C.navy,fontSize:13}}>{sk.icon} {sk.label}</div>
                    {pp&&<div style={{fontSize:11,color:tp>pp?"#27AE60":"#E84A4A",marginTop:2}}>Kỳ trước: {pp} → {tp} ({tp-pp>=0?"+":""}{tp-pp})</div>}
                  </div>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:22,fontWeight:900,color:coCfg.color}}>{tp}</div>
                    <div style={{fontSize:10,color:C.gray}}>Trainer</div>
                  </div>
                </div>
              );
            })
          }
        </div>
      )}

      {view==="history"&&(
        <div>
          {base&&(
            <div style={{...cardSt,borderTop:"3px solid #C9A84C",background:"#FDF8EE"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#C9A84C",marginBottom:6}}>🏁 BASELINE — {fmt(base.date)}</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {SKILLS.map(sk=><div key={sk.k} style={{textAlign:"center",minWidth:44}}><div style={{fontSize:20,fontWeight:900,color:"#C9A84C"}}>{base[sk.k]||1}</div><div style={{fontSize:10,color:C.gray}}>{sk.icon}</div></div>)}
              </div>
            </div>
          )}
          {Object.entries(uScores).sort((a,b)=>b[0].localeCompare(a[0])).map(([d,sc])=>{
            const total=SKILLS.reduce((s,sk)=>s+(sc[sk.k]||1),0);
            const baseTotal=base?SKILLS.reduce((s,sk)=>s+(base[sk.k]||1),0):null;
            return (
              <div key={d} style={cardSt}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <span style={{fontWeight:700,color:C.navy}}>{fmt(d)}</span>
                  <div>
                    <span style={{fontSize:18,fontWeight:900,color:coCfg.color}}>{total}/{SKILLS.length*5}</span>
                    {baseTotal&&<span style={{fontSize:12,fontWeight:700,color:total>baseTotal?"#27AE60":"#E84A4A",marginLeft:8}}>({total>baseTotal?"+":""}{total-baseTotal} vs baseline)</span>}
                  </div>
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {SKILLS.map(sk=>{const d2=(sc[sk.k]||1)-(base?.[sk.k]||1);return(
                    <div key={sk.k} style={{textAlign:"center",minWidth:44}}>
                      <div style={{fontSize:18,fontWeight:900,color:d2>0?"#27AE60":d2<0?"#E84A4A":coCfg.color}}>{sc[sk.k]||1}</div>
                      <div style={{fontSize:10,color:C.gray}}>{sk.icon}</div>
                      {base&&d2!==0&&<div style={{fontSize:9,fontWeight:700,color:d2>0?"#27AE60":"#E84A4A"}}>{d2>0?"+":""}{d2}</div>}
                    </div>
                  );})}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// TRAINEE APP
function Trainee({ company, userName, onLogout }) {
  const [tab, setTab] = useState("home");
  const [db, setDb] = useState({tasks:[],reports:[],lessons:[],scores:{},baselines:{}});
  const [loading, setLoading] = useState(true);
  const coCfg = COMPANIES[company];

  useEffect(()=>{
    (async()=>{
      const [t,r,l,s,b] = await Promise.all([dbLoad("tasks"),dbLoad("reports"),dbLoad("lessons"),dbLoad("scores"),dbLoad("baselines")]);
      setDb({tasks:t||[],reports:r||[],lessons:l||[],scores:s||{},baselines:b||{}});
      setLoading(false);
    })();
  },[]);

  const upd = async (key,val) => { setDb(d=>({...d,[key]:val})); await dbSave(key,val); };
  const myTasks = db.tasks.filter(t=>t.company===company&&t.user===userName);
  const myLessons = db.lessons.filter(l=>l.company===company);
  const myReports = db.reports.filter(r=>r.company===company&&r.user===userName);
  const pending = myTasks.filter(t=>t.status!=="xong").length;

  const tabs = [
    {k:"home",label:"Trang chủ",icon:"🏠"},
    {k:"tasks",label:"Bài tập"+(pending?" ("+pending+")":""),icon:"📝"},
    {k:"report",label:"Báo cáo",icon:"📋"},
    {k:"lessons",label:"Bài giảng",icon:"📚"},
    {k:"journey",label:"Hành trình",icon:"🌱"},
  ];

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif",maxWidth:960,margin:"0 auto"}}>
      <div style={{background:coCfg.color,padding:"14px 18px",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",letterSpacing:2}}>{company}</div>
            <div style={{fontSize:16,fontWeight:900,color:"#fff"}}>{userName} 👋</div>
          </div>
          <Btn onClick={onLogout} color="rgba(255,255,255,0.2)" small>↩ Thoát</Btn>
        </div>
        <div style={{display:"flex",overflowX:"auto",gap:2,paddingBottom:2}}>
          {tabs.map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)} style={{padding:"8px 12px",background:"none",border:"none",borderBottom:tab===t.k?"2px solid #fff":"2px solid transparent",color:tab===t.k?"#fff":"rgba(255,255,255,0.5)",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{padding:"18px 16px 40px"}}>
        {loading?<p style={{textAlign:"center",color:C.gray,padding:40}}>Đang tải...</p>:(
          <>
            {tab==="home"    &&<TrHome myTasks={myTasks} myReports={myReports} userName={userName} coCfg={coCfg} db={db}/>}
            {tab==="tasks"   &&<TrTasks myTasks={myTasks} db={db} upd={upd} coCfg={coCfg}/>}
            {tab==="report"  &&<TrReport userName={userName} company={company} db={db} upd={upd} coCfg={coCfg}/>}
            {tab==="lessons" &&<TrLessons myLessons={myLessons} coCfg={coCfg}/>}
            {tab==="journey" &&<TrJourney userName={userName} db={db} coCfg={coCfg} myReports={myReports}/>}
          </>
        )}
      </div>
    </div>
  );
}

function TrHome({ myTasks, myReports, userName, coCfg, db }) {
  const done = myTasks.filter(t=>t.status==="xong").length;
  const base = db.baselines[userName];
  const uScores = db.scores[userName]||{};
  const latestKey = Object.keys(uScores).sort().slice(-1)[0];
  const latest = uScores[latestKey];
  const totalNow = latest ? SKILLS.reduce((s,sk)=>s+(latest[sk.k]||1),0) : null;
  const totalBase = base ? SKILLS.reduce((s,sk)=>s+(base[sk.k]||1),0) : null;
  return (
    <div>
      <H1 title={"Xin chào, "+userName+"!"} sub="Hành trình phát triển của bạn"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10,marginBottom:16}}>
        {[
          {label:"Bài tập xong",val:done+"/"+myTasks.length,color:coCfg.color},
          {label:"Báo cáo đã nộp",val:myReports.length,color:"#3B6FE8"},
          {label:"Điểm hiện tại",val:totalNow?(totalNow+"/"+(SKILLS.length*5)):"—",color:"#27AE60"},
        ].map(s=>(
          <div key={s.label} style={{...cardSt,textAlign:"center",marginBottom:0}}>
            <div style={{fontSize:20,fontWeight:900,color:s.color}}>{s.val}</div>
            <div style={{fontSize:11,color:C.gray,marginTop:2}}>{s.label}</div>
          </div>
        ))}
      </div>
      {!base&&<div style={{...cardSt,borderLeft:"3px solid #E8904A",background:"#FEF9F0"}}><b style={{color:C.navy}}>⚠️ Chưa có baseline</b><p style={{fontSize:12,color:C.gray,margin:"4px 0 0"}}>Trainer sẽ thiết lập trong buổi học đầu tiên.</p></div>}
      {base&&totalNow&&totalBase&&totalNow>totalBase&&<div style={{...cardSt,borderLeft:"3px solid #27AE60",background:"#EEFAF4"}}><b style={{color:C.navy}}>🌱 Bạn đã tăng {totalNow-totalBase} điểm so với ngày đầu!</b><p style={{fontSize:12,color:C.gray,margin:"4px 0 0"}}>Baseline: {totalBase} → Hiện tại: {totalNow}</p></div>}
      {myTasks.filter(t=>t.status!=="xong").slice(0,3).map(t=>(
        <div key={t.id} style={{...cardSt,borderLeft:"3px solid "+(STATUS[t.status]?.color||C.gray)}}>
          <div style={{fontWeight:700,color:C.navy,fontSize:13}}>{t.title}</div>
          <div style={{fontSize:11,color:C.gray,marginTop:2}}>{t.cat}{t.deadline?" — ⏰ "+fmt(t.deadline):""}</div>
        </div>
      ))}
    </div>
  );
}

function TrTasks({ myTasks, db, upd, coCfg }) {
  const [exp, setExp] = useState(null);
  return (
    <div>
      <H1 title="Bài tập của tôi" sub={myTasks.length+" bài"}/>
      {myTasks.length===0&&<Empty text="Chưa có bài tập nào"/>}
      {myTasks.map(t=>{
        const st=STATUS[t.status]||STATUS.chua;
        return (
          <div key={t.id} style={{...cardSt,borderLeft:"3px solid "+st.color,padding:0,overflow:"hidden"}}>
            <div onClick={()=>setExp(exp===t.id?null:t.id)} style={{padding:"13px 16px",cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
                <div>
                  <Tag text={t.cat} color={coCfg.color}/><Tag text={st.label} color={st.color}/>
                  <div style={{fontWeight:700,color:C.navy,marginTop:4}}>{t.title}</div>
                  {t.output&&<div style={{fontSize:12,color:C.gray,marginTop:2}}>📋 {t.output}</div>}
                </div>
                <div style={{fontSize:11,color:t.deadline&&t.deadline<today()&&t.status!=="xong"?"#E84A4A":C.gray,flexShrink:0,textAlign:"right"}}>
                  {t.deadline?fmt(t.deadline):""}<br/>{exp===t.id?"▲":"▼"}
                </div>
              </div>
            </div>
            {exp===t.id&&(
              <div style={{padding:"0 16px 14px",borderTop:"1px solid "+C.border}}>
                {t.content&&<p style={{fontSize:13,color:C.navy,lineHeight:1.6,margin:"10px 0"}}>{t.content}</p>}
                {t.link&&<a href={t.link} target="_blank" rel="noreferrer" style={{fontSize:12,color:"#3B6FE8",display:"block",marginBottom:8}}>📁 Tài liệu →</a>}
                <div style={{fontSize:11,fontWeight:700,color:C.gray,marginBottom:8}}>CẬP NHẬT TRẠNG THÁI</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {Object.entries(STATUS).map(([k,v])=>(
                    <Btn key={k} onClick={()=>upd("tasks",db.tasks.map(x=>x.id===t.id?{...x,status:k}:x))} color={t.status===k?v.color:"#eee"} textColor={t.status===k?"#fff":C.gray} small>{v.label}</Btn>
                  ))}
                </div>
                {t.status==="xong"&&<p style={{color:"#27AE60",fontWeight:700,fontSize:13,marginTop:8}}>✅ Nhớ upload file lên Google Drive và báo cáo cho Trainer!</p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TrReport({ userName, company, db, upd, coCfg }) {
  const [type, setType] = useState("lesson");
  const [phase, setPhase] = useState("pre");
  const [pre, setPre] = useState(defScore());
  const [post, setPost] = useState(defScore());
  const [form, setForm] = useState({learned:"",apply:"",unclear:"",progress:"",stuck:"",decision:"",applied:""});
  const [done, setDone] = useState(false);

  const submit = async () => {
    const r = {id:Date.now(),company,user:userName,date:today(),type,selfPre:pre,selfPost:type==="lesson"?post:undefined,...form,read:false};
    await upd("reports",[...db.reports,r]);
    setDone(true);
  };

  if (done) return (
    <div style={{textAlign:"center",padding:40}}>
      <div style={{fontSize:48}}>✅</div>
      <div style={{fontSize:18,fontWeight:800,color:C.navy,marginBottom:8}}>Đã nộp báo cáo!</div>
      <div style={{fontSize:13,color:C.gray,marginBottom:20}}>Trainer sẽ xem và phản hồi sớm.</div>
      <Btn onClick={()=>{setDone(false);setPhase("pre");setForm({learned:"",apply:"",unclear:"",progress:"",stuck:"",decision:"",applied:""});}} color={coCfg.color}>Nộp báo cáo khác</Btn>
    </div>
  );

  return (
    <div>
      <H1 title="Nộp báo cáo"/>
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        {[["lesson","📖 Sau buổi học"],["weekly","📅 Báo cáo tuần"]].map(([k,lb])=>(
          <Btn key={k} onClick={()=>setType(k)} color={type===k?coCfg.color:"#eee"} textColor={type===k?"#fff":C.gray} style={{flex:1}}>{lb}</Btn>
        ))}
      </div>

      {type==="lesson"&&(
        <>
          <div style={{display:"flex",borderRadius:10,overflow:"hidden",border:"1px solid "+C.border,marginBottom:16}}>
            {[["pre","① Trước học"],["content","② Đúc kết"],["post","③ Sau học"]].map(([k,lb])=>(
              <button key={k} onClick={()=>setPhase(k)} style={{flex:1,padding:"10px",border:"none",background:phase===k?coCfg.color:"#F8F8F6",color:phase===k?"#fff":C.gray,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{lb}</button>
            ))}
          </div>
          {phase==="pre"&&(
            <div style={cardSt}>
              <div style={{fontWeight:700,color:C.navy,marginBottom:4}}>Tự chấm điểm TRƯỚC khi học</div>
              <p style={{fontSize:12,color:C.gray,marginTop:0}}>1 = chưa biết gì · 5 = rất tự tin</p>
              {SKILLS.map(sk=><ScoreRow key={sk.k} skill={sk} scores={pre} setScores={setPre} color={coCfg.color}/>)}
              <Btn onClick={()=>setPhase("content")} color={coCfg.color} full>Đã chấm → Vào buổi học ▶</Btn>
            </div>
          )}
          {phase==="content"&&(
            <div style={cardSt}>
              <div style={{fontWeight:700,color:C.navy,marginBottom:12}}>Đúc kết sau buổi học</div>
              <span style={lblSt}>💡 Tôi học được gì hôm nay?</span>
              <textarea value={form.learned} onChange={e=>setForm(f=>({...f,learned:e.target.value}))} placeholder="Điều quan trọng nhất bạn nhận ra..." style={{...inpSt,minHeight:70,resize:"vertical"}}/>
              <span style={lblSt}>🎯 Tuần này tôi sẽ áp dụng điều gì vào thực tế?</span>
              <textarea value={form.apply} onChange={e=>setForm(f=>({...f,apply:e.target.value}))} placeholder="Cụ thể làm gì, với ai, khi nào..." style={{...inpSt,minHeight:70,resize:"vertical"}}/>
              <span style={lblSt}>❓ Tôi vẫn chưa rõ điều gì?</span>
              <textarea value={form.unclear} onChange={e=>setForm(f=>({...f,unclear:e.target.value}))} placeholder="Điểm nào còn mơ hồ..." style={{...inpSt,minHeight:60,resize:"vertical"}}/>
              <Btn onClick={()=>setPhase("post")} color={coCfg.color} full>Tiếp theo: Tự chấm sau học →</Btn>
            </div>
          )}
          {phase==="post"&&(
            <div style={cardSt}>
              <div style={{fontWeight:700,color:C.navy,marginBottom:4}}>Tự chấm điểm SAU khi học</div>
              <p style={{fontSize:12,color:C.gray,marginTop:0}}>Cảm thấy thay đổi thế nào?</p>
              {SKILLS.map(sk=>{
                const d=post[sk.k]-pre[sk.k];
                return (
                  <div key={sk.k} style={{marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontWeight:600,color:C.navy,fontSize:13}}>{sk.icon} {sk.label}</span>
                      <span style={{fontSize:11,fontWeight:700,color:d>0?"#27AE60":d<0?"#E84A4A":C.gray}}>
                        {pre[sk.k]}→{post[sk.k]} {d>0?"(+"+ d+")":d<0?"("+d+")":"(=)"}
                      </span>
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      {[1,2,3,4,5].map(v=>(
                        <button key={v} onClick={()=>setPost(f=>({...f,[sk.k]:v}))} style={{flex:1,padding:"8px 0",border:"1.5px solid",borderColor:post[sk.k]>=v?coCfg.color:"#E0D9CE",background:post[sk.k]>=v?coCfg.color+"18":"#FAFAF8",color:post[sk.k]>=v?coCfg.color:C.gray,fontWeight:800,fontSize:13,cursor:"pointer",borderRadius:8,fontFamily:"inherit"}}>{v}</button>
                      ))}
                    </div>
                  </div>
                );
              })}
              <Btn onClick={submit} color={coCfg.color} full style={{padding:"13px"}}>✅ Nộp báo cáo</Btn>
            </div>
          )}
        </>
      )}

      {type==="weekly"&&(
        <div style={cardSt}>
          <span style={lblSt}>📌 Tiến độ bài tập tuần này</span>
          <textarea value={form.progress} onChange={e=>setForm(f=>({...f,progress:e.target.value}))} placeholder="Bài nào xong, đang làm, chưa làm..." style={{...inpSt,minHeight:70,resize:"vertical"}}/>
          <span style={lblSt}>🔧 Đang kẹt ở đâu?</span>
          <textarea value={form.stuck} onChange={e=>setForm(f=>({...f,stuck:e.target.value}))} placeholder="Khó khăn cụ thể..." style={{...inpSt,minHeight:60,resize:"vertical"}}/>
          <span style={lblSt}>⚡ Quyết định nào tôi đưa ra tuần này?</span>
          <textarea value={form.decision} onChange={e=>setForm(f=>({...f,decision:e.target.value}))} placeholder="Quyết định gì, xử lý thế nào..." style={{...inpSt,minHeight:70,resize:"vertical"}}/>
          <span style={lblSt}>✅ Áp dụng bài học vào thực tế thế nào?</span>
          <textarea value={form.applied} onChange={e=>setForm(f=>({...f,applied:e.target.value}))} placeholder="Làm gì cụ thể, kết quả ra sao..." style={{...inpSt,minHeight:70,resize:"vertical"}}/>
          <div style={{borderTop:"1px solid "+C.border,paddingTop:14,marginBottom:12}}>
            <div style={{fontWeight:700,color:C.navy,fontSize:13,marginBottom:10}}>Tự chấm 6 nhóm năng lực</div>
            {SKILLS.map(sk=><ScoreRow key={sk.k} skill={sk} scores={pre} setScores={setPre} color={coCfg.color}/>)}
          </div>
          <Btn onClick={submit} color={coCfg.color} full style={{padding:"13px"}}>✅ Nộp báo cáo tuần</Btn>
        </div>
      )}
    </div>
  );
}

function TrLessons({ myLessons, coCfg }) {
  const [exp, setExp] = useState(null);
  return (
    <div>
      <H1 title="Bài giảng" sub={myLessons.length+" bài học"}/>
      {myLessons.length===0&&<Empty text="Trainer chưa thêm bài giảng nào"/>}
      {myLessons.map(l=>(
        <div key={l.id} style={{...cardSt,borderLeft:"3px solid "+coCfg.color}}>
          <div onClick={()=>setExp(exp===l.id?null:l.id)} style={{cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                {l.module&&<Tag text={l.module} color={coCfg.color}/>}
                <div style={{fontWeight:800,color:C.navy,marginTop:4}}>{l.title}</div>
                <div style={{fontSize:11,color:C.gray,marginTop:2}}>{fmt(l.date)} {l.video?"🎬":""}{l.link?"📁":""}</div>
              </div>
              <span style={{color:C.gray}}>{exp===l.id?"▲":"▼"}</span>
            </div>
          </div>
          {exp===l.id&&(
            <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid "+C.border}}>
              {l.content&&<p style={{fontSize:13,color:C.navy,lineHeight:1.7,whiteSpace:"pre-wrap",margin:"0 0 12px"}}>{l.content}</p>}
              <div style={{display:"flex",gap:10}}>
                {l.video&&<a href={l.video} target="_blank" rel="noreferrer" style={{fontSize:13,color:"#fff",background:"#E84A4A",padding:"6px 14px",borderRadius:7,textDecoration:"none",fontWeight:700}}>▶ Video</a>}
                {l.link&&<a href={l.link} target="_blank" rel="noreferrer" style={{fontSize:13,color:"#fff",background:"#3B6FE8",padding:"6px 14px",borderRadius:7,textDecoration:"none",fontWeight:700}}>📁 Tài liệu</a>}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TrJourney({ userName, db, coCfg, myReports }) {
  const base = db.baselines[userName];
  const uScores = db.scores[userName]||{};
  const totalBase = base ? SKILLS.reduce((s,sk)=>s+(base[sk.k]||1),0) : null;
  return (
    <div>
      <H1 title="Hành trình phát triển" sub="Nhìn lại bạn đã đi bao xa"/>
      {!base?(
        <div style={{...cardSt,borderLeft:"3px solid #E8904A"}}><b style={{color:C.navy}}>⏳ Chưa có baseline</b><p style={{fontSize:12,color:C.gray,margin:"4px 0 0"}}>Trainer sẽ thiết lập trong buổi học đầu tiên.</p></div>
      ):(
        <>
          <div style={{...cardSt,borderTop:"3px solid #C9A84C",background:"#FDF8EE"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#C9A84C",marginBottom:8}}>🏁 ĐIỂM KHỞI ĐẦU — {fmt(base.date)}</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {SKILLS.map(sk=><div key={sk.k} style={{textAlign:"center",minWidth:44}}><div style={{fontSize:20,fontWeight:900,color:"#C9A84C"}}>{base[sk.k]||1}</div><div style={{fontSize:10,color:C.gray}}>{sk.icon}</div></div>)}
            </div>
            <div style={{fontSize:12,color:C.gray,marginTop:6}}>Tổng: {totalBase}/{SKILLS.length*5} điểm</div>
          </div>
          {Object.entries(uScores).sort((a,b)=>b[0].localeCompare(a[0])).map(([d,sc])=>{
            const total=SKILLS.reduce((s,sk)=>s+(sc[sk.k]||1),0);
            const delta=total-totalBase;
            return (
              <div key={d} style={{...cardSt,borderLeft:"3px solid "+(delta>0?"#27AE60":C.gray)}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <span style={{fontWeight:700,color:C.navy}}>{fmt(d)}</span>
                  <div>
                    <span style={{fontSize:18,fontWeight:900,color:coCfg.color}}>{total}/{SKILLS.length*5}</span>
                    <span style={{fontSize:12,fontWeight:700,color:delta>0?"#27AE60":"#E84A4A",marginLeft:8}}>({delta>0?"+":""}{delta} vs baseline)</span>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {SKILLS.map(sk=>{const d2=(sc[sk.k]||1)-(base[sk.k]||1);return(
                    <div key={sk.k} style={{textAlign:"center",minWidth:44}}>
                      <div style={{fontSize:18,fontWeight:900,color:d2>0?"#27AE60":d2<0?"#E84A4A":coCfg.color}}>{sc[sk.k]||1}</div>
                      <div style={{fontSize:10,color:C.gray}}>{sk.icon}</div>
                      {d2!==0&&<div style={{fontSize:9,fontWeight:700,color:d2>0?"#27AE60":"#E84A4A"}}>{d2>0?"+":""}{d2}</div>}
                    </div>
                  );})}
                </div>
              </div>
            );
          })}
        </>
      )}
      {myReports.length>0&&(
        <>
          <H1 title="Nhật ký học tập" sub={myReports.length+" lần báo cáo"}/>
          {myReports.sort((a,b)=>b.date.localeCompare(a.date)).map(r=>(
            <div key={r.id} style={{...cardSt,borderLeft:"3px solid "+coCfg.color}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:11,fontWeight:700,color:coCfg.color,textTransform:"uppercase"}}>{r.type==="weekly"?"Báo cáo tuần":"Đúc kết sau học"}</span>
                <span style={{fontSize:11,color:C.gray}}>{fmt(r.date)}</span>
              </div>
              {r.learned&&<InfoBlock icon="💡" title="Học được" text={r.learned}/>}
              {r.apply&&<InfoBlock icon="🎯" title="Áp dụng" text={r.apply}/>}
              {r.applied&&<InfoBlock icon="✅" title="Đã làm" text={r.applied}/>}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  if (!session) return <Login onLogin={(role,co,name)=>setSession({role,co,name})}/>;
  if (session.role==="trainer") return <Trainer onLogout={()=>setSession(null)}/>;
  return <Trainee company={session.co} userName={session.name} onLogout={()=>setSession(null)}/>;
}
