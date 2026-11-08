import { FormEvent, useState } from 'react'
import { Users } from 'lucide-react'
import { api } from '../api'
import { useAsyncData } from '../hooks/useAsyncData'
import { roleLabel, roleValue } from '../data'

export default function Team() {
  const { data, loading, error, reload } = useAsyncData(() => api.users())
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'Motorista' | 'Administrador'>('Motorista')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string>()

  const members = data ?? []

  const add = async (event: FormEvent) => {
    event.preventDefault()
    if (!name || !email || saving) return
    setSaving(true)
    setFormError(undefined)
    try {
      await api.createUser({ name, email, role: roleValue(role) })
      setName('')
      setEmail('')
      reload()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Não foi possível cadastrar o membro.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page mid">
      <span className="eyebrow">Gestão de acesso</span>
      <h1 className="title">Equipe FrioVale</h1>
      <p className="muted">Cadastre motoristas e administradores em um espaço dedicado.</p>
      <div className="two">
        <form className="card pad" onSubmit={add}>
          <div className="card-title"><i className="sq soft"><Users size={16} /></i><div><h3>Novo membro</h3><p>A senha inicial é gerada automaticamente.</p></div></div>
          <div className="grid2">
            <input placeholder="Nome completo" value={name} onChange={e => setName(e.target.value)} />
            <input placeholder="E-mail corporativo" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            <select value={role} onChange={e => setRole(e.target.value as 'Motorista' | 'Administrador')}><option>Motorista</option><option>Administrador</option></select>
          </div>
          {formError && <p className="muted">{formError}</p>}
          <button className="btn primary block" type="submit" disabled={saving}>{saving ? 'Cadastrando...' : 'Cadastrar membro'}</button>
        </form>
        <div className="card members">
          <div className="card-head"><h3>Membros cadastrados</h3><p>{members.length} pessoas com acesso ao aplicativo.</p></div>
          {loading && <p className="muted" style={{ padding: '0 20px 20px' }}>Carregando membros...</p>}
          {error && <p className="muted" style={{ padding: '0 20px 20px' }}>{error}</p>}
          {!loading && members.length === 0 && <p className="muted" style={{ padding: '0 20px 20px' }}>Nenhum membro cadastrado.</p>}
          {members.map(m => (
            <div className="member" key={m.email}>
              <span className="avatar">{m.name.charAt(0).toUpperCase()}</span>
              <div><strong>{m.name}</strong><small>{m.email}</small></div>
              <span className="pill soft">{roleLabel(m.role)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
