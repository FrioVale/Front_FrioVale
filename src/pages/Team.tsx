import { FormEvent, useState } from 'react'
import { Users } from 'lucide-react'
import { Member, user } from '../data'

export default function Team() {
  const [members, setMembers] = useState<Member[]>([{ name: user.name, email: user.email, role: 'Administrador' }])
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [role, setRole] = useState<Member['role']>('Motorista')
  const add = (e: FormEvent) => { e.preventDefault(); if (!name || !email) return; setMembers(m => [...m, { name, email, role }]); setName(''); setEmail('') }
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
            <select value={role} onChange={e => setRole(e.target.value as Member['role'])}><option>Motorista</option><option>Administrador</option></select>
          </div>
          <button className="btn primary block" type="submit">Cadastrar membro</button>
        </form>
        <div className="card members">
          <div className="card-head"><h3>Membros cadastrados</h3><p>{members.length} pessoas com acesso ao aplicativo.</p></div>
          {members.map(m => (
            <div className="member" key={m.email}>
              <span className="avatar">{m.name[0]}</span>
              <div><strong>{m.name}</strong><small>{m.email}</small></div>
              <span className="pill soft">{m.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
