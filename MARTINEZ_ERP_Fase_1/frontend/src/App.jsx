import { useEffect, useState } from 'react';
import {
  Activity, BarChart3, Bell, BriefcaseBusiness, ChevronDown, CircleHelp,
  ClipboardList, Command, FileText, LayoutDashboard, LogOut, Menu,
  Package, Search, Settings, ShieldCheck, Users, X
} from 'lucide-react';
import { api, getToken } from './api';

const navItems = [
  { label: 'Panel principal', icon: LayoutDashboard, active: true },
  { label: 'Operaciones funerarias', icon: BriefcaseBusiness, phase: 'Fase 2' },
  { label: 'Clientes y ventas', icon: Users, phase: 'Fase 3' },
  { label: 'Inventario y compras', icon: Package, phase: 'Fase 4' },
  { label: 'Finanzas', icon: BarChart3, phase: 'Fase 5' },
  { label: 'Personal y logística', icon: ClipboardList, phase: 'Fase 6' },
  { label: 'Análisis e inteligencia', icon: Activity, phase: 'Fase 7' }
];

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const result = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      sessionStorage.setItem('martinez_erp_token', result.token);
      onLogin(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return <main className="login-shell">
    <section className="login-brand">
      <div className="brand-mark large">M</div>
      <div className="eyebrow">GESTIÓN EMPRESARIAL INTEGRAL</div>
      <h1>MARTÍNEZ <span>ERP</span></h1>
      <p>Una plataforma central para administrar y hacer crecer nuestras operaciones.</p>
      <div className="login-foot">FUNERARIA MARTÍNEZ · SISTEMA EMPRESARIAL</div>
    </section>
    <section className="login-panel">
      <div className="login-card">
        <div className="small-brand"><div className="brand-mark">M</div><span>MARTÍNEZ ERP</span></div>
        <div className="eyebrow">ACCESO SEGURO</div>
        <h2>Bienvenido</h2>
        <p className="muted">Ingresa con tus credenciales corporativas.</p>
        <form onSubmit={submit}>
          <label>Correo electrónico</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="usuario@empresa.com" required autoComplete="username" />
          <label>Contraseña</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Tu contraseña" required autoComplete="current-password" />
          {error && <div className="error">{error}</div>}
          <button className="primary full" disabled={busy}>{busy ? 'Ingresando...' : 'Ingresar al sistema'}</button>
        </form>
        <div className="secure-note"><ShieldCheck size={15}/> Conexión protegida · Acceso autorizado</div>
      </div>
    </section>
  </main>;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  async function loadSummary() {
    try { setSummary(await api('/dashboard/summary')); setError(''); }
    catch (e) { setError(e.message); }
  }

  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }
    api('/auth/me').then(r => setUser(r.user)).catch(() => {
      sessionStorage.removeItem('martinez_erp_token');
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { if (user) loadSummary(); }, [user]);

  async function logout() {
    try { await api('/auth/logout', { method: 'POST' }); } catch {}
    sessionStorage.removeItem('martinez_erp_token');
    setUser(null); setSummary(null);
  }

  if (loading) return <div className="loading-screen">Cargando MARTÍNEZ ERP...</div>;
  if (!user) return <Login onLogin={setUser} />;

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-mark">M</div>
        <div><strong>MARTÍNEZ ERP</strong><small>ENTERPRISE MANAGEMENT</small></div>
        <button className="icon-btn mobile-close" onClick={() => setMobileOpen(false)}><X size={18}/></button>
      </div>
      <div className="workspace"><span className="workspace-dot"/> FUNERARIA MARTÍNEZ <ChevronDown size={14}/></div>
      <div className="nav-caption">ESPACIO DE TRABAJO</div>
      <nav>
        {navItems.map(item => <button key={item.label} className={`nav-item ${item.active ? 'selected' : ''}`} onClick={() => item.active && setMobileOpen(false)}>
          <item.icon size={18}/><span>{item.label}</span>{item.phase && <small>{item.phase}</small>}
        </button>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="nav-caption">SISTEMA</div>
        <button className="nav-item"><Settings size={18}/><span>Configuración</span></button>
        <button className="nav-item"><CircleHelp size={18}/><span>Centro de ayuda</span></button>
        <div className="profile">
          <div className="avatar">{user.name?.charAt(0)?.toUpperCase() || 'U'}</div>
          <div className="profile-info"><strong>{user.name}</strong><small>{user.role === 'admin' ? 'Administrador' : user.role === 'manager' ? 'Supervisor' : 'Usuario'}</small></div>
          <button className="icon-btn" title="Cerrar sesión" onClick={logout}><LogOut size={17}/></button>
        </div>
      </div>
    </aside>

    <main className="main-area">
      <header className="topbar">
        <button className="icon-btn mobile-menu" onClick={() => setMobileOpen(true)}><Menu/></button>
        <div className="breadcrumb">MARTÍNEZ ERP <span>/</span> Panel principal</div>
        <div className="top-actions"><div className="system-status"><i/> Sistema operativo</div><button className="icon-btn"><Bell size={18}/></button><div className="top-avatar">{user.name?.charAt(0)?.toUpperCase()}</div></div>
      </header>
      <div className="content">
        <div className="page-heading">
          <div><div className="eyebrow">RESUMEN GENERAL</div><h1>Panel principal</h1><p>Bienvenido, {user.name}. Este es el centro de control de la empresa.</p></div>
          <button className="outline-btn" onClick={loadSummary}><Activity size={16}/> Actualizar datos</button>
        </div>

        {error && <div className="error-banner">{error}</div>}
        <div className="welcome-banner">
          <div><div className="banner-kicker">MARTÍNEZ ENTERPRISE</div><h2>Gestión clara. Decisiones inteligentes.</h2><p>La infraestructura de tu nueva plataforma empresarial está lista para crecer por módulos.</p></div>
          <div className="banner-emblem"><Command size={56}/></div>
        </div>

        <div className="section-title"><div><h3>Indicadores del sistema</h3><p>Datos reales de la plataforma</p></div><span className="live-tag"><i/> EN VIVO</span></div>
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon navy"><Users size={19}/></div><span>Usuarios activos</span><strong>{summary?.indicators?.activeUsers ?? '—'}</strong><small>Cuentas habilitadas</small></div>
          <div className="stat-card"><div className="stat-icon blue"><ShieldCheck size={19}/></div><span>Seguridad</span><strong>Activa</strong><small>Autenticación y roles</small></div>
          <div className="stat-card"><div className="stat-icon green"><Activity size={19}/></div><span>Base de datos</span><strong>{summary ? 'Conectada' : 'Verificando'}</strong><small>PostgreSQL en la nube/local</small></div>
          <div className="stat-card"><div className="stat-icon gold"><FileText size={19}/></div><span>Módulos ERP</span><strong>7</strong><small>Planificados por fases</small></div>
        </div>

        <div className="lower-grid">
          <section className="panel">
            <div className="panel-heading"><div><h3>Módulos de gestión</h3><p>Desarrollo progresivo de la plataforma</p></div></div>
            <div className="module-list">{navItems.slice(1).map((item, i) => <div className="module-row" key={item.label}><div className="module-icon"><item.icon size={18}/></div><div className="module-copy"><strong>{item.label}</strong><small>{item.phase} · Planificado</small></div><span className="planned">Próximamente</span></div>)}</div>
          </section>
          <section className="panel">
            <div className="panel-heading"><div><h3>Actividad reciente</h3><p>Últimos eventos registrados</p></div></div>
            {summary?.recentActivity?.length ? <div className="activity-list">{summary.recentActivity.map(log => <div className="activity-row" key={log.id}><div className="activity-dot"/><div><strong>{log.action}</strong><small>{log.full_name || 'Sistema'} · {new Date(log.created_at).toLocaleString('es-PE')}</small></div></div>)}</div> : <div className="empty-state"><div className="empty-icon"><ClipboardList size={23}/></div><strong>Sin actividad registrada</strong><p>Los eventos del sistema aparecerán aquí cuando se utilice la plataforma.</p></div>}
          </section>
        </div>
        <footer>© {new Date().getFullYear()} Funeraria Martínez · MARTÍNEZ ERP <span>Versión 1.0 · Fase 1</span></footer>
      </div>
    </main>
    {mobileOpen && <button className="scrim" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú"/>}
  </div>;
}

export default App;
