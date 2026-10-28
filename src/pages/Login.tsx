import { FormEvent, useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import Logo from '../components/Logo'
import { ThemeButton } from '../components/Layout'

const maskPhone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [tab, setTab] = useState<'in' | 'up'>('in')
  const [phone, setPhone] = useState('')
  const signup = tab === 'up'
  const submit = (e: FormEvent) => { e.preventDefault(); onLogin() }

  return (
    <div className="login">
      <section className="login-hero">
        <Logo size={40} />
        <div className="hero-body">
          <span className="chip">Cadeia fria inteligente</span>
          <h1>Da origem ao destino, a temperatura sob controle.</h1>
          <p>Monitoramento contínuo para preservar a qualidade das frutas do Vale do São Francisco em cada quilômetro.</p>
          <ul>{['Alertas em tempo real', 'Rastreabilidade completa', 'Relatórios confiáveis'].map(t => <li key={t}><span><Check size={11} /></span>{t}</li>)}</ul>
        </div>
        <small>Tecnologia para uma logística mais fresca, segura e eficiente.</small>
        <i className="ring r1" /><i className="ring r2" />
      </section>

      <section className="login-form">
        <div className="theme-corner"><ThemeButton /></div>
        <form onSubmit={submit}>
          <span className="eyebrow">{signup ? 'Comece agora' : 'Bem-vindo de volta'}</span>
          <h2>{signup ? 'Crie sua conta' : 'Acesse sua conta'}</h2>
          <p className="muted">
            {signup
              ? 'O primeiro cadastro configura a administração; os próximos entram como motoristas.'
              : 'Entre para acompanhar sua operação.'}
          </p>

          <div className="tabs">
            <button type="button" className={tab === 'in' ? 'on' : ''} onClick={() => setTab('in')}>Entrar</button>
            <button type="button" className={tab === 'up' ? 'on' : ''} onClick={() => setTab('up')}>Cadastrar</button>
          </div>

          {signup && (
            <>
              <label>Nome completo</label>
              <input placeholder="Como devemos chamar você?" required />
              <label>Telefone</label>
              <input type="tel" placeholder="(87) 99999-0000" value={phone} onChange={e => setPhone(maskPhone(e.target.value))} required />
            </>
          )}
          <label>E-mail</label>
          <input type="email" placeholder="voce@empresa.com.br" required />
          <label>Senha</label>
          <input type="password" placeholder="Mínimo de 8 caracteres" minLength={8} required />

          <button className="btn primary block" type="submit">
            {signup ? 'Criar minha conta' : 'Entrar no FrioVale'} <ArrowRight size={16} />
          </button>
          <p className="legal">Ao continuar, você concorda com o uso seguro dos dados operacionais para monitoramento da cadeia fria.</p>
        </form>
      </section>
    </div>
  )
}