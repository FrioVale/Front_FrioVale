import { Navigate, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Team from './pages/Team'
import Reports from './pages/Reports'
import Profile from './pages/Profile'
import IoTLogs from './pages/IotLogs'
import { Trips, Alerts } from './pages/Lists'
import { session } from './api'

export default function App() {
  const [auth, setAuth] = useState(() => session.hasToken())
  if (!auth) return <Login onLogin={() => setAuth(true)} />
  return (
    <Routes>
      <Route element={<Layout onLogout={() => { session.clear(); setAuth(false) }} />}>
        <Route index element={<Dashboard />} />
        <Route path="viagens" element={<Trips />} />
        <Route path="alertas" element={<Alerts />} />
        <Route path="logs-iot" element={<IoTLogs />} />
        <Route path="equipe" element={<Team />} />
        <Route path="relatorios" element={<Reports />} />
        <Route path="perfil" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  )
}
