import { useState } from 'react'
import { FileText, Truck, Users, Download } from 'lucide-react'
import { api } from '../api'
import { useAsyncData } from '../hooks/useAsyncData'
import {
  currentMonthName, fmtTemp, monthNames, tripCode, tripRoute, yearOptions,
} from '../data'

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function Reports() {
  const { data: tripsData, loading, error } = useAsyncData(() => api.trips())
  const { data: driversData } = useAsyncData(() => api.driverStats())
  const [month, setMonth] = useState(currentMonthName())
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [mode, setMode] = useState<'trip' | 'driver'>('trip')
  const [sel, setSel] = useState<string[]>([])
  const [done, setDone] = useState(false)
  const [generating, setGenerating] = useState(false)

  const trips = tripsData ?? []
  const drivers = driversData ?? []
  const years = yearOptions()

  const toggle = (id: string) => { setDone(false); setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]) }
  const change = (m: 'trip' | 'driver') => { setMode(m); setSel([]); setDone(false) }

  const items = mode === 'trip'
    ? trips.map(t => ({
      id: String(t.id),
      title: `${tripCode(t.id)} • ${tripRoute(t)}`,
      sub: `${t.fruitName} • ${fmtTemp(t.temperature)}`,
    }))
    : drivers.map(d => ({
      id: String(d.id),
      title: d.name,
      sub: `${d.trips} viagens registradas • ${d.inRangePercent ?? '—'}% dentro da faixa`,
    }))

  const selectedTitles = sel.map(id => {
    const item = items.find(i => i.id === id)
    return item ? item.title : id
  })

  const generate = async () => {
    if (!sel.length) return
    setGenerating(true)
    try {
      if (mode === 'trip') {
        // Um PDF detalhado por viagem selecionada, com todas as leituras do trajeto
        for (const id of sel) {
          const blob = await api.tripPdf(Number(id))
          downloadBlob(blob, `relatorio-viagem-fv-${String(id).padStart(3, '0')}.pdf`)
        }
      } else {
        const blob = await api.reportPdf('driver', undefined, undefined, sel.map(Number))
        downloadBlob(blob, 'relatorio-motoristas.pdf')
      }
      setDone(true)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Não foi possível gerar o relatório.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="page mid">
      <span className="eyebrow">Análise operacional</span>
      <h1 className="title">Central de relatórios</h1>
      <p className="muted narrow">Selecione viagens específicas ou motoristas com múltiplas operações para consolidar o desempenho mensal da cadeia fria.</p>
      {loading && <p className="muted">Carregando dados...</p>}
      {error && <p className="muted">{error}</p>}
      <div className="two rep">
        <div className="card pad">
          <div className="card-title"><i className="sq soft"><FileText size={16} /></i><div><h3>Configurar relatório</h3><p>Escolha o período e os registros que deseja consolidar.</p></div></div>
          <div className="grid2">
            <div><label>Mês de referência</label><select value={month} onChange={e => setMonth(e.target.value)}>{monthNames.map(m => <option key={m}>{m}</option>)}</select></div>
            <div><label>Ano de referência</label><select value={year} onChange={e => setYear(e.target.value)}>{years.map(y => <option key={y}>{y}</option>)}</select></div>
          </div>
          <div className="tabs seg">
            <button className={mode === 'trip' ? 'on' : ''} onClick={() => change('trip')}><Truck size={14} /> Por viagem</button>
            <button className={mode === 'driver' ? 'on' : ''} onClick={() => change('driver')}><Users size={14} /> Por motorista</button>
          </div>
          {items.length === 0 && <p className="muted">Nenhum registro disponível para este filtro.</p>}
          {items.map(i => (
            <label className="pick" key={i.id}>
              <input type="checkbox" checked={sel.includes(i.id)} onChange={() => toggle(i.id)} />
              <div><strong>{i.title}</strong><small>{i.sub}</small></div>
            </label>
          ))}
          <button className="btn primary block" disabled={!sel.length || generating} onClick={generate}>
            <Download size={14} />
            {generating ? 'Gerando...' : mode === 'trip' ? 'Baixar PDF da(s) viagem(ns)' : 'Baixar PDF do relatório'}
          </button>
        </div>
        <div className="card pad preview">
          <span className="eyebrow sm">Prévia do documento</span>
          {!done || sel.length === 0 ? (
            <div className="empty"><i className="sq soft lg"><FileText size={22} /></i><h3>Selecione ao menos uma viagem ou motorista e gere o relatório.</h3><p>No modo viagem, cada PDF traz todas as leituras de temperatura e umidade com horário ao longo do trajeto.</p></div>
          ) : (
            <div className="doc"><h3>Relatório de {month} de {year}</h3><ul>{selectedTitles.map(s => <li key={s}>{s}</li>)}</ul><p className="muted">PDF gerado com os dados completos do banco.</p></div>
          )}
        </div>
      </div>
    </div>
  )
}
