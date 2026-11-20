import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowRight, Bell, Check, Thermometer, Truck, X, Zap } from 'lucide-react'
import { api, type ImpactResponse, type ImpactSummaryResponse } from '../api'
import { useAsyncData } from '../hooks/useAsyncData'
import { tripEvents } from '../lib/tripEvents'
import {
  alertColor, alertDetail, alertTitle, driverContainerCodes, fmt, fmtTemp, formatDateTime, isDriver, timeAgo, tripCode, tripRoute, tripStatus,
  iaStatus, iaDivergenciaLabel, iaToneColor,
} from '../data'
import TempChart from '../components/TempChart'
import ImpactTimeline from '../components/ImpactTimeline'

export default function Dashboard() {
  const [selected, setSelected] = useState<number | null>(null)
  const [monitorTab, setMonitorTab] = useState<'temperature' | 'impacts'>('temperature')
  const { data, loading, error, reload } = useAsyncData(() => api.dashboard())
  const { data: currentUser } = useAsyncData(() => api.currentUser())
  const driver = isDriver(currentUser?.role)

  // Atualiza automaticamente quando uma viagem é cadastrada em outra tela (ex.: /viagens).
  useEffect(() => {
    const unsubscribe = tripEvents.on(() => reload())
    return unsubscribe
  }, [reload])
  const { data: telemetry } = useAsyncData(
    () => (selected == null ? Promise.resolve([]) : api.telemetry(selected)),
    [selected],
  )
  // Impactos do acelerômetro: carregados apenas quando a aba Impactos é aberta.
  const { data: impacts } = useAsyncData(
    () => (selected == null || monitorTab !== 'impacts' ? Promise.resolve([] as ImpactResponse[]) : api.impactsByTrip(selected)),
    [selected, monitorTab],
  )
  const { data: impactSummary } = useAsyncData(
    () => (selected == null || monitorTab !== 'impacts'
      ? Promise.resolve(null as ImpactSummaryResponse | null)
      : api.impactSummary(selected)),
    [selected, monitorTab],
  )

  const allTrips = data?.trips ?? []
  const allAlerts = data?.recentAlerts ?? []

  // Motorista vê apenas sua(s) própria(s) viagem(s) e alertas do seu(s) contêiner(es).
  const trips = driver ? allTrips.filter(t => t.driverId === currentUser?.id) : allTrips
  const containerCodes = useMemo(() => driverContainerCodes(currentUser, trips), [currentUser, trips])
  const alerts = driver ? allAlerts.filter(a => containerCodes.includes(a.containerCode)) : allAlerts

  const trip = trips.find(t => t.id === selected)
  const history = (telemetry ?? []).slice(-60)
  const series = history.map(t => t.temperature)
  const labels = history.map(t => {
    const date = new Date(t.timestamp)
    return Number.isNaN(date.getTime()) ? '' : `${String(date.getHours()).padStart(2, '0')}h`
  })

  const activeTripsCount = trips.filter(t => t.status === 'IN_TRANSIT').length
  const tripsInRangeCount = trips.filter(t => t.inRange === true).length
  const activeAlertCount = alerts.filter(a => !a.resolved).length
  const activeDriverCount = new Set(trips.map(t => t.driverId).filter((id): id is number => id != null)).size

  const mins = trips.map(t => t.minTemp).filter((v): v is number => v != null)
  const maxs = trips.map(t => t.maxTemp).filter((v): v is number => v != null)
  const idealMinTemp = mins.length ? Math.min(...mins) : null
  const idealMaxTemp = maxs.length ? Math.max(...maxs) : null

  const stats = [
    {
      label: 'Viagens em andamento',
      value: String(activeTripsCount),
      note: `${tripsInRangeCount} dentro da faixa`,
      icon: Truck,
      tone: 'teal',
    },
    {
      label: 'Temperatura ideal',
      value: idealMinTemp != null && idealMaxTemp != null
        ? `${fmt(idealMinTemp)}–${fmt(idealMaxTemp)} °C`
        : '—',
      note: 'Faixa recomendada para as frutas',
      icon: Thermometer,
      tone: 'green',
    },
    {
      label: 'Alertas ativos',
      value: String(activeAlertCount),
      note: activeAlertCount > 0 ? 'Requer atenção' : 'Nenhum alerta ativo',
      icon: Bell,
      tone: 'red',
    },
    {
      label: 'Motoristas ativos',
      value: String(activeDriverCount),
      note: activeTripsCount > 0 ? 'Em viagens monitoradas' : 'Sem viagens ativas',
      icon: Truck,
      tone: 'teal',
    },
  ]

  const toggle = (id: number) => {
    setMonitorTab('temperature') // temperatura é sempre a aba inicial
    setSelected(current => (current === id ? null : id))
  }
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
              <div><h3>Viagens monitoradas</h3><p>Selecione uma viagem para visualizar o monitoramento (temperatura e impactos).</p></div>
              <span className="badge">{trips.length} viagens ativas</span>
            </div>
            <table>
              <thead><tr><th>Viagem</th><th>Rota</th><th>Motorista</th><th>Carga</th><th>Temperatura</th><th>Status</th><th className="r">Histórico</th></tr></thead>
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
                      <td>{t.driverName}</td>
                      <td>{t.fruitName}</td>
                      <td className={t.inRange === false ? 'hot' : t.inRange === true ? 'ok' : ''}><b>{fmtTemp(t.temperature)}</b></td>
                      <td><span className={`pill ${status.tone}`}>{status.label}</span></td>
                      <td className="r"><button className="btn ghost" onClick={() => toggle(t.id)}>Ver monitoramento <ArrowRight size={13} /></button></td>
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
                {/* Abas: mesmo padrão visual de "Por viagem / Por motorista" (Relatórios) */}
                <div className="tabs seg monitor-tabs">
                  <button className={monitorTab === 'temperature' ? 'on' : ''} onClick={() => setMonitorTab('temperature')}>
                    <Thermometer size={14} /> Temperatura
                  </button>
                  <button className={monitorTab === 'impacts' ? 'on' : ''} onClick={() => setMonitorTab('impacts')}>
                    <Zap size={14} /> Impactos
                  </button>
                </div>

                {monitorTab === 'temperature' && (
                  <>
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
                    <div className="hist-cards">
                      <div className="mini">
                        <small>Monitoramento Inteligente (IA)</small>
                        <strong className={iaToneColor(trip.iaResultado === 'anomalia' ? 'red' : trip.iaResultado === 'normal' ? 'green' : 'soft')}>
                          {iaStatus(trip.iaResultado).label}
                        </strong>
                      </div>
                      <div className="mini">
                        <small>Regras fixas</small>
                        <strong className={trip.regrasAnomalia === true ? 'hot' : trip.regrasAnomalia === false ? 'ok' : 'soft'}>
                          {trip.regrasAnomalia === true ? 'Alerta' : trip.regrasAnomalia === false ? 'Normal' : 'Sem dado'}
                        </strong>
                      </div>
                      <div className="mini">
                        <small>Status geral</small>
                        <strong className={trip.iaDivergencia === true ? 'hot' : trip.iaDivergencia === false ? 'ok' : 'soft'}>
                          {trip.iaDivergencia === true ? 'Divergência' : trip.iaDivergencia === false ? 'Alinhado' : 'Sem análise'}
                        </strong>
                      </div>
                    </div>
                    <div className="card-wrap">
                      <small>{trip.iaMensagem || 'Sem análise de IA disponível para esta leitura.'}</small>
                    </div>
                  </>
                )}

                {monitorTab === 'impacts' && (
                  <>
                    <div className="hist-cards">
                      <div className="mini">
                        <small>Impactos na viagem</small>
                        <strong><Zap size={18} /> {impactSummary?.total ?? 0}</strong>
                      </div>
                      <div className="mini">
                        <small>Maior pico em g</small>
                        <strong className={(impactSummary?.maxPeakG ?? 0) >= 2 ? 'hot' : ''}>
                          {impactSummary?.maxPeakG != null ? `${impactSummary.maxPeakG.toFixed(1).replace('.', ',')} g` : '—'}
                        </strong>
                      </div>
                      <div className="mini">
                        <small>Último impacto</small>
                        <strong style={{ fontSize: 13 }}>
                          {impactSummary?.lastImpact
                            ? `${impactSummary.lastImpact.peakG.toFixed(1).replace('.', ',')} g`
                            : '—'}
                        </strong>
                        <small>{impactSummary?.lastImpact
                          ? formatDateTime(impactSummary.lastImpact.originalTimestamp)
                          : (impactSummary?.message ?? '—')}</small>
                      </div>
                    </div>
                    <div className="chart-wrap impact-wrap">
                      {impactSummary && impactSummary.total === 0 && impactSummary.message && (
                        <p className="muted impact-status">{impactSummary.message}</p>
                      )}
                      <ImpactTimeline impacts={impacts ?? []} />
                    </div>
                  </>
                )}
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
