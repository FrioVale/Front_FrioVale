import { FormEvent, useCallback, useEffect, useState } from 'react'
import { Plus, Trash2, Edit2, Save, X, Activity } from 'lucide-react'
import { api, type ContainerRequest, type ContainerResponse, type ImpactResponse } from '../api'
import { useAsyncData } from '../hooks/useAsyncData'

/** Status inferido do acelerômetro a partir do sinal mais recente do próprio sensor. */
function accelStatus(impacts: ImpactResponse[]): { label: string; tone: string } {
  if (impacts.length === 0) return { label: 'Sem sinal recente', tone: 'soft' }
  const last = impacts.reduce((a, b) =>
    new Date(b.originalTimestamp) > new Date(a.originalTimestamp) ? b : a)
  const minutes = (Date.now() - new Date(last.originalTimestamp).getTime()) / 60000
  if (minutes > 2) return { label: 'Sem sinal recente', tone: 'soft' }
  return { label: 'Ativo', tone: 'green' }
}

/** Badge de status do acelerômetro de um contêiner. */
function AccelStatus({ containerId }: { containerId: number }) {
  const { data } = useAsyncData(() => api.impactsByContainer(containerId), [containerId])
  const status = accelStatus(data ?? [])
  return <span className={`pill ${status.tone}`} style={{ marginTop: 4 }}><Activity size={11} /> {status.label}</span>
}

export default function Containers() {
  const { data, loading, error, reload } = useAsyncData(() => api.containers())
  const containers: ContainerResponse[] = data ?? []

  const [editingId, setEditingId] = useState<number | null>(null)
  const [code, setCode] = useState('')
  const [thingSpeakChannelId, setThingSpeakChannelId] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [formError, setFormError] = useState<string>()
  const [listError, setListError] = useState<string>()
  const [success, setSuccess] = useState<string>()

  useEffect(() => {
    setListError(undefined)
    if (error) setListError(error)
  }, [error])

  const containerToEdit = containers.find(c => c.id === editingId)

  const resetForm = useCallback(() => {
    setEditingId(null)
    setCode('')
    setThingSpeakChannelId('')
    setFormError(undefined)
    setSuccess(undefined)
  }, [])

  const startEdit = (c: ContainerResponse) => {
    setEditingId(c.id)
    setCode(c.code)
    setThingSpeakChannelId(c.thingSpeakChannelId)
    setFormError(undefined)
    setSuccess(undefined)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(undefined)
    const next: Record<string, string> = {}
    if (!code.trim()) next.code = 'Informe o código do contêiner.'
    if (!thingSpeakChannelId.trim()) next.thingSpeakChannelId = 'Informe o ID do canal ThingSpeak.'
    if (Object.keys(next).length > 0) {
      setFormError(next.code ?? next.thingSpeakChannelId)
      return
    }

    const payload: ContainerRequest = {
      code: code.trim(),
      thingSpeakChannelId: thingSpeakChannelId.trim(),
    }

    setSaving(true)
    try {
      if (editingId == null) {
        await api.createContainer(payload)
        setSuccess('Contêiner cadastrado com sucesso.')
      } else {
        await api.updateContainer(editingId, payload)
        setSuccess('Contêiner atualizado com sucesso.')
      }
      resetForm()
      reload()
    } catch (err) {
      const e = err as Error & { errors?: Record<string, string> }
      if (e.errors) {
        const first = Object.values(e.errors)[0]
        setFormError(first ?? 'Não foi possível salvar o contêiner.')
        if (e.errors.code) setCode(code)
        if (e.errors.thingSpeakChannelId) setThingSpeakChannelId(thingSpeakChannelId)
      } else {
        setFormError(e instanceof Error ? e.message : 'Não foi possível salvar o contêiner.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number, code: string) => {
    if (!window.confirm(`Excluir o contêiner "${code}"? Esta ação não pode ser desfeita.`)) return
    setDeleting(id)
    try {
      await api.deleteContainer(id)
      reload()
      setSuccess('Contêiner excluído com sucesso.')
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Não foi possível excluir o contêiner.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="page mid">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div><span className="eyebrow">Frota</span><h1 className="title">Contêineres</h1></div>
        <button className="btn primary" onClick={resetForm}>
          <Plus size={16} /> Novo contêiner
        </button>
      </div>

      {success && <p className="muted" style={{ color: '#1e8a3c' }}>{success}</p>}
      {listError && <p className="muted" style={{ color: '#e11d1d' }}>{listError}</p>}

      <div className="two">
        <form className="card pad" onSubmit={handleSubmit}>
          <div className="card-title">
            <div>
              <h3>{editingId == null ? 'Novo contêiner' : 'Editar contêiner'}</h3>
              <p>Cadastre o código e o dispositivo IoT (canal ThingSpeak) do contêiner.</p>
            </div>
            {editingId != null && (
              <button type="button" className="btn ghost sm" onClick={resetForm}>
                <X size={14} /> Cancelar
              </button>
            )}
          </div>

          <div className="grid2">
            <input
              placeholder="Código (ex.: FV001)"
              value={code}
              onChange={e => setCode(e.target.value)}
              disabled={saving}
            />
            <input
              placeholder="Canal ThingSpeak (ex.: 123456)"
              value={thingSpeakChannelId}
              onChange={e => setThingSpeakChannelId(e.target.value)}
              disabled={saving}
            />
          </div>

          {formError && <p className="muted" style={{ color: '#e11d1d' }}>{formError}</p>}
          <button className="btn primary block" type="submit" disabled={saving}>
            {saving
              ? 'Salvando...'
              : editingId == null
                ? 'Cadastrar contêiner'
                : 'Atualizar contêiner'}
          </button>
        </form>

        <div className="card members">
          <div className="card-head">
            <h3>Contêineres cadastrados</h3>
            <p>{containers.length} contêiner(es) na frota.</p>
          </div>
          {loading && <p className="muted" style={{ padding: '0 20px 20px' }}>Carregando contêineres...</p>}
          {listError && <p className="muted" style={{ padding: '0 20px 20px' }}>{listError}</p>}
          {!loading && containers.length === 0 && (
            <p className="muted" style={{ padding: '0 20px 20px' }}>Nenhum contêiner cadastrado.</p>
          )}
          {!loading &&
            containers.map(c => {
              const inUse = !c.available
              return (
                <div className="member" key={c.id}>
                  <span className="avatar">{c.code.charAt(0).toUpperCase()}</span>
                  <div className="flex" style={{ flex: 1 }}>
                    <strong>{c.code}</strong>
                    <small style={{ display: 'block', marginTop: 2 }}>
                      Dispositivo IoT: {c.thingSpeakChannelId || '—'}
                    </small>
                    <AccelStatus containerId={c.id} />
                    <span className={`pill ${inUse ? 'red' : 'green'}`} style={{ marginLeft: 'auto' }}>
                      {inUse ? 'Em viagem' : 'Disponível'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="btn ghost sm"
                      onClick={() => startEdit(c)}
                      disabled={saving || deleting === c.id || inUse}
                      title={inUse ? 'Não é possível editar um contêiner em viagem' : 'Editar'}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn ghost sm"
                      onClick={() => handleDelete(c.id, c.code)}
                      disabled={saving || deleting === c.id || inUse}
                      title={inUse ? 'Não é possível excluir um contêiner em viagem' : 'Excluir'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
