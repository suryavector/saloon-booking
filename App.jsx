import { useState, useEffect, useCallback, createContext, useContext } from "react";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:       "#0a0a0f",
  surface:  "#12121a",
  card:     "#1a1a26",
  border:   "#2a2a3a",
  gold:     "#c9a96e",
  goldLight:"#e8c88a",
  text:     "#f0ede8",
  muted:    "#8a8799",
  accent:   "#9b7fe8",
  green:    "#4ade80",
  red:      "#f87171",
  amber:    "#fbbf24",
};

// ── Global CSS ────────────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: ${C.bg};
      color: ${C.text};
      font-family: 'DM Sans', sans-serif;
      font-weight: 300;
      min-height: 100vh;
      overflow-x: hidden;
    }

    .serif { font-family: 'Cormorant Garamond', serif; }

    /* scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: ${C.bg}; }
    ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0%,100% { opacity: 1; }
      50%      { opacity: .4; }
    }

    .fade-up { animation: fadeUp .45s ease both; }
    .fade-up-2 { animation: fadeUp .45s .1s ease both; }
    .fade-up-3 { animation: fadeUp .45s .2s ease both; }

    .gold-shimmer {
      background: linear-gradient(90deg, ${C.gold} 0%, ${C.goldLight} 40%, ${C.gold} 60%, ${C.gold} 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: shimmer 3s linear infinite;
    }

    .btn-gold {
      background: linear-gradient(135deg, ${C.gold}, ${C.goldLight});
      color: #0a0a0f;
      border: none;
      padding: 12px 28px;
      font-family: 'DM Sans', sans-serif;
      font-weight: 500;
      font-size: 14px;
      letter-spacing: .04em;
      border-radius: 2px;
      cursor: pointer;
      transition: opacity .2s, transform .15s;
    }
    .btn-gold:hover { opacity: .88; transform: translateY(-1px); }
    .btn-gold:disabled { opacity: .4; cursor: not-allowed; transform: none; }

    .btn-outline {
      background: transparent;
      color: ${C.gold};
      border: 1px solid ${C.gold};
      padding: 10px 24px;
      font-family: 'DM Sans', sans-serif;
      font-weight: 400;
      font-size: 13px;
      letter-spacing: .06em;
      border-radius: 2px;
      cursor: pointer;
      transition: background .2s, color .2s;
    }
    .btn-outline:hover { background: ${C.gold}22; }

    .btn-ghost {
      background: transparent;
      color: ${C.muted};
      border: none;
      padding: 8px 16px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      cursor: pointer;
      transition: color .2s;
    }
    .btn-ghost:hover { color: ${C.text}; }

    .card {
      background: ${C.card};
      border: 1px solid ${C.border};
      border-radius: 4px;
    }

    .input-field {
      width: 100%;
      background: ${C.surface};
      border: 1px solid ${C.border};
      color: ${C.text};
      padding: 11px 14px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      border-radius: 2px;
      outline: none;
      transition: border-color .2s;
    }
    .input-field:focus { border-color: ${C.gold}; }
    .input-field::placeholder { color: ${C.muted}; }

    .label {
      display: block;
      font-size: 11px;
      letter-spacing: .1em;
      color: ${C.muted};
      text-transform: uppercase;
      margin-bottom: 7px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      letter-spacing: .05em;
      font-weight: 500;
    }
    .badge-pending   { background: ${C.amber}22; color: ${C.amber}; border: 1px solid ${C.amber}44; }
    .badge-confirmed { background: ${C.green}22; color: ${C.green}; border: 1px solid ${C.green}44; }
    .badge-completed { background: ${C.accent}22; color: ${C.accent}; border: 1px solid ${C.accent}44; }
    .badge-cancelled { background: ${C.red}22;   color: ${C.red};   border: 1px solid ${C.red}44; }

    .spinner {
      width: 20px; height: 20px;
      border: 2px solid ${C.border};
      border-top-color: ${C.gold};
      border-radius: 50%;
      animation: spin .7s linear infinite;
    }

    .nav-link {
      color: ${C.muted};
      text-decoration: none;
      font-size: 13px;
      letter-spacing: .05em;
      cursor: pointer;
      transition: color .2s;
    }
    .nav-link:hover, .nav-link.active { color: ${C.gold}; }

    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, ${C.border}, transparent);
      margin: 24px 0;
    }

    .staff-card {
      cursor: pointer;
      transition: border-color .2s, transform .15s;
    }
    .staff-card:hover { border-color: ${C.gold}66; transform: translateY(-2px); }
    .staff-card.selected { border-color: ${C.gold} !important; }

    .slot-btn {
      background: ${C.surface};
      border: 1px solid ${C.border};
      color: ${C.text};
      padding: 8px 14px;
      font-size: 13px;
      border-radius: 2px;
      cursor: pointer;
      transition: border-color .15s, background .15s;
    }
    .slot-btn:hover { border-color: ${C.gold}88; }
    .slot-btn.selected { border-color: ${C.gold}; background: ${C.gold}18; color: ${C.gold}; }

    .tab-btn {
      padding: 8px 20px;
      font-size: 13px;
      letter-spacing: .05em;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      color: ${C.muted};
      background: transparent;
      border-top: none; border-left: none; border-right: none;
      transition: color .2s, border-color .2s;
    }
    .tab-btn.active { color: ${C.gold}; border-bottom-color: ${C.gold}; }

    /* Calendar */
    .cal-header { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
    .cal-cell {
      aspect-ratio: 1;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      font-size: 13px; border-radius: 2px; cursor: pointer;
      transition: background .15s;
    }
    .cal-cell:hover { background: ${C.card}; }
    .cal-cell.today { color: ${C.gold}; font-weight: 500; }
    .cal-cell.selected { background: ${C.gold}; color: #0a0a0f; font-weight: 600; }
    .cal-cell.other-month { color: ${C.muted}; }
    .cal-cell.has-appt::after {
      content: '';
      width: 4px; height: 4px;
      background: ${C.accent};
      border-radius: 50%;
      margin-top: 2px;
    }

    @media (max-width: 768px) {
      .hide-mobile { display: none !important; }
    }
  `}</style>
);

// ── Auth Context ──────────────────────────────────────────────────────────────
const AuthCtx = createContext(null);
const useAuth = () => useContext(AuthCtx);

// ── Mock API (replace with real fetch calls in production) ───────────────────
const SERVICES = [
  { service_id:"s1", service_name:"Haircut & Style",  price:55,  duration_minutes:60, buffer_time_minutes:10, category:"Hair",   description:"Full cut, wash & blow-dry" },
  { service_id:"s2", service_name:"Full Color",        price:120, duration_minutes:90, buffer_time_minutes:15, category:"Hair",   description:"Single-process full color" },
  { service_id:"s3", service_name:"Balayage",          price:180, duration_minutes:120,buffer_time_minutes:20, category:"Hair",   description:"Hand-painted highlights" },
  { service_id:"s4", service_name:"Manicure",          price:35,  duration_minutes:45, buffer_time_minutes:10, category:"Nails",  description:"Classic shaping & polish" },
  { service_id:"s5", service_name:"Gel Pedicure",      price:65,  duration_minutes:60, buffer_time_minutes:10, category:"Nails",  description:"Gel polish with massage" },
  { service_id:"s6", service_name:"Classic Shave",     price:40,  duration_minutes:30, buffer_time_minutes:10, category:"Barber", description:"Hot-towel straight-razor shave" },
  { service_id:"s7", service_name:"Facial Treatment",  price:90,  duration_minutes:60, buffer_time_minutes:15, category:"Spa",    description:"Deep-cleanse hydrating facial" },
];
const STAFF = [
  { staff_id:"t1", full_name:"Sofia Reyes",  role:"Senior Stylist",  is_active:true },
  { staff_id:"t2", full_name:"Marcus Chen",  role:"Colorist",        is_active:true },
  { staff_id:"t3", full_name:"Priya Nair",   role:"Nail Technician", is_active:true },
  { staff_id:"t4", full_name:"James Okafor", role:"Barber",          is_active:true },
];

let APPOINTMENTS_DB = [
  { appointment_id:"a1", user_id:"u1", staff_id:"t1", service_id:"s1",
    start_time: new Date(Date.now()+86400000).toISOString(),
    end_time:   new Date(Date.now()+86400000+4200000).toISOString(),
    status:"confirmed", total_price:55, service_name:"Haircut & Style",
    staff_name:"Sofia Reyes", staff_role:"Senior Stylist", customer_name:"Demo User", customer_email:"demo@salon.com" },
  { appointment_id:"a2", user_id:"u1", staff_id:"t2", service_id:"s2",
    start_time: new Date(Date.now()-86400000*3).toISOString(),
    end_time:   new Date(Date.now()-86400000*3+5700000).toISOString(),
    status:"completed", total_price:120, service_name:"Full Color",
    staff_name:"Marcus Chen", staff_role:"Colorist", customer_name:"Demo User", customer_email:"demo@salon.com" },
];

const API_BASE = 'http://localhost:4000/api';

const mockApi = {
  register: async (full_name, email, password) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, email, password }),
    });
    if (!res.ok) throw new Error('Registration failed');
    return res.json();
  },

  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },
  
  getServices: async () => {
    const res = await fetch(`${API_BASE}/services`);
    if (!res.ok) throw new Error('Failed to fetch services');
    return res.json();
  },
  
  getStaff: async () => {
    const res = await fetch(`${API_BASE}/staff`);
    if (!res.ok) throw new Error('Failed to fetch staff');
    return res.json();
  },
  
  getSlots: async (staffId, serviceId, date) => {
    const res = await fetch(`${API_BASE}/bookings/slots?staffId=${staffId}&serviceId=${serviceId}&date=${date}`);
    if (!res.ok) throw new Error('Failed to fetch slots');
    return res.json();
  },
  
  createAppointment: async (data, token) => {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create appointment');
    return res.json();
  },
  
  myAppointments: async (token) => {
    const res = await fetch(`${API_BASE}/bookings/my`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return res.json();
  },
  
  cancelAppointment: async (id, token) => {
    const res = await fetch(`${API_BASE}/bookings/${id}/cancel`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to cancel appointment');
    return res.json();
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (iso) => new Date(iso).toLocaleString('en-US',{ weekday:'short', month:'short', day:'numeric', hour:'numeric', minute:'2-digit' });
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('en-US',{ hour:'numeric', minute:'2-digit' });
const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US',{ weekday:'long', month:'long', day:'numeric', year:'numeric' });
const initials = (n="") => n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
const categoryColors = { Hair:"#c9a96e", Nails:"#9b7fe8", Barber:"#4ade80", Spa:"#60a5fa" };
const statusColor = (s) => ({ confirmed:C.green, pending:C.amber, completed:C.accent, cancelled:C.red, no_show:C.red }[s] || C.muted);

// ── Components ────────────────────────────────────────────────────────────────

function Avatar({ name, size=36, color=C.gold }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `${color}22`, border: `1px solid ${color}44`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize: size * .35, fontWeight: 600, color, flexShrink: 0,
      fontFamily: "'Cormorant Garamond', serif",
    }}>
      {initials(name)}
    </div>
  );
}

function Spinner({ size=20 }) {
  return <div className="spinner" style={{ width: size, height: size }} />;
}

function Badge({ status }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}

function SalonLogo() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 2C14 2 7 7 7 14C7 17.866 10.134 21 14 21C17.866 21 21 17.866 21 14C21 7 14 2 14 2Z"
          stroke={C.gold} strokeWidth="1.2" fill="none"/>
        <path d="M14 21V26M11 24H17" stroke={C.gold} strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="14" cy="14" r="3" fill={C.gold} opacity=".6"/>
      </svg>
      <span className="serif" style={{ fontSize:20, fontWeight:300, letterSpacing:".12em", color:C.text }}>
        JAGITIAL
      </span>
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────
function Nav({ page, setPage, user, logout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = user?.isAdmin
    ? [["calendar","Calendar"],["admin-services","Services"],["admin-staff","Staff"]]
    : [["home","Home"],["book","Book"],["dashboard","My Appointments"],["contact","Contact"]];

  return (
    <nav style={{
      position:"sticky", top:0, zIndex:100,
      background: `${C.bg}e8`, backdropFilter:"blur(12px)",
      borderBottom: `1px solid ${C.border}`,
      padding:"0 24px",
    }}>
      <div style={{ maxWidth:1100, margin:"0 auto", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ cursor:"pointer" }} onClick={()=>setPage("home")}>
          <SalonLogo/>
        </div>

        {/* Desktop links */}
        <div className="hide-mobile" style={{ display:"flex", gap:28, alignItems:"center" }}>
          {links.map(([k,v])=>(
            <span key={k} className={`nav-link${page===k?" active":""}`} onClick={()=>setPage(k)}>{v}</span>
          ))}
        </div>

        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          {user ? (
            <>
              <Avatar name={user.full_name} size={30}/>
              <button className="btn-ghost" style={{ fontSize:12 }} onClick={logout}>Sign Out</button>
            </>
          ) : (
            <>
              <button className="btn-ghost" onClick={()=>setPage("login")}>Sign In</button>
              <button className="btn-gold" style={{ padding:"8px 18px", fontSize:12 }} onClick={()=>setPage("register")}>Join</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function HeroPage({ setPage }) {
  return (
    <div style={{ minHeight:"calc(100vh - 60px)", display:"flex", flexDirection:"column" }}>
      {/* Hero */}
      <div style={{
        flex:1, display:"flex", alignItems:"center", justifyContent:"center",
        textAlign:"center", padding:"80px 24px",
        background:`radial-gradient(ellipse 80% 60% at 50% 0%, ${C.gold}0a, transparent)`,
      }}>
        <div className="fade-up" style={{ maxWidth:640 }}>
          <p style={{ fontSize:11, letterSpacing:".25em", color:C.gold, textTransform:"uppercase", marginBottom:24 }}>
            Professional Hair Salon
          </p>
          <h1 className="serif" style={{ fontSize:"clamp(48px,8vw,88px)", lineHeight:1.05, fontWeight:300, marginBottom:28 }}>
            Your Perfect Hair<br/>
            <em className="gold-shimmer" style={{ fontStyle:"italic" }}>Starts Here</em>
          </h1>
          <p style={{ color:C.muted, lineHeight:1.8, marginBottom:40, fontSize:15 }}>
            Premium hair care and styling in Jagitial. Our experienced stylists deliver exceptional results with personalized service.
          </p>
          <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
            <button className="btn-gold" style={{ fontSize:14, padding:"14px 36px" }} onClick={()=>setPage("book")}>
              Book Appointment
            </button>
            <button className="btn-outline" onClick={()=>setPage("contact")}>Our Location</button>
          </div>
        </div>
      </div>

      {/* Services preview */}
      <div style={{ padding:"60px 24px", maxWidth:1100, margin:"0 auto", width:"100%" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <p style={{ fontSize:11, letterSpacing:".2em", color:C.gold, textTransform:"uppercase", marginBottom:12 }}>What We Offer</p>
          <h2 className="serif" style={{ fontSize:36, fontWeight:300 }}>Our Services</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16 }}>
          {["Hair","Nails","Barber","Spa"].map((cat, i) => (
            <div key={cat} className="card fade-up" style={{ padding:28, animationDelay:`${i*.08}s`, cursor:"pointer" }}
              onClick={()=>setPage("book")}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:`${categoryColors[cat]}22`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
                <div style={{ width:12, height:12, borderRadius:"50%", background:categoryColors[cat] }}/>
              </div>
              <h3 className="serif" style={{ fontSize:22, fontWeight:300, marginBottom:8, color:categoryColors[cat] }}>{cat}</h3>
              <p style={{ fontSize:12, color:C.muted, lineHeight:1.7 }}>
                {cat==="Hair"?"Cuts, color, styling & treatments"
                  :cat==="Nails"?"Manicures, pedicures & gel art"
                  :cat==="Barber"?"Classic cuts, shaves & grooming"
                  :"Facials, waxing & relaxation"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Auth ──────────────────────────────────────────────────────────────────────
function AuthPage({ mode, setPage, onLogin }) {
  const [form, setForm] = useState({ full_name:"", email:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    setErr(""); setLoading(true);
    try {
      let res;
      if (mode === "register") {
        res = await mockApi.register(form.full_name, form.email, form.password);
      } else {
        res = await mockApi.login(form.email, form.password);
      }
      onLogin(res.user, res.token);
      setPage(res.user.isAdmin ? "calendar" : "dashboard");
    } catch(e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"calc(100vh - 60px)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div className="card fade-up" style={{ width:"100%", maxWidth:400, padding:40 }}>
        <h2 className="serif" style={{ fontSize:30, fontWeight:300, textAlign:"center", marginBottom:8 }}>
          {mode==="login" ? "Welcome Back" : "Join Hair Salon Jagitial"}
        </h2>
        <p style={{ textAlign:"center", color:C.muted, fontSize:13, marginBottom:32 }}>
          {mode==="login" ? "Sign in to your account" : "Create your account"}
        </p>

        {mode==="register" && (
          <div style={{ marginBottom:18 }}>
            <label className="label">Full Name</label>
            <input className="input-field" placeholder="Jane Smith"
              value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})}/>
          </div>
        )}
        <div style={{ marginBottom:18 }}>
          <label className="label">Email</label>
          <input className="input-field" type="email" placeholder="you@example.com"
            value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
        </div>
        <div style={{ marginBottom:8 }}>
          <label className="label">Password</label>
          <input className="input-field" type="password" placeholder="••••••••"
            value={form.password} onChange={e=>setForm({...form,password:e.target.value})}
            onKeyDown={e=>e.key==="Enter"&&submit()}/>
        </div>

        {mode==="login" && (
          <p style={{ fontSize:11, color:C.muted, marginBottom:24 }}>
            Demo: <strong>any email / any password</strong>. Admin: <strong>admin@salon.com / admin</strong>
          </p>
        )}

        {err && <p style={{ color:C.red, fontSize:12, marginBottom:16 }}>{err}</p>}

        <button className="btn-gold" style={{ width:"100%", marginBottom:16 }} onClick={submit} disabled={loading}>
          {loading ? <Spinner size={16}/> : (mode==="login" ? "Sign In" : "Create Account")}
        </button>

        <p style={{ textAlign:"center", fontSize:13, color:C.muted }}>
          {mode==="login" ? "No account? " : "Already have one? "}
          <span style={{ color:C.gold, cursor:"pointer" }}
            onClick={()=>setPage(mode==="login"?"register":"login")}>
            {mode==="login" ? "Join now" : "Sign in"}
          </span>
        </p>
      </div>
    </div>
  );
}

// ── Booking Wizard ────────────────────────────────────────────────────────────
function BookingPage({ user, setPage, token }) {
  const [step, setStep]         = useState(1);
  const [services, setServices] = useState([]);
  const [staff, setStaff]       = useState([]);
  const [service, setService]   = useState(null);
  const [member, setMember]     = useState(null);
  const [date, setDate]         = useState("");
  const [slots, setSlots]       = useState([]);
  const [slot, setSlot]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [catFilter, setCatFilter] = useState("All");

  useEffect(()=>{ mockApi.getServices().then(setServices); mockApi.getStaff().then(setStaff); },[]);

  const loadSlots = useCallback(async(m, d) => {
    if (!m || !d || !service) return;
    setLoading(true);
    const s = await mockApi.getSlots(m.staff_id, service.service_id, d);
    setSlots(s); setLoading(false);
  },[service]);

  const book = async () => {
    if (!user) { setPage("login"); return; }
    setLoading(true);
    await mockApi.createAppointment({
      user_id: user.user_id,
      staff_id: member.staff_id,
      service_id: service.service_id,
      start_time: slot,
    }, token);
    setLoading(false);
    setConfirmed(true);
  };

  const cats = ["All", ...new Set(services.map(s=>s.category))];

  if (confirmed) return (
    <div style={{ minHeight:"calc(100vh - 60px)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div className="card fade-up" style={{ maxWidth:440, width:"100%", padding:48, textAlign:"center" }}>
        <div style={{ width:64, height:64, borderRadius:"50%", background:`${C.green}22`, border:`2px solid ${C.green}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px" }}>
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h2 className="serif" style={{ fontSize:32, fontWeight:300, marginBottom:12 }}>Booked!</h2>
        <p style={{ color:C.muted, marginBottom:32, lineHeight:1.8 }}>
          Your appointment for <strong style={{color:C.text}}>{service.service_name}</strong> with{" "}
          <strong style={{color:C.text}}>{member.full_name}</strong> on{" "}
          <strong style={{color:C.text}}>{fmt(slot)}</strong> is confirmed.
        </p>
        <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
          <button className="btn-gold" onClick={()=>setPage("dashboard")}>View My Appointments</button>
          <button className="btn-outline" onClick={()=>{ setStep(1); setService(null); setMember(null); setSlot(null); setConfirmed(false); }}>Book Again</button>
        </div>
      </div>
    </div>
  );

  const stepLabels = ["Service","Specialist","Date & Time","Confirm"];

  return (
    <div style={{ maxWidth:820, margin:"0 auto", padding:"40px 24px" }}>
      {/* Stepper */}
      <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:48, justifyContent:"center" }}>
        {stepLabels.map((label, i) => {
          const n = i+1;
          const done = step > n;
          const active = step === n;
          return (
            <div key={n} style={{ display:"flex", alignItems:"center" }}>
              <div onClick={()=>done&&setStep(n)} style={{
                display:"flex", flexDirection:"column", alignItems:"center", gap:8,
                cursor: done ? "pointer" : "default",
              }}>
                <div style={{
                  width:32, height:32, borderRadius:"50%",
                  background: done ? C.gold : active ? C.gold+"22" : C.surface,
                  border: `1px solid ${active||done ? C.gold : C.border}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:12, fontWeight:500,
                  color: done ? "#0a0a0f" : active ? C.gold : C.muted,
                  transition:"all .2s",
                }}>
                  {done ? "✓" : n}
                </div>
                <span style={{ fontSize:10, letterSpacing:".08em", textTransform:"uppercase", color: active ? C.gold : C.muted }}>
                  {label}
                </span>
              </div>
              {i < stepLabels.length-1 && (
                <div style={{ width:48, height:1, background: step>n+1 ? C.gold : C.border, margin:"0 8px", marginBottom:24, transition:"background .3s" }}/>
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: Service */}
      {step === 1 && (
        <div className="fade-up">
          <h2 className="serif" style={{ fontSize:32, fontWeight:300, marginBottom:8 }}>Select a Service</h2>
          <p style={{ color:C.muted, fontSize:13, marginBottom:24 }}>Choose from our range of premium treatments</p>
          {/* Category filter */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:24 }}>
            {cats.map(c=>(
              <button key={c} onClick={()=>setCatFilter(c)} style={{
                padding:"6px 16px", borderRadius:20, fontSize:12, cursor:"pointer", border:"1px solid",
                borderColor: catFilter===c ? C.gold : C.border,
                background: catFilter===c ? C.gold+"18" : "transparent",
                color: catFilter===c ? C.gold : C.muted,
                transition:"all .2s",
              }}>{c}</button>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:14 }}>
            {services.filter(s=>catFilter==="All"||s.category===catFilter).map(s=>(
              <div key={s.service_id} onClick={()=>{ setService(s); setStep(2); }} style={{
                padding:22, borderRadius:4, cursor:"pointer",
                background: service?.service_id===s.service_id ? C.gold+"18" : C.card,
                border: `1px solid ${service?.service_id===s.service_id ? C.gold : C.border}`,
                transition:"all .2s",
              }}
                onMouseEnter={e=>{ if(service?.service_id!==s.service_id) e.currentTarget.style.borderColor=C.gold+"44"; }}
                onMouseLeave={e=>{ if(service?.service_id!==s.service_id) e.currentTarget.style.borderColor=C.border; }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                  <span style={{ fontSize:11, letterSpacing:".08em", color:categoryColors[s.category]||C.gold, textTransform:"uppercase" }}>{s.category}</span>
                  <span style={{ fontSize:18, fontWeight:600, color:C.gold, fontFamily:"'Cormorant Garamond', serif" }}>${s.price}</span>
                </div>
                <h3 style={{ fontSize:16, marginBottom:6 }}>{s.service_name}</h3>
                <p style={{ fontSize:12, color:C.muted, marginBottom:12 }}>{s.description}</p>
                <p style={{ fontSize:11, color:C.muted }}>{s.duration_minutes} min</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Staff */}
      {step === 2 && (
        <div className="fade-up">
          <h2 className="serif" style={{ fontSize:32, fontWeight:300, marginBottom:8 }}>Choose Your Specialist</h2>
          <p style={{ color:C.muted, fontSize:13, marginBottom:24 }}>All specialists are trained to perform your selected service</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14, marginBottom:24 }}>
            {staff.map(m=>(
              <div key={m.staff_id} className={`card staff-card${member?.staff_id===m.staff_id?" selected":""}`}
                style={{ padding:24, textAlign:"center" }}
                onClick={()=>setMember(m)}>
                <Avatar name={m.full_name} size={52} color={C.gold}/>
                <h3 style={{ marginTop:14, marginBottom:4, fontSize:15 }}>{m.full_name}</h3>
                <p style={{ fontSize:12, color:C.muted }}>{m.role}</p>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:12 }}>
            <button className="btn-ghost" onClick={()=>setStep(1)}>← Back</button>
            <button className="btn-gold" disabled={!member} onClick={()=>setStep(3)}>Continue →</button>
          </div>
        </div>
      )}

      {/* Step 3: Date & Time */}
      {step === 3 && (
        <div className="fade-up">
          <h2 className="serif" style={{ fontSize:32, fontWeight:300, marginBottom:8 }}>Pick Date & Time</h2>
          <p style={{ color:C.muted, fontSize:13, marginBottom:28 }}>
            {service?.service_name} · {service?.duration_minutes} min · ${service?.price}
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
            <div>
              <label className="label">Date</label>
              <input className="input-field" type="date"
                min={new Date().toISOString().split("T")[0]}
                value={date}
                onChange={e=>{ setDate(e.target.value); setSlot(null); loadSlots(member, e.target.value); }}/>
            </div>
          </div>
          {loading && <div style={{ marginTop:24, display:"flex", gap:10, alignItems:"center" }}><Spinner/><span style={{color:C.muted,fontSize:13}}>Loading availability…</span></div>}
          {!loading && date && (
            <div style={{ marginTop:28 }}>
              <label className="label">Available Slots — {new Date(date+"T12:00:00").toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</label>
              {slots.length === 0
                ? <p style={{ color:C.muted, fontSize:13 }}>No availability on this date. Please try another day.</p>
                : <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginTop:12 }}>
                    {slots.map(s=>(
                      <button key={s} className={`slot-btn${slot===s?" selected":""}`} onClick={()=>setSlot(s)}>
                        {fmtTime(s)}
                      </button>
                    ))}
                  </div>
              }
            </div>
          )}
          <div style={{ display:"flex", gap:12, marginTop:28 }}>
            <button className="btn-ghost" onClick={()=>setStep(2)}>← Back</button>
            <button className="btn-gold" disabled={!slot} onClick={()=>setStep(4)}>Continue →</button>
          </div>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <div className="fade-up">
          <h2 className="serif" style={{ fontSize:32, fontWeight:300, marginBottom:28 }}>Confirm Booking</h2>
          <div className="card" style={{ padding:28, marginBottom:24 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
              {[
                ["Service", service?.service_name],
                ["Duration", `${service?.duration_minutes} minutes`],
                ["Specialist", member?.full_name],
                ["Role", member?.role],
                ["Date", fmtDate(slot)],
                ["Time", fmtTime(slot)],
                ["Price", `$${service?.price}`],
              ].map(([k,v])=>(
                <div key={k}>
                  <p style={{ fontSize:11, letterSpacing:".08em", color:C.muted, textTransform:"uppercase", marginBottom:4 }}>{k}</p>
                  <p style={{ fontWeight:400 }}>{v}</p>
                </div>
              ))}
            </div>
            <div className="divider"/>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:13, color:C.muted }}>Total</span>
              <span className="serif" style={{ fontSize:28, color:C.gold }}>${service?.price}</span>
            </div>
          </div>
          {!user && <p style={{ color:C.amber, fontSize:13, marginBottom:16 }}>⚠ You must be signed in to complete booking.</p>}
          <div style={{ display:"flex", gap:12 }}>
            <button className="btn-ghost" onClick={()=>setStep(3)}>← Back</button>
            <button className="btn-gold" style={{ padding:"12px 36px" }} onClick={book} disabled={loading}>
              {loading ? <Spinner size={16}/> : "Confirm Appointment"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── User Dashboard ────────────────────────────────────────────────────────────
function DashboardPage({ user, token }) {
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("upcoming");

  const load = useCallback(async()=>{ setLoading(true); const a = await mockApi.myAppointments(token); setAppts(a); setLoading(false); },[token]);
  useEffect(()=>{ load(); },[load]);

  const cancel = async (id) => {
    await mockApi.cancelAppointment(id, token);
    load();
  };

  const now = new Date();
  const filtered = appts.filter(a => {
    if (filter==="upcoming") return new Date(a.start_time) > now && a.status!=="cancelled";
    if (filter==="past")     return new Date(a.start_time) <= now || a.status==="completed";
    if (filter==="cancelled")return a.status==="cancelled";
    return true;
  });

  return (
    <div style={{ maxWidth:820, margin:"0 auto", padding:"40px 24px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:36, flexWrap:"wrap", gap:16 }}>
        <div>
          <h1 className="serif" style={{ fontSize:34, fontWeight:300, marginBottom:4 }}>My Appointments</h1>
          <p style={{ color:C.muted, fontSize:13 }}>Welcome back, {user.full_name}</p>
        </div>
      </div>

      <div style={{ display:"flex", gap:0, borderBottom:`1px solid ${C.border}`, marginBottom:28 }}>
        {["upcoming","past","cancelled"].map(f=>(
          <button key={f} className={`tab-btn${filter===f?" active":""}`} onClick={()=>setFilter(f)}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", padding:60 }}><Spinner size={32}/></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 0", color:C.muted }}>
          <p style={{ fontSize:16, marginBottom:8 }}>No appointments found.</p>
          <p style={{ fontSize:13 }}>Book your first appointment to get started.</p>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {filtered.map(a=>(
            <div key={a.appointment_id} className="card" style={{ padding:22, display:"flex", gap:20, alignItems:"flex-start", flexWrap:"wrap" }}>
              <div style={{ width:4, borderRadius:2, alignSelf:"stretch", background:statusColor(a.status), flexShrink:0 }}/>
              <Avatar name={a.staff_name} size={42}/>
              <div style={{ flex:1, minWidth:200 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6, flexWrap:"wrap" }}>
                  <h3 style={{ fontSize:16, fontWeight:400 }}>{a.service_name}</h3>
                  <Badge status={a.status}/>
                </div>
                <p style={{ fontSize:13, color:C.muted, marginBottom:4 }}>with {a.staff_name} · {a.staff_role}</p>
                <p style={{ fontSize:13, color:C.muted }}>{fmt(a.start_time)}</p>
              </div>
              <div style={{ textAlign:"right" }}>
                <p className="serif" style={{ fontSize:22, color:C.gold, marginBottom:8 }}>${a.total_price}</p>
                {a.status==="confirmed"||a.status==="pending" ? (
                  <button className="btn-ghost" style={{ fontSize:11, color:C.red, borderColor:C.red+"44" }}
                    onClick={()=>cancel(a.appointment_id)}>
                    Cancel
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Admin Calendar ────────────────────────────────────────────────────────────
function AdminCalendar() {
  const [appts, setAppts]   = useState([]);
  const [view, setView]     = useState("week");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date(); d.setHours(0,0,0,0);
    d.setDate(d.getDate() - d.getDay());
    return d;
  });

  const load = useCallback(async()=>{ setLoading(true); const a = await mockApi.allAppointments(); setAppts(a); setLoading(false); },[]);
  useEffect(()=>{ load(); },[load]);

  const updateStatus = async (id, status) => {
    await mockApi.updateStatus(id, status);
    setSelected(prev => prev ? {...prev, status} : null);
    load();
  };

  const weekDays = Array.from({length:7}, (_,i) => {
    const d = new Date(weekStart); d.setDate(d.getDate()+i); return d;
  });

  const hours = Array.from({length:10}, (_,i) => i+9);

  const getAppts = (day) => appts.filter(a => {
    const d = new Date(a.start_time);
    return d.toDateString() === day.toDateString();
  });

  const staffColors = {};
  STAFF.forEach((s,i)=>{ staffColors[s.staff_id] = [C.gold, C.accent, "#4ade80","#60a5fa"][i%4]; });

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"32px 24px" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:32, flexWrap:"wrap", gap:16 }}>
        <div>
          <h1 className="serif" style={{ fontSize:32, fontWeight:300, marginBottom:4 }}>Master Calendar</h1>
          <p style={{ fontSize:13, color:C.muted }}>
            {weekDays[0].toLocaleDateString('en-US',{month:'long',day:'numeric'})} – {weekDays[6].toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}
          </p>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <button className="btn-ghost" onClick={()=>{ const d=new Date(weekStart); d.setDate(d.getDate()-7); setWeekStart(d); }}>←</button>
          <button className="btn-outline" style={{ fontSize:12, padding:"7px 16px" }} onClick={()=>{
            const d=new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-d.getDay()); setWeekStart(d);
          }}>Today</button>
          <button className="btn-ghost" onClick={()=>{ const d=new Date(weekStart); d.setDate(d.getDate()+7); setWeekStart(d); }}>→</button>
          <div style={{ display:"flex", gap:4 }}>
            {["week","day"].map(v=><button key={v} className={`tab-btn${view===v?" active":""}`} onClick={()=>setView(v)}>{v}</button>)}
          </div>
        </div>
      </div>

      {/* Staff legend */}
      <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:20 }}>
        {STAFF.map(s=>(
          <div key={s.staff_id} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:staffColors[s.staff_id] }}/>
            <span style={{ fontSize:12, color:C.muted }}>{s.full_name}</span>
          </div>
        ))}
      </div>

      {loading ? <div style={{ display:"flex", justifyContent:"center", padding:60 }}><Spinner size={32}/></div> : (
        /* Week grid */
        <div style={{ overflowX:"auto" }}>
          <div style={{ minWidth:700 }}>
            {/* Day headers */}
            <div style={{ display:"grid", gridTemplateColumns:"60px repeat(7, 1fr)", borderBottom:`1px solid ${C.border}`, paddingBottom:10, marginBottom:4 }}>
              <div/>
              {weekDays.map(d=>{
                const isToday = d.toDateString()===new Date().toDateString();
                return (
                  <div key={d} style={{ textAlign:"center", padding:"6px 0" }}>
                    <p style={{ fontSize:10, letterSpacing:".08em", color:C.muted, textTransform:"uppercase" }}>
                      {d.toLocaleDateString('en-US',{weekday:'short'})}
                    </p>
                    <p style={{ fontSize:18, fontWeight:300, color:isToday?C.gold:C.text, marginTop:2 }}>
                      {d.getDate()}
                    </p>
                  </div>
                );
              })}
            </div>
            {/* Hour rows */}
            {hours.map(h=>(
              <div key={h} style={{ display:"grid", gridTemplateColumns:"60px repeat(7, 1fr)", minHeight:64, borderBottom:`1px solid ${C.border}22` }}>
                <div style={{ fontSize:11, color:C.muted, paddingTop:4, textAlign:"right", paddingRight:8 }}>
                  {h}:00
                </div>
                {weekDays.map(d=>{
                  const dayAppts = getAppts(d).filter(a=>{
                    const ah = new Date(a.start_time).getHours();
                    return ah===h;
                  });
                  return (
                    <div key={d} style={{ position:"relative", padding:"2px", borderLeft:`1px solid ${C.border}22` }}>
                      {dayAppts.map(a=>(
                        <div key={a.appointment_id} onClick={()=>setSelected(a)} style={{
                          background:`${staffColors[a.staff_id]}22`,
                          border:`1px solid ${staffColors[a.staff_id]}66`,
                          borderLeft:`3px solid ${staffColors[a.staff_id]}`,
                          borderRadius:2, padding:"3px 6px", cursor:"pointer", marginBottom:2,
                          fontSize:11,
                        }}>
                          <p style={{ fontWeight:500, color:staffColors[a.staff_id], whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                            {fmtTime(a.start_time)} {a.service_name}
                          </p>
                          <p style={{ color:C.muted, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                            {a.customer_name}
                          </p>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Appointment detail modal */}
      {selected && (
        <div style={{
          position:"fixed", inset:0, background:"#000000b8", zIndex:200,
          display:"flex", alignItems:"center", justifyContent:"center", padding:24
        }} onClick={e=>e.target===e.currentTarget&&setSelected(null)}>
          <div className="card fade-up" style={{ width:"100%", maxWidth:440, padding:32 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
              <div>
                <h2 className="serif" style={{ fontSize:26, fontWeight:300, marginBottom:4 }}>{selected.service_name}</h2>
                <Badge status={selected.status}/>
              </div>
              <button className="btn-ghost" style={{ fontSize:18 }} onClick={()=>setSelected(null)}>×</button>
            </div>
            {[
              ["Customer", selected.customer_name],
              ["Specialist", selected.staff_name],
              ["Date", fmt(selected.start_time)],
              ["Price", `$${selected.total_price}`],
            ].map(([k,v])=>(
              <div key={k} style={{ marginBottom:14 }}>
                <p className="label">{k}</p>
                <p style={{ fontSize:14 }}>{v}</p>
              </div>
            ))}
            <div className="divider"/>
            <p className="label" style={{ marginBottom:12 }}>Update Status</p>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {["confirmed","completed","cancelled"].map(s=>(
                <button key={s} onClick={()=>updateStatus(selected.appointment_id,s)} style={{
                  padding:"7px 16px", borderRadius:2, fontSize:12, cursor:"pointer", border:"1px solid",
                  borderColor:statusColor(s)+"66", background:selected.status===s?`${statusColor(s)}22`:"transparent",
                  color:statusColor(s), transition:"all .15s",
                }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Admin Services ────────────────────────────────────────────────────────────
function AdminServices() {
  const [services, setServices] = useState(SERVICES);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const open = (s) => { setEditing(s.service_id); setForm({...s}); };
  const save = () => { setServices(prev=>prev.map(s=>s.service_id===editing?form:s)); setEditing(null); };

  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"40px 24px" }}>
      <h1 className="serif" style={{ fontSize:32, fontWeight:300, marginBottom:32 }}>Service Management</h1>
      <div style={{ display:"grid", gap:12 }}>
        {services.map(s=>(
          <div key={s.service_id} className="card" style={{ padding:20, display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:categoryColors[s.category]||C.gold, flexShrink:0 }}/>
            <div style={{ flex:1, minWidth:160 }}>
              <h3 style={{ fontSize:15 }}>{s.service_name}</h3>
              <p style={{ fontSize:12, color:C.muted }}>{s.category} · {s.duration_minutes} min + {s.buffer_time_minutes} min buffer</p>
            </div>
            <p className="serif" style={{ fontSize:22, color:C.gold }}>${s.price}</p>
            <button className="btn-outline" style={{ fontSize:11, padding:"6px 16px" }} onClick={()=>open(s)}>Edit</button>
          </div>
        ))}
      </div>

      {editing && (
        <div style={{ position:"fixed", inset:0, background:"#000000b8", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}
          onClick={e=>e.target===e.currentTarget&&setEditing(null)}>
          <div className="card fade-up" style={{ width:"100%", maxWidth:480, padding:32 }}>
            <h2 className="serif" style={{ fontSize:26, fontWeight:300, marginBottom:28 }}>Edit Service</h2>
            {[
              ["service_name","Service Name","text"],
              ["price","Price (USD)","number"],
              ["duration_minutes","Duration (minutes)","number"],
              ["buffer_time_minutes","Buffer Time (minutes)","number"],
            ].map(([key,label,type])=>(
              <div key={key} style={{ marginBottom:18 }}>
                <label className="label">{label}</label>
                <input className="input-field" type={type} value={form[key]||""} onChange={e=>setForm({...form,[key]:e.target.value})}/>
              </div>
            ))}
            <div style={{ display:"flex", gap:12, marginTop:8 }}>
              <button className="btn-ghost" onClick={()=>setEditing(null)}>Cancel</button>
              <button className="btn-gold" onClick={save}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Admin Staff ───────────────────────────────────────────────────────────────
function AdminStaff() {
  const [staffList, setStaffList] = useState(STAFF);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState({});
  const [avail, setAvail]         = useState({});
  const [adding, setAdding]       = useState(false);
  const [newForm, setNewForm]     = useState({ full_name:"", role:"", phone_number:"" });

  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const openEdit = (s) => {
    setEditing(s.staff_id);
    setForm({...s});
    const a = {};
    for (let i=0;i<7;i++) a[i] = { active: i>0&&i<6, start:"09:00", end:"18:00" };
    setAvail(a);
  };

  const save = () => {
    setStaffList(prev=>prev.map(s=>s.staff_id===editing?{...s,...form}:s));
    setEditing(null);
  };

  const addStaff = () => {
    const s = { staff_id:"t"+Date.now(), ...newForm, is_active:true };
    setStaffList(prev=>[...prev,s]);
    setAdding(false);
    setNewForm({ full_name:"", role:"", phone_number:"" });
  };

  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"40px 24px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:32, flexWrap:"wrap", gap:16 }}>
        <h1 className="serif" style={{ fontSize:32, fontWeight:300 }}>Staff Management</h1>
        <button className="btn-gold" onClick={()=>setAdding(true)}>+ Add Staff</button>
      </div>

      <div style={{ display:"grid", gap:12 }}>
        {staffList.map(s=>(
          <div key={s.staff_id} className="card" style={{ padding:22, display:"flex", alignItems:"center", gap:18, flexWrap:"wrap" }}>
            <Avatar name={s.full_name} size={44}/>
            <div style={{ flex:1, minWidth:160 }}>
              <h3 style={{ fontSize:15, marginBottom:2 }}>{s.full_name}</h3>
              <p style={{ fontSize:12, color:C.muted }}>{s.role}</p>
            </div>
            <div style={{ display:"flex", gap:4, alignItems:"center" }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:s.is_active?C.green:C.red }}/>
              <span style={{ fontSize:12, color:C.muted }}>{s.is_active?"Active":"Inactive"}</span>
            </div>
            <button className="btn-outline" style={{ fontSize:11, padding:"6px 16px" }} onClick={()=>openEdit(s)}>Edit Hours</button>
          </div>
        ))}
      </div>

      {/* Edit availability modal */}
      {editing && (
        <div style={{ position:"fixed", inset:0, background:"#000000b8", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}
          onClick={e=>e.target===e.currentTarget&&setEditing(null)}>
          <div className="card fade-up" style={{ width:"100%", maxWidth:520, padding:32, maxHeight:"90vh", overflowY:"auto" }}>
            <h2 className="serif" style={{ fontSize:26, fontWeight:300, marginBottom:24 }}>Edit Working Hours</h2>
            <p style={{ color:C.muted, fontSize:13, marginBottom:24 }}>{form.full_name} · {form.role}</p>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {days.map((day,i)=>(
                <div key={i} style={{ display:"grid", gridTemplateColumns:"80px 1fr 1fr 80px", gap:12, alignItems:"center" }}>
                  <span style={{ fontSize:13, color: avail[i]?.active?C.text:C.muted }}>{day}</span>
                  {avail[i]?.active ? (
                    <>
                      <input className="input-field" type="time" style={{ padding:"8px 10px", fontSize:13 }}
                        value={avail[i]?.start||"09:00"} onChange={e=>setAvail({...avail,[i]:{...avail[i],start:e.target.value}})}/>
                      <input className="input-field" type="time" style={{ padding:"8px 10px", fontSize:13 }}
                        value={avail[i]?.end||"18:00"} onChange={e=>setAvail({...avail,[i]:{...avail[i],end:e.target.value}})}/>
                    </>
                  ) : (
                    <span style={{ gridColumn:"span 2", color:C.muted, fontSize:13 }}>Off</span>
                  )}
                  <button onClick={()=>setAvail({...avail,[i]:{...avail[i],active:!avail[i]?.active}})} style={{
                    padding:"6px 12px", borderRadius:2, fontSize:11, cursor:"pointer", border:"1px solid",
                    borderColor: avail[i]?.active ? C.red+"66" : C.green+"66",
                    background:"transparent",
                    color: avail[i]?.active ? C.red : C.green,
                  }}>{avail[i]?.active?"Off":"On"}</button>
                </div>
              ))}
            </div>
            <div className="divider"/>
            <div style={{ display:"flex", gap:12 }}>
              <button className="btn-ghost" onClick={()=>setEditing(null)}>Cancel</button>
              <button className="btn-gold" onClick={save}>Save Schedule</button>
            </div>
          </div>
        </div>
      )}

      {/* Add staff modal */}
      {adding && (
        <div style={{ position:"fixed", inset:0, background:"#000000b8", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}
          onClick={e=>e.target===e.currentTarget&&setAdding(false)}>
          <div className="card fade-up" style={{ width:"100%", maxWidth:420, padding:32 }}>
            <h2 className="serif" style={{ fontSize:26, fontWeight:300, marginBottom:24 }}>Add Staff Member</h2>
            {[["full_name","Full Name","text"],["role","Role","text"],["phone_number","Phone","tel"]].map(([k,l,t])=>(
              <div key={k} style={{ marginBottom:18 }}>
                <label className="label">{l}</label>
                <input className="input-field" type={t} value={newForm[k]} onChange={e=>setNewForm({...newForm,[k]:e.target.value})}/>
              </div>
            ))}
            <div style={{ display:"flex", gap:12 }}>
              <button className="btn-ghost" onClick={()=>setAdding(false)}>Cancel</button>
              <button className="btn-gold" disabled={!newForm.full_name||!newForm.role} onClick={addStaff}>Add Staff</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Contact / Map ─────────────────────────────────────────────────────────────
function ContactPage() {
  return (
    <div style={{ maxWidth:1000, margin:"0 auto", padding:"40px 24px" }}>
      <div style={{ textAlign:"center", marginBottom:48 }}>
        <p style={{ fontSize:11, letterSpacing:".2em", color:C.gold, textTransform:"uppercase", marginBottom:12 }}>Find Us</p>
        <h1 className="serif" style={{ fontSize:42, fontWeight:300, marginBottom:16 }}>Our Location</h1>
        <p style={{ color:C.muted }}>Your Salon Location, Jagitial, Telangana</p>
      </div>

      {/* Google Maps Embed */}
      <div style={{
        position:"relative", height:420, borderRadius:4, overflow:"hidden",
        border:`1px solid ${C.border}`, marginBottom:40,
      }}>
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border:0 }}
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3805.241!2d78.9042208!3d18.7860962!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb3d5d5d5d5d5d%3A0x5d5d5d5d5d5d5d5d!2sHair%20Salon%20Jagitial!5e0!3m2!1sen!2sin!4v1711350000000"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Hair Salon Jagitial Location"
        />
      </div>

      {/* Google Maps Link */}
      <div style={{ textAlign:"center", marginBottom:40 }}>
        <p style={{ color:C.muted, fontSize:13, marginBottom:16 }}>
          Can't find us? Tap below to open in Google Maps
        </p>
        <a href="https://www.google.com/maps/search/4-2-254+Tulasi+Nagar+Jagtial+Telangana+505327" target="_blank" rel="noreferrer">
          <button className="btn-gold" style={{ fontSize:13, padding:"12px 32px" }}>
            🗺 Open in Google Maps
          </button>
        </a>
      </div>

      {/* Info cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:16 }}>
        {[
          { label:"Address", value:"4-2-254, Tulasi Nagar\nJagtial, Telangana 505327", icon:"📍" },
          { label:"Hours", value:"Mon–Fri: 10AM – 8PM\nSat: 10AM – 7PM\nSun: 11AM – 6PM", icon:"🕐" },
          { label:"Phone", value:"+91 98765 43210", icon:"📞" },
          { label:"Email", value:"hello@hairsalonjagitial.com", icon:"✉️" },
        ].map(({label,value,icon})=>(
          <div key={label} className="card" style={{ padding:24 }}>
            <div style={{ fontSize:24, marginBottom:12 }}>{icon}</div>
            <p className="label">{label}</p>
            <p style={{ fontSize:14, lineHeight:1.8, whiteSpace:"pre-line" }}>{value}</p>
          </div>
        ))}
      </div>

      <div style={{ textAlign:"center", marginTop:36 }}>
        <a href="https://www.google.com/maps/search/4-2-254+Tulasi+Nagar+Jagtial+Telangana+505327" target="_blank" rel="noreferrer">
          <button className="btn-gold" style={{ fontSize:13, padding:"12px 32px" }}>
            🗺 Get Directions
          </button>
        </a>
      </div>
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage]   = useState("home");
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(null);

  const onLogin = (u, t) => { setUser(u); setToken(t); };
  const logout  = () => { setUser(null); setToken(null); setPage("home"); };

  const navigate = (p) => {
    if ((p==="dashboard"||p==="book") && !user) { setPage("login"); return; }
    if ((p==="calendar"||p==="admin-services"||p==="admin-staff") && !user?.isAdmin) { setPage("login"); return; }
    setPage(p);
  };

  const renderPage = () => {
    switch (page) {
      case "home":           return <HeroPage setPage={navigate}/>;
      case "book":           return <BookingPage user={user} setPage={navigate} token={token}/>;
      case "dashboard":      return <DashboardPage user={user} token={token}/>;
      case "contact":        return <ContactPage/>;
      case "login":          return <AuthPage mode="login"  setPage={navigate} onLogin={onLogin}/>;
      case "register":       return <AuthPage mode="register" setPage={navigate} onLogin={onLogin}/>;
      case "calendar":       return <AdminCalendar/>;
      case "admin-services": return <AdminServices/>;
      case "admin-staff":    return <AdminStaff/>;
      default:               return <HeroPage setPage={navigate}/>;
    }
  };

  return (
    <AuthCtx.Provider value={{ user, token }}>
      <GlobalStyle/>
      <Nav page={page} setPage={navigate} user={user} logout={logout}/>
      <main>{renderPage()}</main>
      {/* Footer */}
      <footer style={{
        borderTop:`1px solid ${C.border}`, padding:"32px 24px", textAlign:"center",
        marginTop:60, color:C.muted, fontSize:12,
      }}>
        <SalonLogo/>
        <p style={{ marginTop:12 }}>© 2026 Hair Salon Jagitial · Premium Hair Care</p>
      </footer>
    </AuthCtx.Provider>
  );
}
