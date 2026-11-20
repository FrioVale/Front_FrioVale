import { Navigate, Route, Routes } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Team from './pages/Team'
import Containers from './pages/Containers'
import Reports from './pages/Reports'
import Profile from './pages/Profile'
import IoTLogs from './pages/IotLogs'
import { Trips, Alerts } from './pages/Lists'
import { api, session, type UserResponse } from './api'
import { isDriver } from './data'

export default function App() {
  const [auth, setAuth] = useState(() => session.hasToken())
  const [user, setUser] = useState<UserResponse | null>(null)
  const [userLoaded, setUserLoaded] = useState(false)

  useEffect(() => {
    if (!auth) {
      setUserLoaded(true)
      return
    }
    api.currentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setUserLoaded(true))
  }, [auth])

  if (!auth) return <Login onLogin={() => setAuth(true)} />
  if (!userLoaded) return null

  const driver = isDriver(user?.role)

  return (
    <Routes>
      <Route element={<Layout user={user} onLogout={() => { session.clear(); setAuth(false) }} />}>
        <Route index element={<Dashboard />} />
        {driver ? null : (
          <>
            <Route path="viagens" element={<Trips />} />
            <Route path="containers" element={<Containers />} />
            <Route path="logs-iot" element={<IoTLogs />} />
            <Route path="equipe" element={<Team />} />
            <Route path="relatorios" element={<Reports />} />
            <Route path="perfil" element={<Profile />} />
          </>
        )}
        <Route path="alertas" element={<Alerts />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
