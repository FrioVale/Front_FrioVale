import { useState } from 'react'
import { ArrowRight, Bell, Check, Thermometer, Truck, X } from 'lucide-react'
import { alerts, fmt, trips, user } from '../data'
import TempChart from '../components/TempChart'

const stats = [
  { label: 'Viagens em andamento', value: '3', note: '2 dentro da faixa', icon: Truck, tone: 'teal' },
  { label: 'Temperatura ideal', value: '8–12 °C', note: 'Faixa recomendada para as frutas', icon: Thermometer, tone: 'green' },
  { label: 'Alertas ativos', value: '2', note: '1 requer atenção', icon: Bell, tone: 'red' },
  { label: 'Motoristas ativos', value: '8', note: 'Todos conectados', icon: Truck, tone: 'teal' },
]

export default function Dashboard() {
  const [selected, setSelected] = useState<string | null>(null)
  const trip = trips.find(t => t.id === selected)
  const toggle = (id: string) => setSelected(s => (s === id ? null : id))

  return (
    <div className="page wide">
      <span className="eyebrow">Operação em tempo real</span>
      <h1 className="title">Bom dia, {user.name.split(' ')[0]}.</h1>
      <p className="muted">Acompanhe as condições da frota e antecipe desvios.</p>

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
            {trips.map(t => (
              <tr key={t.id} className={selected === t.id ? 'sel' : ''}>
                <td><b>{t.id}</b></td><td>{t.route}</td><td>{t.cargo}</td>
                <td className={t.status === 'Atenção' ? 'hot' : 'ok'}><b>{fmt(t.temp)} °C</b></td>
                <td><span className={`pill ${t.status === 'Atenção' ? 'red' : 'green'}`}>{t.status}</span></td>
                <td className="r"><button className="btn ghost" onClick={() => toggle(t.id)}>Abrir gráfico <ArrowRight size={13} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>

        {trip && (
          <div className="hist">
            <div className="hist-head">
              <div>
                <span className="eyebrow sm">Histórico da viagem {trip.id}</span>
                <h3>{trip.route}</h3>
                <p>{trip.cargo} • Faixa ideal 8–12 °C</p>
              </div>
              <button className="icon-btn" onClick={() => setSelected(null)} aria-label="Fechar histórico"><X size={16} /></button>
            </div>
            <div className="hist-cards">
              <div className="mini">
                <small>Temperatura atual</small>
                <strong className={trip.status === 'Atenção' ? 'hot' : 'ok'}><Thermometer size={18} /> {fmt(trip.temp)} °C</strong>
              </div>
              <div className="mini">
                <small>Amplitude registrada</small>
                <strong>{fmt(Math.max(...trip.series) - Math.min(...trip.series))} °C</strong>
              </div>
              <div className="mini">
                <small>Faixa recomendada</small>
                <strong>8–12 °C</strong>
              </div>
            </div>
            <div className="chart-wrap"><TempChart series={trip.series} /></div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-head row"><div><h3>Alertas recentes</h3><p>Prioridade operacional</p></div><i className="sq red"><Bell size={15} /></i></div>
        <div className="alert-list">
          {alerts.map(a => (
            <div className="alert-row" key={a.id}>
              <div><strong><i className={`bullet ${a.color}`} />{a.title}</strong><small>{a.detail}</small></div>
              <small>{a.ago}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}