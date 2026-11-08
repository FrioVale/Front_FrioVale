import { api } from '../api'
import { useAsyncData } from '../hooks/useAsyncData'
import { alertColor, alertDetail, alertTitle, fmtTemp, timeAgo, tripCode, tripRoute } from '../data'

export const Trips = () => {
  const { data, loading, error } = useAsyncData(() => api.trips())
  const trips = data ?? []

  return (
    <div className="page mid">
      <span className="eyebrow">Frota</span><h1 className="title">Viagens</h1>
      {loading && <p className="muted">Carregando viagens...</p>}
      {error && <p className="muted">{error}</p>}
      <div className="card" style={{ marginTop: 24 }}>
        {!loading && trips.length === 0 && (
          <p className="muted" style={{ padding: 16 }}>Nenhuma viagem cadastrada.</p>
        )}
        {trips.map(t => (
          <div className="alert-row" key={t.id}>
            <div>
              <strong>{tripCode(t.id)} • {tripRoute(t)}</strong>
              <small>{t.fruitName}</small>
            </div>
            <b>{fmtTemp(t.temperature)}</b>
          </div>
        ))}
      </div>
    </div>
  )
}

export const Alerts = () => {
  const { data, loading, error } = useAsyncData(() => api.alerts())
  const alerts = data ?? []

  return (
    <div className="page mid">
      <span className="eyebrow">Monitoramento</span><h1 className="title">Alertas</h1>
      {loading && <p className="muted">Carregando alertas...</p>}
      {error && <p className="muted">{error}</p>}
      <div className="card" style={{ marginTop: 24 }}>
        {!loading && alerts.length === 0 && (
          <p className="muted" style={{ padding: 16 }}>Nenhum alerta registrado até o momento.</p>
        )}
        {alerts.map(a => (
          <div className="alert-row" key={a.id}>
            <div>
              <strong><i className={`bullet ${alertColor(a)}`} />{alertTitle(a)}</strong>
              <small>{alertDetail(a)}</small>
            </div>
            <small>{timeAgo(a.createdAt)}</small>
          </div>
        ))}
      </div>
    </div>
  )
}
