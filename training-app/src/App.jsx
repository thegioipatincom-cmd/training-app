import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore, doc, getDoc, setDoc, collection,
  addDoc, deleteDoc, onSnapshot, orderBy, query
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCB3sdD4u4WZTqQtg4tCzbnFz_B434BPjs",
  authDomain: "hoa050825.firebaseapp.com",
  projectId: "hoa050825",
  storageBucket: "hoa050825.firebasestorage.app",
  messagingSenderId: "143707883942",
  appId: "1:143707883942:web:2e71d8d23b28a72d966767",
  measurementId: "G-MSDW28VFGH"
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const TRAINER_PASS = "hue2024";
const COMPANIES = {
  qjc: { label: "QJC", color: "#e11d48", members: ["Anh Tình", "Hoa", "Phượng"] },
  centosy: { label: "CENTOSY", color: "#7c3aed", members: ["Hoài", "Nhi", "Hạnh", "Hoá", "Vân", "Phú", "Thuỷ"] }
};
const SKILLS = {
  cn: "Quản lý con người", qd: "Ra quyết định", tg: "Quản lý thời gian",
  ds: "Đọc số / Tài chính", ht: "Xây hệ thống", ld: "Tư duy lãnh đạo"
};
const CATS = {
  tc: "Thực chiến", vh: "Văn hoá", kn: "Kỹ năng", qt: "Quy trình",
  cs: "Chiến lược", kd: "Kinh doanh", hr: "Nhân sự", kt: "Kế toán"
};
const STATUS = {
  chua: { label: "Chưa làm", color: "#64748b" },
  dang: { label: "Đang làm", color: "#f59e0b" },
  xong: { label: "Hoàn thành", color: "#10b981" },
  tre:  { label: "Trễ hạn", color: "#ef4444" }
};

async function dbLoad(key) {
  const snap = await getDoc(doc(db, "data", key));
  return snap.exists() ? snap.data().value : null;
}
async function dbSave(key, val) {
  await setDoc(doc(db, "data", key), { value: val });
}

const Btn = ({ children, onClick, color = "#3b82f6", small, disabled, variant }) => {
  const base = { padding: small ? "4px 10px" : "8px 18px", borderRadius: 8, border: "none", cursor: disabled ? "not-allowed" : "pointer", fontWeight: 600, fontSize: small ? 12 : 14, transition: "all 0.15s", opacity: disabled ? 0.5 : 1 };
  if (variant === "ghost") return <button style={{ ...base, background: "transparent", color: "#64748b", border: "1px solid #e2e8f0" }} onClick={onClick} disabled={disabled}>{children}</button>;
  if (variant === "danger") return <button style={{ ...base, background: "#fee2e2", color: "#ef4444" }} onClick={onClick} disabled={disabled}>{children}</button>;
  return <button style={{ ...base, background: color, color: "#fff" }} onClick={onClick} disabled={disabled}>{children}</button>;
};
const Tag = ({ text, color = "#e2e8f0", textColor = "#475569" }) => (
  <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 99, background: color, color: textColor, fontSize: 11, fontWeight: 600 }}>{text}</span>
);
const H1 = ({ children }) => <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", margin: "0 0 20px" }}>{children}</h1>;
const Card = ({ children, style }) => <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginBottom: 16, ...style }}>{children}</div>;
const Empty = ({ text }) => <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px 0", fontSize: 14 }}>{text || "Chưa có dữ liệu"}</div>;
const ScoreRow = ({ label, score, max = 5, onChange }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
    <span style={{ width: 180, fontSize: 13, color: "#475569" }}>{label}</span>
    {[1,2,3,4,5].map(n => (
      <div key={n} onClick={() => onChange && onChange(n)} style={{ width: 28, height: 28, borderRadius: 6, cursor: onChange ? "pointer" : "default", background: n <= score ? "#f59e0b" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: n <= score ? "#fff" : "#cbd5e1" }}>{n}</div>
    ))}
    <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 4 }}>{score || 0}/{max}</span>
  </div>
);

