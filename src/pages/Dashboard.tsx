import { ArrowRight, Bell, Check, Thermometer, Truck } from 'lucide-react'
import { alerts, fmt, trips, user } from '../data'

const stats = [
  { label: 'Viagens em andamento', value: '3', note: '2 dentro da faixa', icon: Truck, tone: 'teal' },
  { label: 'Temperatura ideal', value: '8–12 °C', note: 'Faixa recomendada para as frutas', icon: Thermometer, tone: 'green' },
  { label: 'Alertas ativos', value: '2', note: '1 requer atenção', icon: Bell, tone: 'red' },
  { label: 'Motoristas ativos', value: '8', note: 'Todos conectados', icon: Truck, tone: 'teal' },
]
export default function Dashboard() {
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
        <div className="card-head"><h3>Viagens monitoradas</h3><p>Selecione uma viagem para visualizar o histórico térmico.</p></div>
        <table>
          <thead><tr><th>Viagem</th><th>Rota</th><th>Carga</th><th>Temperatura</th><th>Status</th><th className="r">Histórico</th></tr></thead>
          <tbody>
            {trips.map(t => (
              <tr key={t.id}>
                <td><b>{t.id}</b></td><td>{t.route}</td><td>{t.cargo}</td>
                <td className={t.status === 'Atenção' ? 'hot' : 'ok'}><b>{fmt(t.temp)} °C</b></td>
                <td><span className={`pill ${t.status === 'Atenção' ? 'red' : 'green'}`}>{t.status}</span></td>
                <td className="r"><button className="btn ghost">Abrir gráfico <ArrowRight size={13} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
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
