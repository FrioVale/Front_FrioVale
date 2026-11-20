import { useCallback, useMemo, useState } from 'react'
import { Plus, Edit2 } from 'lucide-react'
import { api } from '../api'
import { useAsyncData } from '../hooks/useAsyncData'
import { NewTripForm } from '../components/NewTripForm'
import { tripEvents } from '../lib/tripEvents'
import {
  alertColor,
  alertDetail,
  alertTitle,
  driverContainerCodes,
  fmtTemp,
  isDriver,
  timeAgo,
  tripCode,
  tripRoute,
  tripStatus,
} from '../data'
import type { TripMonitor, UserResponse } from '../api'

export const Trips = () => {
  const { data, loading, error, reload } = useAsyncData(() => api.trips())
  const { data: currentUser } = useAsyncData(() => api.currentUser())
  const driver = isDriver(currentUser?.role)
  const trips: TripMonitor[] = driver ? (data ?? []).filter(t => t.driverId === currentUser?.id) : (data ?? [])

  const [isNewOpen, setIsNewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingTrip, setEditingTrip] = useState<TripMonitor | null>(null)

  /** Contêineres com viagem em andamento não podem ser reutilizados em outra viagem. */
  const unavailableContainerIds = useMemo(
    () => trips.filter(t => t.status === 'IN_TRANSIT').map(t => t.containerId),
    [trips],
  )

  const handleCreated = useCallback(() => {
    tripEvents.emit()
    reload()
  }, [reload])

  const startEdit = (t: TripMonitor) => {
    setEditingTrip(t)
    setIsEditOpen(true)
  }

  return (
    <div className="page mid">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div><span className="eyebrow">Frota</span><h1 className="title">Viagens</h1></div>
        {!driver && (
          <button className="btn primary" onClick={() => setIsNewOpen(true)}>
            <Plus size={16} /> Nova viagem
          </button>
        )}
      </div>
      {loading && <p className="muted">Carregando viagens...</p>}
      {error && <p className="muted">{error}</p>}
      <div className="card" style={{ marginTop: 24 }}>
        {!loading && trips.length === 0 && (
          <p className="muted" style={{ padding: 16 }}>Nenhuma viagem cadastrada.</p>
        )}
        {trips.map(t => {
          const status = tripStatus(t)
          return (
            <div className="alert-row" key={t.id} style={{ alignItems: 'center' }}>
              <div>
                <strong>{tripCode(t.id)} • {tripRoute(t)}</strong>
                <br />
                <small>{t.fruitName} • Motorista: {t.driverName}</small>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <b>{fmtTemp(t.temperature)}</b>
                <span className={`pill ${status.tone}`}>{status.label}</span>
                <button
                  className="btn ghost sm"
                  onClick={() => startEdit(t)}
                  title="Editar viagem"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal: Nova viagem / Editar viagem */}
      <NewTripForm
        open={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        mode="create"
        unavailableContainerIds={unavailableContainerIds}
        onCreated={handleCreated}
      />
      <NewTripForm
        open={isEditOpen}
        onClose={() => { setIsEditOpen(false); setEditingTrip(null) }}
        mode="edit"
        trip={editingTrip}
        unavailableContainerIds={unavailableContainerIds}
        onCreated={handleCreated}
      />
    </div>
  )
}

export const Alerts = () => {
  const { data, loading, error } = useAsyncData(() => api.alerts())
  const { data: impactAlerts } = useAsyncData(() => api.impactAlerts())
  const { data: currentUser } = useAsyncData(() => api.currentUser())
  const { data: trips } = useAsyncData(() => api.trips())
  const driver = isDriver(currentUser?.role)
  const containerCodes = useMemo(() => driverContainerCodes(currentUser, trips ?? []), [currentUser, trips])
  const alerts = driver ? (data ?? []).filter(a => containerCodes.includes(a.containerCode)) : (data ?? [])
  const impacts = driver
    ? (impactAlerts ?? []).filter(a => containerCodes.includes(a.containerCode))
    : (impactAlerts ?? [])

  return (
    <div className="page mid">
      <span className="eyebrow">Monitoramento</span><h1 className="title">Alertas</h1>
      {loading && <p className="muted">Carregando alertas...</p>}
      {error && <p className="muted">{error}</p>}
      <div className="card" style={{ marginTop: 24 }}>
        {!loading && alerts.length === 0 && impacts.length === 0 && (
          <p className="muted" style={{ padding: 16 }}>Nenhum alerta registrado até o momento.</p>
        )}
        {alerts.map(a => (
          <div className="alert-row" key={`temp-${a.id}`}>
            <div>
              <strong><i className={`bullet ${alertColor(a)}`} />{alertTitle(a)}</strong>
              <small>{alertDetail(a)}</small>
            </div>
            <small>{timeAgo(a.createdAt)}</small>
          </div>
        ))}
        {impacts.map(a => (
          <div className="alert-row" key={`impact-${a.alertId}`}>
            <div>
              <strong><i className="bullet orange" />Impacto acima do limite configurado</strong>
              <small>{a.message}</small>
            </div>
            <small>{timeAgo(a.timestamp)}</small>
          </div>
        ))}
      </div>
    </div>
  )
}
