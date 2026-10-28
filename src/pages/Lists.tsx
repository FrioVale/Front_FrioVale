import { alerts, fmt, trips } from '../data'
export const Trips = () => (
  <div className="page mid"><span className="eyebrow">Frota</span><h1 className="title">Viagens</h1>
    <div className="card" style={{ marginTop: 24 }}>{trips.map(t => (
      <div className="alert-row" key={t.id}><div><strong>{t.id} • {t.route}</strong><small>{t.cargo}</small></div><b>{fmt(t.temp)} °C</b></div>))}</div></div>
)
export const Alerts = () => (
  <div className="page mid"><span className="eyebrow">Monitoramento</span><h1 className="title">Alertas</h1>
    <div className="card" style={{ marginTop: 24 }}>{alerts.map(a => (
      <div className="alert-row" key={a.id}><div><strong><i className={`bullet ${a.color}`} />{a.title}</strong><small>{a.detail}</small></div><small>{a.ago}</small></div>))}</div></div>
)
