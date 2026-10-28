import { Navigate, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Team from './pages/Team'
import Reports from './pages/Reports'
import Profile from './pages/Profile'
import { Trips, Alerts } from './pages/Lists'

export default function App() {
  const [auth, setAuth] = useState(false)
  if (!auth) return <Login onLogin={() => setAuth(true)} />
  return (
    <Routes>
      <Route element={<Layout onLogout={() => setAuth(false)} />}>
        <Route index element={<Dashboard />} />
        <Route path="viagens" element={<Trips />} />
        <Route path="alertas" element={<Alerts />} />
        <Route path="equipe" element={<Team />} />
        <Route path="relatorios" element={<Reports />} />
        <Route path="perfil" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  )
}
