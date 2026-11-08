import { useState } from 'react'
import { ArrowRight, Bell, Check, Thermometer, Truck, X } from 'lucide-react'
import { api } from '../api'
import { useAsyncData } from '../hooks/useAsyncData'
import {
  alertColor, alertDetail, alertTitle, fmt, fmtTemp, timeAgo, tripCode, tripRoute, tripStatus,
} from '../data'
import TempChart from '../components/TempChart'

export default function Dashboard() {
  const [selected, setSelected] = useState<number | null>(null)
  const { data, loading, error } = useAsyncData(() => api.dashboard())
  const { data: currentUser } = useAsyncData(() => api.currentUser())
  const { data: telemetry } = useAsyncData(
    () => (selected == null ? Promise.resolve([]) : api.telemetry(selected)),
    [selected],
  )

  const trips = data?.trips ?? []
  const alerts = data?.recentAlerts ?? []
  const trip = trips.find(t => t.id === selected)
  const history = (telemetry ?? []).slice(-60)
  const series = history.map(t => t.temperature)
  const labels = history.map(t => {
    const date = new Date(t.timestamp)
    return Number.isNaN(date.getTime()) ? '' : `${String(date.getHours()).padStart(2, '0')}h`
  })

  const stats = data
    ? [
      {
        label: 'Viagens em andamento',
        value: String(data.activeTrips),
        note: `${data.tripsInRange} dentro da faixa`,
        icon: Truck,
        tone: 'teal',
      },
      {
        label: 'Temperatura ideal',
        value: data.idealMinTemp != null && data.idealMaxTemp != null
          ? `${fmt(data.idealMinTemp)}–${fmt(data.idealMaxTemp)} °C`
          : '—',
        note: 'Faixa recomendada para as frutas',
        icon: Thermometer,
        tone: 'green',
      },
      {
        label: 'Alertas ativos',
        value: String(data.activeAlerts),
        note: data.activeAlerts > 0 ? 'Requer atenção' : 'Nenhum alerta ativo',
        icon: Bell,
        tone: 'red',
      },
      {
        label: 'Motoristas ativos',
        value: String(data.activeDrivers),
        note: data.activeTrips > 0 ? 'Em viagens monitoradas' : 'Sem viagens ativas',
        icon: Truck,
        tone: 'teal',
      },
    ]
    : []

  const toggle = (id: number) => setSelected(current => (current === id ? null : id))
  const firstName = currentUser?.name.split(' ')[0] ?? 'operador'

  return (
    <div className="page wide">
      <span className="eyebrow">Operação em tempo real</span>
      <h1 className="title">Bom dia, {firstName}.</h1>
      <p className="muted">Acompanhe as condições da frota e antecipe desvios.</p>

      {loading && !data && <div className="card pad"><p className="muted">Carregando dados do servidor...</p></div>}
      {error && <div className="card pad"><p className="muted">{error}</p></div>}

      {data && (
        <>
          <div className="stats">
            {stats.map(s => (
              <div className="card stat" key={s.label}>
                <div className="stat-top"><span>{s.label}</span><i className={`sq ${s.tone}`}><s.icon size={15} /></i></div>
                <strong>{s.value}</strong>
                <small><Check size={11} /> {s.note}</small>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-head row">
              <div><h3>Viagens monitoradas</h3><p>Selecione uma viagem para visualizar o histórico térmico.</p></div>
              <span className="badge">{trips.length} viagens ativas</span>
            </div>
            <table>
              <thead><tr><th>Viagem</th><th>Rota</th><th>Carga</th><th>Temperatura</th><th>Status</th><th className="r">Histórico</th></tr></thead>
              <tbody>
                {trips.length === 0 && (
                  <tr><td colSpan={6} className="muted">Nenhuma viagem em andamento no momento.</td></tr>
                )}
                {trips.map(t => {
                  const status = tripStatus(t)
                  return (
                    <tr key={t.id} className={selected === t.id ? 'sel' : ''}>
                      <td><b>{tripCode(t.id)}</b></td>
                      <td>{tripRoute(t)}</td>
                      <td>{t.fruitName}</td>
                      <td className={t.inRange === false ? 'hot' : t.inRange === true ? 'ok' : ''}><b>{fmtTemp(t.temperature)}</b></td>
                      <td><span className={`pill ${status.tone}`}>{status.label}</span></td>
                      <td className="r"><button className="btn ghost" onClick={() => toggle(t.id)}>Abrir gráfico <ArrowRight size={13} /></button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {trip && (
              <div className="hist">
                <div className="hist-head">
                  <div>
                    <span className="eyebrow sm">Histórico da viagem {tripCode(trip.id)}</span>
                    <h3>{tripRoute(trip)}</h3>
                    <p>{trip.fruitName} • Faixa ideal {fmt(trip.minTemp)}–{fmt(trip.maxTemp)} °C</p>
                  </div>
                  <button className="icon-btn" onClick={() => setSelected(null)} aria-label="Fechar histórico"><X size={16} /></button>
                </div>
                <div className="hist-cards">
                  <div className="mini">
                    <small>Temperatura atual</small>
                    <strong className={trip.inRange === false ? 'hot' : trip.inRange === true ? 'ok' : ''}><Thermometer size={18} /> {fmtTemp(trip.temperature)}</strong>
                  </div>
                  <div className="mini">
                    <small>Amplitude registrada</small>
                    <strong>{series.length > 1 ? `${fmt(Math.max(...series) - Math.min(...series))} °C` : '—'}</strong>
                  </div>
                  <div className="mini">
                    <small>Faixa recomendada</small>
                    <strong>{fmt(trip.minTemp)}–{fmt(trip.maxTemp)} °C</strong>
                  </div>
                </div>
                <div className="chart-wrap">
                  {series.length > 0
                    ? <TempChart series={series} labels={labels} safeMin={trip.minTemp} safeMax={trip.maxTemp} />
                    : <p className="muted">Nenhuma leitura de telemetria registrada para esta viagem.</p>}
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-head row"><div><h3>Alertas recentes</h3><p>Prioridade operacional</p></div><i className="sq red"><Bell size={15} /></i></div>
            <div className="alert-list">
              {alerts.length === 0 && <p className="muted">Nenhum alerta registrado até o momento.</p>}
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
        </>
      )}
    </div>
  )
}
