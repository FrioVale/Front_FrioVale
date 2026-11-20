import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Activity, Bell, Box, FileText, LayoutGrid, LogIn, Moon, Sun, Truck, Users } from 'lucide-react'
import Logo from './Logo'
import Acessibilidade from './Acessibilidade'
import { api, type UserResponse } from '../api'
import { useAsyncData } from '../hooks/useAsyncData'
import { alertColor, alertDetail, alertTitle, driverContainerCodes, isDriver, roleLabel, timeAgo } from '../data'

const nav = [
  { to: '/', label: 'Visão geral', icon: LayoutGrid },
  { to: '/viagens', label: 'Viagens', icon: Truck },
  { to: '/containers', label: 'Contêineres', icon: Box },
  { to: '/alertas', label: 'Alertas', icon: Bell },
  { to: '/logs-iot', label: 'Logs IoT', icon: Activity },
  { to: '/equipe', label: 'Equipe', icon: Users },
  { to: '/relatorios', label: 'Relatórios', icon: FileText },
]

// Motorista só acessa Visão geral e Alertas.
const driverNav = [
  { to: '/', label: 'Visão geral', icon: LayoutGrid },
  { to: '/alertas', label: 'Alertas', icon: Bell },
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

export default function Layout({ user, onLogout }: { user: UserResponse | null; onLogout: () => void }) {
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState(false)
  const navigate = useNavigate()
  const { data: alerts } = useAsyncData(() => api.alerts())
  const { data: trips } = useAsyncData(() => api.trips())

  const driver = isDriver(user?.role)
  const navItems = driver ? driverNav : nav

  const containerCodes = useMemo(() => driverContainerCodes(user, trips ?? []), [user, trips])
  const alertList = driver ? (alerts ?? []).filter(a => containerCodes.includes(a.containerCode)) : (alerts ?? [])
  const activeAlerts = alertList.filter(a => !a.resolved).length
  const toastAlert = alertList.find(a => !a.resolved)

  useEffect(() => {
    if (!toastAlert) {
      setToast(false)
      return
    }
    setToast(true)
    const timer = setTimeout(() => setToast(false), 8000)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toastAlert?.id])

  const userName = user?.name ?? 'Usuário'
  const userRole = user ? roleLabel(user.role) : '—'

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="side-logo"><Logo size={22} /></div>
        <nav>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
              <Icon size={16} />{label}
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">
          <button className="user-chip" onClick={() => navigate('/perfil')}>
            <span className="avatar light">{userName.charAt(0).toUpperCase()}</span>
            <span><strong>{userName}</strong><small>{userRole}</small></span>
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
                <Bell size={16} />{activeAlerts > 0 && <i className="dot" />}
              </button>
              {open && (
                <div className="notif">
                  <div className="notif-head">
                    <div>
                      <h4>Notificações</h4>
                      <small>{alertList.length} alertas recentes</small>
                    </div>
                    <span className="pill red">{activeAlerts} ativos</span>
                  </div>
                  {alertList.slice(0, 5).map(a => (
                    <div key={a.id} className="notif-item">
                      <i className={`bullet ${alertColor(a)}`} />
                      <div>
                        <strong>{alertTitle(a)}</strong>
                        <small>{alertDetail(a)}</small>
                        <small>{timeAgo(a.createdAt)}</small>
                      </div>
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
      {toast && toastAlert && (
        <div className="toast" role="alert">
          <span className="toast-ic"><Bell size={16} /></span>
          <div>
            <strong>{alertTitle(toastAlert)}</strong>
            <p>{alertDetail(toastAlert)}. Verifique a refrigeração imediatamente.</p>
          </div>
          <button onClick={() => setToast(false)} aria-label="Fechar">✕</button>
        </div>
      )}
      <Acessibilidade />
    </div>
  )
}
