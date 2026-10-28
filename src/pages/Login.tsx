import { FormEvent, useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import Logo from '../components/Logo'
import { ThemeButton } from '../components/Layout'

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [tab, setTab] = useState<'in' | 'up'>('in')
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
          <span className="eyebrow">Bem-vindo de volta</span>
          <h2>Acesse sua conta</h2>
          <p className="muted">Entre para acompanhar sua operação.</p>
          <div className="tabs">
            <button type="button" className={tab === 'in' ? 'on' : ''} onClick={() => setTab('in')}>Entrar</button>
            <button type="button" className={tab === 'up' ? 'on' : ''} onClick={() => setTab('up')}>Cadastrar</button>
          </div>
          {tab === 'up' && <><label>Nome completo</label><input placeholder="Seu nome" /></>}
          <label>E-mail</label><input type="email" placeholder="voce@empresa.com.br" required />
          <label>Senha</label><input type="password" placeholder="Mínimo de 8 caracteres" minLength={8} required />
          <button className="btn primary block" type="submit">{tab === 'in' ? 'Entrar no FrioVale' : 'Criar conta'} <ArrowRight size={16} /></button>
          <p className="legal">Ao continuar, você concorda com o uso seguro dos dados operacionais para monitoramento da cadeia fria.</p>
        </form>
      </section>
    </div>
  )
}