function Login({ onLogin }) {
  const [pass, setPass] = useState(""); const [company, setCompany] = useState("qjc");
  const [member, setMember] = useState(""); const [mode, setMode] = useState("student"); const [err, setErr] = useState("");
  const members = COMPANIES[company]?.members || [];
  function doLogin() {
    if (mode === "trainer") { if (pass === TRAINER_PASS) onLogin({ role: "trainer", company }); else setErr("Sai mật khẩu trainer"); }
    else { if (!member) { setErr("Chọn thành viên"); return; } onLogin({ role: "student", company, member }); }
  }
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#667eea,#764ba2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 40, width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 40 }}>🎯</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", margin: "8px 0 4px" }}>Training System</h2>
          <p style={{ color: "#94a3b8", fontSize: 13 }}>QJC & CENTOSY</p>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 20, background: "#f1f5f9", padding: 4, borderRadius: 10 }}>
          {["student","trainer"].map(m => (
            <button key={m} onClick={() => { setMode(m); setErr(""); }}
              style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, background: mode === m ? "#fff" : "transparent", color: mode === m ? "#1e293b" : "#94a3b8", boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}>
              {m === "student" ? "👤 Học viên" : "🎓 Trainer"}
            </button>
          ))}
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>CÔNG TY</label>
          <div style={{ display: "flex", gap: 8 }}>
            {Object.entries(COMPANIES).map(([k, v]) => (
              <button key={k} onClick={() => { setCompany(k); setMember(""); }}
                style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `2px solid ${company === k ? v.color : "#e2e8f0"}`, background: company === k ? v.color + "15" : "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14, color: company === k ? v.color : "#94a3b8" }}>
                {v.label}
              </button>
            ))}
          </div>
        </div>
        {mode === "student" && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>THÀNH VIÊN</label>
            <select value={member} onChange={e => setMember(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "2px solid #e2e8f0", fontSize: 14, outline: "none" }}>
              <option value="">-- Chọn thành viên --</option>
              {members.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        )}
        {mode === "trainer" && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>MẬT KHẨU TRAINER</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && doLogin()} placeholder="Nhập mật khẩu..." style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "2px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
        )}
        {err && <p style={{ color: "#ef4444", fontSize: 13, margin: "8px 0" }}>{err}</p>}
        <Btn onClick={doLogin} color={COMPANIES[company]?.color || "#3b82f6"} style={{ width: "100%" }}>Đăng nhập →</Btn>
      </div>
    </div>
  );
}

function TrainerApp({ session, onLogout }) {
  const [tab, setTab] = useState("tasks");
  const [company, setCompany] = useState(session.company);
  const tabs = [{ id: "tasks", icon: "📋", label: "Nhiệm vụ" }, { id: "scores", icon: "⭐", label: "Đánh giá" }, { id: "lessons", icon: "📚", label: "Bài học" }];
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 24 }}>🎯</span>
          <div><div style={{ fontWeight: 800, fontSize: 16, color: "#1e293b" }}>Training System — Trainer</div><div style={{ fontSize: 12, color: "#94a3b8" }}>Quản lý toàn bộ hệ thống</div></div>
          <div style={{ display: "flex", gap: 8, marginLeft: 20 }}>
            {Object.entries(COMPANIES).map(([k, v]) => (
              <button key={k} onClick={() => setCompany(k)} style={{ padding: "4px 14px", borderRadius: 99, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, background: company === k ? v.color : "#f1f5f9", color: company === k ? "#fff" : "#64748b" }}>{v.label}</button>
            ))}
          </div>
        </div>
        <Btn onClick={onLogout} variant="ghost" small>Đăng xuất</Btn>
      </div>
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 24px", display: "flex", gap: 4 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "14px 18px", border: "none", background: "transparent", cursor: "pointer", fontWeight: 600, fontSize: 14, color: tab === t.id ? "#3b82f6" : "#64748b", borderBottom: tab === t.id ? "2px solid #3b82f6" : "2px solid transparent" }}>{t.icon} {t.label}</button>
        ))}
      </div>
      <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
        {tab === "tasks" && <TasksManager company={company} isTrainer />}
        {tab === "scores" && <ScoresManager company={company} />}
        {tab === "lessons" && <LessonsManager />}
      </div>
    </div>
  );
}

