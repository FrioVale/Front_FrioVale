import { useState } from 'react'
import { FileText, Truck, Users } from 'lucide-react'
import { drivers, fmt, trips } from '../data'

const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
export default function Reports() {
  const [month, setMonth] = useState('Outubro'); const [year, setYear] = useState('2026')
  const [mode, setMode] = useState<'trip' | 'driver'>('trip')
  const [sel, setSel] = useState<string[]>([]); const [done, setDone] = useState(false)
  const toggle = (id: string) => { setDone(false); setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]) }
  const change = (m: 'trip' | 'driver') => { setMode(m); setSel([]); setDone(false) }
  const items = mode === 'trip'
    ? trips.map(t => ({ id: t.id, title: `${t.id} • ${t.route}`, sub: `${t.cargo} • ${fmt(t.temp)} °C` }))
    : drivers.map(d => ({ id: d.name, title: d.name, sub: `${d.trips} viagens no mês • ${d.inRange}% dentro da faixa` }))
  return (
    <div className="page mid">
      <span className="eyebrow">Análise operacional</span>
      <h1 className="title">Central de relatórios</h1>
      <p className="muted narrow">Selecione viagens específicas ou motoristas com múltiplas operações para consolidar o desempenho mensal da cadeia fria.</p>
      <div className="two rep">
        <div className="card pad">
          <div className="card-title"><i className="sq soft"><FileText size={16} /></i><div><h3>Configurar relatório</h3><p>Escolha o período e os registros que deseja consolidar.</p></div></div>
          <div className="grid2">
            <div><label>Mês de referência</label><select value={month} onChange={e => setMonth(e.target.value)}>{months.map(m => <option key={m}>{m}</option>)}</select></div>
            <div><label>Ano de referência</label><select value={year} onChange={e => setYear(e.target.value)}><option>2026</option><option>2025</option></select></div>
          </div>
          <div className="tabs seg">
            <button className={mode === 'trip' ? 'on' : ''} onClick={() => change('trip')}><Truck size={14} /> Por viagem</button>
            <button className={mode === 'driver' ? 'on' : ''} onClick={() => change('driver')}><Users size={14} /> Por motorista</button>
          </div>
          {items.map(i => (
            <label className="pick" key={i.id}>
              <input type="checkbox" checked={sel.includes(i.id)} onChange={() => toggle(i.id)} />
              <div><strong>{i.title}</strong><small>{i.sub}</small></div>
            </label>
          ))}
          <button className="btn primary block" disabled={!sel.length} onClick={() => setDone(true)}>Gerar relatório</button>
        </div>
        <div className="card pad preview">
          <span className="eyebrow sm">Prévia do documento</span>
          {!done ? (
            <div className="empty"><i className="sq soft lg"><FileText size={22} /></i><h3>Seu relatório aparecerá aqui</h3><p>Selecione ao menos uma viagem ou motorista e clique em gerar relatório.</p></div>
          ) : (
            <div className="doc"><h3>Relatório de {month} de {year}</h3><ul>{sel.map(s => <li key={s}>{s}</li>)}</ul></div>
          )}
        </div>
      </div>
    </div>
  )
}
