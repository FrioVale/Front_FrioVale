import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Bell, FileText, LayoutGrid, LogIn, Moon, Sun, Truck, Users } from 'lucide-react'
import Logo from './Logo'
import { alerts, user } from '../data'

const nav = [
  { to: '/', label: 'Visão geral', icon: LayoutGrid },
  { to: '/viagens', label: 'Viagens', icon: Truck },
  { to: '/alertas', label: 'Alertas', icon: Bell },
  { to: '/equipe', label: 'Equipe', icon: Users },
  { to: '/relatorios', label: 'Relatórios', icon: FileText },
]

export function useTheme() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])
  return { dark, toggle: () => setDark(d => !d) }
}
export const ThemeButton = () => {
  const { dark, toggle } = useTheme()
  return <button className="icon-btn" onClick={toggle} aria-label="Alternar tema">{dark ? <Sun size={16} /> : <Moon size={16} />}</button>
}

export default function Layout({ onLogout }: { onLogout: () => void }) {
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState(true)
  const navigate = useNavigate()
  useEffect(() => { const t = setTimeout(() => setToast(false), 8000); return () => clearTimeout(t) }, [])
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="side-logo"><Logo size={22} /></div>
        <nav>
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
              <Icon size={16} />{label}
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">
          <button className="user-chip" onClick={() => navigate('/perfil')}>
            <span className="avatar light">K</span>
            <span><strong>{user.name}</strong><small>{user.role}</small></span>
          </button>
          <button className="logout" onClick={onLogout}><LogIn size={15} />Sair</button>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <span>Centro de monitoramento da cadeia fria</span>
          <div className="top-actions">
            <ThemeButton />
            <div className="rel">
              <button className="icon-btn" onClick={() => setOpen(o => !o)} aria-label="Notificações">
                <Bell size={16} /><i className="dot" />
              </button>
              {open && (
                <div className="notif">
                  <div className="notif-head">
                    <div><h4>Notificações</h4><small>3 alertas recentes</small></div>
                    <span className="pill red">2 ativos</span>
                  </div>
                  {alerts.map(a => (
                    <div key={a.id} className="notif-item">
                      <i className={`bullet ${a.color}`} />
                      <div><strong>{a.title}</strong><small>{a.detail}</small><small>{a.ago}</small></div>
                    </div>
                  ))}
                  <button className="notif-foot" onClick={() => { setOpen(false); navigate('/alertas') }}>Ver todos os alertas</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="content"><Outlet /></main>
      </div>
      {toast && (
        <div className="toast" role="alert">
          <span className="toast-ic"><Bell size={16} /></span>
          <div><strong>Alerta de temperatura alta</strong><p>Baú a 13,8 °C. Verifique a refrigeração imediatamente.</p></div>
          <button onClick={() => setToast(false)} aria-label="Fechar">✕</button>
        </div>
      )}
    </div>
  )
}