function TasksManager({ company, isTrainer, member: filterMember }) {
  const [tasks, setTasks] = useState([]); const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ title: "", member: "", cat: "tc", skill: "cn", deadline: "", note: "" });
  const companyData = COMPANIES[company];
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, `tasks_${company}`), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => { setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); });
    return unsub;
  }, [company]);
  async function addTask() {
    if (!form.title || !form.member) return;
    await addDoc(collection(db, `tasks_${company}`), { ...form, status: "chua", createdAt: Date.now() });
    setForm({ title: "", member: "", cat: "tc", skill: "cn", deadline: "", note: "" }); setShowForm(false);
  }
  async function updateStatus(id, status) { await setDoc(doc(db, `tasks_${company}`, id), { status }, { merge: true }); }
  async function deleteTask(id) { if (!window.confirm("Xóa nhiệm vụ này?")) return; await deleteDoc(doc(db, `tasks_${company}`, id)); }
  let filtered = tasks;
  if (filterMember) filtered = filtered.filter(t => t.member === filterMember);
  if (filter !== "all") filtered = filtered.filter(t => t.status === filter);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <H1>{companyData?.label} — Nhiệm vụ {filterMember ? `của ${filterMember}` : ""}</H1>
        {isTrainer && <Btn onClick={() => setShowForm(!showForm)} color="#10b981">+ Thêm nhiệm vụ</Btn>}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["all", ...Object.keys(STATUS)].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: "5px 14px", borderRadius: 99, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: filter === s ? (s === "all" ? "#3b82f6" : STATUS[s]?.color) : "#f1f5f9", color: filter === s ? "#fff" : "#64748b" }}>
            {s === "all" ? "Tất cả" : STATUS[s].label}
          </button>
        ))}
      </div>
      {isTrainer && showForm && (
        <Card style={{ borderLeft: "4px solid #10b981" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Thêm nhiệm vụ mới</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Tiêu đề *</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Tên nhiệm vụ..." style={inputStyle} /></div>
            <div><label style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Thành viên *</label><select value={form.member} onChange={e => setForm({...form, member: e.target.value})} style={inputStyle}><option value="">-- Chọn --</option>{companyData?.members.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
            <div><label style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Danh mục</label><select value={form.cat} onChange={e => setForm({...form, cat: e.target.value})} style={inputStyle}>{Object.entries(CATS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div><label style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Kỹ năng</label><select value={form.skill} onChange={e => setForm({...form, skill: e.target.value})} style={inputStyle}>{Object.entries(SKILLS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div><label style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Deadline</label><input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} style={inputStyle} /></div>
            <div><label style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Ghi chú</label><input value={form.note} onChange={e => setForm({...form, note: e.target.value})} placeholder="Ghi chú..." style={inputStyle} /></div>
          </div>
          <div style={{ display: "flex", gap: 8 }}><Btn onClick={addTask} color="#10b981">Lưu nhiệm vụ</Btn><Btn onClick={() => setShowForm(false)} variant="ghost">Huỷ</Btn></div>
        </Card>
      )}
      {loading ? <Empty text="Đang tải..." /> : filtered.length === 0 ? <Empty text="Không có nhiệm vụ nào" /> : (
        <div>
          {filtered.map(task => (
            <Card key={task.id} style={{ borderLeft: `4px solid ${STATUS[task.status]?.color}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>{task.title}</span>
                    <Tag text={STATUS[task.status]?.label} color={STATUS[task.status]?.color + "20"} textColor={STATUS[task.status]?.color} />
                    {task.cat && <Tag text={CATS[task.cat]} />}
                    {task.skill && <Tag text={SKILLS[task.skill]} color="#dbeafe" textColor="#2563eb" />}
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#94a3b8" }}>
                    {task.member && <span>👤 {task.member}</span>}
                    {task.deadline && <span>📅 {task.deadline}</span>}
                    {task.note && <span>📝 {task.note}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: 12 }}>
                  <select value={task.status} onChange={e => updateStatus(task.id, e.target.value)} style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, cursor: "pointer" }}>
                    {Object.entries(STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  {isTrainer && <Btn onClick={() => deleteTask(task.id)} variant="danger" small>Xóa</Btn>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ScoresManager({ company }) {
  const [scores, setScores] = useState({}); const [saving, setSaving] = useState({});
  const companyData = COMPANIES[company];
  useEffect(() => {
    async function load() {
      const s = {};
      for (const m of companyData.members) { const val = await dbLoad(`scores_${company}_${m}`); s[m] = val ? JSON.parse(val) : {}; }
      setScores(s);
    }
    load();
  }, [company]);
  async function setScore(member, skill, val) {
    const updated = { ...(scores[member] || {}), [skill]: val };
    setScores(prev => ({ ...prev, [member]: updated }));
    setSaving(prev => ({ ...prev, [member]: true }));
    await dbSave(`scores_${company}_${member}`, JSON.stringify(updated));
    setTimeout(() => setSaving(prev => ({ ...prev, [member]: false })), 800);
  }
  return (
    <div>
      <H1>{companyData?.label} — Đánh giá kỹ năng</H1>
      {companyData?.members.map(member => (
        <Card key={member}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b" }}>👤 {member}</h3>
            {saving[member] && <span style={{ fontSize: 12, color: "#10b981" }}>✓ Đã lưu</span>}
          </div>
          {Object.entries(SKILLS).map(([k, label]) => (
            <ScoreRow key={k} label={label} score={scores[member]?.[k] || 0} onChange={val => setScore(member, k, val)} />
          ))}
        </Card>
      ))}
    </div>
  );
}

function LessonsManager() {
  const [lessons, setLessons] = useState([]); const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", type: "video", content: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [quiz, setQuiz] = useState([{ q: "", a: ["", "", ""], correct: 0 }]);
  useEffect(() => {
    const q = query(collection(db, "lessons"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => { setLessons(snap.docs.map(d => ({ id: d.id, ...d.data() }))); });
    return unsub;
  }, []);
  async function saveLesson() {
    if (!form.title) return; setSaving(true);
    await addDoc(collection(db, "lessons"), { ...form, quiz: form.type === "quiz" ? quiz : [], createdAt: Date.now() });
    setForm({ title: "", type: "video", content: "", description: "" });
    setQuiz([{ q: "", a: ["", "", ""], correct: 0 }]); setShowForm(false); setSaving(false);
  }
  async function deleteLesson(lesson) {
    if (!window.confirm(`Xóa bài "${lesson.title}"?`)) return;
    await deleteDoc(doc(db, "lessons", lesson.id));
  }
  const typeIcon = { video: "🎬", pdf: "📄", text: "📝", quiz: "🧠" };
  const typeLabel = { video: "YouTube", pdf: "PDF (link)", text: "Văn bản", quiz: "Trắc nghiệm" };
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <H1>📚 Quản lý bài học</H1>
        <Btn onClick={() => setShowForm(!showForm)} color="#8b5cf6">+ Thêm bài học</Btn>
      </div>
      {showForm && (
        <Card style={{ borderLeft: "4px solid #8b5cf6" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Tạo bài học mới</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div style={{ gridColumn: "1/-1" }}><label style={labelStyle}>Tiêu đề bài học *</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="VD: Cách quản lý thời gian hiệu quả" style={inputStyle} /></div>
            <div><label style={labelStyle}>Loại nội dung</label><select value={form.type} onChange={e => setForm({...form, type: e.target.value, content: ""})} style={inputStyle}><option value="video">🎬 YouTube video</option><option value="pdf">📄 PDF (paste link Drive/Dropbox)</option><option value="text">📝 Văn bản</option><option value="quiz">🧠 Trắc nghiệm</option></select></div>
            <div><label style={labelStyle}>Mô tả ngắn</label><input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Tóm tắt nội dung..." style={inputStyle} /></div>
          </div>
          {form.type === "video" && <div style={{ marginBottom: 14 }}><label style={labelStyle}>YouTube URL</label><input value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="https://youtube.com/watch?v=..." style={inputStyle} /></div>}
          {form.type === "pdf" && (
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Link PDF (Google Drive, Dropbox...)</label>
              <input value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="https://drive.google.com/file/d/..." style={inputStyle} />
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "6px 0 0" }}>💡 Google Drive: mở file → Share → Anyone with link → copy link</p>
            </div>
          )}
          {form.type === "text" && <div style={{ marginBottom: 14 }}><label style={labelStyle}>Nội dung văn bản</label><textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="Nhập nội dung bài học..." rows={8} style={{ ...inputStyle, resize: "vertical" }} /></div>}
          {form.type === "quiz" && (
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Câu hỏi trắc nghiệm</label>
              {quiz.map((q, qi) => (
                <div key={qi} style={{ background: "#f8fafc", borderRadius: 10, padding: 14, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>Câu {qi + 1}</span>
                    {quiz.length > 1 && <button onClick={() => setQuiz(quiz.filter((_,i) => i !== qi))} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 12 }}>✕ Xóa</button>}
                  </div>
                  <input value={q.q} onChange={e => setQuiz(quiz.map((x,i) => i === qi ? {...x, q: e.target.value} : x))} placeholder="Câu hỏi..." style={{ ...inputStyle, marginBottom: 8 }} />
                  {q.a.map((ans, ai) => (
                    <div key={ai} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                      <input type="radio" name={`q${qi}`} checked={q.correct === ai} onChange={() => setQuiz(quiz.map((x,i) => i === qi ? {...x, correct: ai} : x))} />
                      <input value={ans} onChange={e => setQuiz(quiz.map((x,i) => i === qi ? {...x, a: x.a.map((a,j) => j === ai ? e.target.value : a)} : x))} placeholder={`Đáp án ${["A","B","C","D"][ai]}...`} style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
                    </div>
                  ))}
                  {q.a.length < 4 && <button onClick={() => setQuiz(quiz.map((x,i) => i === qi ? {...x, a: [...x.a, ""]} : x))} style={{ fontSize: 12, color: "#8b5cf6", background: "none", border: "none", cursor: "pointer" }}>+ Thêm đáp án</button>}
                </div>
              ))}
              <Btn onClick={() => setQuiz([...quiz, { q: "", a: ["", "", ""], correct: 0 }])} variant="ghost" small>+ Thêm câu hỏi</Btn>
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={saveLesson} color="#8b5cf6" disabled={saving}>{saving ? "Đang lưu..." : "Lưu bài học"}</Btn>
            <Btn onClick={() => setShowForm(false)} variant="ghost">Huỷ</Btn>
          </div>
        </Card>
      )}
      {lessons.length === 0 ? <Empty text="Chưa có bài học nào. Bấm + Thêm bài học để bắt đầu." /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {lessons.map(lesson => (
            <Card key={lesson.id} style={{ position: "relative" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{typeIcon[lesson.type] || "📄"}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b", marginBottom: 4 }}>{lesson.title}</div>
              <Tag text={typeLabel[lesson.type] || lesson.type} color="#ede9fe" textColor="#7c3aed" />
              {lesson.description && <p style={{ fontSize: 13, color: "#64748b", margin: "8px 0 0" }}>{lesson.description}</p>}
              <div style={{ marginTop: 14 }}><Btn onClick={() => deleteLesson(lesson)} variant="danger" small>Xóa</Btn></div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StudentApp({ session, onLogout }) {
  const [tab, setTab] = useState("tasks");
  const tabs = [{ id: "tasks", icon: "📋", label: "Nhiệm vụ" }, { id: "lessons", icon: "📚", label: "Bài học" }, { id: "scores", icon: "⭐", label: "Điểm của tôi" }];
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>👤</span>
          <div><div style={{ fontWeight: 800, fontSize: 16, color: "#1e293b" }}>{session.member}</div><div style={{ fontSize: 12, color: "#94a3b8" }}>{COMPANIES[session.company]?.label}</div></div>
        </div>
        <Btn onClick={onLogout} variant="ghost" small>Đăng xuất</Btn>
      </div>
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 24px", display: "flex", gap: 4 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "14px 18px", border: "none", background: "transparent", cursor: "pointer", fontWeight: 600, fontSize: 14, color: tab === t.id ? "#3b82f6" : "#64748b", borderBottom: tab === t.id ? "2px solid #3b82f6" : "2px solid transparent" }}>{t.icon} {t.label}</button>
        ))}
      </div>
      <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
        {tab === "tasks" && <TasksManager company={session.company} member={session.member} isTrainer={false} />}
        {tab === "lessons" && <LessonsViewer />}
        {tab === "scores" && <MyScores session={session} />}
      </div>
    </div>
  );
}

function LessonsViewer() {
  const [lessons, setLessons] = useState([]); const [selected, setSelected] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({}); const [quizResult, setQuizResult] = useState(null);
  useEffect(() => {
    const q = query(collection(db, "lessons"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => { setLessons(snap.docs.map(d => ({ id: d.id, ...d.data() }))); });
    return unsub;
  }, []);
  function submitQuiz(lesson) {
    let correct = 0;
    lesson.quiz.forEach((q, i) => { if (quizAnswers[i] === q.correct) correct++; });
    setQuizResult({ correct, total: lesson.quiz.length });
  }
  function getYouTubeId(url) {
    if (!url) return "";
    const m = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : url;
  }
  if (selected) {
    return (
      <div>
        <button onClick={() => { setSelected(null); setQuizAnswers({}); setQuizResult(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#3b82f6", fontWeight: 600, fontSize: 14, marginBottom: 16 }}>← Quay lại danh sách</button>
        <Card>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", marginBottom: 8 }}>{selected.title}</h2>
          {selected.description && <p style={{ color: "#64748b", marginBottom: 16 }}>{selected.description}</p>}
          {selected.type === "video" && selected.content && (
            <div style={{ position: "relative", paddingBottom: "56.25%", borderRadius: 12, overflow: "hidden", background: "#000", marginBottom: 16 }}>
              <iframe src={`https://www.youtube.com/embed/${getYouTubeId(selected.content)}`} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }} allowFullScreen allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" />
            </div>
          )}
          {selected.type === "pdf" && selected.content && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: 20, textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>📄</div>
                <p style={{ color: "#64748b", fontSize: 14, marginBottom: 16 }}>Bấm nút bên dưới để mở tài liệu PDF</p>
                <a href={selected.content} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}><Btn color="#3b82f6">📂 Mở tài liệu PDF</Btn></a>
              </div>
            </div>
          )}
          {selected.type === "text" && (
            <div style={{ background: "#f8fafc", borderRadius: 12, padding: 20, marginBottom: 16, fontSize: 14, lineHeight: 1.8, color: "#374151", whiteSpace: "pre-wrap" }}>{selected.content}</div>
          )}
          {selected.type === "quiz" && selected.quiz?.length > 0 && (
            <div>
              {selected.quiz.map((q, qi) => (
                <div key={qi} style={{ marginBottom: 20 }}>
                  <p style={{ fontWeight: 700, fontSize: 15, color: "#1e293b", marginBottom: 10 }}>{qi + 1}. {q.q}</p>
                  {q.a.filter(Boolean).map((ans, ai) => {
                    const chosen = quizAnswers[qi] === ai; const isCorrect = quizResult && ai === q.correct; const isWrong = quizResult && chosen && ai !== q.correct;
                    return (
                      <div key={ai} onClick={() => !quizResult && setQuizAnswers({...quizAnswers, [qi]: ai})}
                        style={{ padding: "10px 16px", borderRadius: 10, marginBottom: 8, cursor: quizResult ? "default" : "pointer", border: `2px solid ${isCorrect ? "#10b981" : isWrong ? "#ef4444" : chosen ? "#3b82f6" : "#e2e8f0"}`, background: isCorrect ? "#d1fae5" : isWrong ? "#fee2e2" : chosen ? "#dbeafe" : "#fff", fontWeight: chosen ? 600 : 400, fontSize: 14, color: "#374151" }}>
                        {["A","B","C","D"][ai]}. {ans}{isCorrect && " ✓"}
                      </div>
                    );
                  })}
                </div>
              ))}
              {!quizResult ? (
                <Btn onClick={() => submitQuiz(selected)} color="#8b5cf6">Nộp bài</Btn>
              ) : (
                <div style={{ background: quizResult.correct === quizResult.total ? "#d1fae5" : "#fff7ed", borderRadius: 12, padding: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 36 }}>{quizResult.correct === quizResult.total ? "🎉" : "📊"}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, marginTop: 8 }}>{quizResult.correct}/{quizResult.total} câu đúng</div>
                  <div style={{ color: "#64748b", marginTop: 4 }}>{quizResult.correct === quizResult.total ? "Xuất sắc! Bạn trả lời đúng tất cả!" : quizResult.correct >= quizResult.total * 0.7 ? "Tốt! Hãy ôn lại các câu sai." : "Cần học lại bài này nhé!"}</div>
                  <div style={{ marginTop: 12 }}><Btn onClick={() => { setQuizAnswers({}); setQuizResult(null); }} variant="ghost" small>Làm lại</Btn></div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    );
  }
  const typeIcon = { video: "🎬", pdf: "📄", text: "📝", quiz: "🧠" };
  const typeLabel = { video: "YouTube", pdf: "PDF", text: "Văn bản", quiz: "Trắc nghiệm" };
  const typeColor = { video: "#fee2e2", pdf: "#fff7ed", text: "#f0fdf4", quiz: "#ede9fe" };
  const typeText = { video: "#dc2626", pdf: "#ea580c", text: "#16a34a", quiz: "#7c3aed" };
  return (
    <div>
      <H1>📚 Bài học của tôi</H1>
      {lessons.length === 0 ? <Empty text="Chưa có bài học nào. Trainer sẽ thêm bài học sớm!" /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {lessons.map(lesson => (
            <div key={lesson.id} onClick={() => setSelected(lesson)} style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"; }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{typeIcon[lesson.type] || "📄"}</div>
              <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: typeColor[lesson.type], color: typeText[lesson.type] }}>{typeLabel[lesson.type]}</span>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b", margin: "10px 0 4px" }}>{lesson.title}</div>
              {lesson.description && <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>{lesson.description}</p>}
              <div style={{ marginTop: 14, color: "#3b82f6", fontWeight: 600, fontSize: 13 }}>Xem bài học →</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MyScores({ session }) {
  const [scores, setScores] = useState({});
  useEffect(() => {
    async function load() { const val = await dbLoad(`scores_${session.company}_${session.member}`); if (val) setScores(JSON.parse(val)); }
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [session]);
  const total = Object.values(scores).reduce((s, v) => s + v, 0);
  const max = Object.keys(SKILLS).length * 5;
  return (
    <div>
      <H1>⭐ Điểm kỹ năng của {session.member}</H1>
      <Card style={{ marginBottom: 20, textAlign: "center", background: "linear-gradient(135deg,#667eea,#764ba2)", color: "#fff" }}>
        <div style={{ fontSize: 48, fontWeight: 800 }}>{total}</div>
        <div style={{ fontSize: 14, opacity: 0.8 }}>/ {max} điểm tổng</div>
        <div style={{ marginTop: 8, fontSize: 13, opacity: 0.7 }}>{total >= max * 0.8 ? "🏆 Xuất sắc!" : total >= max * 0.6 ? "💪 Khá tốt, tiếp tục phát triển!" : "📈 Đang trong quá trình phát triển"}</div>
      </Card>
      <Card>{Object.entries(SKILLS).map(([k, label]) => <ScoreRow key={k} label={label} score={scores[k] || 0} />)}</Card>
    </div>
  );
}

const inputStyle = { width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", marginTop: 4 };
const labelStyle = { fontSize: 12, color: "#64748b", fontWeight: 600 };

export default function App() {
  const [session, setSession] = useState(null);
  function handleLogin(s) { setSession(s); }
  function handleLogout() { setSession(null); }
  if (!session) return <Login onLogin={handleLogin} />;
  if (session.role === "trainer") return <TrainerApp session={session} onLogout={handleLogout} />;
  return <StudentApp session={session} onLogout={handleLogout} />;
                                                                                                                                                                               }
