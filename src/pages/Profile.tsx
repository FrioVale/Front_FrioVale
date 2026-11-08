import { useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import { api } from '../api'
import { useAsyncData } from '../hooks/useAsyncData'
import { roleLabel } from '../data'

export default function Profile() {
  const ref = useRef<HTMLInputElement>(null)
  const [img, setImg] = useState<string>()
  const { data: user, loading, error } = useAsyncData(() => api.currentUser())
  const onFile = (f?: File) => { if (f && f.size <= 5 * 1024 * 1024) setImg(URL.createObjectURL(f)) }
  const name = user?.name ?? '—'
  const role = user ? roleLabel(user.role) : '—'
  const fields = [
    ['Nome completo', name],
    ['E-mail', user?.email ?? '—'],
    ['Telefone', user?.phone ?? '—'],
    ['Perfil de acesso', role],
  ]

  return (
    <div className="page mid">
      <span className="eyebrow">Minha conta</span>
      <h1 className="title">Perfil do usuário</h1>
      <p className="muted">Consulte seus dados e mantenha sua imagem de perfil atualizada.</p>
      {loading && <p className="muted">Carregando perfil...</p>}
      {error && <p className="muted">{error}</p>}
      <div className="card profile">
        <div className="p-left">
          <button className="big-avatar" onClick={() => ref.current?.click()}>
            {img ? <img src={img} alt="" /> : name.charAt(0).toUpperCase()}<span className="cam"><Camera size={15} /></span>
          </button>
          <input ref={ref} type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={e => onFile(e.target.files?.[0])} />
          <p>Clique na foto para escolher uma nova imagem</p><small>JPG, PNG ou WebP de até 5 MB</small>
          <button className="btn primary sm" onClick={() => ref.current?.click()}>Atualizar foto</button>
        </div>
        <div className="p-right">
          <small>Informações pessoais</small>
          <h2>{name}</h2><span className="pill soft">{role}</span>
          <div className="grid2">{fields.map(([k, v]) => <div className="field" key={k}><small>{k}</small><strong>{v}</strong></div>)}</div>
          <div className="field safe"><strong>Seus dados estão protegidos</strong><small>A foto e as informações desta página ficam vinculadas somente à sua conta FrioVale.</small></div>
        </div>
      </div>
    </div>
  )
}
